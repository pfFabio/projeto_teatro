// =============================================================================
// Theatrum — Configuração do Express App
// Segurança (Helmet, Rate Limit), CORS, Middlewares e Global Error Handler
// =============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { ENV } = require('./config/env');
const logger = require('./lib/logger');
const AppError = require('./errors/AppError');

const rotasAuth = require('./routes/auth');
const rotasPecas = require('./routes/pecas');
const rotasColaboradores = require('./routes/colaboradores');
const rotasConfig = require('./routes/config');
const rotasUpload = require('./routes/upload');
const rotasPropagandas = require('./routes/propagandas');

const app = express();

// =============================================================================
// Middlewares de Segurança
// =============================================================================

// Helmet — Proteção de headers HTTP
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite servir imagens/vídeos de /uploads
  })
);

// Rate Limiter Geral — Prevenção contra DoS
const limiterGeral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Limite de 500 requisições por janela por IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => ENV.NODE_ENV !== 'production',
  message: {
    erro: true,
    mensagem: 'Muitas requisições originadas deste IP. Tente novamente em alguns minutos.',
  },
});
app.use('/api', limiterGeral);

// Rate Limiter Específico para Login — Prevenção contra Brute Force (ISO 25010 - Segurança)
const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Máximo 20 tentativas de login por IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => ENV.NODE_ENV !== 'production',
  message: {
    erro: true,
    mensagem: 'Muitas tentativas de login consecutivas. Por segurança, tente novamente em 15 minutos.',
  },
});
app.use('/api/auth/login', limiterLogin);

// =============================================================================
// Middlewares de Parsing e CORS
// =============================================================================

const origensPadrao = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://pffabio.github.io',
];

const origensPermitidas = [
  ...origensPadrao,
  ENV.CLIENT_URL ? ENV.CLIENT_URL.replace(/\/$/, '') : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const originNormalizada = origin.replace(/\/$/, '');

      const permitida = origensPermitidas.some((o) =>
        originNormalizada === o ||
        originNormalizada.startsWith('http://localhost:') ||
        originNormalizada.endsWith('.github.io')
      );

      if (permitida || ENV.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new AppError(`Origem ${origin} bloqueada pelas políticas de CORS`, 403));
      }
    },
    credentials: true,
  })
);

// Parse de JSON no body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos de uploads: Primeiro tenta disco local; se não encontrar (ex: container reiniciou no Render), busca do PostgreSQL
const fs = require('fs');
app.get('/uploads/:nome', async (req, res, next) => {
  try {
    const nomeArquivo = path.basename(req.params.nome);
    const caminhoDisco = path.join(__dirname, '..', 'uploads', nomeArquivo);

    // 1. Se o arquivo estiver em disco, serve diretamente
    if (fs.existsSync(caminhoDisco)) {
      return res.sendFile(caminhoDisco);
    }

    // 2. Se não estiver no disco local (devido ao filesystem efêmero do Render), busca do PostgreSQL
    const prisma = require('./lib/prisma');
    const arquivoBanco = await prisma.arquivo.findUnique({
      where: { nome: nomeArquivo },
    });

    if (!arquivoBanco) {
      return res.status(404).send('Arquivo não encontrado');
    }

    // Restaura em disco em segundo plano para cache
    try {
      await fs.promises.mkdir(path.dirname(caminhoDisco), { recursive: true });
      await fs.promises.writeFile(caminhoDisco, arquivoBanco.dados);
    } catch {
      // Ignora erro de cache
    }

    res.setHeader('Content-Type', arquivoBanco.mimetype);
    res.setHeader('Content-Length', arquivoBanco.tamanho);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(Buffer.from(arquivoBanco.dados));
  } catch (erro) {
    next(erro);
  }
});

// =============================================================================
// Rotas da API
// =============================================================================
app.use('/api/auth', rotasAuth);
app.use('/api/pecas', rotasPecas);
app.use('/api/colaboradores', rotasColaboradores);
app.use('/api/config', rotasConfig);
app.use('/api/upload', rotasUpload);
app.use('/api/propagandas', rotasPropagandas);

// Rota de health check
app.get('/api/saude', (req, res) => {
  res.json({
    status: 'ok',
    mensagem: '🎭 Theatrum API está funcionando!',
    ambiente: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Rota 404 para endpoints da API não encontrados
app.use('/api/*', (req, res, next) => {
  next(AppError.notFound(`Endpoint '${req.originalUrl}' não encontrado`));
});

// =============================================================================
// Tratamento de Erros Global (ISO 25010 - Confiabilidade e Robustez)
// =============================================================================
app.use((erro, req, res, next) => {
  const statusCode = erro.statusCode || (erro.status ? erro.status : 500);
  const mensagem = erro.message || 'Erro interno do servidor';

  if (statusCode >= 500) {
    logger.error(`❌ [${req.method} ${req.originalUrl}] Erro não tratado:`, erro.stack || erro.message);
  } else {
    logger.warn(`⚠️ [${req.method} ${req.originalUrl}] ${statusCode} - ${mensagem}`);
  }

  res.status(statusCode).json({
    erro: true,
    mensagem: statusCode >= 500 && ENV.NODE_ENV === 'production' ? 'Ocorreu um erro interno no servidor.' : mensagem,
    ...(erro.detalhes ? { detalhes: erro.detalhes } : {}),
  });
});

module.exports = app;
