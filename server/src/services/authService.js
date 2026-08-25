// =============================================================================
// Theatrum — Service de Autenticação
// Regras de negócio de autenticação, hashing e emissão de JWT
// =============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');
const { ENV } = require('../config/env');
const { validarLogin } = require('../validators/authValidator');

class AuthService {
  /**
   * Realiza login de usuário administrador
   * @param {Object} credenciais - { email, senha }
   * @returns {Promise<{ token: string, usuario: Object }>}
   */
  static async login({ email, senha }) {
    const validacao = validarLogin({ email, senha });
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario) {
      throw AppError.unauthorized('Email ou senha incorretos');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw AppError.unauthorized('Email ou senha incorretos');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        papel: usuario.papel,
      },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        papel: usuario.papel,
      },
    };
  }

  /**
   * Busca perfil do usuário logado
   * @param {number} usuarioId
   */
  static async buscarPerfil(usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, email: true, nome: true, papel: true, criadoEm: true },
    });

    if (!usuario) {
      throw AppError.notFound('Usuário não encontrado');
    }

    return usuario;
  }
}

module.exports = AuthService;
