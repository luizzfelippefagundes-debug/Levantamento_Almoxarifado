import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get('unitId')

    try {
        const stocks = await prisma.stock.findMany({
            where: unitId ? { unitId: unitId } : undefined,
            include: { toner: true }
        })
        return NextResponse.json(stocks)
    } catch (error) {
        console.error('Fetch stocks error:', error)
        return NextResponse.json({ error: 'Failed to fetch stocks', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { unitId, tonerId, quantity, imageUrl } = body

        const stock = await prisma.stock.upsert({
            where: {
                unitId_tonerId: { unitId, tonerId }
            },
            update: {
                quantity: parseInt(quantity),
                imageUrl: imageUrl || undefined
            },
            create: {
                unitId,
                tonerId,
                quantity: parseInt(quantity),
                imageUrl: imageUrl || undefined
            }
        })
        return NextResponse.json(stock)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
    }
}
