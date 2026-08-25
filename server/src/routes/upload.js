// =============================================================================
// Rotas de Upload Genérico
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const AppError = require('../errors/AppError');

// POST /api/upload — Upload genérico de arquivo (admin only)
router.post('/', autenticar, apenasAdmin, upload.single('arquivo'), (req, res, next) => {
  if (!req.file) {
    return next(AppError.badRequest('Nenhum arquivo enviado'));
  }

  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    nomeOriginal: req.file.originalname,
    tamanho: req.file.size,
    tipo: req.file.mimetype,
  });
});

module.exports = router;
