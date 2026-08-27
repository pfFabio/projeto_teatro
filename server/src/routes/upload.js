const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const FileService = require('../services/fileService');
const AppError = require('../errors/AppError');

// POST /api/upload — Upload genérico de arquivo (admin only)
router.post('/', autenticar, apenasAdmin, upload.single('arquivo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(AppError.badRequest('Nenhum arquivo enviado'));
    }

    const salvo = await FileService.salvarArquivo(req.file);

    res.status(201).json({
      url: salvo.url,
      nomeOriginal: req.file.originalname,
      tamanho: salvo.tamanho,
      tipo: salvo.mimetype,
    });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
