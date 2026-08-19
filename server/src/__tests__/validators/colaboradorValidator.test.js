// =============================================================================
// Testes Unitários — Validador de Colaboradores
// =============================================================================

const {
  validarCriacaoColaborador,
  CAMPOS_OBRIGATORIOS,
} = require('../../validators/colaboradorValidator');

describe('validarCriacaoColaborador', () => {
  const dadosValidos = {
    nome: 'João Silva',
    funcao: 'Ator',
    idade: '25',
    celular: '(21) 99999-9999',
    email: 'joao@email.com',
    endereco: 'Rua A, 123 — Centro, Niterói, RJ',
    genero: 'Masculino',
  };

  test('deve aceitar dados completos válidos', () => {
    const resultado = validarCriacaoColaborador(dadosValidos);
    expect(resultado.valido).toBe(true);
    expect(resultado.mensagem).toBeUndefined();
  });

  test('deve rejeitar quando nome está vazio', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, nome: '' });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('obrigatórios');
  });

  test('deve rejeitar quando funcao está ausente', () => {
    const dados = { ...dadosValidos };
    delete dados.funcao;
    const resultado = validarCriacaoColaborador(dados);
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar quando email está vazio', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, email: '' });
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar quando genero está vazio', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, genero: '' });
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar idade inválida (0)', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, idade: '0' });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Idade');
  });

  test('deve rejeitar idade inválida (negativa)', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, idade: '-5' });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Idade');
  });

  test('deve rejeitar idade inválida (acima de 120)', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, idade: '150' });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Idade');
  });

  test('deve rejeitar idade não numérica', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, idade: 'abc' });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Idade');
  });

  test('deve aceitar idade válida no limite inferior (1)', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, idade: '1' });
    expect(resultado.valido).toBe(true);
  });

  test('deve aceitar idade válida no limite superior (120)', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, idade: '120' });
    expect(resultado.valido).toBe(true);
  });

  test('deve rejeitar campo com apenas espaços', () => {
    const resultado = validarCriacaoColaborador({ ...dadosValidos, nome: '   ' });
    expect(resultado.valido).toBe(false);
  });
});

describe('CAMPOS_OBRIGATORIOS', () => {
  test('deve conter todos os 7 campos', () => {
    expect(CAMPOS_OBRIGATORIOS).toHaveLength(7);
    expect(CAMPOS_OBRIGATORIOS).toEqual(
      expect.arrayContaining(['nome', 'funcao', 'idade', 'celular', 'email', 'endereco', 'genero'])
    );
  });
});
