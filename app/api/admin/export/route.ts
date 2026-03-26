import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateExcel } from '@/lib/excel-export';

function checkAuth(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD no está configurado');
  }

  // Check for Bearer token in header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader === `Bearer ${password}`) {
    return true;
  }

  // Check for auth query parameter (for URL-based access)
  const { searchParams } = new URL(request.url);
  const authParam = searchParams.get('auth');
  if (authParam && authParam === password) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get all students
    const students = await prisma.student.findMany({
      orderBy: { name: 'asc' }
    });

    // Format for Excel export
    const studentsForExport = students.map(s => ({
      name: s.name,
      email: s.email,
      dni: s.dni,
      gender: s.gender,
      personal_code: s.personalCode,
      dg1_catedra: s.dg1Catedra,
      dg1_otra: s.dg1Otra,
      dg2_catedra: s.dg2Catedra,
      dg2_otra: s.dg2Otra,
      morfo1_catedra: s.morfo1Catedra,
      morfo1_otra: s.morfo1Otra,
      morfo2_catedra: s.morfo2Catedra,
      morfo2_otra: s.morfo2Otra,
      tipo1_catedra: s.tipo1Catedra,
      tipo1_otra: s.tipo1Otra,
      tipo2_catedra: s.tipo2Catedra,
      tipo2_otra: s.tipo2Otra,
      is_recursante: s.isRecursante ? 1 : 0,
      recursante_catedra: s.recursanteCatedra,
      score: s.score,
      commission: s.commission
    }));

    // Generate Excel file
    const buffer = await generateExcel(studentsForExport);

    // Convert Buffer to Uint8Array for Next.js compatibility
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="inscripciones-dg3-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Error al exportar datos' },
      { status: 500 }
    );
  }
}
