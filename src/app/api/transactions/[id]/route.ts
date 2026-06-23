import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try{
        const resolvedParams = await params;
        const {id} = resolvedParams// Intentamos obtener el ID de ambos lugares por seguridad
        console.log("ID recibido en API route:", id); // Debugging: Verifica que el ID se esté recibiendo correctamente

        const transaction = await prisma.transactions.findUnique({
            where: {
                id: id
            },
            include: {
                author: true,
            }
        });
        if (!transaction) {
            return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, transaction });
    }catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}