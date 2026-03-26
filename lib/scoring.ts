// Scoring system for DG3 commission assignment

export interface StudentData {
  dg1_catedra: string;
  dg1_otra?: string | null;
  dg2_catedra: string;
  dg2_otra?: string | null;
  morfo1_catedra: string;
  morfo1_otra?: string | null;
  morfo2_catedra: string;
  morfo2_otra?: string | null;
  tipo1_catedra: string;
  tipo1_otra?: string | null;
  tipo2_catedra: string;
  tipo2_otra?: string | null;
}

// Normalize text for matching (case-insensitive, remove accents, handle "ex" prefix)
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim();
}

// Check if a catedra matches one of the target catedras
function matchesCatedra(selected: string, otras: string | null | undefined, targets: string[]): boolean {
  // If "Otra" was selected, check the custom input
  if (selected === 'Otra' && otras) {
    const normalizedOtra = normalize(otras);

    return targets.some(target => {
      const normalizedTarget = normalize(target);

      // Handle "Ex" prefix variations
      if (normalizedTarget.startsWith('ex ')) {
        const baseName = normalizedTarget.replace(/^ex[\s-]*/, '');
        // Match if otras contains the base name (e.g., "Wolkowicz", "Wolko")
        return normalizedOtra.includes(baseName) ||
               normalizedOtra.includes(normalizedTarget) ||
               baseName.includes(normalizedOtra);
      }

      return normalizedOtra === normalizedTarget;
    });
  }

  // Direct match from dropdown
  const normalizedSelected = normalize(selected);
  return targets.some(target => normalize(target) === normalizedSelected);
}

export function calculateScore(student: StudentData): number {
  let score = 0;

  // Diseño Gráfico 2 - 3 points
  if (matchesCatedra(student.dg2_catedra, student.dg2_otra, ['Gabriele', 'Ex Wolkowicz', 'Ex Rico'])) {
    score += 3;
  }

  // Diseño Gráfico 1 - 2 points
  if (matchesCatedra(student.dg1_catedra, student.dg1_otra, ['Gabriele', 'Ex Wolkowicz', 'Ex Rico'])) {
    score += 2;
  }

  // Tipografía 2 - 1 point
  if (matchesCatedra(student.tipo2_catedra, student.tipo2_otra, ['Longinotti', 'Cosgaya', 'Gaitto'])) {
    score += 1;
  }

  // Morfología 2 - 1 point
  if (matchesCatedra(student.morfo2_catedra, student.morfo2_otra, ['Longinotti', 'Pereyra'])) {
    score += 1;
  }

  // Tipografía 1 - 0.5 points
  if (matchesCatedra(student.tipo1_catedra, student.tipo1_otra, ['Longinotti', 'Cosgaya', 'Gaitto'])) {
    score += 0.5;
  }

  // Morfología 1 - 0.5 points
  if (matchesCatedra(student.morfo1_catedra, student.morfo1_otra, ['Longinotti', 'Pereyra'])) {
    score += 0.5;
  }

  return score;
}
