// =============================================================================
// Testes de Integração — Rotas de Comprovantes de Despesa (/api/comprovantes)
// Test-Driven Development (TDD) & Padrão AAA
// =============================================================================

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const ComprovanteService = require('../../services/comprovanteService');
const { ENV } = require('../../config/env');

jest.mock('../../services/comprovanteService');

describe('Rotas de Comprovantes (/api/comprovantes)', () => {
  let tokenAdmin;
  let tokenComum;

  beforeAll(() => {
    tokenAdmin = jwt.sign(
      { id: 1, email: 'admin@theatrum.com', papel: 'ADMIN' },
      ENV.JWT_SECRET || 'theatrum_super_secreto_2026',
      { expiresIn: '1h' }
    );

    tokenComum = jwt.sign(
      { id: 2, email: 'ator@theatrum.com', papel: 'COLABORADOR' },
      ENV.JWT_SECRET || 'theatrum_super_secreto_2026',
      { expiresIn: '1h' }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Segurança e Controle de Acesso', () => {
    test('deve rejeitar acesso sem token (401)', async () => {
      // Act
      const res = await request(app).get('/api/comprovantes');

      // Assert
      expect(res.status).toBe(401);
      expect(res.body.erro).toBe(true);
    });

    test('deve rejeitar acesso para usuário sem privilégio ADMIN (403)', async () => {
      // Act
      const res = await request(app)
        .get('/api/comprovantes')
        .set('Authorization', `Bearer ${tokenComum}`);

      // Assert
      expect(res.status).toBe(403);
      expect(res.body.erro).toBe(true);
    });

    test('deve bloquear acesso direto público em /uploads para arquivos de comprovante (403)', async () => {
      // Act
      const res = await request(app).get('/uploads/comprovante-sigiloso-123456.pdf');

      // Assert
      expect(res.status).toBe(403);
      expect(res.body.mensagem).toMatch(/sigiloso|restrito|comprovante/i);
    });

    test('deve bloquear acesso direto em /uploads mesmo com variação de caixa alta (Comprovante-*) (403)', async () => {
      // Act
      const res = await request(app).get('/uploads/Comprovante-Maiusculo-123456.pdf');

      // Assert
      expect(res.status).toBe(403);
      expect(res.body.erro).toBe(true);
    });
  });

  describe('GET /api/comprovantes', () => {
    test('deve listar comprovantes com sucesso quando autenticado como ADMIN (200)', async () => {
      // Arrange
      const mockRetorno = {
        comprovantes: [
          {
            id: 1,
            titulo: 'Recibo Van',
            valor: 450.0,
            categoria: 'TRANSPORTE',
            dataComprovante: '2026-10-15',
          },
        ],
        total: 1,
        valorTotal: 450.0,
      };
      ComprovanteService.listar.mockResolvedValue(mockRetorno);

      // Act
      const res = await request(app)
        .get('/api/comprovantes?categoria=TRANSPORTE')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.comprovantes).toHaveLength(1);
      expect(res.body.valorTotal).toBe(450.0);
      expect(ComprovanteService.listar).toHaveBeenCalledWith(
        expect.objectContaining({ categoria: 'TRANSPORTE' })
      );
    });
  });

  describe('GET /api/comprovantes/:id', () => {
    test('deve buscar comprovante por ID existente (200)', async () => {
      // Arrange
      const mockItem = {
        id: 1,
        titulo: 'Nota Cenografia',
        valor: 1200.0,
        categoria: 'CENOGRAFIA_FIGURINO',
      };
      ComprovanteService.buscarPorId.mockResolvedValue(mockItem);

      // Act
      const res = await request(app)
        .get('/api/comprovantes/1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.titulo).toBe('Nota Cenografia');
    });

    test('deve retornar 400 para ID inválido', async () => {
      // Act
      const res = await request(app)
        .get('/api/comprovantes/abc')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      // Assert
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/comprovantes/:id/arquivo', () => {
    test('deve entregar arquivo com headers privados para admin (200)', async () => {
      // Arrange
      const mockArquivo = {
        buffer: Buffer.from('%PDF-1.4 simulado'),
        mimetype: 'application/pdf',
        nomeOriginal: 'recibo_oficial.pdf',
      };
      ComprovanteService.obterArquivo.mockResolvedValue(mockArquivo);

      // Act
      const res = await request(app)
        .get('/api/comprovantes/1/arquivo')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['cache-control']).toMatch(/private/i);
    });
  });

  describe('POST /api/comprovantes', () => {
    test('deve criar novo comprovante com anexo multipart (201)', async () => {
      // Arrange
      const mockCriado = {
        id: 10,
        titulo: 'Alimentação Ensaio',
        valor: 250.0,
        categoria: 'ALIMENTACAO',
        dataComprovante: '2026-10-18',
        arquivoUrl: '/uploads/comprovante-10.pdf',
      };
      ComprovanteService.criar.mockResolvedValue(mockCriado);

      // Act
      const res = await request(app)
        .post('/api/comprovantes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('titulo', 'Alimentação Ensaio')
        .field('valor', '250.00')
        .field('dataComprovante', '2026-10-18')
        .field('categoria', 'ALIMENTACAO')
        .attach('arquivo', Buffer.from('%PDF-1.4 nota'), 'nota.pdf');

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(10);
      expect(ComprovanteService.criar).toHaveBeenCalled();
    });

    test('deve rejeitar upload de arquivo com formato não permitido (.txt / .mp4) retornando 400', async () => {
      // Act
      const res = await request(app)
        .post('/api/comprovantes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('titulo', 'Tentativa de Arquivo Inválido')
        .field('valor', '100.00')
        .field('dataComprovante', '2026-10-18')
        .field('categoria', 'OUTROS')
        .attach('arquivo', Buffer.from('conteudo texto'), {
          filename: 'malicioso.txt',
          contentType: 'text/plain',
        });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.erro).toBe(true);
      expect(ComprovanteService.criar).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/comprovantes/:id', () => {
    test('deve atualizar comprovante com sucesso (200)', async () => {
      // Arrange
      const mockAtualizado = {
        id: 1,
        titulo: 'Título Atualizado',
        valor: 500.0,
      };
      ComprovanteService.atualizar.mockResolvedValue(mockAtualizado);

      // Act
      const res = await request(app)
        .put('/api/comprovantes/1')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('titulo', 'Título Atualizado')
        .field('valor', '500.00');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.titulo).toBe('Título Atualizado');
    });
  });

  describe('DELETE /api/comprovantes/:id', () => {
    test('deve deletar comprovante com sucesso (200)', async () => {
      // Arrange
      ComprovanteService.deletar.mockResolvedValue(true);

      // Act
      const res = await request(app)
        .delete('/api/comprovantes/1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.sucesso).toBe(true);
    });
  });
});

