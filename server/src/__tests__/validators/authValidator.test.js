// =============================================================================
// Testes Unitários — Validador de Autenticação
// =============================================================================

const { validarLogin, validarAtualizacaoPerfil } = require('../../validators/authValidator');

describe('validarLogin', () => {
  test('deve aceitar email e senha válidos', () => {
    const resultado = validarLogin({
      email: 'admin@theatrum.com',
      senha: 'minhaSenha123',
    });
    expect(resultado.valido).toBe(true);
    expect(resultado.mensagem).toBeUndefined();
  });

  test('deve rejeitar email vazio', () => {
    const resultado = validarLogin({
      email: '',
      senha: 'minhaSenha123',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Email');
  });

  test('deve rejeitar email nulo', () => {
    const resultado = validarLogin({
      email: null,
      senha: 'minhaSenha123',
    });
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar senha vazia', () => {
    const resultado = validarLogin({
      email: 'admin@theatrum.com',
      senha: '',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Senha');
  });

  test('deve rejeitar senha nula', () => {
    const resultado = validarLogin({
      email: 'admin@theatrum.com',
      senha: null,
    });
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar email sem formato válido', () => {
    const resultado = validarLogin({
      email: 'email-invalido',
      senha: 'minhaSenha123',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('email');
  });

  test('deve rejeitar email sem @ e domínio', () => {
    const resultado = validarLogin({
      email: 'semArroba',
      senha: 'senha123',
    });
    expect(resultado.valido).toBe(false);
  });

  test('deve aceitar email com subdomínio', () => {
    const resultado = validarLogin({
      email: 'admin@mail.theatrum.com',
      senha: 'senha123',
    });
    expect(resultado.valido).toBe(true);
  });

  test('deve rejeitar ambos vazios', () => {
    const resultado = validarLogin({ email: '', senha: '' });
    expect(resultado.valido).toBe(false);
  });

  test('deve rejeitar email com apenas espaços', () => {
    const resultado = validarLogin({
      email: '   ',
      senha: 'senha123',
    });
    expect(resultado.valido).toBe(false);
  });
});

describe('validarAtualizacaoPerfil', () => {
  test('deve aceitar atualização de nome e email válidos', () => {
    const resultado = validarAtualizacaoPerfil({
      nome: 'Diretor Angelo Turci',
      email: 'angelofariaturci@theatrum.com',
    });
    expect(resultado.valido).toBe(true);
  });

  test('deve rejeitar payload vazio ou não objeto', () => {
    expect(validarAtualizacaoPerfil(null).valido).toBe(false);
    expect(validarAtualizacaoPerfil({}).valido).toBe(false);
  });

  test('deve rejeitar nome em branco', () => {
    const resultado = validarAtualizacaoPerfil({ nome: '   ' });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('Nome');
  });

  test('deve rejeitar email com formato inválido', () => {
    const resultado = validarAtualizacaoPerfil({ email: 'invalido-sem-arroba' });
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toContain('email');
  });
});
