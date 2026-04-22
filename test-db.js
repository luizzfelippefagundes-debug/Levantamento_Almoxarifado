const { PrismaClient } = require('@prisma/client')

async function test() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://neondb_owner:npg_ZdGHipVC98Dw@ep-solitary-king-amayakjs-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"
            }
        }
    })

    try {
        console.log('Tentando conectar ao Neon...')
        await prisma.$connect()
        console.log('✅ CONECTADO COM SUCESSO AO NEON!')
        const units = await prisma.unit.count()
        console.log(`Unidades encontradas no banco: ${units}`)
    } catch (e) {
        console.error('❌ ERRO AO CONECTAR:')
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

test()
