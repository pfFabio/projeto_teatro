// =============================================================================
// Theatrum — Constantes de Status de Peças e Locais (Backend)
// Centralização e Open/Closed Principle
// =============================================================================

const STATUS_PECA = {
  PROGRAMADA: 'PROGRAMADA',
  EM_CARTAZ: 'EM_CARTAZ',
  ENCERRADA: 'ENCERRADA',
  EM_REPERTORIO: 'EM_REPERTORIO',
  PROJETO_FUTURO: 'PROJETO_FUTURO',
};

const STATUS_PERMITIDOS = Object.values(STATUS_PECA);

function validarStatus(status) {
  if (!status) return true; // Se não fornecido, usará default
  return STATUS_PERMITIDOS.includes(status);
}

module.exports = {
  STATUS_PECA,
  STATUS_PERMITIDOS,
  validarStatus,
};
