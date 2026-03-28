import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { creatorEmail, memberCodes } = await request.json();

    // Verificar linking habilitado
    const appState = await prisma.appState.findUnique({ where: { id: 1 } });
    if (!appState?.linkingEnabled) {
      return NextResponse.json(
        { error: 'Vinculación no habilitada' },
        { status: 400 }
      );
    }

    // TRANSACCIÓN
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener creador
      const creator = await tx.student.findUnique({
        where: { email: creatorEmail },
        select: { id: true, personalCode: true, affinityGroupId: true }
      });

      if (!creator) {
        throw new Error('Creador no encontrado');
      }
      if (creator.affinityGroupId) {
        throw new Error('Ya estás en un grupo');
      }

      // 2. Obtener miembros (incluido creador)
      const allCodes = [creator.personalCode, ...memberCodes];
      const members = await tx.student.findMany({
        where: { personalCode: { in: allCodes } },
        select: { id: true, name: true, personalCode: true, affinityGroupId: true }
      });

      // 3. Validaciones
      if (members.length !== allCodes.length) {
        throw new Error('Códigos inválidos');
      }
      if (members.some(m => m.affinityGroupId !== null)) {
        throw new Error('Algún miembro ya está en un grupo');
      }
      if (members.length < 2 || members.length > 6) {
        throw new Error('Grupo debe tener entre 2 y 6 personas');
      }

      // 4. Crear grupo
      const group = await tx.affinityGroup.create({
        data: { creatorStudentId: creator.id }
      });

      // 5. Asignar affinity_group_id a todos
      const memberIds = members.map(m => m.id);
      await tx.student.updateMany({
        where: { id: { in: memberIds } },
        data: { affinityGroupId: group.id }
      });

      // 6. Si <= 3, crear subgrupo automáticamente
      let needsSubdivision = members.length > 3;
      if (!needsSubdivision) {
        const subgroup = await tx.subgroup.create({
          data: { affinityGroupId: group.id }
        });
        await tx.student.updateMany({
          where: { id: { in: memberIds } },
          data: { subgroupId: subgroup.id }
        });
      }

      return { groupId: group.id, needsSubdivision, members };
    }, {
      isolationLevel: 'Serializable'
    });

    return NextResponse.json({
      success: true,
      group: {
        id: result.groupId,
        members: result.members
      },
      needsSubdivision: result.needsSubdivision
    });

  } catch (error: any) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear grupo' },
      { status: 500 }
    );
  }
}
