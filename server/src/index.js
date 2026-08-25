// =============================================================================
// Theatrum — Entry Point do Servidor
// Inicialização, validação de ambiente e Graceful Shutdown
// =============================================================================

const { ENV, validarEnv } = require('./config/env');
const logger = require('./lib/logger');
const prisma = require('./lib/prisma');

// Valida variáveis de ambiente antes de inicializar o servidor
validarEnv();

const app = require('./app');

const server = app.listen(ENV.PORT, () => {
  logger.info(`🎭 Theatrum API rodando em http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`);
  logger.info(`   Health check: http://localhost:${ENV.PORT}/api/saude`);
});

// =============================================================================
// Graceful Shutdown
// =============================================================================
async function encerrarServidor(sinal) {
  logger.info(`\nSinal ${sinal} recebido. Encerrando conexões de forma segura...`);
  server.close(async () => {
    logger.info('Servidor HTTP encerrado.');
    await prisma.$disconnect();
    logger.info('Conexão com banco de dados Prisma finalizada.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Encerramento forçado após timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => encerrarServidor('SIGTERM'));
process.on('SIGINT', () => encerrarServidor('SIGINT'));
