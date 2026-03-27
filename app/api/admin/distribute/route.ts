import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { distributeStudents, getCommissionStats } from '@/lib/distribution';

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

    // Get all students
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        score: true,
        isRecursante: true,
        gender: true
      },
      orderBy: { score: 'desc' }
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No hay estudiantes para distribuir' },
        { status: 400 }
      );
    }

    // Distribute students
    const commissions = distributeStudents(students.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      score: s.score,
      is_recursante: s.isRecursante,
      gender: s.gender
    })));

    // Get stats for response
    const commissionsWithStats = commissions.map(c => ({
      ...getCommissionStats(c),
      students: c.students
    }));

    return NextResponse.json({
      success: true,
      commissions: commissionsWithStats
    });

  } catch (error: any) {
    console.error('Distribution error:', error);
    return NextResponse.json(
      { error: 'Error al distribuir estudiantes' },
      { status: 500 }
    );
  }
}
