// =============================================================================
// Theatrum — Logger Estruturado
// Suporte a timestamps, níveis de log e formatação consistente (ISO 25010)
// =============================================================================

const NIVEIS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
};

function formatarLog(nivel, mensagem, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
  return `[${timestamp}] [${nivel}] ${mensagem}${metaStr}`;
}

const logger = {
  info(msg, meta) {
    console.log(formatarLog(NIVEIS.INFO, msg, meta));
  },
  warn(msg, meta) {
    console.warn(formatarLog(NIVEIS.WARN, msg, meta));
  },
  error(msg, meta) {
    console.error(formatarLog(NIVEIS.ERROR, msg, meta));
  },
  debug(msg, meta) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatarLog(NIVEIS.DEBUG, msg, meta));
    }
  },
};

module.exports = logger;
