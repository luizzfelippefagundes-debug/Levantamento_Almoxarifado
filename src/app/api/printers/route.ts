import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const printers = await prisma.printerModel.findMany({
            orderBy: { name: 'asc' },
            include: { toners: true }
        })
        return NextResponse.json(printers)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch printers' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const printer = await prisma.printerModel.create({
            data: {
                name: body.name,
                brand: body.brand,
                toners: body.tonerIds ? {
                    connect: body.tonerIds.map((id: string) => ({ id }))
                } : undefined
            }
        })
        return NextResponse.json(printer)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create printer' }, { status: 500 })
    }
}
