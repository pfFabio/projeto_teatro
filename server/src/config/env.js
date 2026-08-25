// =============================================================================
// Theatrum — Configuração e Validação de Variáveis de Ambiente
// Validação fail-fast na inicialização (ISO 25010 - Segurança e Confiabilidade)
// =============================================================================

require('dotenv').config();

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret-key-12345' : ''),
  DATABASE_URL: process.env.DATABASE_URL || '',
  CLIENT_URL: process.env.CLIENT_URL || '',
};

function validarEnv() {
  const erros = [];

  if (!ENV.JWT_SECRET && ENV.NODE_ENV !== 'test') {
    erros.push('JWT_SECRET é obrigatório. Defina uma chave segura no arquivo .env');
  }

  if (!ENV.DATABASE_URL && ENV.NODE_ENV !== 'test') {
    erros.push('DATABASE_URL é obrigatório. Defina a string de conexão no arquivo .env');
  }

  if (erros.length > 0) {
    console.error('❌ [ERRO DE CONFIGURAÇÃO] Falha na validação de variáveis de ambiente:');
    erros.forEach(e => console.error(`   - ${e}`));
    if (ENV.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

module.exports = {
  ENV,
  validarEnv,
};
