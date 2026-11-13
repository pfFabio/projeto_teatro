// =============================================================================
// Testes de Integração — Rotas de Autenticação (/api/auth)
// =============================================================================

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const AuthService = require('../../services/authService');
const { ENV } = require('../../config/env');

jest.mock('../../services/authService');

describe('Rotas de Autenticação (/api/auth)', () => {
  let tokenAdmin;

  beforeAll(() => {
    tokenAdmin = jwt.sign(
      { id: 1, email: 'admin@theatrum.com', papel: 'ADMIN' },
      ENV.JWT_SECRET || 'theatrum_super_secreto_2026',
      { expiresIn: '1h' }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/me', () => {
    test('deve retornar 401 quando o token não for fornecido', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    test('deve retornar perfil do usuário autenticado com status 200', async () => {
      AuthService.buscarPerfil.mockResolvedValueOnce({
        id: 1,
        email: 'admin@theatrum.com',
        nome: 'Administrador Theatrum',
        papel: 'ADMIN',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Administrador Theatrum');
      expect(res.body.email).toBe('admin@theatrum.com');
    });
  });

  describe('PUT /api/auth/perfil', () => {
    test('deve retornar 401 quando não autenticado', async () => {
      const res = await request(app)
        .put('/api/auth/perfil')
        .send({ nome: 'Novo Nome' });

      expect(res.status).toBe(401);
    });

    test('deve atualizar o perfil com sucesso quando dados válidos forem enviados', async () => {
      AuthService.atualizarPerfil.mockResolvedValueOnce({
        id: 1,
        email: 'diretoria@theatrum.com',
        nome: 'Angelo Faria Turci',
        papel: 'ADMIN',
      });

      const res = await request(app)
        .put('/api/auth/perfil')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          nome: 'Angelo Faria Turci',
          email: 'diretoria@theatrum.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Angelo Faria Turci');
      expect(res.body.email).toBe('diretoria@theatrum.com');
      expect(AuthService.atualizarPerfil).toHaveBeenCalledWith(1, {
        nome: 'Angelo Faria Turci',
        email: 'diretoria@theatrum.com',
      });
    });
  });
});

