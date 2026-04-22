import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const [unitCount, printerCount, tonerCount, stocks] = await Promise.all([
            prisma.unit.count(),
            prisma.printerModel.count(),
            prisma.tonerModel.count(),
            prisma.stock.findMany({
                include: { toner: true }
            })
        ])

        // Calculate critical items (total stock < 5)
        const tonerTotals: Record<string, { name: string, total: number }> = {}
        stocks.forEach(s => {
            if (!tonerTotals[s.tonerId]) {
                tonerTotals[s.tonerId] = { name: s.toner.name, total: 0 }
            }
            tonerTotals[s.tonerId].total += s.quantity
        })

        const criticalItems = Object.values(tonerTotals).filter(item => item.total < 5)

        return NextResponse.json({
            unitCount,
            printerCount,
            tonerCount,
            criticalCount: criticalItems.length
        })
    } catch (error) {
        console.error('Dashboard error:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard stats', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}
