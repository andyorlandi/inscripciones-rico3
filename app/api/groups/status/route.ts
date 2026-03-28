import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { email },
      select: {
        id: true,
        affinityGroupId: true,
        subgroupId: true
      }
    });

    if (!student || !student.affinityGroupId) {
      return NextResponse.json({ inGroup: false });
    }

    // Obtener grupo completo
    const group = await prisma.affinityGroup.findUnique({
      where: { id: student.affinityGroupId }
    });

    const members = await prisma.student.findMany({
      where: { affinityGroupId: student.affinityGroupId },
      select: {
        id: true,
        name: true,
        personalCode: true,
        subgroupId: true
      }
    });

    const subgroups = await prisma.subgroup.findMany({
      where: { affinityGroupId: student.affinityGroupId }
    });

    const needsSubdivision = members.length > 3 && subgroups.length === 0;

    return NextResponse.json({
      inGroup: true,
      isCreator: group?.creatorStudentId === student.id,
      needsSubdivision,
      group: {
        id: student.affinityGroupId,
        members,
        subgroups: subgroups.map(sg => ({
          id: sg.id,
          members: members.filter(m => m.subgroupId === sg.id)
        }))
      }
    });

  } catch (error: any) {
    console.error('Group status error:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado del grupo' },
      { status: 500 }
    );
  }
}
