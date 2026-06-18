import 'dotenv/config'
import { createPrismaClient } from '../src/shared/infrastructure/prisma/prisma.js'

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://alphamedi:alphamedi_dev@localhost:5432/alphamedi_ips?schema=public'

const prisma = createPrismaClient(databaseUrl)

async function seed(): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: 'system.bootstrap' },
    update: {
      value: {
        initialized: true,
        aiProvider: process.env.AI_PROVIDER ?? 'mock',
      },
      description: 'Idempotent bootstrap configuration for the IPS backend.',
    },
    create: {
      key: 'system.bootstrap',
      value: {
        initialized: true,
        aiProvider: process.env.AI_PROVIDER ?? 'mock',
      },
      description: 'Idempotent bootstrap configuration for the IPS backend.',
    },
  })
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exitCode = 1
  })
