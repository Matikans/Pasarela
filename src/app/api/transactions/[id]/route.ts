import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try{
        const { id } = params;

        const transaction = await prisma.transactions.findUnique({
            where: {
                id: id
            },
            include: {
                author: true
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