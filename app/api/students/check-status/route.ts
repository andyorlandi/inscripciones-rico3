import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'El mail es requerido' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { email },
      select: {
        name: true,
        personalCode: true,
        commission: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'No se encontró un estudiante con ese mail' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: student.name,
      personal_code: student.personalCode,
      commission: student.commission
    });

  } catch (error: any) {
    console.error('Check status error:', error);
    return NextResponse.json(
      { error: 'Error al verificar el estado' },
      { status: 500 }
    );
  }
}
