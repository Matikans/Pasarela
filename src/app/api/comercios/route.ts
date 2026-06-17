import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, walletAddress } = body;

    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios: email o walletAddress' },
        { status: 400 }
      );
    }
    const savedUser = await prisma.user.upsert({
        where: { email: email },
        update: { wallet_address: walletAddress },
        create: { email: email, wallet_address: walletAddress },
    })
    console.log(`Usuario guardado: ${email} con wallet ${walletAddress}`);

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente en el backend.',
      usuario: savedUser,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar los datos' },
      { status: 500 }
    );
  }
}