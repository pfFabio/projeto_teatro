# 🎭 Theatrum — Sistema de Gestão de Peças de Teatro

> Projeto acadêmico full-stack para cadastro, gestão e divulgação de peças de teatro, seus colaboradores e locais de apresentação.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [API REST — Endpoints](#api-rest--endpoints)
- [Autenticação](#autenticação)
- [Sistema de Uploads](#sistema-de-uploads)
- [Deploy em Produção](#deploy-em-produção)
- [Testes](#testes)
- [Credenciais Padrão](#credenciais-padrão)

---

## Visão Geral

O **Theatrum** permite que um administrador gerencie peças teatrais (com fotos, vídeos, locais de apresentação e elenco), enquanto o público pode navegar por essas informações em uma interface moderna com mapa interativo. Colaboradores (atores, técnicos, diretores) podem se cadastrar pelo próprio site.

### Funcionalidades Principais

| Funcionalidade | Acesso |
|---|---|
| Listagem e detalhes de peças | Público |
| Mapa interativo com locais de apresentação (Leaflet) | Público |
| Cadastro de colaborador (ator, técnico, etc.) | Público |
| Galeria de fotos e vídeos das peças | Público |
| Carrossel de propagandas/anúncios na página inicial | Público |
| Painel administrativo completo (CRUD de peças, colaboradores, alocações) | Admin |
| Upload de fotos/vídeos para peças e colaboradores | Admin |
| CRUD de propagandas/anúncios com fotos e links | Admin |
| Configurações editáveis do site (título, contato, etc.) | Admin |
| Gerenciamento de locais e datas de apresentação | Admin |

---

## Tecnologias

### Frontend (SPA)
- **React 19** + **Vite 7** (com lazy loading por rota)
- **React Router 7** (SPA com `BrowserRouter`)
- **Axios** (chamadas HTTP)
- **Leaflet + React-Leaflet** (mapas interativos)
- **CSS puro** (sem frameworks CSS — design com glassmorphism e gradientes)
- **GitHub Pages** (hospedagem via branch `gh-pages`)

### Backend (API REST)
- **Node.js** + **Express 4**
- **Prisma ORM** (com PostgreSQL)
- **JWT** (autenticação)
- **Bcrypt** (hash de senhas)
- **Multer** (upload de arquivos em memória)
- **Helmet** (segurança de headers)
- **express-rate-limit** (proteção contra DoS/brute force)
- **Render.com** (hospedagem — Web Service + PostgreSQL)

---

## Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** rodando localmente (ou string de conexão remota)

---

## Como Rodar Localmente

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/pfFabio/projeto_teatro.git
cd projeto_teatro
npm run install:all
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `server/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/theatrum"
JWT_SECRET="uma-chave-secreta-qualquer-com-pelo-menos-32-caracteres"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

### 3. Criar o banco e popular com dados iniciais

```bash
cd server
npx prisma db push    # Cria as tabelas no PostgreSQL
node prisma/seed.js   # Popula com dados de exemplo
```

### 4. Iniciar o projeto (frontend + backend juntos)

```bash
# Na raiz do projeto
npm run dev
```

Isso vai iniciar:
- **Backend** em `http://localhost:3001`
- **Frontend** em `http://localhost:5173`

O Vite já está configurado com proxy para `/api` e `/uploads`, então tudo funciona transparente no navegador.

---

## Estrutura do Projeto

```
theatrum/
├── client/                     # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Componentes do painel admin
│   │   │   │   ├── AdminDashboard.jsx          # Dashboard com abas (peças, colaboradores, alocações, propagandas, config)
│   │   │   │   ├── AdminLogin.jsx              # Tela de login
│   │   │   │   ├── AbaPecas.jsx                # CRUD de peças
│   │   │   │   ├── AbaColaboradores.jsx        # CRUD de colaboradores
│   │   │   │   ├── AbaAlocacoes.jsx            # Alocação de colaboradores em peças
│   │   │   │   ├── AbaPropagandas.jsx          # CRUD de propagandas/anúncios
│   │   │   │   ├── AbaConfig.jsx               # Configurações do site
│   │   │   │   ├── ModalPecaForm.jsx           # Modal de criação/edição de peça
│   │   │   │   ├── ModalPropagandaForm.jsx     # Modal de criação/edição de propaganda
│   │   │   │   ├── ModalFotosManager.jsx       # Galeria de fotos de peças (upload, reordenar, capa)
│   │   │   │   ├── ModalFotosPropagandaManager.jsx # Galeria de fotos de propagandas
│   │   │   │   └── ModalLocaisManager.jsx      # Gerenciar locais de apresentação
│   │   │   ├── common/         # Componentes reutilizáveis
│   │   │   │   ├── Carousel.jsx                # Carrossel de imagens/vídeos (hero)
│   │   │   │   ├── ConfirmModal.jsx            # Modal de confirmação
│   │   │   │   ├── MapView.jsx                 # Mapa Leaflet
│   │   │   │   ├── Modal.jsx                   # Modal genérico
│   │   │   │   └── PropagandasSection.jsx      # Carrossel de propagandas (homepage)
│   │   │   └── layout/         # Estrutura visual
│   │   │       ├── Header.jsx                  # Cabeçalho com navegação
│   │   │       ├── Footer.jsx                  # Rodapé
│   │   │       └── Layout.jsx                  # Wrapper (Header + conteúdo + Footer)
│   │   ├── pages/              # Páginas (lazy loaded)
│   │   │   ├── HomePage.jsx             # Página inicial (hero, propagandas, peças em destaque)
│   │   │   ├── PecasPage.jsx            # Listagem de peças com filtros
│   │   │   ├── PecaDetalhesPage.jsx     # Detalhes de uma peça + mapa + elenco
│   │   │   ├── ColaboradorPage.jsx      # Formulário público de cadastro
│   │   │   └── AdminPage.jsx            # Wrapper do painel admin
│   │   ├── services/
│   │   │   ├── api.js                   # Cliente HTTP centralizado (Axios)
│   │   │   └── geocodingService.js      # Geocodificação de endereços
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Contexto de autenticação (React Context)
│   │   ├── constants/
│   │   │   └── statusPeca.js            # Constantes de status (EM_CARTAZ, etc.)
│   │   ├── styles/
│   │   │   ├── index.css                # Design system (variáveis, reset, tipografia)
│   │   │   ├── components.css           # Estilos de componentes reutilizáveis
│   │   │   └── pages.css                # Estilos específicos de cada página
│   │   ├── App.jsx                      # Roteamento principal + Suspense
│   │   └── main.jsx                     # Ponto de entrada (ReactDOM.createRoot)
│   ├── vite.config.js                   # Config do Vite (proxy, chunks, testes)
│   └── package.json
│
├── server/                     # Backend Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma                # Schema do banco (modelos, relações)
│   │   └── seed.js                      # Dados iniciais (admin, peças, colaboradores, propagandas)
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                   # Validação de variáveis de ambiente
│   │   ├── constants/
│   │   │   └── statusPeca.js            # Constantes de status
│   │   ├── controllers/                 # Camada de controle (req/res)
│   │   │   ├── authController.js        # Login e perfil
│   │   │   ├── pecasController.js       # CRUD de peças
│   │   │   ├── colaboradoresController.js# CRUD de colaboradores
│   │   │   ├── fotosController.js       # Upload/deleção de fotos de peças
│   │   │   ├── locaisController.js      # CRUD de locais
│   │   │   ├── propagandasController.js # CRUD de propagandas e fotos
│   │   │   └── configController.js      # Configurações do site
│   │   ├── services/                    # Camada de negócios (lógica)
│   │   │   ├── authService.js           # Autenticação JWT + bcrypt
│   │   │   ├── pecaService.js           # Regras de negócio de peças
│   │   │   ├── colaboradorService.js    # Regras de colaboradores (LGPD)
│   │   │   ├── fotoService.js           # Upload/deleção de fotos de peças
│   │   │   ├── localService.js          # CRUD de locais de apresentação
│   │   │   ├── propagandaService.js     # CRUD de propagandas + fotos
│   │   │   ├── fileService.js           # Persistência de arquivos (PostgreSQL + disco)
│   │   │   └── configService.js         # Configurações do site
│   │   ├── middleware/
│   │   │   ├── auth.js                  # JWT: autenticar, autenticarOpcional, apenasAdmin
│   │   │   ├── upload.js                # Multer (memoryStorage, filtros, limites)
│   │   │   └── validateId.js            # Validação de IDs numéricos nos params
│   │   ├── routes/                      # Definição de rotas Express
│   │   │   ├── auth.js                  # /api/auth
│   │   │   ├── pecas.js                 # /api/pecas (+ fotos, colaboradores, locais)
│   │   │   ├── colaboradores.js         # /api/colaboradores
│   │   │   ├── propagandas.js           # /api/propagandas (+ fotos)
│   │   │   ├── config.js                # /api/config
│   │   │   └── upload.js               # /api/upload
│   │   ├── validators/                  # Validação de dados de entrada
│   │   │   ├── authValidator.js
│   │   │   ├── pecaValidator.js
│   │   │   ├── colaboradorValidator.js
│   │   │   └── propagandaValidator.js
│   │   ├── errors/
│   │   │   └── AppError.js              # Classe padronizada de erros HTTP
│   │   ├── lib/
│   │   │   ├── prisma.js                # Instância singleton do Prisma Client
│   │   │   └── logger.js                # Logger customizado
│   │   ├── app.js                       # Configuração do Express (CORS, Helmet, rotas)
│   │   └── index.js                     # Ponto de entrada (app.listen)
│   └── package.json
│
├── docs/                       # Documentação
├── package.json                # Scripts de orquestração (raiz)
└── .gitignore
```

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                  NAVEGADOR                          │
│  React SPA (GitHub Pages)                           │
│  ┌──────────────────────────────────┐               │
│  │ Pages → Components → api.js     │               │
│  │    (Axios com JWT interceptor)   │               │
│  └──────────┬───────────────────────┘               │
└─────────────┼───────────────────────────────────────┘
              │ HTTPS (JSON + multipart/form-data)
              ▼
┌─────────────────────────────────────────────────────┐
│                RENDER.COM                           │
│  Express API (Node.js Web Service)                  │
│  ┌──────────────────────────────────┐               │
│  │ Routes → Controllers → Services │               │
│  │    ↓           ↓           ↓     │               │
│  │ Middleware   Validators   Prisma │               │
│  └──────────┬───────────────────────┘               │
│             │                                       │
│             ▼                                       │
│  ┌─────────────────────┐                            │
│  │    PostgreSQL        │                           │
│  │  (Render Database)   │                           │
│  └─────────────────────┘                            │
└─────────────────────────────────────────────────────┘
```

### Fluxo de uma requisição típica:

1. O React chama `pecasAPI.listar()` via Axios
2. Axios adiciona o JWT no header `Authorization: Bearer <token>` (se logado)
3. Express recebe em `/api/pecas` → rota → middleware de validação → controller
4. Controller chama o service correspondente
5. Service executa queries no Prisma e retorna dados
6. Controller envia a resposta JSON ao frontend

---

## Banco de Dados

O Theatrum usa **PostgreSQL** via **Prisma ORM**. Todas as tabelas e relações estão definidas em `server/prisma/schema.prisma`.

### Modelos e Relações

| Modelo | Tabela | Descrição |
|---|---|---|
| `Usuario` | `usuarios` | Admin do sistema (login JWT) |
| `Colaborador` | `colaboradores` | Atores, técnicos, diretores (cadastro público) |
| `Peca` | `pecas` | Peças de teatro |
| `LocalPeca` | `locais_pecas` | Locais/datas de apresentação (N por peça) |
| `PecaColaborador` | `peca_colaboradores` | Tabela N:N entre peças e colaboradores |
| `FotoPeca` | `fotos_pecas` | Fotos/vídeos das peças |
| `Propaganda` | `propagandas` | Anúncios/propagandas do site |
| `FotoPropaganda` | `fotos_propagandas` | Fotos das propagandas |
| `ConfigSite` | `config_site` | Configurações editáveis (chave-valor) |
| `Arquivo` | `arquivos` | Armazenamento binário de uploads no PostgreSQL |

### Diagrama de Relações

```
Usuario (independente)

Colaborador ◄──── PecaColaborador ────► Peca
                     (N:N)                │
                                          ├── FotoPeca (1:N)
                                          └── LocalPeca (1:N)

Propaganda ◄──── FotoPropaganda (1:N)

ConfigSite (independente, chave-valor)
Arquivo (independente, armazenamento binário)
```

### Comandos úteis do Prisma

```bash
cd server
npx prisma studio          # Abre interface visual do banco no navegador
npx prisma db push         # Sincroniza o schema com o banco (sem migration)
npx prisma migrate dev     # Cria migration formal
npx prisma generate        # Re-gera o Prisma Client
node prisma/seed.js        # Re-popula dados iniciais
```

---

## API REST — Endpoints

**URL base**: `https://projeto-teatro.onrender.com/api`

### Autenticação (`/api/auth`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | Público | Login (retorna JWT) |
| `GET` | `/auth/me` | Admin | Perfil do usuário logado |

### Peças (`/api/pecas`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/pecas` | Público | Listar todas as peças |
| `GET` | `/pecas/:id` | Público | Detalhes de uma peça |
| `POST` | `/pecas` | Admin | Criar peça |
| `PUT` | `/pecas/:id` | Admin | Atualizar peça |
| `DELETE` | `/pecas/:id` | Admin | Deletar peça |

### Fotos de Peças (`/api/pecas/:id/fotos`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/pecas/:id/fotos` | Admin | Upload de fotos (multipart, max 10) |
| `DELETE` | `/pecas/:pecaId/fotos/:fotoId` | Admin | Remover foto |
| `PUT` | `/pecas/:id/fotos/reordenar` | Admin | Reordenar fotos |
| `PUT` | `/pecas/:id/fotos/:fotoId/capa` | Admin | Definir foto de capa |

### Locais de Apresentação (`/api/pecas/:id/locais`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/pecas/:id/locais` | Admin | Adicionar local |
| `PUT` | `/pecas/:id/locais/:localId` | Admin | Atualizar local |
| `DELETE` | `/pecas/:id/locais/:localId` | Admin | Remover local |

### Alocação de Colaboradores (`/api/pecas/:id/colaboradores`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/pecas/:id/colaboradores` | Admin | Alocar colaborador em peça |
| `DELETE` | `/pecas/:id/colaboradores/:colabId` | Admin | Remover alocação |

### Colaboradores (`/api/colaboradores`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/colaboradores` | Público* | Listar (dados sensíveis ocultos sem JWT) |
| `GET` | `/colaboradores/:id` | Público* | Detalhes |
| `POST` | `/colaboradores` | Público | Cadastro com foto (multipart) |
| `PUT` | `/colaboradores/:id` | Admin | Atualizar |
| `DELETE` | `/colaboradores/:id` | Admin | Deletar |

> \* Dados sensíveis (celular, email, endereço) são omitidos para não-admins (LGPD).

### Configurações (`/api/config`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/config` | Público | Listar todas as configurações |
| `PUT` | `/config/:chave` | Admin | Atualizar configuração |

### Propagandas (`/api/propagandas`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/propagandas` | Público | Listar propagandas (filtro: `?ativo=true&limite=5`) |
| `GET` | `/propagandas/:id` | Público | Detalhes de uma propaganda |
| `POST` | `/propagandas` | Admin | Criar propaganda (multipart, com fotos opcionais) |
| `PUT` | `/propagandas/:id` | Admin | Atualizar propaganda |
| `DELETE` | `/propagandas/:id` | Admin | Deletar propaganda e fotos |

### Fotos de Propagandas (`/api/propagandas/:id/fotos`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/propagandas/:id/fotos` | Admin | Upload de fotos (multipart, max 10) |
| `DELETE` | `/propagandas/:id/fotos/:fotoId` | Admin | Remover foto |
| `PUT` | `/propagandas/:id/fotos/reordenar` | Admin | Reordenar fotos |

### Upload Genérico (`/api/upload`)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/upload` | Admin | Upload avulso de arquivo |

### Health Check

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/saude` | Público | Verifica se a API está online |

---

## Autenticação

O sistema usa **JWT (JSON Web Token)**:

1. O admin faz `POST /api/auth/login` com `{ email, senha }`
2. O servidor valida com bcrypt e retorna `{ token, usuario }`
3. O frontend armazena o token em `localStorage` (`theatrum_token`)
4. Todas as requisições subsequentes incluem `Authorization: Bearer <token>` via interceptor Axios
5. Se o token expirar (ou for inválido), o interceptor remove o token e desloga o usuário

### Middlewares de autenticação:

- **`autenticar`** — Obrigatório: rejeita com 401 se não tiver token válido
- **`autenticarOpcional`** — Se tiver token válido, preenche `req.usuario`; senão, continua
- **`apenasAdmin`** — Rejeita com 403 se `req.usuario.papel !== 'ADMIN'`

---

## Sistema de Uploads

O Render usa **filesystem efêmero** (arquivos são apagados quando o container reinicia ou hiberna). Para resolver isso:

1. **Multer** recebe o arquivo em memória (`memoryStorage`)
2. **`FileService.salvarArquivo()`** salva o buffer em duas camadas:
   - **PostgreSQL** (tabela `arquivos`) — persistência permanente
   - **Disco local** (`/uploads/`) — cache rápido
3. Quando alguém acessa `GET /uploads/nome.jpg`:
   - Se o arquivo existir no disco → serve diretamente (rápido)
   - Se não existir (container reiniciou) → busca do PostgreSQL, restaura em disco e serve

Esse sistema é **transparente** para o frontend — a URL `/uploads/xxx.jpg` sempre funciona.

---

## Deploy em Produção

### Frontend → GitHub Pages

```bash
cd client
npm run deploy    # Faz build + publica na branch gh-pages
```

Acesso: `https://pffabio.github.io/projeto_teatro/`

### Backend → Render.com

O Render faz deploy automático a cada push na branch `main`.

**Variáveis de ambiente no Render:**

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `postgresql://...` (fornecido pelo Render PostgreSQL) |
| `JWT_SECRET` | Uma chave secreta longa |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://pffabio.github.io` |

**Build command do Render:**
```
npm install && npx prisma generate && npx prisma db push && node prisma/seed.js
```

**Start command:** `node src/index.js`

---

## Testes

```bash
# Rodar todos os testes
npm test

# Apenas servidor
npm run test:server    # Jest

# Apenas cliente
npm run test:client    # Vitest
```

---

## Credenciais Padrão

| Campo | Valor |
|---|---|
| **Email** | `admin@theatrum.com` |
| **Senha** | `admin123` |

> ⚠️ Em produção, troque a senha imediatamente após o primeiro deploy.

---

## Licença

Projeto acadêmico — uso educacional.
