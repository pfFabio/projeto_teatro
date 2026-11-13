// =============================================================================
// Testes Unitários — Camada de Abstração de Extração Assistida por IA
// Padrão AAA (Arrange, Act, Assert) — Metodologia TDD
// =============================================================================

const {
  IComprovanteExtractor,
  MockExtractorProvider,
  obterExtratorIA,
} = require('../../services/ai');
const { CATEGORIAS_COMPROVANTE } = require('../../validators/comprovanteValidator');

describe('Camada de Abstração de IA (AI Extractor)', () => {
  const arquivoSimulado = {
    buffer: Buffer.from('%PDF-1.4 nota fiscal de van'),
    mimetype: 'application/pdf',
    originalname: 'recibo_transporte.pdf',
    size: 1024 * 100,
  };

  test('IComprovanteExtractor base deve lançar erro se método extrair não for implementado', async () => {
    // Arrange
    const extratorAbstrato = new IComprovanteExtractor();

    // Act & Assert
    await expect(extratorAbstrato.extrair(arquivoSimulado)).rejects.toThrow(
      /deve implementar o método extrair/i
    );
  });

  test('MockExtractorProvider deve extrair dados estruturados com notas de confiança válidas', async () => {
    // Arrange
    const mockProvider = new MockExtractorProvider();

    // Act
    const resultado = await mockProvider.extrair(arquivoSimulado);

    // Assert
    expect(resultado).toHaveProperty('dados');
    expect(resultado).toHaveProperty('confianca');
    expect(resultado).toHaveProperty('alertas');

    // Validação da estrutura dos dados
    expect(resultado.dados.titulo).toBeTruthy();
    expect(typeof resultado.dados.valor).toBe('number');
    expect(resultado.dados.valor).toBeGreaterThan(0);
    expect(resultado.dados.dataComprovante).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(CATEGORIAS_COMPROVANTE).toContain(resultado.dados.categoria);

    // Validação dos scores de confiança (0.0 a 1.0)
    expect(resultado.confianca.titulo).toBeGreaterThanOrEqual(0);
    expect(resultado.confianca.titulo).toBeLessThanOrEqual(1);
    expect(resultado.confianca.valor).toBeGreaterThanOrEqual(0);
    expect(resultado.confianca.valor).toBeLessThanOrEqual(1);
    expect(resultado.confianca.dataComprovante).toBeGreaterThanOrEqual(0);
    expect(resultado.confianca.dataComprovante).toBeLessThanOrEqual(1);
    expect(resultado.confianca.categoria).toBeGreaterThanOrEqual(0);
    expect(resultado.confianca.categoria).toBeLessThanOrEqual(1);
  });

  test('MockExtractorProvider deve aceitar simulação de falha/timeout para teste de resiliência', async () => {
    // Arrange
    const mockFalho = new MockExtractorProvider({ simularErro: true });

    // Act & Assert
    await expect(mockFalho.extrair(arquivoSimulado)).rejects.toThrow(
      /falha na extração assistida por ia/i
    );
  });

  test('obterExtratorIA deve retornar o provedor injetado', () => {
    // Act
    const extrator = obterExtratorIA();

    // Assert
    expect(extrator).toBeInstanceOf(IComprovanteExtractor);
  });
});
