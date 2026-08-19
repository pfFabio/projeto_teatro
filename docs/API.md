# 📡 API REST — Documentação Completa

Documentação de todos os endpoints da API REST do Theatrum.

**Base URL:** `http://localhost:3001/api`

---

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)**. Endpoints protegidos exigem o header:

```
Authorization: Bearer <token>
```

### POST `/auth/login`

Realiza login do administrador.

**Body:**
```json
{
  "email": "admin@theatrum.com",
  "senha": "admin123"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "email": "admin@theatrum.com",
    "nome": "Administrador",
    "papel": "ADMIN"
  }
}
```

**Erros:**
- `400` — Email ou senha não fornecidos
- `401` — Credenciais incorretas

### GET `/auth/me`

Retorna dados do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{
  "id": 1,
  "email": "admin@theatrum.com",
  "nome": "Administrador",
  "papel": "ADMIN",
  "criadoEm": "2026-01-01T00:00:00.000Z"
}
```

---

## 🎪 Peças

### GET `/pecas`

Lista todas as peças com paginação e filtros.

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|:---|:---|:---|
| `status` | string | Filtrar por status: `EM_CARTAZ`, `ENCERRADA`, `PROGRAMADA` |
| `busca` | string | Busca textual no título, resumo ou endereço |
| `pagina` | number | Página atual (padrão: 1) |
| `limite` | number | Itens por página (padrão: 20) |

**Resposta 200:**
```json
{
  "pecas": [
    {
      "id": 1,
      "titulo": "Hamlet",
      "resumo": "...",
      "endereco": "Teatro Municipal — ...",
      "latitude": -23.5453,
      "longitude": -46.6385,
      "dataEstreia": "2026-09-15",
      "status": "PROGRAMADA",
      "criadoEm": "...",
      "fotos": [{ "id": 1, "url": "/uploads/foto.jpg", "tipo": "IMAGEM" }],
      "_count": { "colaboradores": 4 }
    }
  ],
  "total": 3,
  "pagina": 1,
  "totalPaginas": 1
}
```

### GET `/pecas/:id`

Retorna detalhes completos de uma peça, incluindo fotos e colaboradores.

**Resposta 200:**
```json
{
  "id": 1,
  "titulo": "Hamlet",
  "resumo": "...",
  "endereco": "...",
  "latitude": -23.5453,
  "longitude": -46.6385,
  "fotos": [
    { "id": 1, "url": "/uploads/foto.jpg", "descricao": "", "tipo": "IMAGEM", "ordem": 0 }
  ],
  "colaboradores": [
    {
      "id": 1,
      "funcaoNaPeca": "Hamlet",
      "colaborador": {
        "id": 2,
        "nome": "João Santos",
        "funcao": "Ator",
        "fotoUrl": null
      }
    }
  ]
}
```

### POST `/pecas` 🔐

Cria uma nova peça. **Requer autenticação admin.**

**Body:**
```json
{
  "titulo": "Nova Peça",
  "resumo": "Descrição da peça...",
  "endereco": "Teatro X — Rua Y, 123",
  "latitude": -23.55,
  "longitude": -46.64,
  "dataEstreia": "2026-10-01",
  "status": "PROGRAMADA"
}
```

### PUT `/pecas/:id` 🔐

Atualiza uma peça existente. Aceita atualização parcial.

### DELETE `/pecas/:id` 🔐

Deleta uma peça e todas as suas fotos e alocações.

### POST `/pecas/:id/fotos` 🔐

Upload de fotos/vídeos da peça. **Multipart form-data.**

| Campo | Tipo | Descrição |
|:---|:---|:---|
| `arquivos` | File[] | Até 10 arquivos (JPG, PNG, WebP, MP4, WebM) |
| `descricao` | string | Descrição opcional |

### DELETE `/pecas/:pecaId/fotos/:fotoId` 🔐

Deleta uma foto/vídeo específico.

### POST `/pecas/:id/colaboradores` 🔐

Aloca um colaborador a uma peça.

**Body:**
```json
{
  "colaboradorId": 1,
  "funcaoNaPeca": "Hamlet"
}
```

### DELETE `/pecas/:id/colaboradores/:colabId` 🔐

Remove um colaborador de uma peça.

---

## 👥 Colaboradores

### GET `/colaboradores`

Lista todos os colaboradores com filtros.

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|:---|:---|:---|
| `funcao` | string | Filtrar por função |
| `genero` | string | Filtrar por gênero |
| `busca` | string | Busca por nome, email ou função |
| `pagina` | number | Página atual |
| `limite` | number | Itens por página |

### GET `/colaboradores/:id`

Detalhes de um colaborador, incluindo peças em que participa.

### POST `/colaboradores`

Cadastro público de colaborador. **Multipart form-data.**

| Campo | Tipo | Obrigatório | Descrição |
|:---|:---|:---|:---|
| `nome` | string | ✅ | Nome completo |
| `funcao` | string | ✅ | Função/cargo |
| `idade` | number | ✅ | Idade |
| `celular` | string | ✅ | Número de celular |
| `email` | string | ✅ | Email (único) |
| `endereco` | string | ✅ | Endereço completo |
| `genero` | string | ✅ | Gênero |
| `foto` | File | ❌ | Foto pessoal |

### PUT `/colaboradores/:id` 🔐

Atualiza dados de um colaborador. **Requer autenticação admin.**

### DELETE `/colaboradores/:id` 🔐

Deleta um colaborador e suas alocações.

---

## ⚙ Configurações

### GET `/config`

Retorna todas as configurações do site como objeto chave-valor.

**Resposta 200:**
```json
{
  "titulo_site": { "valor": "Theatrum", "tipo": "TEXT" },
  "propaganda_titulo": { "valor": "Aulas de Teatro", "tipo": "TEXT" },
  "propaganda_texto": { "valor": "...", "tipo": "TEXT" }
}
```

### PUT `/config/:chave` 🔐

Cria ou atualiza uma configuração.

**Body:**
```json
{
  "valor": "Novo valor",
  "tipo": "TEXT"
}
```

---

## 📤 Upload

### POST `/upload` 🔐

Upload genérico de arquivo.

| Campo | Tipo | Descrição |
|:---|:---|:---|
| `arquivo` | File | Arquivo a ser enviado (max 50MB) |

**Tipos aceitos:** JPG, PNG, WebP, GIF, MP4, WebM

---

## 🔴 Códigos de Status

| Código | Significado |
|:---|:---|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Dados inválidos |
| `401` | Não autenticado |
| `403` | Sem permissão |
| `404` | Não encontrado |
| `409` | Conflito (ex: email duplicado) |
| `500` | Erro interno |
