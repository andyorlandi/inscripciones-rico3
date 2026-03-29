import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appState = await prisma.appState.findUnique({
    where: { id: 1 },
    select: {
      registrationOpen: true,
      linkingEnabled: true,
      commissionsPublished: true
    }
  });

  return NextResponse.json({
    registration_open: appState?.registrationOpen || false,
    linking_enabled: appState?.linkingEnabled || false,
    commissions_published: appState?.commissionsPublished || false
  });
}
