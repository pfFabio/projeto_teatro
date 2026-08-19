// =============================================================================
// Controller de Configurações do Site
// Permite ao admin customizar textos, imagens e conteúdo do site
// =============================================================================

const prisma = require('../lib/prisma');

// GET /api/config — Retorna todas as configurações (acesso público)
async function listarConfigs(req, res) {
  try {
    const configs = await prisma.configSite.findMany();

    // Transformar array em objeto chave-valor para facilitar o uso no frontend
    const configObj = {};
    for (const config of configs) {
      configObj[config.chave] = {
        valor: config.valor,
        tipo: config.tipo,
      };
    }

    res.json(configObj);
  } catch (erro) {
    console.error('Erro ao listar configurações:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao listar configurações' });
  }
}

// PUT /api/config/:chave — Atualizar ou criar configuração (admin only)
async function atualizarConfig(req, res) {
  try {
    const { chave } = req.params;
    const { valor, tipo = 'TEXT' } = req.body;

    if (valor === undefined) {
      return res.status(400).json({
        erro: true,
        mensagem: 'O campo "valor" é obrigatório',
      });
    }

    // Se foi enviado um arquivo (imagem/vídeo para configuração)
    let valorFinal = valor;
    if (req.file) {
      valorFinal = `/uploads/${req.file.filename}`;
    }

    const config = await prisma.configSite.upsert({
      where: { chave },
      update: { valor: valorFinal, tipo },
      create: { chave, valor: valorFinal, tipo },
    });

    res.json(config);
  } catch (erro) {
    console.error('Erro ao atualizar configuração:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao atualizar configuração' });
  }
}

module.exports = { listarConfigs, atualizarConfig };
