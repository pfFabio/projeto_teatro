# 🗄 Banco de Dados — Documentação

Documentação completa do modelo de dados do Theatrum.

---

## ORM: Prisma

O Theatrum usa **Prisma ORM** com **PostgreSQL** como banco de dados. Em produção, o banco roda no Render.com (plano gerenciado). Em desenvolvimento, usa-se PostgreSQL local.

### Arquivo de Schema

`server/prisma/schema.prisma`

---

## Diagrama Entidade-Relacionamento

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│    usuarios       │       │   peca_colaboradores  │       │  colaboradores    │
├──────────────────┤       ├──────────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)              │       │ id (PK)          │
│ email (UNIQUE)   │       │ pecaId (FK) ─────────┤──┐    │ nome             │
│ senha            │       │ colaboradorId (FK) ──┤──┤──→ │ funcao           │
│ nome             │       │ funcaoNaPeca         │  │    │ idade            │
│ papel            │       │ criadoEm             │  │    │ celular          │
│ criadoEm         │       │ atualizadoEm         │  │    │ email (UNIQUE)   │
│ atualizadoEm     │       │                      │  │    │ endereco         │
└──────────────────┘       │ UNIQUE(pecaId,       │  │    │ genero           │
                           │   colaboradorId)     │  │    │ fotoUrl          │
                           └──────────────────────┘  │    │ criadoEm         │
                                                     │    │ atualizadoEm     │
┌──────────────────┐       ┌──────────────────────┐  │    └──────────────────┘
│    pecas          │       │    fotos_pecas        │  │
├──────────────────┤       ├──────────────────────┤  │
│ id (PK) ←────────┤───────┤ pecaId (FK)          │  │
│ titulo           │  ┌────┤ id (PK)              │  │
│ resumo           │  │    │ url                  │  │
│ endereco         │←─┘    │ descricao            │  │
│ latitude         │       │ tipo                 │  │
│ longitude        │       │ ordem                │  │
│ dataEstreia      │       │ criadoEm             │  │
│ status           │       │ atualizadoEm         │  │
│ criadoEm         │←──────┤                      │  │
│ atualizadoEm     │       └──────────────────────┘  │
└──────────────────┘                                  │
         │                                            │
         ├── locais_pecas (1:N) ─────────────────────┘
         │
┌──────────────────┐       ┌──────────────────────┐
│   locais_pecas    │       │   config_site         │
├──────────────────┤       ├──────────────────────┤
│ id (PK)          │       │ id (PK)              │
│ pecaId (FK)      │       │ chave (UNIQUE)       │
│ nomeLocal        │       │ valor                │
│ cidade           │       │ tipo                 │
│ endereco         │       │ criadoEm             │
│ latitude         │       │ atualizadoEm         │
│ longitude        │       └──────────────────────┘
│ dataEstreia      │
│ dataFim          │       ┌──────────────────────┐
│ horario          │       │   arquivos            │
│ status           │       ├──────────────────────┤
│ criadoEm         │       │ id (PK)              │
│ atualizadoEm     │       │ nome (UNIQUE)        │
└──────────────────┘       │ mimetype             │
                           │ dados (BYTES)        │
┌──────────────────┐       │ tamanho              │
│   propagandas     │       │ criadoEm             │
├──────────────────┤       │ atualizadoEm         │
│ id (PK)          │       └──────────────────────┘
│ titulo           │
│ descricao        │       ┌──────────────────────┐
│ link             │       │  fotos_propagandas    │
│ textoBotao       │       ├──────────────────────┤
│ ativo            │───────┤ id (PK)              │
│ ordem            │       │ propagandaId (FK)    │
│ criadoEm         │       │ url                  │
│ atualizadoEm     │       │ ordem                │
└──────────────────┘       │ criadoEm             │
                           │ atualizadoEm         │
                           └──────────────────────┘
```

---

## Tabelas

### `usuarios`

Administradores do sistema. Autenticação via JWT.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `email` | String | TEXT | UNIQUE, NOT NULL | Email de login |
| `senha` | String | TEXT | NOT NULL | Hash bcrypt da senha |
| `nome` | String | TEXT | NOT NULL | Nome do administrador |
| `papel` | String | TEXT | DEFAULT "ADMIN" | Papel do usuário |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

### `colaboradores`

Pessoas envolvidas nas peças (atores, técnicos, etc). Cadastrados via formulário público.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `nome` | String | TEXT | NOT NULL | Nome completo |
| `funcao` | String | TEXT | NOT NULL | Função/cargo principal |
| `idade` | Int | INTEGER | NOT NULL | Idade |
| `celular` | String | TEXT | NOT NULL | Número de celular |
| `email` | String | TEXT | UNIQUE, NOT NULL | Email de contato |
| `endereco` | String | TEXT | NOT NULL | Endereço completo |
| `genero` | String | TEXT | NOT NULL | Gênero |
| `fotoUrl` | String? | TEXT | NULLABLE | Caminho da foto pessoal |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de cadastro |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

> ⚠️ **LGPD**: Os campos `celular`, `email` e `endereco` são omitidos das respostas públicas da API (só retornados com JWT válido de admin).

### `pecas`

Peças de teatro gerenciadas pelo sistema.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `titulo` | String | TEXT | NOT NULL | Título da peça |
| `resumo` | String | TEXT | NOT NULL | Sinopse/descrição |
| `endereco` | String | TEXT | DEFAULT "" | Endereço principal/legado |
| `latitude` | Float? | DOUBLE PRECISION | NULLABLE | Latitude para o mapa Leaflet |
| `longitude` | Float? | DOUBLE PRECISION | NULLABLE | Longitude para o mapa Leaflet |
| `dataEstreia` | String? | TEXT | NULLABLE | Data de estreia (YYYY-MM-DD) |
| `status` | String | TEXT | DEFAULT "PROGRAMADA" | `EM_CARTAZ`, `ENCERRADA` ou `PROGRAMADA` |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

**Relações:** `fotos` (1:N FotoPeca), `colaboradores` (N:N via PecaColaborador), `locais` (1:N LocalPeca)

### `locais_pecas`

Locais e datas de apresentação das peças. Permite que a mesma peça estreie em múltiplos teatros/cidades com datas e horários próprios.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `pecaId` | Int | INTEGER | FK → pecas(id), CASCADE | ID da peça |
| `nomeLocal` | String | TEXT | NOT NULL | Nome do teatro/local |
| `cidade` | String | TEXT | NOT NULL | Cidade (ex: "São Paulo, SP") |
| `endereco` | String | TEXT | NOT NULL | Endereço completo |
| `latitude` | Float? | DOUBLE PRECISION | NULLABLE | Latitude para o mapa |
| `longitude` | Float? | DOUBLE PRECISION | NULLABLE | Longitude para o mapa |
| `dataEstreia` | String? | TEXT | NULLABLE | Data de estreia (YYYY-MM-DD) |
| `dataFim` | String? | TEXT | NULLABLE | Data de encerramento |
| `horario` | String? | TEXT | NULLABLE | Horários (ex: "Sextas e Sábados às 20h") |
| `status` | String | TEXT | DEFAULT "PROGRAMADA" | Status do local |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

### `peca_colaboradores`

Tabela intermediária N:N — Associação de colaboradores a peças.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `pecaId` | Int | INTEGER | FK → pecas(id), CASCADE | ID da peça |
| `colaboradorId` | Int | INTEGER | FK → colaboradores(id), CASCADE | ID do colaborador |
| `funcaoNaPeca` | String | TEXT | NOT NULL | Função específica nesta peça |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

**Constraint:** UNIQUE(pecaId, colaboradorId) — Um colaborador aparece no máximo uma vez por peça.

### `fotos_pecas`

Fotos e vídeos associados às peças.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `pecaId` | Int | INTEGER | FK → pecas(id), CASCADE | ID da peça |
| `url` | String | TEXT | NOT NULL | Caminho do arquivo |
| `descricao` | String | TEXT | DEFAULT "" | Descrição da mídia |
| `tipo` | String | TEXT | DEFAULT "IMAGEM" | `IMAGEM` ou `VIDEO` |
| `ordem` | Int | INTEGER | DEFAULT 0 | Ordem de exibição |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

### `propagandas`

Anúncios e propagandas do site, publicados e gerenciados pelo admin. As 5 mais recentes e ativas aparecem como carrossel na página inicial.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `titulo` | String | TEXT | NOT NULL | Título da propaganda |
| `descricao` | String | TEXT | NOT NULL | Texto do anúncio |
| `link` | String? | TEXT | NULLABLE | URL ou link de redirecionamento |
| `textoBotao` | String? | TEXT | DEFAULT "Saiba Mais" | Texto do botão CTA |
| `ativo` | Boolean | BOOLEAN | DEFAULT true | Se está visível no site |
| `ordem` | Int | INTEGER | DEFAULT 0 | Ordem de exibição |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

**Relação:** `fotos` (1:N FotoPropaganda)

### `fotos_propagandas`

Fotos/imagens associadas às propagandas.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `propagandaId` | Int | INTEGER | FK → propagandas(id), CASCADE | ID da propaganda |
| `url` | String | TEXT | NOT NULL | Caminho do arquivo /uploads/... |
| `ordem` | Int | INTEGER | DEFAULT 0 | Ordem de exibição |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

### `config_site`

Configurações customizáveis do site (chave-valor).

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `chave` | String | TEXT | UNIQUE, NOT NULL | Nome da configuração |
| `valor` | String | TEXT | NOT NULL | Valor da configuração |
| `tipo` | String | TEXT | DEFAULT "TEXT" | `TEXT`, `IMAGE`, `HTML` ou `VIDEO` |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

### `arquivos`

Armazenamento binário persistente de uploads no PostgreSQL. Resolve o problema do filesystem efêmero do Render.com — os arquivos são armazenados como bytes no banco para que nunca sejam perdidos quando o container reinicia.

| Coluna | Tipo Prisma | Tipo PostgreSQL | Restrições | Descrição |
|:---|:---|:---|:---|:---|
| `id` | Int | SERIAL | PK, AUTO_INCREMENT | Identificador único |
| `nome` | String | TEXT | UNIQUE, NOT NULL | Nome único do arquivo |
| `mimetype` | String | TEXT | NOT NULL | Tipo MIME (ex: image/jpeg) |
| `dados` | Bytes | BYTEA | NOT NULL | Conteúdo binário do arquivo |
| `tamanho` | Int | INTEGER | NOT NULL | Tamanho em bytes |
| `criadoEm` | DateTime | TIMESTAMP | DEFAULT now() | Data de criação |
| `atualizadoEm` | DateTime | TIMESTAMP | DEFAULT now(), @updatedAt | Atualizado automaticamente |

---

## Comandos Úteis

```bash
# Sincronizar schema com o banco (sem migration formal)
npx prisma db push

# Criar migration formal
npx prisma migrate dev --name descricao

# Abrir interface visual do banco
npx prisma studio

# Popular com dados iniciais
node prisma/seed.js

# Resetar banco (apaga tudo e recria)
npx prisma migrate reset

# Gerar client após alterar schema
npx prisma generate
```
