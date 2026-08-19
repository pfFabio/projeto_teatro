// =============================================================================
// Instância única do PrismaClient
// Evita múltiplas conexões ao banco e facilita mocks nos testes
// =============================================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
