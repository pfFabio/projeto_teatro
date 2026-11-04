// =============================================================================
// Testes Unitários — IdeiaService
// =============================================================================

const IdeiaService = require('../../services/ideiaService');
const prisma = require('../../lib/prisma');

jest.mock('../../lib/prisma', () => ({
  mensagemIdeia: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('IdeiaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve rejeitar ideia com nome vazio', async () => {
    await expect(
      IdeiaService.criar({ nome: '', email: 'teste@email.com', descricao: 'Uma ideia bacana' })
    ).rejects.toThrow('nome é obrigatório');
  });

  it('deve rejeitar ideia com email inválido', async () => {
    await expect(
      IdeiaService.criar({ nome: 'João', email: 'email-invalido', descricao: 'Uma ideia bacana' })
    ).rejects.toThrow('Formato de email inválido');
  });

  it('deve rejeitar descrição muito curta', async () => {
    await expect(
      IdeiaService.criar({ nome: 'João', email: 'joao@email.com', descricao: 'curta' })
    ).rejects.toThrow('pelo menos 10 caracteres');
  });

  it('deve criar uma ideia com sucesso', async () => {
    prisma.mensagemIdeia.create.mockResolvedValue({
      id: 1,
      nome: 'Maria Proponente',
      email: 'maria@cultura.com',
      telefone: '21999998888',
      titulo: 'Peça Infantojuvenil',
      descricao: 'Gostaria de propor uma parceria para montagem conjunta no RJ.',
      status: 'NOVA',
    });

    const resultado = await IdeiaService.criar({
      nome: 'Maria Proponente',
      email: 'maria@cultura.com',
      telefone: '21999998888',
      titulo: 'Peça Infantojuvenil',
      descricao: 'Gostaria de propor uma parceria para montagem conjunta no RJ.',
    });

    expect(resultado.sucesso).toBe(true);
    expect(resultado.ideiaId).toBe(1);
  });
});

