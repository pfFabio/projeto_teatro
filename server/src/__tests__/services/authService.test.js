// =============================================================================
// Testes Unitários — AuthService
// =============================================================================

const AuthService = require('../../services/authService');
const prisma = require('../../lib/prisma');
const bcrypt = require('bcryptjs');

jest.mock('../../lib/prisma', () => ({
  usuario: {
    findUnique: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve rejeitar login com campos vazios', async () => {
    await expect(AuthService.login({ email: '', senha: '' })).rejects.toThrow();
  });

  it('deve rejeitar login com usuário não encontrado', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(
      AuthService.login({ email: 'inexistente@theatrum.com', senha: '123' })
    ).rejects.toThrow('Email ou senha incorretos');
  });

  it('deve rejeitar login com senha incorreta', async () => {
    const hash = await bcrypt.hash('senha_correta', 10);
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      email: 'admin@theatrum.com',
      senha: hash,
      nome: 'Admin',
      papel: 'ADMIN',
    });

    await expect(
      AuthService.login({ email: 'admin@theatrum.com', senha: 'senha_errada' })
    ).rejects.toThrow('Email ou senha incorretos');
  });

  it('deve realizar login com sucesso e retornar token JWT', async () => {
    const hash = await bcrypt.hash('senha_correta', 10);
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      email: 'admin@theatrum.com',
      senha: hash,
      nome: 'Administrador',
      papel: 'ADMIN',
    });

    const resultado = await AuthService.login({
      email: 'admin@theatrum.com',
      senha: 'senha_correta',
    });

    expect(resultado).toHaveProperty('token');
    expect(resultado.usuario.email).toBe('admin@theatrum.com');
  });
});
