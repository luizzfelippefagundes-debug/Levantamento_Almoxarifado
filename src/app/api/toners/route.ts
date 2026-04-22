import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const toners = await prisma.tonerModel.findMany({
            orderBy: { name: 'asc' },
            include: { printers: true }
        })
        return NextResponse.json(toners)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch toners' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const toner = await prisma.tonerModel.create({
            data: {
                name: body.name,
                printers: body.printerIds ? {
                    connect: body.printerIds.map((id: string) => ({ id }))
                } : undefined
            }
        })
        return NextResponse.json(toner)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create toner' }, { status: 500 })
    }
}
