// =============================================================================
// Theatrum — Configuração do Express App
// Separado do index.js para permitir testes com supertest
// =============================================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const rotasAuth = require('./routes/auth');
const rotasPecas = require('./routes/pecas');
const rotasColaboradores = require('./routes/colaboradores');
const rotasConfig = require('./routes/config');
const rotasUpload = require('./routes/upload');

const app = express();

// =============================================================================
// Middlewares globais
// =============================================================================

// CORS — permite requisições do frontend em dev e prod
const origensPermitidas = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: process.env.CLIENT_URL ? origensPermitidas : true,
  credentials: true,
}));

// Parse de JSON no body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens e vídeos enviados)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// =============================================================================
// Rotas da API
// =============================================================================
app.use('/api/auth', rotasAuth);
app.use('/api/pecas', rotasPecas);
app.use('/api/colaboradores', rotasColaboradores);
app.use('/api/config', rotasConfig);
app.use('/api/upload', rotasUpload);

// Rota de health check
app.get('/api/saude', (req, res) => {
  res.json({ status: 'ok', mensagem: '🎭 Theatrum API está funcionando!' });
});

// =============================================================================
// Tratamento de erros global
// =============================================================================
app.use((erro, req, res, next) => {
  console.error('❌ Erro:', erro.message);
  res.status(erro.status || 500).json({
    erro: true,
    mensagem: erro.message || 'Erro interno do servidor',
  });
});

module.exports = app;
