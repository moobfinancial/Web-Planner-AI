import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error'],
  transactionOptions: {
    maxWait: 30000, // Maximum time to wait for a transaction
    timeout: 30000  // Maximum time a transaction can run
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
