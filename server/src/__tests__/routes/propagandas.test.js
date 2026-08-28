// =============================================================================
// Testes de Integração — Rotas de Propagandas
// =============================================================================

const request = require('supertest');
const app = require('../../app');
const PropagandaService = require('../../services/propagandaService');

jest.mock('../../services/propagandaService');

describe('Rotas de Propagandas (/api/propagandas)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/propagandas', () => {
    test('deve listar propagandas com sucesso', async () => {
      const mockResultado = {
        propagandas: [
          { id: 1, titulo: 'Aulas de Teatro', descricao: 'Texto da propaganda', ativo: true, fotos: [] },
        ],
        total: 1,
        pagina: 1,
        totalPaginas: 1,
      };

      PropagandaService.listar.mockResolvedValue(mockResultado);

      const res = await request(app).get('/api/propagandas?limite=5&ativo=true');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('propagandas');
      expect(res.body.propagandas).toHaveLength(1);
      expect(res.body.propagandas[0].titulo).toBe('Aulas de Teatro');
      expect(PropagandaService.listar).toHaveBeenCalledWith(
        expect.objectContaining({ limite: '5', ativo: 'true' })
      );
    });
  });

  describe('GET /api/propagandas/:id', () => {
    test('deve buscar propaganda por ID existente', async () => {
      const mockPropaganda = {
        id: 1,
        titulo: 'Workshop de Dança',
        descricao: 'Aulas práticas',
        fotos: [{ id: 1, url: '/uploads/foto-1.jpg', ordem: 0 }],
      };

      PropagandaService.buscarPorId.mockResolvedValue(mockPropaganda);

      const res = await request(app).get('/api/propagandas/1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.titulo).toBe('Workshop de Dança');
    });

    test('deve retornar 400 para ID inválido', async () => {
      const res = await request(app).get('/api/propagandas/abc');
      expect(res.status).toBe(400);
    });
  });

  describe('Rotas protegidas (POST, PUT, DELETE)', () => {
    test('POST /api/propagandas deve exigir autenticação', async () => {
      const res = await request(app)
        .post('/api/propagandas')
        .send({ titulo: 'Teste', descricao: 'Sem token' });

      expect(res.status).toBe(401);
    });

    test('PUT /api/propagandas/:id deve exigir autenticação', async () => {
      const res = await request(app)
        .put('/api/propagandas/1')
        .send({ titulo: 'Atualizado' });

      expect(res.status).toBe(401);
    });

    test('DELETE /api/propagandas/:id deve exigir autenticação', async () => {
      const res = await request(app).delete('/api/propagandas/1');
      expect(res.status).toBe(401);
    });
  });
});
