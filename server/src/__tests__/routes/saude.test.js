// =============================================================================
// Teste de Integração — Rota de Health Check
// Usa supertest para testar a rota sem ligar o servidor
// =============================================================================

const request = require('supertest');
const app = require('../../app');

describe('GET /api/saude', () => {
  test('deve retornar status 200 e mensagem ok', async () => {
    const resposta = await request(app).get('/api/saude');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveProperty('status', 'ok');
    expect(resposta.body).toHaveProperty('mensagem');
    expect(resposta.body.mensagem).toContain('Theatrum');
  });

  test('deve retornar content-type JSON', async () => {
    const resposta = await request(app).get('/api/saude');

    expect(resposta.headers['content-type']).toMatch(/json/);
  });
});

describe('Rota inexistente', () => {
  test('deve retornar 404 para rota que não existe', async () => {
    const resposta = await request(app).get('/api/rota-que-nao-existe');

    expect(resposta.status).toBe(404);
  });
});
