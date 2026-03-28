import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD;
  return authHeader === `Bearer ${password}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const groups = await prisma.affinityGroup.findMany({
      select: {
        id: true,
        creatorStudentId: true,
        students: {
          select: {
            id: true,
            name: true,
            personalCode: true,
            score: true,
            subgroupId: true
          }
        },
        subgroups: {
          select: {
            id: true
          }
        }
      }
    });

    const enrichedGroups = groups.map(g => ({
      id: g.id,
      creatorStudentId: g.creatorStudentId,
      members: g.students,
      subgroups: g.subgroups.map(sg => ({
        id: sg.id,
        members: g.students.filter(s => s.subgroupId === sg.id)
      })),
      totalScore: g.students.reduce((sum, s) => sum + s.score, 0),
      hasSubdivision: g.subgroups.length > 0
    }));

    return NextResponse.json({ groups: enrichedGroups });

  } catch (error: any) {
    console.error('Get groups error:', error);
    return NextResponse.json(
      { error: 'Error al obtener grupos' },
      { status: 500 }
    );
  }
}
