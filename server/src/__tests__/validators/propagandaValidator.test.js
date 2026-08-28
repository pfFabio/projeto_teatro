// =============================================================================
// Testes Unitários — Validador de Propagandas
// =============================================================================

const {
  validarCriacaoPropaganda,
  validarAtualizacaoPropaganda,
  validarReordenacaoFotos,
} = require('../../validators/propagandaValidator');

describe('validarCriacaoPropaganda', () => {
  test('deve aceitar dados válidos com campos mínimos', () => {
    const res = validarCriacaoPropaganda({
      titulo: 'Aulas de Teatro',
      descricao: 'Aprenda atuação para todas as idades.',
    });
    expect(res.valido).toBe(true);
    expect(res.mensagem).toBeUndefined();
  });

  test('deve aceitar dados válidos com todos os campos preenchidos', () => {
    const res = validarCriacaoPropaganda({
      titulo: 'Workshop de Voz',
      descricao: 'Desenvolva sua presença de palco.',
      link: 'https://exemplo.com/workshop',
      textoBotao: 'Inscrever Agora',
      ativo: true,
    });
    expect(res.valido).toBe(true);
  });

  test('deve rejeitar título vazio', () => {
    const res = validarCriacaoPropaganda({
      titulo: '   ',
      descricao: 'Descrição válida',
    });
    expect(res.valido).toBe(false);
    expect(res.mensagem).toContain('Título');
  });

  test('deve rejeitar título nulo ou indefinido', () => {
    expect(validarCriacaoPropaganda({ descricao: 'Texto' }).valido).toBe(false);
    expect(validarCriacaoPropaganda({ titulo: null, descricao: 'Texto' }).valido).toBe(false);
  });

  test('deve rejeitar título excessivamente longo (> 150 caracteres)', () => {
    const res = validarCriacaoPropaganda({
      titulo: 'A'.repeat(151),
      descricao: 'Descrição válida',
    });
    expect(res.valido).toBe(false);
    expect(res.mensagem).toContain('150 caracteres');
  });

  test('deve rejeitar descrição vazia', () => {
    const res = validarCriacaoPropaganda({
      titulo: 'Título válido',
      descricao: '',
    });
    expect(res.valido).toBe(false);
    expect(res.mensagem).toContain('Descrição');
  });

  test('deve rejeitar link excessivamente longo (> 500 caracteres)', () => {
    const res = validarCriacaoPropaganda({
      titulo: 'Título',
      descricao: 'Descrição',
      link: 'https://exemplo.com/' + 'a'.repeat(500),
    });
    expect(res.valido).toBe(false);
    expect(res.mensagem).toContain('500 caracteres');
  });

  test('deve rejeitar texto de botão excessivamente longo (> 60 caracteres)', () => {
    const res = validarCriacaoPropaganda({
      titulo: 'Título',
      descricao: 'Descrição',
      textoBotao: 'A'.repeat(61),
    });
    expect(res.valido).toBe(false);
    expect(res.mensagem).toContain('60 caracteres');
  });

  test('deve rejeitar status ativo inválido', () => {
    const res = validarCriacaoPropaganda({
      titulo: 'Título',
      descricao: 'Descrição',
      ativo: 'invalido',
    });
    expect(res.valido).toBe(false);
    expect(res.mensagem).toContain('booleano');
  });
});

describe('validarAtualizacaoPropaganda', () => {
  test('deve aceitar atualização parcial válida', () => {
    const res = validarAtualizacaoPropaganda({
      titulo: 'Novo Título',
    });
    expect(res.valido).toBe(true);
  });

  test('deve rejeitar dados vazios/nulos', () => {
    expect(validarAtualizacaoPropaganda(null).valido).toBe(false);
  });

  test('deve rejeitar título vazio na atualização', () => {
    const res = validarAtualizacaoPropaganda({
      titulo: '   ',
    });
    expect(res.valido).toBe(false);
    expect(res.mensagem).toContain('Título não pode ser vazio');
  });

  test('deve rejeitar descrição vazia na atualização', () => {
    const res = validarAtualizacaoPropaganda({
      descricao: '',
    });
    expect(res.valido).toBe(false);
    expect(res.mensagem).toContain('Descrição/texto não pode ser vazio');
  });
});

describe('validarReordenacaoFotos', () => {
  test('deve aceitar array de IDs numéricos válidos', () => {
    expect(validarReordenacaoFotos([1, 2, 3]).valido).toBe(true);
  });

  test('deve rejeitar array vazio ou não-array', () => {
    expect(validarReordenacaoFotos([]).valido).toBe(false);
    expect(validarReordenacaoFotos(null).valido).toBe(false);
  });

  test('deve rejeitar IDs não numéricos ou negativos', () => {
    expect(validarReordenacaoFotos([1, 'abc', 3]).valido).toBe(false);
    expect(validarReordenacaoFotos([1, -5, 3]).valido).toBe(false);
  });
});
