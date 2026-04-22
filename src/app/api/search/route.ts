import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.toLowerCase() || ''

    if (q.length < 2) {
        return NextResponse.json({ units: [], models: [], stocks: [] })
    }

    try {
        const [units, printers, toners, stocks] = await Promise.all([
            prisma.unit.findMany({
                where: { name: { contains: q, mode: 'insensitive' } }
            }),
            prisma.printerModel.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { brand: { contains: q, mode: 'insensitive' } }
                    ]
                },
                include: {
                    toners: {
                        include: {
                            stocks: {
                                include: { unit: true }
                            }
                        }
                    }
                }
            }),
            prisma.tonerModel.findMany({
                where: { name: { contains: q, mode: 'insensitive' } },
                include: {
                    stocks: {
                        include: { unit: true }
                    }
                }
            }),
            prisma.stock.findMany({
                where: {
                    OR: [
                        { toner: { name: { contains: q, mode: 'insensitive' } } },
                        { unit: { name: { contains: q, mode: 'insensitive' } } }
                    ]
                },
                include: {
                    unit: true,
                    toner: true
                }
            })
        ])

        // Aggregating stocks from multiple sources
        const allStockItems = [...stocks.map(s => ({
            unit: s.unit.name,
            unitId: s.unit.id,
            toner: s.toner.name,
            quantity: s.quantity
        }))];

        // If a printer was found, add stocks of all toners compatible with it
        printers.forEach(printer => {
            printer.toners.forEach(toner => {
                toner.stocks.forEach(s => {
                    // Avoid duplicates
                    if (!allStockItems.find(item => item.unitId === s.unitId && item.toner === toner.name)) {
                        allStockItems.push({
                            unit: s.unit.name,
                            unitId: s.unit.id,
                            toner: toner.name,
                            quantity: s.quantity
                        });
                    }
                });
            });
        });

        return NextResponse.json({
            units,
            models: [...printers, ...toners],
            stocks: allStockItems
        })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}
