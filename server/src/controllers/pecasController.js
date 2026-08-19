// =============================================================================
// Controller de Peças de Teatro
// Single Responsibility: apenas CRUD de peças + alocação de colaboradores
// Fotos → fotosController.js | Locais → locaisController.js
// =============================================================================

const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');
const { validarCriacaoPeca, validarAlocacao } = require('../validators/pecaValidator');

// GET /api/pecas — Listar todas as peças (com filtros)
async function listarPecas(req, res) {
  try {
    const { status, busca, cidade, pagina = 1, limite = 20 } = req.query;

    // Montar filtros dinâmicos
    const where = {};

    if (status) {
      where.status = status;
    }

    if (busca) {
      where.OR = [
        { titulo: { contains: busca } },
        { resumo: { contains: busca } },
        { endereco: { contains: busca } },
        { locais: { some: { OR: [{ cidade: { contains: busca } }, { nomeLocal: { contains: busca } }, { endereco: { contains: busca } }] } } },
      ];
    }

    if (cidade) {
      where.locais = { some: { cidade: { contains: cidade } } };
    }

    const [pecas, total] = await Promise.all([
      prisma.peca.findMany({
        where,
        include: {
          fotos: { orderBy: { ordem: 'asc' }, take: 1 }, // Só a primeira foto para o card
          locais: { orderBy: { dataEstreia: 'asc' } },
          _count: { select: { colaboradores: true } },
        },
        orderBy: { criadoEm: 'desc' },
        skip: (parseInt(pagina) - 1) * parseInt(limite),
        take: parseInt(limite),
      }),
      prisma.peca.count({ where }),
    ]);

    res.json({
      pecas,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (erro) {
    console.error('Erro ao listar peças:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao listar peças' });
  }
}

// GET /api/pecas/:id — Detalhes de uma peça (com colaboradores, fotos e locais)
async function buscarPeca(req, res) {
  try {
    const { id } = req.params;

    const peca = await prisma.peca.findUnique({
      where: { id: parseInt(id) },
      include: {
        fotos: { orderBy: { ordem: 'asc' } },
        locais: { orderBy: { dataEstreia: 'asc' } },
        colaboradores: {
          include: {
            colaborador: true,
          },
          orderBy: { funcaoNaPeca: 'asc' },
        },
      },
    });

    if (!peca) {
      return res.status(404).json({ erro: true, mensagem: 'Peça não encontrada' });
    }

    res.json(peca);
  } catch (erro) {
    console.error('Erro ao buscar peça:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao buscar peça' });
  }
}

// POST /api/pecas — Criar nova peça (admin only)
async function criarPeca(req, res) {
  try {
    const { titulo, resumo, endereco, latitude, longitude, dataEstreia, status } = req.body;

    // Validação via validator
    const validacao = validarCriacaoPeca({ titulo, resumo, endereco });
    if (!validacao.valido) {
      return res.status(400).json({ erro: true, mensagem: validacao.mensagem });
    }

    const peca = await prisma.peca.create({
      data: {
        titulo,
        resumo,
        endereco,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        dataEstreia: dataEstreia || null,
        status: status || 'PROGRAMADA',
      },
    });

    res.status(201).json(peca);
  } catch (erro) {
    console.error('Erro ao criar peça:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao criar peça' });
  }
}

// PUT /api/pecas/:id — Atualizar peça (admin only)
async function atualizarPeca(req, res) {
  try {
    const { id } = req.params;
    const { titulo, resumo, endereco, latitude, longitude, dataEstreia, status } = req.body;

    const peca = await prisma.peca.update({
      where: { id: parseInt(id) },
      data: {
        ...(titulo && { titulo }),
        ...(resumo && { resumo }),
        ...(endereco && { endereco }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(dataEstreia !== undefined && { dataEstreia }),
        ...(status && { status }),
      },
    });

    res.json(peca);
  } catch (erro) {
    console.error('Erro ao atualizar peça:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao atualizar peça' });
  }
}

// DELETE /api/pecas/:id — Deletar peça (admin only)
async function deletarPeca(req, res) {
  try {
    const { id } = req.params;

    // Buscar fotos para deletar os arquivos
    const fotos = await prisma.fotoPeca.findMany({
      where: { pecaId: parseInt(id) },
    });

    // Deletar arquivos de fotos do disco
    for (const foto of fotos) {
      const caminhoArquivo = path.join(__dirname, '..', '..', foto.url);
      if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo);
      }
    }

    await prisma.peca.delete({
      where: { id: parseInt(id) },
    });

    res.json({ mensagem: 'Peça deletada com sucesso' });
  } catch (erro) {
    console.error('Erro ao deletar peça:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao deletar peça' });
  }
}

// POST /api/pecas/:id/colaboradores — Alocar colaborador à peça (admin only)
async function alocarColaborador(req, res) {
  try {
    const { id } = req.params;
    const { colaboradorId, funcaoNaPeca } = req.body;

    const validacao = validarAlocacao({ colaboradorId, funcaoNaPeca });
    if (!validacao.valido) {
      return res.status(400).json({ erro: true, mensagem: validacao.mensagem });
    }

    // Verificar se já existe alocação
    const existente = await prisma.pecaColaborador.findUnique({
      where: {
        pecaId_colaboradorId: {
          pecaId: parseInt(id),
          colaboradorId: parseInt(colaboradorId),
        },
      },
    });

    if (existente) {
      return res.status(409).json({
        erro: true,
        mensagem: 'Este colaborador já está alocado nesta peça',
      });
    }

    const alocacao = await prisma.pecaColaborador.create({
      data: {
        pecaId: parseInt(id),
        colaboradorId: parseInt(colaboradorId),
        funcaoNaPeca,
      },
      include: { colaborador: true },
    });

    res.status(201).json(alocacao);
  } catch (erro) {
    console.error('Erro ao alocar colaborador:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao alocar colaborador' });
  }
}

// DELETE /api/pecas/:id/colaboradores/:colabId — Remover colaborador da peça
async function removerColaborador(req, res) {
  try {
    const { id, colabId } = req.params;

    await prisma.pecaColaborador.delete({
      where: {
        pecaId_colaboradorId: {
          pecaId: parseInt(id),
          colaboradorId: parseInt(colabId),
        },
      },
    });

    res.json({ mensagem: 'Colaborador removido da peça com sucesso' });
  } catch (erro) {
    console.error('Erro ao remover colaborador:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao remover colaborador' });
  }
}

module.exports = {
  listarPecas,
  buscarPeca,
  criarPeca,
  atualizarPeca,
  deletarPeca,
  alocarColaborador,
  removerColaborador,
};
