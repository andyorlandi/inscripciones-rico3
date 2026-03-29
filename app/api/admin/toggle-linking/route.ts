import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD no configurado');
  return authHeader === `Bearer ${password}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const appState = await prisma.appState.findUnique({ where: { id: 1 } });

    // Solo permitir si registro está cerrado
    if (appState?.registrationOpen) {
      return NextResponse.json(
        { error: 'Cerrar registro antes de habilitar vinculación' },
        { status: 400 }
      );
    }

    const newState = !appState?.linkingEnabled;
    await prisma.appState.update({
      where: { id: 1 },
      data: { linkingEnabled: newState }
    });

    return NextResponse.json({ success: true, linking_enabled: newState });
  } catch (error: any) {
    console.error('Toggle linking error:', error);
    return NextResponse.json(
      { error: 'Error al cambiar estado de vinculación' },
      { status: 500 }
    );
  }
}
