// =============================================================================
// Middleware de Upload de Arquivos (Multer)
// Configura armazenamento em disco, filtros e limites
// =============================================================================

const multer = require('multer');
const path = require('path');
const AppError = require('../errors/AppError');

// Tipos de arquivo permitidos para galerias (fotos e vídeos)
const TIPOS_PERMITIDOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

// Tipos de arquivo permitidos para comprovantes (documentos e imagens estáticas)
const TIPOS_COMPROVANTES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Configuração de armazenamento em memória (Buffer para persistência no PostgreSQL)
const armazenamento = multer.memoryStorage();

// Filtro de tipos de arquivo
const filtroArquivo = (req, arquivo, cb) => {
  if (TIPOS_PERMITIDOS[arquivo.mimetype]) {
    cb(null, true);
  } else {
    cb(AppError.badRequest(`Tipo de arquivo não permitido: ${arquivo.mimetype}. Use: JPG, PNG, WebP, GIF, MP4 ou WebM.`), false);
  }
};

const filtroComprovante = (req, arquivo, cb) => {
  if (TIPOS_COMPROVANTES[arquivo.mimetype]) {
    cb(null, true);
  } else {
    cb(AppError.badRequest(`Tipo de arquivo não permitido: ${arquivo.mimetype}. Envie comprovantes em PDF, JPG, PNG ou WebP.`), false);
  }
};

// Instância do Multer configurada para mídia geral
const upload = multer({
  storage: armazenamento,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Instância do Multer para comprovantes de despesa (PDF e fotos até 10MB)
const uploadComprovante = multer({
  storage: armazenamento,
  fileFilter: filtroComprovante,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

upload.uploadComprovante = uploadComprovante;

module.exports = upload;
module.exports.uploadComprovante = uploadComprovante;
