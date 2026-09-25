const { PrismaClient } = require('@prisma/client');

/**
 * Instance Prisma singleton pour toute l'application.
 * En développement, on réutilise la même instance pour éviter
 * les connexions multiples lors du hot-reload.
 */
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
