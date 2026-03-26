// Distribution algorithm for assigning students to commissions

export interface Student {
  id: number;
  name: string;
  email: string;
  score: number;
  is_recursante: boolean;
  gender: string;
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

export function distributeStudents(students: Student[]): Commission[] {
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
  // while respecting constraints: ±2 students difference and gender balance
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

    // Sort by multiple criteria:
    // 1. If student is male, prioritize commissions with fewer males
    // 2. Then by total score (ascending)
    // 3. Then by student count (ascending)
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
