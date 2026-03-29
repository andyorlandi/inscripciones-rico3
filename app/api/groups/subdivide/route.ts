import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { creatorEmail, divisions } = await request.json();
    // divisions = [[1, 2], [3, 4, 5]] (student IDs)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener creador
      const creator = await tx.student.findUnique({
        where: { email: creatorEmail },
        select: { id: true, affinityGroupId: true }
      });
      if (!creator || !creator.affinityGroupId) {
        throw new Error('No estás en un grupo');
      }

      // 2. Verificar que es el creador
      const group = await tx.affinityGroup.findUnique({
        where: { id: creator.affinityGroupId }
      });
      if (group?.creatorStudentId !== creator.id) {
        throw new Error('Solo el creador puede subdividir');
      }

      // 3. Validar divisions
      const allIds = divisions.flat();
      const groupMembers = await tx.student.findMany({
        where: { affinityGroupId: creator.affinityGroupId }
      });

      if (allIds.length !== groupMembers.length) {
        throw new Error('Todos los miembros deben estar asignados');
      }
      if (divisions.some((d: number[]) => d.length > 3 || d.length < 1)) {
        throw new Error('Subgrupos deben tener entre 1 y 3 personas');
      }

      // 4. Crear subgrupos
      for (const division of divisions) {
        const subgroup = await tx.subgroup.create({
          data: { affinityGroupId: creator.affinityGroupId }
        });
        await tx.student.updateMany({
          where: { id: { in: division } },
          data: { subgroupId: subgroup.id }
        });
      }

      return { groupId: creator.affinityGroupId };
    });

    return NextResponse.json({ success: true, groupId: result.groupId });

  } catch (error: any) {
    console.error('Subdivide error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al subdividir' },
      { status: 500 }
    );
  }
}
