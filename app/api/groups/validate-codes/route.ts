import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { codes, creatorEmail } = await request.json();

    // Verificar linking habilitado
    const appState = await prisma.appState.findUnique({ where: { id: 1 } });
    if (!appState?.linkingEnabled) {
      return NextResponse.json(
        { error: 'Vinculación no habilitada' },
        { status: 400 }
      );
    }

    // Obtener creador
    const creator = await prisma.student.findUnique({
      where: { email: creatorEmail },
      select: { id: true, personalCode: true }
    });
    if (!creator) {
      return NextResponse.json({ error: 'Creador no encontrado' }, { status: 404 });
    }

    const results = [];
    const errors = [];

    for (const code of codes) {
      const student = await prisma.student.findUnique({
        where: { personalCode: code },
        select: { id: true, name: true, personalCode: true, affinityGroupId: true }
      });

      if (!student) {
        errors.push(`Código ${code} no encontrado`);
        results.push({ code, valid: false, name: null });
      } else if (code === creator.personalCode) {
        errors.push('No podés agregarte a vos mismo');
        results.push({ code, valid: false, name: student.name });
      } else if (student.affinityGroupId) {
        errors.push(`${student.name} ya está en otro grupo`);
        results.push({ code, valid: false, name: student.name });
      } else {
        results.push({ code, valid: true, name: student.name });
      }
    }

    return NextResponse.json({
      valid: errors.length === 0,
      members: results,
      errors
    });

  } catch (error: any) {
    console.error('Validate codes error:', error);
    return NextResponse.json(
      { error: 'Error al validar códigos' },
      { status: 500 }
    );
  }
}
