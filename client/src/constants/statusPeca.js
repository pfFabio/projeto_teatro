// =============================================================================
// Constantes de Status de Peça — Centralização (Open/Closed Principle)
// Qualquer novo status adicionado aqui se propaga automaticamente
// =============================================================================

/**
 * Mapa de status para exibição visual.
 * Chave: status do banco de dados | Valor: { classe CSS, texto exibido }
 */
export const tagMap = {
  EM_CARTAZ: { classe: 'tag-em-cartaz', texto: 'Em Cartaz' },
  ENCERRADA: { classe: 'tag-encerrada', texto: 'Encerrada' },
  PROGRAMADA: { classe: 'tag-programada', texto: 'Programada' },
};

/**
 * Opções de filtro para listagens de peças.
 */
export const statusFiltros = [
  { valor: '', texto: 'Todas' },
  { valor: 'EM_CARTAZ', texto: '🟢 Em Cartaz' },
  { valor: 'PROGRAMADA', texto: '🔵 Programadas' },
  { valor: 'ENCERRADA', texto: '🔴 Encerradas' },
];

/**
 * Retorna tag info para um status, com fallback para PROGRAMADA.
 * @param {string} status
 * @returns {{ classe: string, texto: string }}
 */
export function getTag(status) {
  return tagMap[status] || tagMap.PROGRAMADA;
}
