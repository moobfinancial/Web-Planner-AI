import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the PrismaClient instance.
// This prevents creating multiple instances during hot-reloading in development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize PrismaClient, reusing the global instance if it exists.
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Optionally add logging configuration here
    // log: ['query', 'info', 'warn', 'error'],
  });

// In non-production environments, assign the instance to the global variable.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
