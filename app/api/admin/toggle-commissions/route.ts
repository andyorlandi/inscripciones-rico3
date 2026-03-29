import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD no configurado');
  return authHeader === `Bearer ${password}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const appState = await prisma.appState.findUnique({ where: { id: 1 } });

    // Check if distribution has been done (at least one student has commission)
    const studentsWithCommission = await prisma.student.count({
      where: { commission: { not: null } }
    });

    if (studentsWithCommission === 0) {
      return NextResponse.json(
        { error: 'Primero debes distribuir a los estudiantes en comisiones' },
        { status: 400 }
      );
    }

    const newState = !appState?.commissionsPublished;
    await prisma.appState.update({
      where: { id: 1 },
      data: { commissionsPublished: newState }
    });

    return NextResponse.json({
      success: true,
      commissions_published: newState
    });
  } catch (error: any) {
    console.error('Toggle commissions error:', error);
    return NextResponse.json(
      { error: 'Error al cambiar estado de publicación' },
      { status: 500 }
    );
  }
}
