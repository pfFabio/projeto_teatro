# 🔧 Guia de Instalação e Configuração

Guia passo a passo para instalar, configurar e executar o Theatrum.

---

## Pré-requisitos

| Software | Versão Mínima | Download |
|:---|:---|:---|
| Node.js | 18.0+ | [nodejs.org](https://nodejs.org) |
| npm | 9.0+ | Incluído com Node.js |
| PostgreSQL | 14.0+ | [postgresql.org](https://www.postgresql.org/download/) |

---

## Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/pfFabio/projeto_teatro.git
cd projeto_teatro
```

### 2. Instalar Dependências

```bash
# Instalar tudo de uma vez (raiz + server + client)
npm run install:all

# Ou instalar individualmente:
npm install                    # Raiz (concurrently)
cd server && npm install       # Backend
cd ../client && npm install    # Frontend
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `server/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/theatrum"
JWT_SECRET="uma-chave-secreta-qualquer-com-pelo-menos-32-caracteres"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
PORT=3001
```

> ⚠️ **IMPORTANTE**: Em produção, troque o `JWT_SECRET` por um valor aleatório longo e seguro.

O frontend (`client/.env`) já vem pré-configurado para desenvolvimento:

```env
VITE_API_URL=http://localhost:3001
```

Em desenvolvimento, o proxy do Vite redireciona `/api` → `localhost:3001` automaticamente, então a variável `VITE_API_URL` só é usada no build de produção.

### 4. Configurar o Banco de Dados

```bash
cd server

# Criar as tabelas no PostgreSQL (sincroniza o schema)
npx prisma db push

# Popular com dados de exemplo
node prisma/seed.js
```

Isso criará:
- 1 admin: `admin@theatrum.com` / `admin123`
- 5 colaboradores de exemplo
- 3 peças de teatro
- 6 locais de apresentação
- 11 alocações de colaboradores
- 3 propagandas de exemplo
- 9 configurações do site

### 5. Iniciar o Projeto

```bash
# Na raiz do projeto
cd ..
npm run dev
```

Isso inicia simultaneamente:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## Comandos Disponíveis

### Raiz do Projeto

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Inicia frontend + backend |
| `npm run dev:server` | Inicia apenas o backend |
| `npm run dev:client` | Inicia apenas o frontend |
| `npm run install:all` | Instala dependências de todos |
| `npm run db:seed` | Popula o banco com dados de exemplo |
| `npm run db:migrate` | Executa migrations do Prisma |
| `npm run db:studio` | Abre o Prisma Studio (GUI do banco) |
| `npm test` | Roda todos os testes (server + client) |
| `npm run test:server` | Roda apenas testes do servidor (Jest) |
| `npm run test:client` | Roda apenas testes do cliente (Vitest) |

### Servidor (dentro de `server/`)

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Inicia com hot-reload |
| `npm start` | Inicia em produção |
| `npx prisma studio` | Interface visual do banco |
| `npx prisma db push` | Sincronizar schema com o banco |
| `npx prisma migrate dev` | Criar migration formal |
| `node prisma/seed.js` | Popular com dados |
| `npx prisma migrate reset` | Resetar tudo |

### Cliente (dentro de `client/`)

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Inicia dev server |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run deploy` | Build + publica no GitHub Pages |

---

## Deploy

### Frontend → GitHub Pages

```bash
cd client
npm run deploy    # Faz build + publica na branch gh-pages
```

Acesso: `https://pffabio.github.io/projeto_teatro/`

> ⚠️ O `vite.config.js` define `base: '/projeto_teatro/'`. Se mudar o nome do repositório, atualize esse valor.

### Backend → Render.com

O Render faz deploy automático a cada push na branch `main`.

1. Crie um **Web Service** no [Render](https://render.com)
2. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && node prisma/seed.js`
   - **Start Command**: `node src/index.js`
3. Adicione variáveis de ambiente:

| Variável | Valor |
|:---|:---|
| `DATABASE_URL` | `postgresql://...` (fornecido pelo Render PostgreSQL) |
| `JWT_SECRET` | Uma chave secreta longa |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://pffabio.github.io` |

4. Crie um **PostgreSQL** no Render (plano Free) e vincule ao Web Service.

---

## Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
```bash
cd server && npx prisma generate
```

### Erro: "Database does not exist"
```bash
cd server && npx prisma db push
```

### Porta 3001 em uso
Altere a variável `PORT` no `server/.env`.

### CORS errors no navegador
Verifique se o backend está rodando na porta correta e que o proxy do Vite está configurado em `client/vite.config.js`.


