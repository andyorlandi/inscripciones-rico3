// Distribution algorithm for assigning students to commissions

export interface Student {
  id: number;
  name: string;
  email: string;
  score: number;
  is_recursante: boolean;
  gender: string;
  subgroup_id?: number | null;
  affinity_group_id?: number | null;
}

export interface AssignmentUnit {
  subgroupId: number;
  students: Student[];
  totalScore: number;
  recursantesCount: number;
  masculinoCount: number;
  affinityGroupId: number | null;
}

export interface Commission {
  id: string;
  name: string;
  students: Student[];
  totalScore: number;
  recursantesCount: number;
  masculinoCount: number;
}

export const COMMISSIONS = [
  { id: 'commission_1', name: 'Comisión 1 — Fede y Tami' },
  { id: 'commission_2', name: 'Comisión 2 — Marcos y Bea' },
  { id: 'commission_3', name: 'Comisión 3 — Raúl y Andy' },
];

/**
 * Prepare assignment units from students
 * Groups students by subgroup_id or creates individual units
 */
function prepareAssignmentUnits(students: Student[]): AssignmentUnit[] {
  const units: AssignmentUnit[] = [];
  const processedStudentIds = new Set<number>();

  // Group by subgroup_id
  const studentsBySubgroup = new Map<number, Student[]>();
  const individualsWithoutSubgroup: Student[] = [];

  for (const student of students) {
    if (student.subgroup_id) {
      if (!studentsBySubgroup.has(student.subgroup_id)) {
        studentsBySubgroup.set(student.subgroup_id, []);
      }
      studentsBySubgroup.get(student.subgroup_id)!.push(student);
    } else {
      individualsWithoutSubgroup.push(student);
    }
  }

  // Create units for subgroups
  for (const [subgroupId, students] of studentsBySubgroup) {
    const totalScore = students.reduce((sum, s) => sum + s.score, 0);
    const recursantesCount = students.filter(s => s.is_recursante).length;
    const masculinoCount = students.filter(s => s.gender === 'masculino').length;

    // Get affinity_group_id from first student (all have the same)
    const affinityGroupId = students[0].affinity_group_id || null;

    units.push({
      subgroupId,
      students,
      totalScore,
      recursantesCount,
      masculinoCount,
      affinityGroupId
    });

    students.forEach(s => processedStudentIds.add(s.id));
  }

  // Create individual units (virtual subgroups of 1)
  for (const student of individualsWithoutSubgroup) {
    units.push({
      subgroupId: -1 * student.id, // Virtual negative ID
      students: [student],
      totalScore: student.score,
      recursantesCount: student.is_recursante ? 1 : 0,
      masculinoCount: student.gender === 'masculino' ? 1 : 0,
      affinityGroupId: null
    });
  }

  return units;
}

/**
 * Get valid commissions for a given unit
 */
function getValidCommissionsForUnit(unit: AssignmentUnit, commissions: Commission[]): Commission[] {
  const maxStudents = Math.max(...commissions.map(c => c.students.length));
  const minStudents = Math.min(...commissions.map(c => c.students.length));

  const valid = commissions.filter(c => {
    // Check if adding this unit would violate size constraint
    const newCount = c.students.length + unit.students.length;
    if (maxStudents - minStudents >= 2 && c.students.length === maxStudents) {
      return false;
    }

    // Check gender balance
    if (unit.masculinoCount > 0) {
      const maxMasculino = Math.max(...commissions.map(com => com.masculinoCount));
      const minMasculino = Math.min(...commissions.map(com => com.masculinoCount));
      if (maxMasculino - minMasculino >= 2 && c.masculinoCount === maxMasculino) {
        return false;
      }
    }

    return true;
  });

  // Sort by total score (ascending), then by student count
  valid.sort((a, b) => {
    if (a.totalScore !== b.totalScore) {
      return a.totalScore - b.totalScore;
    }
    return a.students.length - b.students.length;
  });

  return valid;
}

/**
 * Assign a unit to a commission
 */
function assignUnitToCommission(unit: AssignmentUnit, commission: Commission) {
  commission.students.push(...unit.students);
  commission.totalScore += unit.totalScore;
  commission.recursantesCount += unit.recursantesCount;
  commission.masculinoCount += unit.masculinoCount;
}

/**
 * Distribute units (subgroups) to commissions
 */
function distributeUnits(units: AssignmentUnit[]): Commission[] {
  // Initialize commissions
  const commissions: Commission[] = COMMISSIONS.map(c => ({
    ...c,
    students: [],
    totalScore: 0,
    recursantesCount: 0,
    masculinoCount: 0,
  }));

  // Sort units by total score (descending)
  const sortedUnits = [...units].sort((a, b) => b.totalScore - a.totalScore);

  // PHASE 1: Group subgroups by affinity_group_id
  const unitsByAffinity = new Map<number, AssignmentUnit[]>();
  const individualUnits: AssignmentUnit[] = [];

  for (const unit of sortedUnits) {
    if (unit.affinityGroupId) {
      if (!unitsByAffinity.has(unit.affinityGroupId)) {
        unitsByAffinity.set(unit.affinityGroupId, []);
      }
      unitsByAffinity.get(unit.affinityGroupId)!.push(unit);
    } else {
      individualUnits.push(unit);
    }
  }

  // Assign affinity groups (best effort to keep together)
  for (const [affinityId, affinityUnits] of unitsByAffinity) {
    const totalStudents = affinityUnits.reduce((sum, u) => sum + u.students.length, 0);
    const totalScore = affinityUnits.reduce((sum, u) => sum + u.totalScore, 0);

    // Try to assign all to the same commission
    const maxStudents = Math.max(...commissions.map(c => c.students.length));
    const validCommissions = commissions.filter(c => {
      const newCount = c.students.length + totalStudents;
      const avgPerCommission = Math.ceil(units.length / 3);
      return newCount <= avgPerCommission + 2 && maxStudents - newCount <= 2;
    });

    if (validCommissions.length > 0) {
      // Assign to commission with lowest score
      validCommissions.sort((a, b) => a.totalScore - b.totalScore);
      const targetCommission = validCommissions[0];

      for (const unit of affinityUnits) {
        assignUnitToCommission(unit, targetCommission);
      }
    } else {
      // Best effort: distribute among commissions
      for (const unit of affinityUnits) {
        const validComms = getValidCommissionsForUnit(unit, commissions);
        if (validComms.length > 0) {
          assignUnitToCommission(unit, validComms[0]);
        }
      }
    }
  }

  // PHASE 2: Assign individual units (greedy algorithm)
  for (const unit of individualUnits) {
    const validComms = getValidCommissionsForUnit(unit, commissions);
    if (validComms.length > 0) {
      assignUnitToCommission(unit, validComms[0]);
    }
  }

  return commissions;
}

/**
 * Original distribution algorithm (for backward compatibility)
 */
function distributeStudentsOriginal(students: Student[]): Commission[] {
  // Initialize commissions
  const commissions: Commission[] = COMMISSIONS.map(c => ({
    ...c,
    students: [],
    totalScore: 0,
    recursantesCount: 0,
    masculinoCount: 0,
  }));

  // Sort students by score (descending) for balanced distribution
  const sortedStudents = [...students].sort((a, b) => b.score - a.score);

  // Assign each student to the commission with lowest total score
  for (const student of sortedStudents) {
    // Find commission with lowest score that can accept this student
    const validCommissions = commissions.filter(c => {
      const maxStudents = Math.max(...commissions.map(com => com.students.length));
      const minStudents = Math.min(...commissions.map(com => com.students.length));

      // Don't allow more than 2 students difference
      if (maxStudents - minStudents >= 2 && c.students.length === maxStudents) {
        return false;
      }

      // If this student is male, check gender balance
      if (student.gender === 'masculino') {
        const maxMasculino = Math.max(...commissions.map(com => com.masculinoCount));
        const minMasculino = Math.min(...commissions.map(com => com.masculinoCount));

        // Don't allow more than 2 males difference
        if (maxMasculino - minMasculino >= 2 && c.masculinoCount === maxMasculino) {
          return false;
        }
      }

      return true;
    });

    // Sort by multiple criteria
    validCommissions.sort((a, b) => {
      // If student is male, prioritize commissions with fewer males
      if (student.gender === 'masculino' && a.masculinoCount !== b.masculinoCount) {
        return a.masculinoCount - b.masculinoCount;
      }

      if (a.totalScore !== b.totalScore) {
        return a.totalScore - b.totalScore;
      }
      return a.students.length - b.students.length;
    });

    // Assign to the first valid commission
    const targetCommission = validCommissions[0];
    targetCommission.students.push(student);
    targetCommission.totalScore += student.score;
    if (student.is_recursante) {
      targetCommission.recursantesCount++;
    }
    if (student.gender === 'masculino') {
      targetCommission.masculinoCount++;
    }
  }

  return commissions;
}

export function distributeStudents(students: Student[]): Commission[] {
  // Check if any students have subgroups
  const hasSubgroups = students.some(s => s.subgroup_id);

  if (!hasSubgroups) {
    // Use original algorithm for backward compatibility
    return distributeStudentsOriginal(students);
  }

  // Use new algorithm with subgroups
  const units = prepareAssignmentUnits(students);
  return distributeUnits(units);
}

export function getCommissionStats(commission: Commission) {
  return {
    id: commission.id,
    name: commission.name,
    studentCount: commission.students.length,
    totalScore: Math.round(commission.totalScore * 10) / 10,
    averageScore: commission.students.length > 0
      ? Math.round((commission.totalScore / commission.students.length) * 10) / 10
      : 0,
    recursantesCount: commission.recursantesCount,
    masculinoCount: commission.masculinoCount,
  };
}
