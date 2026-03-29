import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD no está configurado');
  }

  if (!authHeader || authHeader !== `Bearer ${password}`) {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assignments } = body; // Array of { studentId, commissionId }

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Update each student's commission in a transaction
    await prisma.$transaction(
      assignments.map(assignment =>
        prisma.student.update({
          where: { id: assignment.studentId },
          data: { commission: assignment.commissionId }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Distribución guardada exitosamente'
    });

  } catch (error: any) {
    console.error('Save distribution error:', error);
    return NextResponse.json(
      { error: 'Error al guardar la distribución' },
      { status: 500 }
    );
  }
}
