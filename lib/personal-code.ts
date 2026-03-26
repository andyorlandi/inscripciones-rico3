import { prisma } from './db';

// Generate a unique personal code for a student
// Format: First 4 letters of name (uppercase, no accents) + hyphen + 4 random digits
// Example: LUCI-4827

function normalize(text: string): string {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^A-Z]/g, ''); // Keep only letters
}

function getFirstLetters(name: string): string {
  const normalized = normalize(name);
  return normalized.slice(0, 4).padEnd(4, 'X'); // Pad with X if less than 4 letters
}

function generateRandomDigits(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function generatePersonalCode(name: string): Promise<string> {
  const letters = getFirstLetters(name);

  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const digits = generateRandomDigits();
    code = `${letters}-${digits}`;
    attempts++;

    // Check if code already exists
    const existing = await prisma.student.findUnique({
      where: { personalCode: code }
    });

    if (!existing) {
      return code;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique personal code');
    }
  } while (true);
}
