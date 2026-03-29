import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { creatorEmail, memberCodes, subgroupDivisions } = await request.json();

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
        select: { id: true, name: true, personalCode: true, affinityGroupId: true }
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

      // 6. Crear subgrupos
      if (subgroupDivisions && Array.isArray(subgroupDivisions)) {
        // Custom divisions provided from frontend
        // subgroupDivisions = [[0, 1, 2], [3, 4]] (indices in members array)

        // Create ordered list matching the codes order
        const orderedMembers = allCodes.map(code => {
          const member = members.find(m => m.personalCode === code);
          if (!member) {
            throw new Error(`Miembro con código ${code} no encontrado`);
          }
          return member;
        });

        // Validate divisions
        const allIndices = subgroupDivisions.flat();
        const uniqueIndices = new Set(allIndices);

        if (allIndices.length !== orderedMembers.length) {
          throw new Error('Todos los miembros deben estar asignados a un subgrupo');
        }

        if (uniqueIndices.size !== allIndices.length) {
          throw new Error('No puede haber miembros duplicados en subgrupos');
        }

        if (subgroupDivisions.some((div: number[]) => div.length > 3 || div.length < 1)) {
          throw new Error('Cada subgrupo debe tener entre 1 y 3 personas');
        }

        // Create subgroups and assign members
        for (const division of subgroupDivisions) {
          const subgroup = await tx.subgroup.create({
            data: { affinityGroupId: group.id }
          });

          const studentIds = division.map((index: number) => orderedMembers[index].id);

          await tx.student.updateMany({
            where: { id: { in: studentIds } },
            data: { subgroupId: subgroup.id }
          });
        }
      } else {
        // Auto-create subgroups (legacy behavior)
        if (members.length <= 3) {
          // Single subgroup
          const subgroup = await tx.subgroup.create({
            data: { affinityGroupId: group.id }
          });
          await tx.student.updateMany({
            where: { id: { in: memberIds } },
            data: { subgroupId: subgroup.id }
          });
        }
        // If > 3 and no divisions provided, subgroups will be created later via subdivide endpoint
      }

      return { groupId: group.id, members };
    }, {
      isolationLevel: 'Serializable'
    });

    return NextResponse.json({
      success: true,
      group: {
        id: result.groupId,
        members: result.members
      }
    });

  } catch (error: any) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear grupo' },
      { status: 500 }
    );
  }
}
