import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { distributeStudents, getCommissionStats } from '@/lib/distribution';

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

    // Get all students
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        score: true,
        isRecursante: true,
        recursanteCatedra: true,
        gender: true,
        subgroupId: true,
        affinityGroupId: true,
        morfo1Catedra: true,
        morfo1Otra: true,
        morfo2Catedra: true,
        morfo2Otra: true,
        tipo1Catedra: true,
        tipo1Otra: true,
        tipo2Catedra: true,
        tipo2Otra: true,
        dg1Catedra: true,
        dg1Otra: true,
        dg2Catedra: true,
        dg2Otra: true
      },
      orderBy: { score: 'desc' }
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No hay estudiantes para distribuir' },
        { status: 400 }
      );
    }

    // Create a map of student details for quick lookup
    const studentDetailsMap = new Map(students.map(s => [s.id, s]));

    // Distribute students (only with fields needed for algorithm)
    const commissions = distributeStudents(students.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      score: s.score,
      is_recursante: s.isRecursante,
      gender: s.gender,
      subgroup_id: s.subgroupId,
      affinity_group_id: s.affinityGroupId
    })));

    // Get stats for response and enrich students with full data
    const commissionsWithStats = commissions.map(c => ({
      ...getCommissionStats(c),
      students: c.students.map(student => {
        const details = studentDetailsMap.get(student.id);
        return {
          ...student,
          dni: details?.dni,
          recursante_catedra: details?.recursanteCatedra,
          morfo1_catedra: details?.morfo1Catedra,
          morfo1_otra: details?.morfo1Otra,
          morfo2_catedra: details?.morfo2Catedra,
          morfo2_otra: details?.morfo2Otra,
          tipo1_catedra: details?.tipo1Catedra,
          tipo1_otra: details?.tipo1Otra,
          tipo2_catedra: details?.tipo2Catedra,
          tipo2_otra: details?.tipo2Otra,
          dg1_catedra: details?.dg1Catedra,
          dg1_otra: details?.dg1Otra,
          dg2_catedra: details?.dg2Catedra,
          dg2_otra: details?.dg2Otra
        };
      })
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
