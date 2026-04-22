import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        console.log('API Test: Iniciando conexão...')
        const units = await prisma.unit.count()
        return NextResponse.json({
            status: 'success',
            message: 'Conectado ao Neon!',
            unitsCount: units,
            env: process.env.NODE_ENV
        })
    } catch (error) {
        console.error('API Test Error:', error)
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}
