import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const toners = await prisma.tonerModel.findMany({
            include: {
                stocks: true,
                _count: {
                    select: { printers: true }
                }
            }
        })

        const report = toners.map(toner => {
            const totalStock = toner.stocks.reduce((acc, s) => acc + s.quantity, 0)
            return {
                id: toner.id,
                name: toner.name,
                totalStock,
                printerCount: toner._count.printers
            }
        })

        return NextResponse.json(report)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }
}
