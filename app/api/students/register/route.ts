import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateScore } from '@/lib/scoring';
import { generatePersonalCode } from '@/lib/personal-code';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      dni,
      gender,
      gender_other,
      dg1_catedra,
      dg1_otra,
      dg2_catedra,
      dg2_otra,
      morfo1_catedra,
      morfo1_otra,
      morfo2_catedra,
      morfo2_otra,
      tipo1_catedra,
      tipo1_otra,
      tipo2_catedra,
      tipo2_otra,
      is_recursante,
      recursante_catedra
    } = body;

    // Validate required fields
    if (!name || !email || !dni || !gender || !dg1_catedra || !dg2_catedra ||
        !morfo1_catedra || !morfo2_catedra ||
        !tipo1_catedra || !tipo2_catedra || !is_recursante) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    // Validate DNI format (7-8 digits)
    if (!/^\d{7,8}$/.test(dni)) {
      return NextResponse.json(
        { error: 'El DNI debe tener 7 u 8 dígitos' },
        { status: 400 }
      );
    }

    // Validate gender_other if gender is "otro"
    if (gender === 'otro' && !gender_other) {
      return NextResponse.json(
        { error: 'Debes especificar tu género cuando seleccionás "Otro"' },
        { status: 400 }
      );
    }

    // Check if registration is open
    const appState = await prisma.appState.findUnique({
      where: { id: 1 }
    });

    if (!appState?.registrationOpen) {
      return NextResponse.json(
        { error: 'El registro está cerrado en este momento' },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.student.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este mail ya está registrado' },
        { status: 409 }
      );
    }

    // Check if DNI already exists
    const existingDni = await prisma.student.findUnique({
      where: { dni }
    });

    if (existingDni) {
      return NextResponse.json(
        { error: 'Este DNI ya está registrado' },
        { status: 409 }
      );
    }

    // Calculate score
    const score = calculateScore({
      dg1_catedra,
      dg1_otra,
      dg2_catedra,
      dg2_otra,
      morfo1_catedra,
      morfo1_otra,
      morfo2_catedra,
      morfo2_otra,
      tipo1_catedra,
      tipo1_otra,
      tipo2_catedra,
      tipo2_otra
    });

    // Generate personal code
    const personalCode = await generatePersonalCode(name);

    // Insert student
    await prisma.student.create({
      data: {
        name,
        email,
        dni,
        gender,
        genderOther: gender === 'otro' ? gender_other : null,
        personalCode,
        dg1Catedra: dg1_catedra,
        dg1Otra: dg1_otra || null,
        dg2Catedra: dg2_catedra,
        dg2Otra: dg2_otra || null,
        morfo1Catedra: morfo1_catedra,
        morfo1Otra: morfo1_otra || null,
        morfo2Catedra: morfo2_catedra,
        morfo2Otra: morfo2_otra || null,
        tipo1Catedra: tipo1_catedra,
        tipo1Otra: tipo1_otra || null,
        tipo2Catedra: tipo2_catedra,
        tipo2Otra: tipo2_otra || null,
        isRecursante: is_recursante === 'si',
        recursanteCatedra: is_recursante === 'si' ? recursante_catedra : null,
        score
      }
    });

    return NextResponse.json({
      success: true,
      name,
      personal_code: personalCode,
      score
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la inscripción' },
      { status: 500 }
    );
  }
}
