// =============================================================================
// Theatrum — Middleware de Validação de Parâmetros de Rota (ID numérico)
// Previne falhas de parseInt / SQL/NoSQL Injection / Erros de conversão
// =============================================================================

const AppError = require('../errors/AppError');

/**
 * Cria um middleware que valida se determinados parâmetros de rota são números inteiros positivos.
 * @param  {...string} nomesParams - Nomes dos parâmetros a validar (ex: 'id', 'fotoId', 'colabId')
 */
function validateId(...nomesParams) {
  const paramsParaValidar = nomesParams.length > 0 ? nomesParams : ['id'];

  return (req, res, next) => {
    for (const nome of paramsParaValidar) {
      const valor = req.params[nome];
      if (valor !== undefined) {
        const num = Number(valor);
        if (!Number.isInteger(num) || num <= 0) {
          return next(
            AppError.badRequest(`O parâmetro '${nome}' deve ser um número inteiro positivo válido. Recebido: '${valor}'`)
          );
        }
        // Anexa o ID já convertido para facilitar o uso no controller/service
        req.params[`${nome}Num`] = num;
      }
    }
    next();
  };
}

module.exports = validateId;
