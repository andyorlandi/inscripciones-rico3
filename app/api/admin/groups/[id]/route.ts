import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD;
  return authHeader === `Bearer ${password}`;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const groupId = parseInt(params.id);

    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Clear subgroup_id from all students
      await tx.student.updateMany({
        where: { affinityGroupId: groupId },
        data: { subgroupId: null }
      });

      // 2. Delete all subgroups
      await tx.subgroup.deleteMany({
        where: { affinityGroupId: groupId }
      });

      // 3. Clear affinity_group_id from all students
      await tx.student.updateMany({
        where: { affinityGroupId: groupId },
        data: { affinityGroupId: null }
      });

      // 4. Delete the group
      await tx.affinityGroup.delete({
        where: { id: groupId }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete group error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar grupo' },
      { status: 500 }
    );
  }
}
