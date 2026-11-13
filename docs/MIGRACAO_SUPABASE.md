# 🚀 Guia Prático de Migração: Render PostgreSQL -> Supabase

Este guia consolida os procedimentos operacionais para a migração de banco de dados do Theatrum Mundi sem perda de uploads (`bytea`) nem desconfiguração de credenciais.

---

## 1. Variáveis de Conexão no PowerShell

No terminal PowerShell da máquina administrativa:

```powershell
# URL do banco atual (Render)
$env:RENDER_DATABASE_URL = "postgres://..."

# Conexão Pooler do Supabase (porta 6543 - Transaction Mode para runtime)
$env:SUPABASE_DATABASE_URL = "postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexão Direta do Supabase (porta 5432 - Session/Direct para Migrations e Restore)
$env:SUPABASE_DIRECT_URL = "postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

---

## 2. Inventário Pré-Migração (Render)

Gere a foto exata dos dados no banco do Render antes de iniciar:

```powershell
$env:DATABASE_URL = $env:RENDER_DATABASE_URL
node server/scripts/inventario-banco.js
```
> 📸 *Guarde a tabela de contagens gerada para comparação posterior.*

---

## 3. Extração dos Backups (Render)

Crie uma pasta segura temporária e gere dois formatos de backup (binário customizado e SQL puro):

```powershell
New-Item -ItemType Directory -Force -Path "./backups"

# Backup 1: Formato customizado comprimido (ideal para pg_restore)
pg_dump --format=custom --file="./backups/theatrum_render_backup.dump" "$env:RENDER_DATABASE_URL"

# Backup 2: SQL legível plano de segurança
pg_dump --format=plain --no-owner --file="./backups/theatrum_render_backup.sql" "$env:RENDER_DATABASE_URL"
```

---

## 4. Aplicação do Schema & Restore no Supabase

### 4.1 Restaurar os dados via pg_restore na conexão direta:

```powershell
pg_restore `
  --clean `
  --if-exists `
  --no-owner `
  --dbname="$env:SUPABASE_DIRECT_URL" `
  "./backups/theatrum_render_backup.dump"
```

*Alternativa caso utilize o SQL plano:*
```powershell
psql "$env:SUPABASE_DIRECT_URL" -f "./backups/theatrum_render_backup.sql"
```

---

## 5. Validação de Integridade Pós-Migração (Supabase)

Execute o inventário apontando para o Supabase:

```powershell
$env:DATABASE_URL = $env:SUPABASE_DIRECT_URL
node server/scripts/inventario-banco.js
```

### Checklist de Paridade:
- [ ] Mesma quantidade de linhas em todas as 14 tabelas.
- [ ] Tabela `arquivos`: quantidade e soma de bytes em MB idênticas.
- [ ] Max IDs idênticos entre Render e Supabase.

---

## 6. Reajuste de Sequências Auto-Incremento (PostgreSQL)

Execute o script de sincronização de sequências para evitar colisões de chave primária em novos cadastros:

```powershell
psql "$env:SUPABASE_DIRECT_URL" -c @"
SELECT setval('usuarios_id_seq', COALESCE((SELECT MAX(id)+1 FROM usuarios), 1), false);
SELECT setval('colaboradores_id_seq', COALESCE((SELECT MAX(id)+1 FROM colaboradores), 1), false);
SELECT setval('pecas_id_seq', COALESCE((SELECT MAX(id)+1 FROM pecas), 1), false);
SELECT setval('fotos_pecas_id_seq', COALESCE((SELECT MAX(id)+1 FROM fotos_pecas), 1), false);
SELECT setval('locais_pecas_id_seq', COALESCE((SELECT MAX(id)+1 FROM locais_pecas), 1), false);
SELECT setval('downloads_tecnicos_id_seq', COALESCE((SELECT MAX(id)+1 FROM downloads_tecnicos), 1), false);
SELECT setval('peca_colaboradores_id_seq', COALESCE((SELECT MAX(id)+1 FROM peca_colaboradores), 1), false);
SELECT setval('propagandas_id_seq', COALESCE((SELECT MAX(id)+1 FROM propagandas), 1), false);
SELECT setval('fotos_propagandas_id_seq', COALESCE((SELECT MAX(id)+1 FROM fotos_propagandas), 1), false);
SELECT setval('mensagens_ideias_id_seq', COALESCE((SELECT MAX(id)+1 FROM mensagens_ideias), 1), false);
SELECT setval('config_site_id_seq', COALESCE((SELECT MAX(id)+1 FROM config_site), 1), false);
SELECT setval('memoria_id_seq', COALESCE((SELECT MAX(id)+1 FROM memoria), 1), false);
SELECT setval('comprovantes_id_seq', COALESCE((SELECT MAX(id)+1 FROM comprovantes), 1), false);
SELECT setval('arquivos_id_seq', COALESCE((SELECT MAX(id)+1 FROM arquivos), 1), false);
"@
```

---

## 7. Atualização do Serviço no Render

No painel do Render (`dashboard.render.com` -> Service `projeto-teatro`):

1. Acesse **Environment**:
   - `DATABASE_URL` = `<Pooler connection string (porta 6543) com pgbouncer=true>`
   - `DIRECT_URL` = `<Direct connection string (porta 5432)>`
2. Acesse **Settings**:
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - *(Não utilizar `prisma db push`)*
3. Clique em **Manual Deploy -> Deploy latest commit**.

---

## 8. Validação em Produção

Após o deploy no Render:

1. Verifique o novo health check:
   ```text
   GET https://projeto-teatro.onrender.com/api/saude
   ```
   Deve responder com status 200:
   ```json
   {
     "status": "ok",
     "banco": "conectado",
     "ambiente": "production"
   }
   ```
2. Acesse a aplicação no GitHub Pages: [https://pffabio.github.io/projeto_teatro/](https://pffabio.github.io/projeto_teatro/)
3. Efetue login no `/admin` e verifique:
   - Fotos e mídias das peças carregando normalmente;
   - Downloads técnicos em PDF abrindo;
   - Aba Comprovantes listando e baixando anexos.
