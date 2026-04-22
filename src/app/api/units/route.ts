import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const units = await prisma.unit.findMany({
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(units)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const unit = await prisma.unit.create({
            data: {
                name: body.name,
                location: body.location
            }
        })
        return NextResponse.json(unit)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
    }
}
