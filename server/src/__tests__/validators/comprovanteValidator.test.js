// =============================================================================
// Testes Unitários — Validador de Comprovantes de Despesa
// Padrão AAA (Arrange, Act, Assert) — Metodologia TDD
// =============================================================================

const {
  validarCriacaoComprovante,
  validarAtualizacaoComprovante,
  CATEGORIAS_COMPROVANTE,
} = require('../../validators/comprovanteValidator');

describe('Validador de Comprovantes (comprovanteValidator)', () => {
  const dadosValidos = {
    titulo: 'Recibo de Transporte — Van Turnê Niterói',
    descricao: 'Transporte de elenco e adereços de cena',
    valor: '450.50',
    dataComprovante: '2026-10-15',
    categoria: 'TRANSPORTE',
    pecaId: '1',
    colaboradorId: '2',
  };

  const arquivoValido = {
    originalname: 'recibo_van.pdf',
    mimetype: 'application/pdf',
    size: 1024 * 500, // 500 KB
    buffer: Buffer.from('%PDF-1.4 test'),
  };

  describe('Constantes de Negócio', () => {
    test('deve exportar as categorias de comprovante esperadas', () => {
      // Arrange & Act
      const categorias = CATEGORIAS_COMPROVANTE;

      // Assert
      expect(Array.isArray(categorias)).toBe(true);
      expect(categorias).toContain('TRANSPORTE');
      expect(categorias).toContain('ALIMENTACAO');
      expect(categorias).toContain('CACHE');
      expect(categorias).toContain('CENOGRAFIA_FIGURINO');
      expect(categorias).toContain('DIVULGACAO');
      expect(categorias).toContain('INFRAESTRUTURA');
      expect(categorias).toContain('OUTROS');
    });
  });

  describe('validarCriacaoComprovante', () => {
    test('deve aceitar dados completos e arquivo válido', () => {
      // Arrange
      const dados = { ...dadosValidos };
      const arquivo = { ...arquivoValido };

      // Act
      const resultado = validarCriacaoComprovante(dados, arquivo);

      // Assert
      expect(resultado.valido).toBe(true);
      expect(resultado.mensagem).toBeUndefined();
    });

    test('deve rejeitar quando o título for vazio ou nulo', () => {
      // Arrange
      const dados = { ...dadosValidos, titulo: '   ' };

      // Act
      const resultado = validarCriacaoComprovante(dados, arquivoValido);

      // Assert
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toMatch(/título/i);
    });

    test('deve rejeitar quando o valor for zero, negativo ou inválido', () => {
      // Arrange & Act & Assert
      expect(validarCriacaoComprovante({ ...dadosValidos, valor: '0' }, arquivoValido).valido).toBe(false);
      expect(validarCriacaoComprovante({ ...dadosValidos, valor: '-15' }, arquivoValido).valido).toBe(false);
      expect(validarCriacaoComprovante({ ...dadosValidos, valor: 'abc' }, arquivoValido).valido).toBe(false);
      expect(validarCriacaoComprovante({ ...dadosValidos, valor: '' }, arquivoValido).valido).toBe(false);
    });

    test('deve rejeitar quando a data for inválida ou vazia', () => {
      // Arrange & Act & Assert
      expect(validarCriacaoComprovante({ ...dadosValidos, dataComprovante: '' }, arquivoValido).valido).toBe(false);
      expect(validarCriacaoComprovante({ ...dadosValidos, dataComprovante: 'data-errada' }, arquivoValido).valido).toBe(false);
    });

    test('deve rejeitar categoria não cadastrada', () => {
      // Arrange
      const dados = { ...dadosValidos, categoria: 'CATEGORIA_INEXISTENTE' };

      // Act
      const resultado = validarCriacaoComprovante(dados, arquivoValido);

      // Assert
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toMatch(/categoria/i);
    });

    test('deve rejeitar quando nenhum arquivo foi enviado na criação', () => {
      // Arrange
      const dados = { ...dadosValidos };

      // Act
      const resultado = validarCriacaoComprovante(dados, null);

      // Assert
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toMatch(/arquivo/i);
    });
  });

  describe('validarAtualizacaoComprovante', () => {
    test('deve aceitar atualização parcial válida sem arquivo', () => {
      // Arrange
      const dados = { valor: '520.00', categoria: 'INFRAESTRUTURA' };

      // Act
      const resultado = validarAtualizacaoComprovante(dados);

      // Assert
      expect(resultado.valido).toBe(true);
    });

    test('deve rejeitar título em branco na atualização', () => {
      // Arrange
      const dados = { titulo: '   ' };

      // Act
      const resultado = validarAtualizacaoComprovante(dados);

      // Assert
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar valor negativo ou zero na atualização', () => {
      // Arrange
      const dados = { valor: '-50' };

      // Act
      const resultado = validarAtualizacaoComprovante(dados);

      // Assert
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar categoria inválida na atualização', () => {
      // Arrange
      const dados = { categoria: 'INVALIDA' };

      // Act
      const resultado = validarAtualizacaoComprovante(dados);

      // Assert
      expect(resultado.valido).toBe(false);
    });
  });
});
