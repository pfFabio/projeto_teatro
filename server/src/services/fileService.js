// =============================================================================
// Theatrum — File Service (I/O Assíncrono e Seguro)
// Não bloqueia o Event Loop do Node.js (ISO 25010 - Eficiência)
// =============================================================================

const fs = require('fs/promises');
const path = require('path');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const TIPOS_EXTENSOES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

class FileService {
  /**
   * Salva um arquivo no PostgreSQL (persistência no Render) e gera cache local em disco
   * @param {Object} arquivo - Objeto req.file do Multer (com buffer em memória)
   * @returns {Promise<{ nomeArquivo: string, url: string, mimetype: string, tamanho: number }>}
   */
  static async salvarArquivo(arquivo) {
    if (!arquivo) return null;

    const sufixoUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extensao = TIPOS_EXTENSOES[arquivo.mimetype] || path.extname(arquivo.originalname || '') || '.bin';
    const fieldname = arquivo.fieldname || 'arquivo';
    const nomeArquivo = `${fieldname}-${sufixoUnico}${extensao}`;
    const urlRelativa = `/uploads/${nomeArquivo}`;

    // 1. Salva no banco PostgreSQL (Persistência garantida no Render)
    await prisma.arquivo.create({
      data: {
        nome: nomeArquivo,
        mimetype: arquivo.mimetype,
        dados: arquivo.buffer,
        tamanho: arquivo.size,
      },
    });

    // 2. Grava em disco local como cache rápido (se o diretório existir/for gravável)
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOADS_DIR, nomeArquivo), arquivo.buffer);
    } catch (errCache) {
      logger.warn('Aviso: Falha ao escrever cache em disco, mantendo apenas no PostgreSQL:', errCache.message);
    }

    return {
      nomeArquivo,
      url: urlRelativa,
      mimetype: arquivo.mimetype,
      tamanho: arquivo.size,
    };
  }

  /**
   * Salva múltiplos arquivos no PostgreSQL e disco
   * @param {Object[]} arquivos - Array de arquivos do Multer
   * @returns {Promise<Object[]>}
   */
  static async salvarMultiplosArquivos(arquivos) {
    if (!Array.isArray(arquivos) || arquivos.length === 0) return [];
    const resultados = [];
    for (const arq of arquivos) {
      const salvo = await FileService.salvarArquivo(arq);
      if (salvo) resultados.push(salvo);
    }
    return resultados;
  }

  /**
   * Remove um arquivo do banco PostgreSQL e do disco
   * @param {string} urlRelativa - Ex: "/uploads/foto-123.jpg"
   * @returns {Promise<boolean>}
   */
  static async removerArquivo(urlRelativa) {
    if (!urlRelativa) return false;

    const nomeArquivo = path.basename(urlRelativa);

    // 1. Remove do PostgreSQL
    try {
      await prisma.arquivo.deleteMany({ where: { nome: nomeArquivo } });
    } catch (errDb) {
      logger.error(`Erro ao remover arquivo do banco: ${nomeArquivo}`, errDb.message);
    }

    // 2. Remove do disco
    try {
      const caminhoCompleto = path.join(UPLOADS_DIR, nomeArquivo);
      await fs.unlink(caminhoCompleto);
      logger.info(`Arquivo removido com sucesso do disco: ${nomeArquivo}`);
      return true;
    } catch (erro) {
      if (erro.code === 'ENOENT') {
        return true;
      }
      logger.error(`Erro ao remover arquivo do disco: ${urlRelativa}`, erro.message);
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
