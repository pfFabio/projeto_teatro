// =============================================================================
// Theatrum — Classe Padronizada de Erros Operacionais (AppError)
// Facilita o tratamento de erros semânticos na API (400, 401, 403, 404, 409, etc.)
// =============================================================================

class AppError extends Error {
  /**
   * @param {string} mensagem - Mensagem descritiva do erro
   * @param {number} statusCode - Código de status HTTP (default: 400)
   * @param {any} [detalhes] - Detalhes adicionais opcionais (ex: campos inválidos)
   */
  constructor(mensagem, statusCode = 400, detalhes = null) {
    super(mensagem);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.detalhes = detalhes;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, detalhes = null) {
    return new AppError(msg, 400, detalhes);
  }

  static unauthorized(msg = 'Não autorizado') {
    return new AppError(msg, 401);
  }

  static forbidden(msg = 'Acesso proibido') {
    return new AppError(msg, 403);
  }

  static notFound(msg = 'Recurso não encontrado') {
    return new AppError(msg, 404);
  }

  static conflict(msg = 'Conflito de dados') {
    return new AppError(msg, 409);
  }

  static internal(msg = 'Erro interno do servidor') {
    return new AppError(msg, 500);
  }
}

module.exports = AppError;
