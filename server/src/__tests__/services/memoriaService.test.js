// =============================================================================
// Testes Unitários — MemoriaService
// =============================================================================

const MemoriaService = require('../../services/memoriaService');
const prisma = require('../../lib/prisma');

jest.mock('../../lib/prisma', () => ({
  memoriaItem: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('MemoriaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar os itens da memória da companhia', async () => {
    prisma.memoriaItem.findMany.mockResolvedValue([
      { id: 1, ano: '2012', titulo: 'Os Contadores', categoria: 'ESPETACULO', descricao: 'Premiações...' },
      { id: 2, ano: '2024–2026', titulo: 'Da Janela, o Mar', categoria: 'ESPETACULO', descricao: 'Dramaturgia...' },
    ]);

    const resultado = await MemoriaService.listar();
    expect(resultado).toHaveProperty('companhia');
    expect(resultado.companhia.nome).toBe('Theatrum Mundi');
    expect(resultado.itens.length).toBe(2);
  });

  it('deve rejeitar criação sem campos obrigatórios', async () => {
    await expect(MemoriaService.criar({ ano: '', titulo: '', descricao: '' })).rejects.toThrow();
  });
});

