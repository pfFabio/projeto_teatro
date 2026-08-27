// =============================================================================
// Middleware de Upload de Arquivos (Multer)
// Configura armazenamento em disco, filtros e limites
// =============================================================================

const multer = require('multer');
const path = require('path');

// Tipos de arquivo permitidos
const TIPOS_PERMITIDOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

// Configuração de armazenamento em memória (Buffer para persistência no PostgreSQL)
const armazenamento = multer.memoryStorage();

// Filtro de tipos de arquivo
const filtroArquivo = (req, arquivo, cb) => {
  if (TIPOS_PERMITIDOS[arquivo.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${arquivo.mimetype}. Use: JPG, PNG, WebP, GIF, MP4 ou WebM.`), false);
  }
};

// Instância do Multer configurada
const upload = multer({
  storage: armazenamento,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (vídeos podem ser maiores)
  },
});

module.exports = upload;
