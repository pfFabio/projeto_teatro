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

// Configuração de armazenamento em disco
const armazenamento = multer.diskStorage({
  destination: (req, arquivo, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, arquivo, cb) => {
    // Gerar nome único: timestamp + número aleatório + extensão original
    const sufixoUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extensao = TIPOS_PERMITIDOS[arquivo.mimetype] || path.extname(arquivo.originalname);
    cb(null, `${arquivo.fieldname}-${sufixoUnico}${extensao}`);
  },
});

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
