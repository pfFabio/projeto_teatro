// =============================================================================
// Testes Unitários — Middleware de Autenticação JWT
// =============================================================================

const jwt = require('jsonwebtoken');
const { autenticar, apenasAdmin } = require('../../middleware/auth');

// Mock do process.env
process.env.JWT_SECRET = 'segredo-teste';

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
  test('deve rejeitar sem header Authorization', () => {
    const { req, res, next } = criarMocks({});

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ erro: true, mensagem: expect.stringContaining('Token') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('deve rejeitar sem prefixo Bearer', () => {
    const { req, res, next } = criarMocks({ authorization: 'Token abc123' });

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('deve rejeitar com token inválido', () => {
    const { req, res, next } = criarMocks({ authorization: 'Bearer token-invalido' });

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: expect.stringContaining('inválido') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('deve aceitar token válido e popular req.usuario', () => {
    const payload = { id: 1, email: 'admin@theatrum.com', nome: 'Admin', papel: 'ADMIN' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const { req, res, next } = criarMocks({ authorization: `Bearer ${token}` });

    autenticar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe(1);
    expect(req.usuario.email).toBe('admin@theatrum.com');
    expect(req.usuario.papel).toBe('ADMIN');
  });

  test('deve rejeitar token expirado', () => {
    const payload = { id: 1, email: 'admin@theatrum.com', nome: 'Admin', papel: 'ADMIN' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '0s' });

    // Aguardar 1 segundo para o token expirar
    const { req, res, next } = criarMocks({ authorization: `Bearer ${token}` });

    // Forçar expiração
    jest.useFakeTimers();
    jest.advanceTimersByTime(2000);
    jest.useRealTimers();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('apenasAdmin', () => {
  test('deve permitir acesso para ADMIN', () => {
    const { req, res, next } = criarMocks();
    req.usuario = { id: 1, papel: 'ADMIN' };

    apenasAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('deve rejeitar acesso para não-ADMIN', () => {
    const { req, res, next } = criarMocks();
    req.usuario = { id: 1, papel: 'USUARIO' };

    apenasAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: expect.stringContaining('administradores') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('deve rejeitar quando req.usuario é null', () => {
    const { req, res, next } = criarMocks();
    req.usuario = null;

    apenasAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('deve rejeitar quando req.usuario é undefined', () => {
    const { req, res, next } = criarMocks();

    apenasAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
