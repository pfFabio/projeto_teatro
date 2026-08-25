// =============================================================================
// Testes Unitários — Middleware validateId
// =============================================================================

const validateId = require('../../middleware/validateId');

describe('Middleware validateId', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {} };
    res = {};
    next = jest.fn();
  });

  it('deve permitir ID inteiro positivo válido e anexar idNum', () => {
    req.params.id = '123';
    const middleware = validateId('id');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.params.idNum).toBe(123);
  });

  it('deve retornar erro AppError 400 para ID não numérico', () => {
    req.params.id = 'abc';
    const middleware = validateId('id');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const erro = next.mock.calls[0][0];
    expect(erro.statusCode).toBe(400);
    expect(erro.message).toContain("O parâmetro 'id' deve ser um número inteiro");
  });

  it('deve retornar erro 400 para ID zero ou negativo', () => {
    req.params.id = '0';
    const middleware = validateId('id');

    middleware(req, res, next);

    const erro = next.mock.calls[0][0];
    expect(erro.statusCode).toBe(400);
  });

  it('deve validar múltiplos parâmetros de rota', () => {
    req.params.pecaId = '10';
    req.params.fotoId = '5';
    const middleware = validateId('pecaId', 'fotoId');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.params.pecaIdNum).toBe(10);
    expect(req.params.fotoIdNum).toBe(5);
  });
});
