# 🗄 Banco de Dados — Documentação

Documentação completa do modelo de dados do Theatrum.

---

## ORM: Prisma

O Theatrum usa **Prisma ORM** para abstração do banco de dados. Isso permite trocar entre SQLite e MySQL sem alterar o código da aplicação.

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
│ papel            │       │                      │  │    │ celular          │
│ criadoEm         │       │ UNIQUE(pecaId,       │  │    │ email (UNIQUE)   │
└──────────────────┘       │   colaboradorId)     │  │    │ endereco         │
                           └──────────────────────┘  │    │ genero           │
                                                     │    │ fotoUrl          │
┌──────────────────┐       ┌──────────────────────┐  │    │ criadoEm         │
│    pecas          │       │    fotos_pecas        │  │    └──────────────────┘
├──────────────────┤       ├──────────────────────┤  │
│ id (PK) ←────────┤───────┤ pecaId (FK)          │  │
│ titulo           │  ┌────┤ id (PK)              │  │
│ resumo           │  │    │ url                  │  │
│ endereco         │←─┘    │ descricao            │  │
│ latitude         │       │ tipo                 │  │
│ longitude        │←──────┤                      │  │
│ dataEstreia      │       └──────────────────────┘  │
│ status           │                                  │
│ criadoEm         │←─────────────────────────────────┘
└──────────────────┘

┌──────────────────┐
│   config_site     │
├──────────────────┤
│ id (PK)          │
│ chave (UNIQUE)   │
│ valor            │
│ tipo             │
└──────────────────┘
```

---

## Tabelas

### `usuarios`

Administradores do sistema. Autenticação via JWT.

| Coluna | Tipo | Restrições | Descrição |
|:---|:---|:---|:---|
| `id` | INTEGER | PK, AUTO_INCREMENT | Identificador único |
| `email` | TEXT | UNIQUE, NOT NULL | Email de login |
| `senha` | TEXT | NOT NULL | Hash bcrypt da senha |
| `nome` | TEXT | NOT NULL | Nome do administrador |
| `papel` | TEXT | DEFAULT "ADMIN" | Papel do usuário |
| `criadoEm` | DATETIME | DEFAULT now() | Data de criação |

### `colaboradores`

Pessoas envolvidas nas peças (atores, técnicos, etc). Cadastrados via formulário público.

| Coluna | Tipo | Restrições | Descrição |
|:---|:---|:---|:---|
| `id` | INTEGER | PK, AUTO_INCREMENT | Identificador único |
| `nome` | TEXT | NOT NULL | Nome completo |
| `funcao` | TEXT | NOT NULL | Função/cargo principal |
| `idade` | INTEGER | NOT NULL | Idade |
| `celular` | TEXT | NOT NULL | Número de celular |
| `email` | TEXT | UNIQUE, NOT NULL | Email de contato |
| `endereco` | TEXT | NOT NULL | Endereço completo |
| `genero` | TEXT | NOT NULL | Gênero |
| `fotoUrl` | TEXT | NULLABLE | Caminho da foto pessoal |
| `criadoEm` | DATETIME | DEFAULT now() | Data de cadastro |

### `pecas`

Peças de teatro gerenciadas pelo sistema.

| Coluna | Tipo | Restrições | Descrição |
|:---|:---|:---|:---|
| `id` | INTEGER | PK, AUTO_INCREMENT | Identificador único |
| `titulo` | TEXT | NOT NULL | Título da peça |
| `resumo` | TEXT | NOT NULL | Sinopse/descrição |
| `endereco` | TEXT | NOT NULL | Endereço do local |
| `latitude` | FLOAT | NULLABLE | Latitude para o mapa |
| `longitude` | FLOAT | NULLABLE | Longitude para o mapa |
| `dataEstreia` | TEXT | NULLABLE | Data de estreia (YYYY-MM-DD) |
| `status` | TEXT | DEFAULT "PROGRAMADA" | `EM_CARTAZ`, `ENCERRADA` ou `PROGRAMADA` |
| `criadoEm` | DATETIME | DEFAULT now() | Data de criação |

### `peca_colaboradores`

Tabela intermediária N:N — Associação de colaboradores a peças.

| Coluna | Tipo | Restrições | Descrição |
|:---|:---|:---|:---|
| `id` | INTEGER | PK, AUTO_INCREMENT | Identificador único |
| `pecaId` | INTEGER | FK → pecas(id), CASCADE | ID da peça |
| `colaboradorId` | INTEGER | FK → colaboradores(id), CASCADE | ID do colaborador |
| `funcaoNaPeca` | TEXT | NOT NULL | Função específica nesta peça |

**Constraint:** UNIQUE(pecaId, colaboradorId) — Um colaborador aparece no máximo uma vez por peça.

### `fotos_pecas`

Fotos e vídeos associados às peças.

| Coluna | Tipo | Restrições | Descrição |
|:---|:---|:---|:---|
| `id` | INTEGER | PK, AUTO_INCREMENT | Identificador único |
| `pecaId` | INTEGER | FK → pecas(id), CASCADE | ID da peça |
| `url` | TEXT | NOT NULL | Caminho do arquivo |
| `descricao` | TEXT | DEFAULT "" | Descrição da mídia |
| `tipo` | TEXT | DEFAULT "IMAGEM" | `IMAGEM` ou `VIDEO` |
| `ordem` | INTEGER | DEFAULT 0 | Ordem de exibição |

### `config_site`

Configurações customizáveis do site (chave-valor).

| Coluna | Tipo | Restrições | Descrição |
|:---|:---|:---|:---|
| `id` | INTEGER | PK, AUTO_INCREMENT | Identificador único |
| `chave` | TEXT | UNIQUE, NOT NULL | Nome da configuração |
| `valor` | TEXT | NOT NULL | Valor da configuração |
| `tipo` | TEXT | DEFAULT "TEXT" | `TEXT`, `IMAGE`, `HTML` ou `VIDEO` |

---

## Comandos Úteis

```bash
# Criar/atualizar tabelas
npx prisma migrate dev --name descricao

# Abrir interface visual do banco
npx prisma studio

# Popular com dados iniciais
npx prisma db seed

# Resetar banco (apaga tudo e recria)
npx prisma migrate reset

# Gerar client após alterar schema
npx prisma generate
```
