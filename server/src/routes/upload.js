// =============================================================================
// Rotas de Upload genérico
// Para uploads que não pertencem a uma entidade específica
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/upload — Upload genérico de arquivo (admin only)
router.post('/', autenticar, apenasAdmin, upload.single('arquivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: true, mensagem: 'Nenhum arquivo enviado' });
  }

  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    nomeOriginal: req.file.originalname,
    tamanho: req.file.size,
    tipo: req.file.mimetype,
  });
});

module.exports = router;
