import { prisma } from './db';

export interface GroupMember {
  id: number;
  name: string;
  personal_code: string;
  email: string;
  affinity_group_id: number | null;
  subgroup_id: number | null;
}

export interface AffinityGroup {
  id: number;
  creator_student_id: number | null;
  members: GroupMember[];
  subgroups: Subgroup[];
}

export interface Subgroup {
  id: number;
  affinity_group_id: number | null;
  members: GroupMember[];
}

/**
 * Validate group creation codes
 */
export async function validateGroupCreation(
  codes: string[],
  creatorEmail: string
): Promise<{ valid: boolean; members: any[]; errors: string[] }> {
  const errors: string[] = [];
  const members: any[] = [];

  // 1. Verify linking is enabled
  const appState = await prisma.appState.findUnique({ where: { id: 1 } });
  if (!appState?.linkingEnabled) {
    errors.push('La vinculación no está habilitada');
    return { valid: false, members: [], errors };
  }

  // 2. Get creator
  const creator = await prisma.student.findUnique({
    where: { email: creatorEmail },
    select: { id: true, personalCode: true, affinityGroupId: true }
  });

  if (!creator) {
    errors.push('Creador no encontrado');
    return { valid: false, members: [], errors };
  }

  if (creator.affinityGroupId) {
    errors.push('Ya estás en un grupo');
    return { valid: false, members: [], errors };
  }

  // 3. Validate each code
  for (const code of codes) {
    const student = await prisma.student.findUnique({
      where: { personalCode: code },
      select: {
        id: true,
        name: true,
        personalCode: true,
        email: true,
        affinityGroupId: true
      }
    });

    if (!student) {
      errors.push(`Código ${code} no encontrado`);
      members.push({ code, valid: false, name: null });
    } else if (code === creator.personalCode) {
      errors.push('No podés agregarte a vos mismo');
      members.push({ code, valid: false, name: student.name });
    } else if (student.affinityGroupId) {
      errors.push(`${student.name} ya está en otro grupo`);
      members.push({ code, valid: false, name: student.name });
    } else {
      members.push({ code, valid: true, name: student.name, id: student.id });
    }
  }

  return {
    valid: errors.length === 0,
    members,
    errors
  };
}

/**
 * Validate subgroup division
 */
export function validateSubgroupDivision(
  divisions: number[][],
  groupSize: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Check all members are assigned
  const totalAssigned = divisions.flat().length;
  if (totalAssigned !== groupSize) {
    errors.push('Todos los miembros deben estar asignados a un subgrupo');
  }

  // 2. Each subgroup must have 1-3 members
  for (let i = 0; i < divisions.length; i++) {
    const size = divisions[i].length;
    if (size < 1) {
      errors.push(`El subgrupo ${i + 1} está vacío`);
    } else if (size > 3) {
      errors.push(`El subgrupo ${i + 1} tiene más de 3 personas`);
    }
  }

  // 3. Check for duplicate assignments
  const allIds = divisions.flat();
  const uniqueIds = new Set(allIds);
  if (uniqueIds.size !== allIds.length) {
    errors.push('Hay estudiantes asignados a múltiples subgrupos');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if linking can be enabled
 */
export async function canEnableLinking(): Promise<{ can: boolean; reason?: string }> {
  const appState = await prisma.appState.findUnique({ where: { id: 1 } });

  if (!appState) {
    return { can: false, reason: 'Estado de aplicación no encontrado' };
  }

  if (appState.registrationOpen) {
    return { can: false, reason: 'El registro debe estar cerrado antes de habilitar la vinculación' };
  }

  return { can: true };
}

/**
 * Get affinity group with all members
 */
export async function getGroupWithMembers(groupId: number): Promise<AffinityGroup | null> {
  const group = await prisma.affinityGroup.findUnique({
    where: { id: groupId },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          personalCode: true,
          email: true,
          affinityGroupId: true,
          subgroupId: true
        }
      },
      subgroups: {
        select: {
          id: true,
          affinityGroupId: true
        }
      }
    }
  });

  if (!group) {
    return null;
  }

  return {
    id: group.id,
    creator_student_id: group.creatorStudentId,
    members: group.students.map(s => ({
      id: s.id,
      name: s.name,
      personal_code: s.personalCode,
      email: s.email,
      affinity_group_id: s.affinityGroupId,
      subgroup_id: s.subgroupId
    })),
    subgroups: group.subgroups.map(sg => ({
      id: sg.id,
      affinity_group_id: sg.affinityGroupId,
      members: group.students
        .filter(s => s.subgroupId === sg.id)
        .map(s => ({
          id: s.id,
          name: s.name,
          personal_code: s.personalCode,
          email: s.email,
          affinity_group_id: s.affinityGroupId,
          subgroup_id: s.subgroupId
        }))
    }))
  };
}
