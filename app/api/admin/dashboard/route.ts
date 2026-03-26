import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get app state
    const appState = await prisma.appState.findUnique({
      where: { id: 1 }
    });

    // Get statistics
    const total = await prisma.student.count();
    const aggregates = await prisma.student.aggregate({
      _avg: { score: true }
    });
    const recursantes = await prisma.student.count({
      where: { isRecursante: true }
    });

    // Get all students
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Convert to snake_case for frontend compatibility
    const studentsFormatted = students.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      personal_code: s.personalCode,
      dg1_catedra: s.dg1Catedra,
      dg1_otra: s.dg1Otra,
      dg2_catedra: s.dg2Catedra,
      dg2_otra: s.dg2Otra,
      morfo1_catedra: s.morfo1Catedra,
      morfo1_otra: s.morfo1Otra,
      morfo2_catedra: s.morfo2Catedra,
      morfo2_otra: s.morfo2Otra,
      tipo1_catedra: s.tipo1Catedra,
      tipo1_otra: s.tipo1Otra,
      tipo2_catedra: s.tipo2Catedra,
      tipo2_otra: s.tipo2Otra,
      is_recursante: s.isRecursante ? 1 : 0,
      recursante_catedra: s.recursanteCatedra,
      score: s.score,
      commission: s.commission,
      created_at: s.createdAt
    }));

    return NextResponse.json({
      appState: {
        registration_open: appState?.registrationOpen ? 1 : 0,
        linking_enabled: appState?.linkingEnabled ? 1 : 0,
        commissions_published: appState?.commissionsPublished ? 1 : 0
      },
      stats: {
        total,
        avgScore: Math.round((aggregates._avg.score || 0) * 10) / 10,
        recursantes
      },
      students: studentsFormatted
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener datos' },
      { status: 500 }
    );
  }
}
