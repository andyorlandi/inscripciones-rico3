import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD no está configurado');
  }

  if (!authHeader || authHeader !== `Bearer ${password}`) {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const currentState = await prisma.appState.findUnique({
      where: { id: 1 }
    });

    const newState = !currentState?.registrationOpen;

    await prisma.appState.update({
      where: { id: 1 },
      data: { registrationOpen: newState }
    });

    return NextResponse.json({
      success: true,
      registration_open: newState
    });

  } catch (error: any) {
    console.error('Toggle registration error:', error);
    return NextResponse.json(
      { error: 'Error al cambiar el estado del registro' },
      { status: 500 }
    );
  }
}
