// =============================================================================
// Theatrum — Factory de Extratores de IA (AI Extractor Factory)
// =============================================================================

const IComprovanteExtractor = require('./IComprovanteExtractor');
const MockExtractorProvider = require('./MockExtractorProvider');
const GeminiExtractorProvider = require('./GeminiExtractorProvider');

let extratorInstancia = null;

function obterExtratorIA() {
  if (extratorInstancia) {
    return extratorInstancia;
  }

  const provedor = (process.env.AI_PROVIDER || '').toLowerCase();

  // Em ambiente de teste ou quando configurado explicitamente, usa Mock
  if (process.env.NODE_ENV === 'test' || provedor === 'mock' || !process.env.GEMINI_API_KEY) {
    extratorInstancia = new MockExtractorProvider();
  } else {
    extratorInstancia = new GeminiExtractorProvider();
  }

  return extratorInstancia;
}

function definirExtratorIA(novoExtrator) {
  extratorInstancia = novoExtrator;
}

module.exports = {
  IComprovanteExtractor,
  MockExtractorProvider,
  GeminiExtractorProvider,
  obterExtratorIA,
  definirExtratorIA,
};

