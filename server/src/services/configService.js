// =============================================================================
// Theatrum — Service de Configurações do Site
// Gerenciamento de textos, propagandas e parâmetros dinâmicos
// =============================================================================

const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');

class ConfigService {
  /**
   * Lista todas as configurações formatadas como chave-valor
   */
  static async listar() {
    const configs = await prisma.configSite.findMany();

    const configObj = {};
    for (const config of configs) {
      configObj[config.chave] = {
        valor: config.valor,
        tipo: config.tipo,
      };
    }

    return configObj;
  }

  /**
   * Atualiza ou cria uma configuração do site
   */
  static async atualizar(chave, valor, tipo = 'TEXT', arquivo = null) {
    if (valor === undefined && !arquivo) {
      throw AppError.badRequest('O campo "valor" é obrigatório');
    }

    let valorFinal = valor;
    if (arquivo) {
      valorFinal = `/uploads/${arquivo.filename}`;
    }

    const config = await prisma.configSite.upsert({
      where: { chave: chave.trim() },
      update: { valor: String(valorFinal), tipo },
      create: { chave: chave.trim(), valor: String(valorFinal), tipo },
    });

    return config;
  }
}

module.exports = ConfigService;
