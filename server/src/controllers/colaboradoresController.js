// =============================================================================
// Controller de Colaboradores
// CRUD completo — Cadastro público + gerenciamento admin
// =============================================================================

const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');
const { validarCriacaoColaborador } = require('../validators/colaboradorValidator');

// GET /api/colaboradores — Listar todos (com filtros)
async function listarColaboradores(req, res) {
  try {
    const { funcao, genero, busca, pagina = 1, limite = 20 } = req.query;

    const where = {};

    if (funcao) {
      where.funcao = { contains: funcao, mode: 'insensitive' };
    }

    if (genero) {
      where.genero = genero;
    }

    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
        { funcao: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const [colaboradores, total] = await Promise.all([
      prisma.colaborador.findMany({
        where,
        include: {
          pecas: {
            include: { peca: { select: { id: true, titulo: true, status: true } } },
          },
        },
        orderBy: { criadoEm: 'desc' },
        skip: (parseInt(pagina) - 1) * parseInt(limite),
        take: parseInt(limite),
      }),
      prisma.colaborador.count({ where }),
    ]);

    res.json({
      colaboradores,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (erro) {
    console.error('Erro ao listar colaboradores:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao listar colaboradores' });
  }
}

// GET /api/colaboradores/:id — Detalhes de um colaborador
async function buscarColaborador(req, res) {
  try {
    const { id } = req.params;

    const colaborador = await prisma.colaborador.findUnique({
      where: { id: parseInt(id) },
      include: {
        pecas: {
          include: {
            peca: true,
          },
        },
      },
    });

    if (!colaborador) {
      return res.status(404).json({ erro: true, mensagem: 'Colaborador não encontrado' });
    }

    res.json(colaborador);
  } catch (erro) {
    console.error('Erro ao buscar colaborador:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao buscar colaborador' });
  }
}

// POST /api/colaboradores — Cadastrar novo colaborador (acesso público)
async function criarColaborador(req, res) {
  try {
    const { nome, funcao, idade, celular, email, endereco, genero } = req.body;

    // Validação via validator
    const validacao = validarCriacaoColaborador({ nome, funcao, idade, celular, email, endereco, genero });
    if (!validacao.valido) {
      return res.status(400).json({ erro: true, mensagem: validacao.mensagem });
    }

    // Verificar se email já existe
    const existente = await prisma.colaborador.findUnique({ where: { email } });
    if (existente) {
      return res.status(409).json({
        erro: true,
        mensagem: 'Já existe um colaborador cadastrado com este email',
      });
    }

    // Se foi enviada uma foto
    let fotoUrl = null;
    if (req.file) {
      fotoUrl = `/uploads/${req.file.filename}`;
    }

    const colaborador = await prisma.colaborador.create({
      data: {
        nome,
        funcao,
        idade: parseInt(idade),
        celular,
        email,
        endereco,
        genero,
        fotoUrl,
      },
    });

    res.status(201).json(colaborador);
  } catch (erro) {
    console.error('Erro ao criar colaborador:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao cadastrar colaborador' });
  }
}

// PUT /api/colaboradores/:id — Atualizar colaborador (admin only)
async function atualizarColaborador(req, res) {
  try {
    const { id } = req.params;
    const { nome, funcao, idade, celular, email, endereco, genero } = req.body;

    const dados = {};
    if (nome) dados.nome = nome;
    if (funcao) dados.funcao = funcao;
    if (idade) dados.idade = parseInt(idade);
    if (celular) dados.celular = celular;
    if (email) dados.email = email;
    if (endereco) dados.endereco = endereco;
    if (genero) dados.genero = genero;

    // Se foi enviada uma nova foto
    if (req.file) {
      // Deletar foto antiga
      const antigo = await prisma.colaborador.findUnique({ where: { id: parseInt(id) } });
      if (antigo && antigo.fotoUrl) {
        const caminhoAntigo = path.join(__dirname, '..', '..', antigo.fotoUrl);
        if (fs.existsSync(caminhoAntigo)) {
          fs.unlinkSync(caminhoAntigo);
        }
      }
      dados.fotoUrl = `/uploads/${req.file.filename}`;
    }

    const colaborador = await prisma.colaborador.update({
      where: { id: parseInt(id) },
      data: dados,
    });

    res.json(colaborador);
  } catch (erro) {
    console.error('Erro ao atualizar colaborador:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao atualizar colaborador' });
  }
}

// DELETE /api/colaboradores/:id — Deletar colaborador (admin only)
async function deletarColaborador(req, res) {
  try {
    const { id } = req.params;

    // Deletar foto se existir
    const colaborador = await prisma.colaborador.findUnique({ where: { id: parseInt(id) } });
    if (colaborador && colaborador.fotoUrl) {
      const caminhoFoto = path.join(__dirname, '..', '..', colaborador.fotoUrl);
      if (fs.existsSync(caminhoFoto)) {
        fs.unlinkSync(caminhoFoto);
      }
    }

    await prisma.colaborador.delete({
      where: { id: parseInt(id) },
    });

    res.json({ mensagem: 'Colaborador deletado com sucesso' });
  } catch (erro) {
    console.error('Erro ao deletar colaborador:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao deletar colaborador' });
  }
}

module.exports = {
  listarColaboradores,
  buscarColaborador,
  criarColaborador,
  atualizarColaborador,
  deletarColaborador,
};
