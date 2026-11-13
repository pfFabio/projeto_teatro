// =============================================================================
// Theatrum — Service de Autenticação
// Regras de negócio de autenticação, hashing, emissão de JWT e recuperação de senha
// =============================================================================

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');
const { ENV } = require('../config/env');
const {
  validarLogin,
  validarAlteracaoSenha,
  validarSolicitacaoRecuperacao,
  validarRedefinicaoSenha,
  validarAtualizacaoPerfil,
} = require('../validators/authValidator');

class AuthService {
  /**
   * Realiza login de usuário administrador
   * Suporta email OU nome de usuário da companhia
   * @param {Object} credenciais - { email, login, usuario, senha }
   * @returns {Promise<{ token: string, usuario: Object }>}
   */
  static async login(credenciais) {
    const validacao = validarLogin(credenciais);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const { senha } = credenciais;
    const loginInput = (credenciais.login || credenciais.email || credenciais.usuario || '').trim().toLowerCase();

    // Busca por email exato ou alias @theatrum.com (compatível com findUnique mockado e findFirst)
    let usuario = null;
    if (typeof prisma.usuario.findUnique === 'function') {
      usuario = await prisma.usuario.findUnique({
        where: { email: loginInput },
      });
      if (!usuario && !loginInput.includes('@')) {
        usuario = await prisma.usuario.findUnique({
          where: { email: `${loginInput}@theatrum.com` },
        });
      }
    }

    if (!usuario && typeof prisma.usuario.findFirst === 'function') {
      usuario = await prisma.usuario.findFirst({
        where: {
          OR: [
            { email: loginInput },
            { email: `${loginInput}@theatrum.com` },
          ],
        },
      });
    }

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

  /**
   * Altera a senha do usuário autenticado
   * @param {number} usuarioId
   * @param {Object} dados - { senhaAtual, novaSenha }
   */
  static async alterarSenha(usuarioId, dados) {
    const validacao = validarAlteracaoSenha(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      throw AppError.notFound('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(dados.senhaAtual, usuario.senha);
    if (!senhaValida) {
      throw AppError.badRequest('A senha atual informada está incorreta');
    }

    const novaSenhaHash = await bcrypt.hash(dados.novaSenha, 10);
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: novaSenhaHash },
    });

    return { mensagem: 'Senha alterada com sucesso!' };
  }

  /**
   * Solicita token para recuperação de senha
   * @param {Object} dados - { email, login, identificador }
   */
  static async solicitarRecuperacaoSenha(dados) {
    const validacao = validarSolicitacaoRecuperacao(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const idInput = (dados.email || dados.login || dados.identificador || '').trim().toLowerCase();
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: idInput },
          { email: `${idInput}@theatrum.com` },
        ],
      },
    });

    // Por segurança e privacidade (LGPD), não informamos se o usuário existe ou não externamente
    if (!usuario) {
      return {
        sucesso: true,
        mensagem: 'Se o usuário informado estiver cadastrado, as instruções foram geradas com sucesso.',
      };
    }

    // Gera token seguro com validade de 1 hora
    const resetToken = crypto.randomBytes(24).toString('hex');
    const validade = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken,
        resetTokenValidade: validade,
      },
    });

    return {
      sucesso: true,
      mensagem: 'Código de recuperação gerado com sucesso.',
      // Em desenvolvimento e ambiente sem SMTP configurado, facilitamos a recuperação disponibilizando o token:
      tokenRecuperacao: ENV.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  /**
   * Redefine a senha utilizando token de recuperação
   * @param {Object} dados - { token, novaSenha }
   */
  static async redefinirSenha(dados) {
    const validacao = validarRedefinicaoSenha(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const { token, novaSenha } = dados;
    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenValidade: {
          gt: new Date(),
        },
      },
    });

    if (!usuario) {
      throw AppError.badRequest('Token de recuperação inválido ou expirado');
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: novaSenhaHash,
        resetToken: null,
        resetTokenValidade: null,
      },
    });

    return { mensagem: 'Senha redefinida com sucesso! Você já pode entrar com a nova senha.' };
  }

  /**
   * Atualiza informações do perfil do usuário (nome e/ou email)
   * @param {number} usuarioId
   * @param {Object} dados - { nome, email }
   */
  static async atualizarPerfil(usuarioId, dados) {
    const validacao = validarAtualizacaoPerfil(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuarioAtual) {
      throw AppError.notFound('Usuário não encontrado');
    }

    const updateData = {};
    if (dados.nome !== undefined) {
      updateData.nome = dados.nome.trim();
    }

    if (dados.email !== undefined) {
      const emailNormalizado = dados.email.trim().toLowerCase();
      if (emailNormalizado !== usuarioAtual.email.toLowerCase()) {
        const existeOutro = await prisma.usuario.findFirst({
          where: {
            email: emailNormalizado,
            NOT: { id: usuarioId },
          },
        });
        if (existeOutro) {
          throw AppError.conflict('Este email já está sendo utilizado por outro administrador');
        }
        updateData.email = emailNormalizado;
      }
    }

    const atualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: updateData,
      select: { id: true, email: true, nome: true, papel: true },
    });

    return atualizado;
  }
}

module.exports = AuthService;
