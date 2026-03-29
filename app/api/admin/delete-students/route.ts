import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    const body = await request.json();
    const { studentIds } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de estudiantes no válidos' },
        { status: 400 }
      );
    }

    // Delete students
    const result = await prisma.student.deleteMany({
      where: {
        id: {
          in: studentIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count
    });

  } catch (error: any) {
    console.error('Delete students error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar estudiantes' },
      { status: 500 }
    );
  }
}
