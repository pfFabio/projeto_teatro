# 🔧 Guia de Instalação e Configuração

Guia passo a passo para instalar, configurar e executar o Theatrum.

---

## Pré-requisitos

### Obrigatórios

| Software | Versão Mínima | Download |
|:---|:---|:---|
| Node.js | 18.0+ | [nodejs.org](https://nodejs.org) |
| npm | 9.0+ | Incluído com Node.js |

### Opcionais (para MySQL em produção)

| Software | Versão | Download |
|:---|:---|:---|
| MySQL Server | 8.0+ | [mysql.com](https://dev.mysql.com/downloads/) |
| XAMPP (alternativa) | 8.0+ | [apachefriends.org](https://www.apachefriends.org/) |

---

## Instalação

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd theatrum
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

O arquivo `server/.env` já vem pré-configurado para desenvolvimento:

```env
PORT=3001
JWT_SECRET=theatrum_super_secreto_2026
DATABASE_URL="file:./dev.db"
```

> ⚠️ **IMPORTANTE**: Em produção, troque o `JWT_SECRET` por um valor aleatório longo.

### 4. Configurar o Banco de Dados

```bash
cd server

# Criar as tabelas (migration)
npx prisma migrate dev --name init

# Popular com dados de exemplo
npx prisma db seed
```

Isso criará:
- 1 admin: `admin@theatrum.com` / `admin123`
- 5 colaboradores de exemplo
- 3 peças de teatro
- 11 alocações

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

## Configuração para MySQL

Se a faculdade exigir MySQL:

### 1. Instalar MySQL

- **Windows**: Baixe o MySQL Installer ou use XAMPP
- **Linux**: `sudo apt install mysql-server`
- **macOS**: `brew install mysql`

### 2. Criar o Banco

```sql
CREATE DATABASE theatrum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'theatrum'@'localhost' IDENTIFIED BY 'senha123';
GRANT ALL PRIVILEGES ON theatrum.* TO 'theatrum'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Atualizar Configurações

**`server/.env`:**
```env
DATABASE_URL="mysql://theatrum:senha123@localhost:3306/theatrum"
```

**`server/prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 4. Recriar o Banco

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

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

### Servidor (dentro de `server/`)

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Inicia com hot-reload |
| `npm start` | Inicia em produção |
| `npx prisma studio` | Interface visual do banco |
| `npx prisma migrate dev` | Criar/atualizar tabelas |
| `npx prisma db seed` | Popular com dados |
| `npx prisma migrate reset` | Resetar tudo |

### Cliente (dentro de `client/`)

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Inicia dev server |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |

---

## Deploy

### Frontend — Vercel

1. Faça push do projeto para o GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Backend — Render

1. Crie um Web Service no [Render](https://render.com)
2. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma migrate deploy`
   - **Start Command**: `node src/index.js`
3. Adicione variáveis de ambiente:
   - `JWT_SECRET`: valor secreto
   - `DATABASE_URL`: URL do banco MySQL

### Docker (Opcional)

```dockerfile
# Dockerfile para o backend
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npx prisma generate
EXPOSE 3001
CMD ["node", "src/index.js"]
```

---

## Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
```bash
cd server && npx prisma generate
```

### Erro: "Database does not exist"
```bash
cd server && npx prisma migrate dev --name init
```

### Porta 3001 em uso
Altere a variável `PORT` no `server/.env`.

### CORS errors no navegador
Verifique se o backend está rodando na porta correta e que o proxy do Vite está configurado.
