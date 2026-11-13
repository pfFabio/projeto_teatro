// =============================================================================
// Theatrum — Mock Extractor Provider (Determinístico para Testes e Fallback)
// =============================================================================

const IComprovanteExtractor = require('./IComprovanteExtractor');

class MockExtractorProvider extends IComprovanteExtractor {
  constructor(config = {}) {
    super();
    this.simularErro = Boolean(config.simularErro);
    this.respostaCustomizada = config.respostaCustomizada || null;
  }

  async extrair(arquivo) {
    if (!arquivo || !arquivo.buffer) {
      throw new Error('Arquivo não fornecido para extração.');
    }

    if (this.simularErro) {
      throw new Error('Falha na extração assistida por IA (Simulada).');
    }

    if (this.respostaCustomizada) {
      return this.respostaCustomizada;
    }

    // Heurística simulada realista
    const nome = (arquivo.originalname || '').toLowerCase();
    let categoria = 'OUTROS';
    let titulo = 'Comprovante Comercial';
    let valor = 120.0;

    if (nome.includes('transporte') || nome.includes('van') || nome.includes('uber') || nome.includes('combustivel')) {
      categoria = 'TRANSPORTE';
      titulo = 'Transporte e Deslocamento';
      valor = 185.5;
    } else if (nome.includes('almoco') || nome.includes('refeicao') || nome.includes('alimentacao')) {
      categoria = 'ALIMENTACAO';
      titulo = 'Alimentação de Elenco';
      valor = 94.0;
    } else if (nome.includes('cenario') || nome.includes('tecido') || nome.includes('figurino')) {
      categoria = 'CENOGRAFIA_FIGURINO';
      titulo = 'Materiais de Figurino e Cenografia';
      valor = 450.0;
    }

    const hoje = new Date().toISOString().split('T')[0];

    return {
      dados: {
        titulo,
        descricao: `Extração assistida automática de "${arquivo.originalname || 'comprovante'}"`,
        valor,
        dataComprovante: hoje,
        categoria,
      },
      confianca: {
        titulo: 0.92,
        valor: 0.95,
        dataComprovante: 0.88,
        categoria: 0.9,
      },
      alertas: [],
    };
  }
}

module.exports = MockExtractorProvider;
