import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function initDb() {
  // Create default app state if it doesn't exist
  const appState = await prisma.appState.findUnique({
    where: { id: 1 }
  });

  if (!appState) {
    await prisma.appState.create({
      data: {
        id: 1,
        registrationOpen: true,
        linkingEnabled: false,
        commissionsPublished: false
      }
    });
  }

  console.log('Database initialized successfully');
}
