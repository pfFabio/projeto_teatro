// =============================================================================
// Theatrum — File Service (I/O Assíncrono e Seguro)
// Não bloqueia o Event Loop do Node.js (ISO 25010 - Eficiência)
// =============================================================================

const fs = require('fs/promises');
const path = require('path');
const logger = require('../lib/logger');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

class FileService {
  /**
   * Remove um arquivo do disco assincronamente a partir de uma URL relativa (/uploads/arquivo.ext)
   * @param {string} urlRelativa - Ex: "/uploads/foto-123.jpg"
   * @returns {Promise<boolean>}
   */
  static async removerArquivo(urlRelativa) {
    if (!urlRelativa) return false;

    try {
      // Normaliza e previne path traversal (Directory Traversal Security)
      const nomeArquivo = path.basename(urlRelativa);
      const caminhoCompleto = path.join(UPLOADS_DIR, nomeArquivo);

      await fs.unlink(caminhoCompleto);
      logger.info(`Arquivo removido com sucesso: ${nomeArquivo}`);
      return true;
    } catch (erro) {
      if (erro.code === 'ENOENT') {
        // Arquivo já não existia no disco, comportamento idempotente
        logger.warn(`Tentativa de remover arquivo inexistente: ${urlRelativa}`);
        return false;
      }
      logger.error(`Erro ao remover arquivo: ${urlRelativa}`, erro.message);
      return false;
    }
  }

  /**
   * Remove múltiplos arquivos assincronamente em paralelo
   * @param {string[]} urls - Lista de URLs relativas
   */
  static async removerMultiplosArquivos(urls) {
    if (!Array.isArray(urls) || urls.length === 0) return;
    await Promise.allSettled(urls.map(url => FileService.removerArquivo(url)));
  }
}

module.exports = FileService;
