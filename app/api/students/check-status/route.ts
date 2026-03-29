import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COMMISSIONS } from '@/lib/distribution';

export const dynamic = 'force-dynamic';

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

    // Get app state
    const appState = await prisma.appState.findUnique({
      where: { id: 1 },
      select: { commissionsPublished: true }
    });

    const student = await prisma.student.findUnique({
      where: { email },
      select: {
        name: true,
        personalCode: true,
        commission: true,
        subgroupId: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'No se encontró un estudiante con ese mail' },
        { status: 404 }
      );
    }

    const response: any = {
      name: student.name,
      personal_code: student.personalCode,
      commissions_published: appState?.commissionsPublished || false
    };

    // If commissions are published, include commission info
    if (appState?.commissionsPublished && student.commission) {
      // Get commission name
      const commissionData = COMMISSIONS.find(c => c.id === student.commission);
      response.commission = student.commission;
      response.commission_name = commissionData?.name || student.commission;

      // Get classmates in the same commission
      const classmates = await prisma.student.findMany({
        where: {
          commission: student.commission,
          email: { not: email } // Exclude the student themselves
        },
        select: {
          name: true,
          subgroupId: true
        },
        orderBy: { name: 'asc' }
      });

      response.commission_classmates = classmates.map(c => ({
        name: c.name,
        same_subgroup: student.subgroupId !== null && c.subgroupId === student.subgroupId
      }));
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Check status error:', error);
    return NextResponse.json(
      { error: 'Error al verificar el estado' },
      { status: 500 }
    );
  }
}
