// =============================================================================
// Controller de Autenticação
// Gerencia login e verificação de token do admin
// =============================================================================

const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validarLogin } = require('../validators/authValidator');

// POST /api/auth/login — Login do administrador
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    // Validação via validator
    const validacao = validarLogin({ email, senha });
    if (!validacao.valido) {
      return res.status(400).json({ erro: true, mensagem: validacao.mensagem });
    }

    // Buscar usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: true,
        mensagem: 'Email ou senha incorretos',
      });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        erro: true,
        mensagem: 'Email ou senha incorretos',
      });
    }

    // Gerar token JWT (expira em 24 horas)
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        papel: usuario.papel,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        papel: usuario.papel,
      },
    });
  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro interno do servidor' });
  }
}

// GET /api/auth/me — Retorna dados do usuário autenticado
async function buscarPerfil(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, email: true, nome: true, papel: true, criadoEm: true },
    });

    if (!usuario) {
      return res.status(404).json({ erro: true, mensagem: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro interno do servidor' });
  }
}

module.exports = { login, buscarPerfil };
