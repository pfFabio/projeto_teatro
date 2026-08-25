// =============================================================================
// Testes Unitários — Middleware de Autenticação JWT
// =============================================================================

const jwt = require('jsonwebtoken');
const { autenticar, apenasAdmin, autenticarOpcional } = require('../../middleware/auth');
const { ENV } = require('../../config/env');

// Helper para criar mocks de req/res/next
function criarMocks(headers = {}) {
  const req = {
    headers: headers,
    usuario: null,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('autenticar', () => {
  test('deve rejeitar sem header Authorization chamando next(AppError 401)', () => {
    const { req, res, next } = criarMocks({});

    autenticar(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const erro = next.mock.calls[0][0];
    expect(erro.statusCode).toBe(401);
    expect(erro.message).toContain('Token');
  });

  test('deve rejeitar sem prefixo Bearer', () => {
    const { req, res, next } = criarMocks({ authorization: 'Token abc123' });

    autenticar(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const erro = next.mock.calls[0][0];
    expect(erro.statusCode).toBe(401);
  });

  test('deve rejeitar com token inválido', () => {
    const { req, res, next } = criarMocks({ authorization: 'Bearer token-invalido' });

    autenticar(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const erro = next.mock.calls[0][0];
    expect(erro.statusCode).toBe(401);
    expect(erro.message).toContain('inválido');
  });

  test('deve aceitar token válido e popular req.usuario', () => {
    const payload = { id: 1, email: 'admin@theatrum.com', nome: 'Admin', papel: 'ADMIN' };
    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1h' });
    const { req, res, next } = criarMocks({ authorization: `Bearer ${token}` });

    autenticar(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe(1);
    expect(req.usuario.email).toBe('admin@theatrum.com');
    expect(req.usuario.papel).toBe('ADMIN');
  });
});

describe('autenticarOpcional', () => {
  test('deve popular req.usuario se token válido fornecido', () => {
    const payload = { id: 2, email: 'admin@theatrum.com', papel: 'ADMIN' };
    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1h' });
    const { req, res, next } = criarMocks({ authorization: `Bearer ${token}` });

    autenticarOpcional(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe(2);
  });

  test('deve continuar sem erro se nenhum token for fornecido', () => {
    const { req, res, next } = criarMocks({});

    autenticarOpcional(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.usuario).toBeNull();
  });
});

describe('apenasAdmin', () => {
  test('deve permitir acesso para ADMIN', () => {
    const { req, res, next } = criarMocks();
    req.usuario = { id: 1, papel: 'ADMIN' };

    apenasAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('deve rejeitar acesso para não-ADMIN com AppError 403', () => {
    const { req, res, next } = criarMocks();
    req.usuario = { id: 1, papel: 'USUARIO' };

    apenasAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const erro = next.mock.calls[0][0];
    expect(erro.statusCode).toBe(403);
    expect(erro.message).toContain('administradores');
  });

  test('deve rejeitar quando req.usuario é null com AppError 403', () => {
    const { req, res, next } = criarMocks();
    req.usuario = null;

    apenasAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const erro = next.mock.calls[0][0];
    expect(erro.statusCode).toBe(403);
  });

  test('deve rejeitar quando req.usuario é undefined com AppError 403', () => {
    const { req, res, next } = criarMocks();

    apenasAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const erro = next.mock.calls[0][0];
    expect(erro.statusCode).toBe(403);
  });
});
