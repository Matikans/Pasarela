import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ message: "Falta el email del usuario" }, { status: 400 });
        }

        // 1. Buscamos el usuario en la base de datos usando el email
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        // Si el usuario todavía no existe en la base de datos, devolvemos un array vacío
        if (!user) {
            return NextResponse.json({ success: true, transactions: [] });
        }

        // 2. Traemos las transacciones usando el 'authorId' real de tu modelo
        const transactions = await prisma.transactions.findMany({
            where: { 
                authorId: user.id // 👈 Conexión limpia usando tu relación real
            },
            orderBy: { 
                createdAt: 'desc' 
            }
        });

        return NextResponse.json({ success: true, transactions });
    } catch (error) {
        console.error("Error en GET /api/transactions:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, concept, userEmail } = body;

        if(!amount || !userEmail) {
            return NextResponse.json({ message: "Amount and userEmail are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: userEmail
            }
        });

        if(!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const transaction = await prisma.transactions.create({
            data: {
                amount: parseFloat(amount),
                concept: concept || "Venta general",
                status: "pending",
                authorId: user.id
            },
        })

        console.log("Transaction created:", transaction);

        return NextResponse.json({
            success: true,
            transaction: transaction});
    }catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}