# 🎭 Theatrum — Sistema de Gestão de Teatro

Sistema web full-stack para gestão de peças de teatro, com múltiplos níveis de acesso, CRUD completo, integração com mapas e documentação minuciosa.

> **Projeto Acadêmico** — Desenvolvido com custo zero utilizando tecnologias open-source.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API REST](#api-rest)
- [Banco de Dados](#banco-de-dados)
- [Deploy](#deploy)
- [Documentação Adicional](#documentação-adicional)

---

## 🎯 Visão Geral

O **Theatrum** é uma plataforma web que conecta artistas, técnicos e público no mundo do teatro. O sistema permite:

- **Público**: Visualizar peças em cartaz, detalhes com mapa, elenco e galeria
- **Colaboradores**: Cadastrar-se como parte da equipe técnica/artística
- **Administradores**: Gerenciar peças, colaboradores, alocações e conteúdo do site

### Arquitetura

```
┌─────────────────┐     HTTP/REST      ┌─────────────────┐     Prisma ORM     ┌──────────────┐
│   Frontend      │ ←───────────────→  │   Backend       │ ←───────────────→  │  Banco de    │
│   React + Vite  │                    │   Express.js    │                    │  Dados       │
│   Port: 5173    │                    │   Port: 3001    │                    │  SQLite/MySQL│
└─────────────────┘                    └─────────────────┘                    └──────────────┘
```

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa |
|:---|:---|:---|:---|
| Frontend | React | 19.x | Biblioteca UI mais popular do mercado |
| Bundler | Vite | 8.x | Build rápido, HMR instantâneo |
| Roteamento | React Router | 7.x | SPA com múltiplas páginas |
| HTTP Client | Axios | 1.x | Interceptors, transformações automáticas |
| Backend | Express.js | 4.x | Framework web minimalista e robusto |
| ORM | Prisma | 6.x | Type-safe, migrations, troca de DB fácil |
| Banco de Dados | SQLite / MySQL | - | SQLite para dev, MySQL para produção |
| Autenticação | JWT + bcrypt | - | Stateless, seguro, sem custo |
| Upload | Multer | 1.x | Upload de arquivos para disco local |
| Mapas | Leaflet | 1.9.x | 100% gratuito, OpenStreetMap |
| Estilização | CSS Vanilla | - | Controle total, sem dependências |
| Tipografia | Google Fonts | - | Playfair Display + Inter |

---

## ✨ Funcionalidades

### 👤 Acesso Público
- ✅ Carrossel de peças na página inicial
- ✅ Seção de propaganda de aulas de teatro
- ✅ Listagem de peças com filtros e busca
- ✅ Detalhes da peça com sinopse, galeria (fotos + vídeos), mapa e elenco
- ✅ Mapa interativo com Leaflet/OpenStreetMap

### 🎭 Acesso Colaborador
- ✅ Formulário de cadastro completo (nome, função, idade, celular, email, endereço, gênero)
- ✅ Upload de foto pessoal com preview
- ✅ Confirmação visual de cadastro

### 🔐 Acesso Admin
- ✅ Login seguro com email/senha (JWT)
- ✅ Dashboard com estatísticas
- ✅ CRUD completo de peças (criar, editar, deletar)
- ✅ CRUD completo de colaboradores (visualizar, editar, deletar)
- ✅ Sistema de alocação de colaboradores por peça
- ✅ Filtros avançados (por função, gênero, status, busca textual)
- ✅ Editor de configurações do site (textos, propaganda)

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+ (incluído com Node.js)

### Passo a passo

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd theatrum

# 2. Instalar todas as dependências (raiz, server e client)
npm run install:all

# 3. Configurar o banco de dados (migration + seed)
cd server
npx prisma migrate dev --name init
npx prisma db seed
cd ..

# 4. Iniciar o projeto (frontend + backend)
npm run dev
```

### Credenciais padrão

| Campo | Valor |
|:---|:---|
| Email | `admin@theatrum.com` |
| Senha | `admin123` |

---

## 📖 Uso

### URLs em Desenvolvimento

| Serviço | URL |
|:---|:---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| Prisma Studio | `npx prisma studio` (na pasta server) |

### Navegação

- **`/`** — Página inicial (carrossel + propaganda)
- **`/pecas`** — Listagem de todas as peças
- **`/pecas/:id`** — Detalhes de uma peça específica
- **`/colaborador`** — Formulário de cadastro de colaborador
- **`/admin`** — Painel administrativo (requer login)

---

## 📁 Estrutura do Projeto

```
theatrum/
├── docs/                      # Documentação
│   ├── README.md              # Este arquivo
│   ├── API.md                 # Documentação da API
│   ├── DATABASE.md            # Documentação do banco
│   └── SETUP.md               # Guia de setup
├── server/                    # Backend (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   └── seed.js            # Dados iniciais
│   ├── src/
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── middleware/        # Auth JWT + Upload Multer
│   │   ├── routes/            # Definição de rotas
│   │   └── index.js           # Entry point
│   └── uploads/               # Arquivos enviados
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── context/           # Contexto de autenticação
│   │   ├── services/          # Chamadas à API
│   │   └── styles/            # CSS (design system)
│   └── index.html
├── package.json               # Scripts raiz
└── .gitignore
```

---

## 🔌 API REST

Documentação completa em [`docs/API.md`](./API.md).

### Endpoints Principais

| Método | Endpoint | Descrição | Auth |
|:---|:---|:---|:---|
| POST | `/api/auth/login` | Login admin | ❌ |
| GET | `/api/pecas` | Listar peças | ❌ |
| GET | `/api/pecas/:id` | Detalhes da peça | ❌ |
| POST | `/api/pecas` | Criar peça | ✅ Admin |
| PUT | `/api/pecas/:id` | Atualizar peça | ✅ Admin |
| DELETE | `/api/pecas/:id` | Deletar peça | ✅ Admin |
| GET | `/api/colaboradores` | Listar colaboradores | ❌ |
| POST | `/api/colaboradores` | Cadastrar colaborador | ❌ |
| PUT | `/api/colaboradores/:id` | Editar colaborador | ✅ Admin |
| DELETE | `/api/colaboradores/:id` | Deletar colaborador | ✅ Admin |
| POST | `/api/pecas/:id/colaboradores` | Alocar colaborador | ✅ Admin |

---

## 🗄 Banco de Dados

Documentação completa em [`docs/DATABASE.md`](./DATABASE.md).

### Diagrama ER

```
Usuario ←──── (1:N) ────→ [Administradores]
Peca ←──── (N:N) ────→ Colaborador [via PecaColaborador]
Peca ←──── (1:N) ────→ FotoPeca
ConfigSite ←──── [Chave-Valor]
```

### Como trocar para MySQL

1. Instale MySQL (ou use XAMPP)
2. Crie o banco: `CREATE DATABASE theatrum;`
3. Edite `server/.env`:
   ```
   DATABASE_URL="mysql://root:senha@localhost:3306/theatrum"
   ```
4. Edite `server/prisma/schema.prisma`:
   ```prisma
   provider = "mysql"
   ```
5. Execute: `npx prisma migrate dev --name init`

---

## 🌐 Deploy

### Frontend (Vercel / GitHub Pages)
```bash
cd client
npm run build  # Gera pasta dist/
```

### Backend (Render)
- Configure como Web Service
- Build command: `cd server && npm install && npx prisma migrate deploy`
- Start command: `cd server && node src/index.js`

---

## 📚 Documentação Adicional

- [API.md](./API.md) — Documentação detalhada da API REST
- [DATABASE.md](./DATABASE.md) — Modelo de dados e diagrama ER
- [SETUP.md](./SETUP.md) — Guia completo de instalação e configuração

---

## 📄 Licença

Projeto acadêmico — Uso educacional.

---

*Desenvolvido com 🎭 por Theatrum Team*
