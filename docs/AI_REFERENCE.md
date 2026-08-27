# 🤖 Theatrum — Guia de Referência para Agentes de IA

> Este documento é otimizado para LLMs e assistentes de código.
> Contém a estrutura exata do projeto, as convenções de código, e instruções precisas sobre onde e como fazer alterações.

---

## IDENTIDADE DO PROJETO

- **Nome**: Theatrum
- **Tipo**: Monorepo full-stack (frontend + backend separados, sem workspace npm)
- **Propósito**: Sistema web acadêmico de gestão de peças de teatro
- **Idioma do código**: Português brasileiro (variáveis, comentários, mensagens de erro)
- **Repositório**: `https://github.com/pfFabio/projeto_teatro`
- **Produção Frontend**: `https://pffabio.github.io/projeto_teatro/` (GitHub Pages, branch `gh-pages`)
- **Produção Backend**: `https://projeto-teatro.onrender.com` (Render.com Web Service)
- **Produção Banco**: PostgreSQL no Render (plano Free)

---

## STACK TÉCNICA EXATA

| Camada | Tecnologia | Versão | Notas |
|---|---|---|---|
| Frontend framework | React | 19.1 | Sem TypeScript |
| Frontend build | Vite | 7.x | SPA, base: `/projeto_teatro/` |
| Frontend routing | react-router-dom | 7.6 | `BrowserRouter` com `basename` |
| Frontend HTTP | Axios | 1.7 | Interceptors JWT automáticos |
| Frontend mapas | Leaflet + react-leaflet | 1.9 / 5.0 | Chunk isolado via `manualChunks` |
| Frontend testes | Vitest + Testing Library | 4.x / 16.x | jsdom |
| Frontend deploy | gh-pages | 6.3 | `npm run deploy` no client |
| Backend framework | Express | 4.21 | CommonJS (`require`) |
| Backend ORM | Prisma | 6.x | Provider: `postgresql` |
| Backend auth | jsonwebtoken + bcryptjs | 9.0 / 2.4 | JWT Bearer token |
| Backend upload | Multer | 1.4 | `memoryStorage()` — buffer em RAM |
| Backend segurança | Helmet + express-rate-limit | 8.x / 8.x | CORS whitelist em produção |
| Backend testes | Jest + Supertest | 30.x / 7.x | |
| Banco de dados | PostgreSQL | — | Render.com managed |

---

## CONVENÇÕES E PADRÕES

### Nomeação

- **Variáveis, funções, classes**: `camelCase` em português (`fotosCriadas`, `pecaService`, `dadosAtualizacao`)
- **Modelos Prisma**: `PascalCase` singular em português (`Peca`, `Colaborador`, `FotoPeca`)
- **Tabelas SQL**: `snake_case` plural via `@@map()` (`pecas`, `fotos_pecas`, `peca_colaboradores`)
- **Componentes React**: `PascalCase` (`AdminDashboard`, `ModalFotosManager`)
- **Arquivos CSS**: `kebab-case` descritivo das classes (`.admin-abas`, `.peca-card`)
- **Rotas API**: `/api/recurso` em português (`/api/pecas`, `/api/colaboradores`)

### Padrão de Camadas do Backend

```
Requisição HTTP
  → Route (definição de rota + middlewares)
    → Controller (extrai params/body, chama service, envia resposta)
      → Service (lógica de negócio, validações, Prisma queries)
        → Prisma Client (acesso ao PostgreSQL)
```

**Regra**: Controllers NUNCA acessam o Prisma diretamente. Toda lógica de negócio fica nos services.

### Padrão de Erros

Usar a classe `AppError` para erros semânticos:

```javascript
const AppError = require('../errors/AppError');

// Métodos estáticos disponíveis:
AppError.badRequest('Mensagem', detalhesOpcionais)   // 400
AppError.unauthorized('Mensagem')                      // 401
AppError.forbidden('Mensagem')                         // 403
AppError.notFound('Mensagem')                          // 404
AppError.conflict('Mensagem')                          // 409
AppError.internal('Mensagem')                          // 500
```

O global error handler em `app.js` captura todos os `AppError` e responde com JSON padronizado:
```json
{ "erro": true, "mensagem": "...", "detalhes": "..." }
```

### Padrão de Resposta da API

- **Sucesso**: retorna o objeto ou array diretamente (sem envelope)
- **Erro**: retorna `{ erro: true, mensagem: "..." }`
- **Criação**: retorna status `201` com o objeto criado

---

## MAPA DE ARQUIVOS — ONDE MEXER

### Para adicionar um NOVO MODELO ao banco:

1. `server/prisma/schema.prisma` — Adicionar o modelo com `@@map("nome_tabela")`
2. `server/prisma/seed.js` — Adicionar dados de exemplo (opcional)
3. Rodar `npx prisma generate` e `npx prisma db push`

### Para adicionar uma NOVA ENTIDADE completa (CRUD):

1. `server/prisma/schema.prisma` — Modelo
2. `server/src/validators/novaEntidadeValidator.js` — [NOVO] Validações
3. `server/src/services/novaEntidadeService.js` — [NOVO] Lógica de negócio
4. `server/src/controllers/novaEntidadeController.js` — [NOVO] Handlers req/res
5. `server/src/routes/novaEntidade.js` — [NOVO] Definição de rotas
6. `server/src/app.js` — Registrar: `app.use('/api/novaEntidade', rotasNovaEntidade)`
7. `client/src/services/api.js` — Adicionar export de API (`novaEntidadeAPI = { ... }`)
8. `client/src/pages/NovaEntidadePage.jsx` — [NOVO] Página
9. `client/src/App.jsx` — Adicionar `<Route>` com lazy import

### Para modificar ESTILOS visuais:

| O que alterar | Arquivo |
|---|---|
| Variáveis globais (cores, fontes, espaçamentos) | `client/src/styles/index.css` |
| Componentes reutilizáveis (modais, cards, botões) | `client/src/styles/components.css` |
| Estilos específicos de páginas | `client/src/styles/pages.css` |

### Para modificar AUTENTICAÇÃO:

| O que alterar | Arquivo |
|---|---|
| Lógica de login/geração de JWT | `server/src/services/authService.js` |
| Middleware de verificação de token | `server/src/middleware/auth.js` |
| Contexto React (estado de login) | `client/src/context/AuthContext.jsx` |
| Tela de login | `client/src/components/admin/AdminLogin.jsx` |

### Para modificar UPLOADS:

| O que alterar | Arquivo |
|---|---|
| Configuração do Multer (limites, filtros, storage) | `server/src/middleware/upload.js` |
| Persistência no PostgreSQL + cache em disco | `server/src/services/fileService.js` |
| Rota de entrega `GET /uploads/:nome` (fallback PostgreSQL) | `server/src/app.js` (linhas 89-126) |

### Para modificar CONFIGURAÇÕES do site:

| O que alterar | Arquivo |
|---|---|
| Chaves disponíveis (seed) | `server/prisma/seed.js` (array `configs`) |
| Lógica de leitura/escrita | `server/src/services/configService.js` |
| Painel admin de edição | `client/src/components/admin/AbaConfig.jsx` |

---

## BANCO DE DADOS — SCHEMA COMPLETO

```prisma
model Usuario {
  id, email (unique), senha (bcrypt hash), nome, papel ("ADMIN"),
  criadoEm, atualizadoEm
  → Tabela: "usuarios"
}

model Colaborador {
  id, nome, funcao, idade, celular, email (unique), endereco, genero,
  fotoUrl?, criadoEm, atualizadoEm
  → Relação: pecas PecaColaborador[]
  → Tabela: "colaboradores"
  → LGPD: celular, email, endereço são omitidos na resposta pública
}

model Peca {
  id, titulo, resumo, endereco, latitude?, longitude?,
  dataEstreia? ("YYYY-MM-DD"), status ("PROGRAMADA"|"EM_CARTAZ"|"ENCERRADA"),
  criadoEm, atualizadoEm
  → Relações: fotos FotoPeca[], colaboradores PecaColaborador[], locais LocalPeca[]
  → Tabela: "pecas"
}

model LocalPeca {
  id, pecaId (FK), nomeLocal, cidade, endereco, latitude?, longitude?,
  dataEstreia?, dataFim?, horario?, status, criadoEm, atualizadoEm
  → Relação: peca Peca (onDelete: Cascade)
  → Tabela: "locais_pecas"
}

model PecaColaborador {
  id, pecaId (FK), colaboradorId (FK), funcaoNaPeca,
  criadoEm, atualizadoEm
  → Constraint: @@unique([pecaId, colaboradorId])
  → Relações: peca Peca, colaborador Colaborador (ambos onDelete: Cascade)
  → Tabela: "peca_colaboradores"
}

model FotoPeca {
  id, pecaId (FK), url, descricao, tipo ("IMAGEM"|"VIDEO"),
  ordem (Int), criadoEm, atualizadoEm
  → Relação: peca Peca (onDelete: Cascade)
  → Tabela: "fotos_pecas"
}

model ConfigSite {
  id, chave (unique), valor, tipo ("TEXT"|"IMAGE"|"HTML"|"VIDEO"),
  criadoEm, atualizadoEm
  → Tabela: "config_site"
}

model Arquivo {
  id, nome (unique), mimetype, dados (Bytes), tamanho (Int),
  criadoEm, atualizadoEm
  → Tabela: "arquivos"
  → Propósito: armazenamento persistente de uploads no PostgreSQL
}
```

---

## ROTAS DA API — REFERÊNCIA COMPLETA

### Autenticação
```
POST   /api/auth/login          → { email, senha } → { token, usuario }
GET    /api/auth/me             → [JWT] → { id, email, nome, papel }
```

### Peças
```
GET    /api/pecas               → [?status=EM_CARTAZ] → Peca[] (com fotos, locais, colaboradores)
GET    /api/pecas/:id           → Peca (completa com todas as relações)
POST   /api/pecas               → [JWT+Admin] { titulo, resumo, endereco, ... } → Peca
PUT    /api/pecas/:id           → [JWT+Admin] { titulo?, resumo?, ... } → Peca
DELETE /api/pecas/:id           → [JWT+Admin] → { mensagem }
```

### Fotos de Peças
```
POST   /api/pecas/:id/fotos           → [JWT+Admin] multipart: arquivos[] → FotoPeca[]
DELETE /api/pecas/:pecaId/fotos/:fotoId → [JWT+Admin] → { mensagem }
PUT    /api/pecas/:id/fotos/reordenar  → [JWT+Admin] { fotosIds: number[] } → FotoPeca[]
PUT    /api/pecas/:id/fotos/:fotoId/capa → [JWT+Admin] → FotoPeca[]
```

### Locais de Apresentação
```
POST   /api/pecas/:id/locais          → [JWT+Admin] { nomeLocal, cidade, endereco, ... }
PUT    /api/pecas/:id/locais/:localId → [JWT+Admin] { nomeLocal?, cidade?, ... }
DELETE /api/pecas/:id/locais/:localId → [JWT+Admin]
```

### Alocação Colaborador ↔ Peça
```
POST   /api/pecas/:id/colaboradores            → [JWT+Admin] { colaboradorId, funcaoNaPeca }
DELETE /api/pecas/:id/colaboradores/:colabId    → [JWT+Admin]
```

### Colaboradores
```
GET    /api/colaboradores       → Colaborador[] (dados sensíveis omitidos sem JWT)
GET    /api/colaboradores/:id   → Colaborador
POST   /api/colaboradores       → multipart: { nome, funcao, idade, celular, email, endereco, genero, foto? }
PUT    /api/colaboradores/:id   → [JWT+Admin] multipart
DELETE /api/colaboradores/:id   → [JWT+Admin]
```

### Configurações
```
GET    /api/config              → ConfigSite[]
PUT    /api/config/:chave       → [JWT+Admin] { valor } ou multipart { arquivo }
```

### Upload & Health
```
POST   /api/upload              → [JWT+Admin] multipart: { arquivo } → { url, nomeOriginal, tamanho, tipo }
GET    /api/saude               → { status, mensagem, ambiente, timestamp }
```

### Arquivos Estáticos
```
GET    /uploads/:nome           → Serve arquivo do disco (cache) ou do PostgreSQL (fallback)
```

---

## VARIÁVEIS DE AMBIENTE

### Backend (`server/.env`)

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"   # OBRIGATÓRIA
JWT_SECRET="chave-secreta-longa"                          # OBRIGATÓRIA
CLIENT_URL="https://pffabio.github.io"                    # Para CORS em produção
NODE_ENV="development"                                     # development | production | test
PORT=3001                                                  # Padrão: 3001
```

### Frontend (`client/.env`)

```env
VITE_API_URL="https://projeto-teatro.onrender.com"        # URL do backend em produção
```

- Em desenvolvimento, o Vite proxy redireciona `/api` → `localhost:3001` automaticamente.
- A variável `VITE_API_URL` só é usada no build de produção.

---

## FLUXO DE UPLOADS — DETALHAMENTO TÉCNICO

### Problema
O Render (plano Free) usa filesystem efêmero: arquivos em `/uploads/` são apagados em cada deploy ou hibernação (15 min de inatividade).

### Solução Implementada

```
Upload (POST) → Multer memoryStorage → buffer na RAM
                                         │
                  ┌──────────────────────┴──────────────────────┐
                  ▼                                              ▼
          prisma.arquivo.create()                    fs.writeFile('/uploads/x.jpg')
          (PostgreSQL - persistente)                  (disco local - cache volátil)
                  │                                              │
                  └──────────────────────┬──────────────────────┘
                                         ▼
                              Retorna URL: /uploads/x.jpg


Leitura (GET /uploads/:nome)
                  │
                  ▼
          fs.existsSync(disco)?
          ┌─── SIM → res.sendFile() (rápido)
          │
          └─── NÃO → prisma.arquivo.findUnique()
                       │
                       ├── encontrou → res.send(buffer) + restaura em disco
                       └── não encontrou → 404
```

### Arquivos-chave:
- **Configuração do Multer**: `server/src/middleware/upload.js`
- **Lógica de salvar/remover**: `server/src/services/fileService.js`
- **Rota de entrega com fallback**: `server/src/app.js` (handler `GET /uploads/:nome`)

---

## SEGURANÇA

| Mecanismo | Implementação |
|---|---|
| Autenticação | JWT via header `Authorization: Bearer <token>` |
| Hashing de senhas | bcryptjs (salt rounds: 10) |
| Headers HTTP | Helmet (CSP, X-Frame-Options, etc.) |
| Rate limiting geral | 500 req / 15min por IP em `/api/*` |
| Rate limiting login | 20 req / 15min por IP em `/api/auth/login` |
| CORS | Whitelist de origens (localhost + CLIENT_URL) |
| LGPD | Dados sensíveis de colaboradores omitidos sem JWT |
| Validação de IDs | Middleware `validateId` rejeita IDs não-numéricos |
| Validação de entrada | Validators dedicados por entidade |
| Path traversal | `path.basename()` no FileService e no handler de uploads |

---

## DEPLOY — COMANDOS EXATOS

### Publicar alterações no FRONTEND (GitHub Pages):

```bash
cd client
npm run deploy          # build + gh-pages -d dist
```

### Publicar alterações no BACKEND (Render):

```bash
git add .
git commit -m "descrição"
git push origin main    # O Render faz deploy automático
```

### Build command configurado no Render:
```
npm install && npx prisma generate && npx prisma db push && node prisma/seed.js
```

### Start command no Render:
```
node src/index.js
```

---

## PERFORMANCE — OTIMIZAÇÕES APLICADAS

| Otimização | Detalhe |
|---|---|
| Code splitting por rota | `React.lazy()` + `Suspense` em `App.jsx` |
| Manual chunks (Vite) | `vendor` (react, axios, router) e `leaflet` isolados |
| Cache de uploads | Headers `Cache-Control: immutable` + disco local como cache |
| Prisma includes seletivos | Queries trazem apenas as relações necessárias |

---

## GOTCHAS E ARMADILHAS

1. **Prisma `@updatedAt` no PostgreSQL**: Sempre usar `@default(now()) @updatedAt` juntos. Sem `@default(now())`, `db push` falha se a tabela já tiver dados.

2. **SPA no GitHub Pages**: O `vite.config.js` define `base: '/projeto_teatro/'`. Se mudar o repo, DEVE atualizar esse valor. O `BrowserRouter` usa `import.meta.env.BASE_URL` como `basename`.

3. **CORS em produção**: A variável `CLIENT_URL` no Render DEVE ser `https://pffabio.github.io` (sem trailing slash e sem o path `/projeto_teatro`).

4. **Upload de arquivos**: O Multer está em `memoryStorage()`. Arquivos grandes (>10MB) serão rejeitados. O limite está em `upload.js`.

5. **Seed idempotente para usuários/configs**: Usa `upsert`. Mas para peças, usa `create` — se rodar duas vezes, duplica. Em produção, o seed só roda no primeiro deploy.

6. **Token JWT no frontend**: Armazenado em `localStorage` com chave `theatrum_token`. Se trocar a chave, os tokens existentes ficam inválidos.

---

## CREDENCIAIS PADRÃO

```
Email: admin@theatrum.com
Senha: admin123
```
