// =============================================================================
// Testes Unitários — Validador de Peças
// =============================================================================

const {
  validarCriacaoPeca,
  validarCriacaoLocal,
  validarAlocacao,
  validarReordenacaoFotos,
} = require('../../validators/pecaValidator');

describe('validarCriacaoPeca', () => {
  test('deve aceitar dados válidos', () => {
    const resultado = validarCriacaoPeca({
      titulo: 'Hamlet',
      resumo: 'Uma tragédia de Shakespeare',
      endereco: 'Teatro Municipal — São Paulo, SP',
    });
    expect(resultado.valido).toBe(true);
    expect(resultado.mensagem).toBeUndefined();
  });

  test('deve rejeitar título vazio', () => {
    const resultado = validarCriacaoPeca({
      titulo: '',
      resumo: 'Resumo',
      endereco: 'Endereço',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Título');
  });

  test('deve rejeitar título nulo', () => {
    const resultado = validarCriacaoPeca({
      titulo: null,
      resumo: 'Resumo',
      endereco: 'Endereço',
    });
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar título com apenas espaços', () => {
    const resultado = validarCriacaoPeca({
      titulo: '   ',
      resumo: 'Resumo',
      endereco: 'Endereço',
    });
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar resumo vazio', () => {
    const resultado = validarCriacaoPeca({
      titulo: 'Hamlet',
      resumo: '',
      endereco: 'Endereço',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Resumo');
  });

  test('deve rejeitar endereço vazio', () => {
    const resultado = validarCriacaoPeca({
      titulo: 'Hamlet',
      resumo: 'Resumo válido',
      endereco: '',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Endereço');
  });

  test('deve rejeitar quando todos os campos estão ausentes', () => {
    const resultado = validarCriacaoPeca({});
    expect(resultado.valido).toBe(false);
  });
});

describe('validarCriacaoLocal', () => {
  test('deve aceitar dados válidos', () => {
    const resultado = validarCriacaoLocal({
      nomeLocal: 'Theatro Municipal de Niterói',
      cidade: 'Niterói, RJ',
      endereco: 'Rua Quinze de Novembro, 35',
    });
    expect(resultado.valido).toBe(true);
  });

  test('deve rejeitar nome do local vazio', () => {
    const resultado = validarCriacaoLocal({
      nomeLocal: '',
      cidade: 'Niterói, RJ',
      endereco: 'Rua Quinze',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('local');
  });

  test('deve rejeitar cidade vazia', () => {
    const resultado = validarCriacaoLocal({
      nomeLocal: 'Teatro',
      cidade: '',
      endereco: 'Rua Quinze',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Cidade');
  });

  test('deve rejeitar endereço vazio', () => {
    const resultado = validarCriacaoLocal({
      nomeLocal: 'Teatro',
      cidade: 'Niterói',
      endereco: '',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Endereço');
  });
});

describe('validarAlocacao', () => {
  test('deve aceitar dados válidos', () => {
    const resultado = validarAlocacao({
      colaboradorId: 1,
      funcaoNaPeca: 'Ator Principal',
    });
    expect(resultado.valido).toBe(true);
  });

  test('deve rejeitar sem colaboradorId', () => {
    const resultado = validarAlocacao({
      colaboradorId: null,
      funcaoNaPeca: 'Ator',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('colaboradorId');
  });

  test('deve rejeitar sem funcaoNaPeca', () => {
    const resultado = validarAlocacao({
      colaboradorId: 1,
      funcaoNaPeca: '',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('funcaoNaPeca');
  });

  test('deve rejeitar funcaoNaPeca com apenas espaços', () => {
    const resultado = validarAlocacao({
      colaboradorId: 1,
      funcaoNaPeca: '   ',
    });
    expect(resultado.valido).toBe(false);
  });
});

describe('validarReordenacaoFotos', () => {
  test('deve aceitar array de IDs válido', () => {
    const resultado = validarReordenacaoFotos([1, 2, 3]);
    expect(resultado.valido).toBe(true);
  });

  test('deve rejeitar array vazio', () => {
    const resultado = validarReordenacaoFotos([]);
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar valor não-array', () => {
    const resultado = validarReordenacaoFotos('não é array');
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar null', () => {
    const resultado = validarReordenacaoFotos(null);
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar undefined', () => {
    const resultado = validarReordenacaoFotos(undefined);
    expect(resultado.valido).toBe(false);
  });
});
