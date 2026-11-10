// =============================================================================
// Testes Unitários — ComprovanteService
// Padrão AAA (Arrange, Act, Assert) — Metodologia TDD
// =============================================================================

const ComprovanteService = require('../../services/comprovanteService');
const prisma = require('../../lib/prisma');
const FileService = require('../../services/fileService');

jest.mock('../../lib/prisma', () => ({
  comprovante: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  peca: {
    findUnique: jest.fn(),
  },
  colaborador: {
    findUnique: jest.fn(),
  },
}));

jest.mock('../../services/fileService', () => ({
  salvarArquivo: jest.fn(),
  removerArquivo: jest.fn(),
  obterBufferArquivo: jest.fn(),
}));

describe('ComprovanteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockComprovante = {
    id: 1,
    titulo: 'Nota Fiscal Cenografia',
    descricao: 'Madeiras e tecidos para o palco',
    valor: 1250.0,
    dataComprovante: '2026-10-10',
    categoria: 'CENOGRAFIA_FIGURINO',
    arquivoUrl: '/uploads/comprovante-123.pdf',
    arquivoNome: 'nf_cenario.pdf',
    mimetype: 'application/pdf',
    tamanho: 204800,
    pecaId: 1,
    colaboradorId: null,
    peca: { id: 1, titulo: 'Da Janela, o Mar' },
    colaborador: null,
    criadoEm: new Date('2026-10-10T12:00:00Z'),
    atualizadoEm: new Date('2026-10-10T12:00:00Z'),
  };

  describe('listar', () => {
    test('deve listar comprovantes com sucesso e calcular o valor total', async () => {
      // Arrange
      const lista = [
        mockComprovante,
        { ...mockComprovante, id: 2, valor: 750.0, titulo: 'Recibo Van' },
      ];
      prisma.comprovante.findMany.mockResolvedValue(lista);

      // Act
      const resultado = await ComprovanteService.listar({});

      // Assert
      expect(resultado).toHaveProperty('comprovantes');
      expect(resultado.comprovantes).toHaveLength(2);
      expect(resultado.total).toBe(2);
      expect(resultado.valorTotal).toBe(2000.0);
      expect(prisma.comprovante.findMany).toHaveBeenCalled();
    });

    test('deve aplicar filtro por pecaId e categoria quando fornecidos', async () => {
      // Arrange
      prisma.comprovante.findMany.mockResolvedValue([mockComprovante]);

      // Act
      await ComprovanteService.listar({ pecaId: '1', categoria: 'CENOGRAFIA_FIGURINO' });

      // Assert
      expect(prisma.comprovante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            pecaId: 1,
            categoria: 'CENOGRAFIA_FIGURINO',
          }),
        })
      );
    });
  });

  describe('buscarPorId', () => {
    test('deve retornar comprovante se ID existir', async () => {
      // Arrange
      prisma.comprovante.findUnique.mockResolvedValue(mockComprovante);

      // Act
      const res = await ComprovanteService.buscarPorId(1);

      // Assert
      expect(res.id).toBe(1);
      expect(res.titulo).toBe('Nota Fiscal Cenografia');
    });

    test('deve lançar erro 404 se ID não existir', async () => {
      // Arrange
      prisma.comprovante.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(ComprovanteService.buscarPorId(999)).rejects.toThrow(/não encontrado/i);
    });
  });

  describe('criar', () => {
    const arquivoMock = {
      originalname: 'recibo.pdf',
      mimetype: 'application/pdf',
      size: 50000,
      buffer: Buffer.from('test'),
    };

    test('deve salvar arquivo com prefixo comprovante e persistir no banco', async () => {
      // Arrange
      FileService.salvarArquivo.mockResolvedValue({
        nomeArquivo: 'comprovante-123456.pdf',
        url: '/uploads/comprovante-123456.pdf',
        mimetype: 'application/pdf',
        tamanho: 50000,
      });

      prisma.comprovante.create.mockResolvedValue({
        ...mockComprovante,
        id: 10,
        titulo: 'Almoço Elenco',
        valor: 320.0,
      });

      // Act
      const res = await ComprovanteService.criar(
        {
          titulo: 'Almoço Elenco',
          valor: '320.00',
          dataComprovante: '2026-10-12',
          categoria: 'ALIMENTACAO',
          pecaId: '1',
        },
        arquivoMock
      );

      // Assert
      expect(arquivoMock.fieldname).toBe('comprovante');
      expect(FileService.salvarArquivo).toHaveBeenCalledWith(arquivoMock);
      expect(prisma.comprovante.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titulo: 'Almoço Elenco',
            valor: 320.0,
            categoria: 'ALIMENTACAO',
            arquivoUrl: '/uploads/comprovante-123456.pdf',
          }),
        })
      );
      expect(res.id).toBe(10);
    });

    test('deve rejeitar criação com dados inválidos antes de salvar arquivo', async () => {
      // Arrange
      const dadosInvalidos = { titulo: '', valor: '0' };

      // Act & Assert
      await expect(ComprovanteService.criar(dadosInvalidos, arquivoMock)).rejects.toThrow();
      expect(FileService.salvarArquivo).not.toHaveBeenCalled();
    });
  });

  describe('obterArquivo', () => {
    test('deve retornar buffer e mimetype quando arquivo existir', async () => {
      // Arrange
      prisma.comprovante.findUnique.mockResolvedValue(mockComprovante);
      const mockBuffer = Buffer.from('%PDF-1.4');
      FileService.obterBufferArquivo.mockResolvedValue(mockBuffer);

      // Act
      const res = await ComprovanteService.obterArquivo(1);

      // Assert
      expect(res.buffer).toEqual(mockBuffer);
      expect(res.mimetype).toBe('application/pdf');
      expect(res.nomeOriginal).toBe('nf_cenario.pdf');
    });

    test('deve lançar erro se o arquivo físico não for encontrado', async () => {
      // Arrange
      prisma.comprovante.findUnique.mockResolvedValue(mockComprovante);
      FileService.obterBufferArquivo.mockResolvedValue(null);

      // Act & Assert
      await expect(ComprovanteService.obterArquivo(1)).rejects.toThrow(/não encontrado/i);
    });
  });

  describe('deletar', () => {
    test('deve remover do banco e apagar arquivo físico', async () => {
      // Arrange
      prisma.comprovante.findUnique.mockResolvedValue(mockComprovante);
      prisma.comprovante.delete.mockResolvedValue(mockComprovante);

      // Act
      await ComprovanteService.deletar(1);

      // Assert
      expect(prisma.comprovante.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(FileService.removerArquivo).toHaveBeenCalledWith('/uploads/comprovante-123.pdf');
    });
  });
});
