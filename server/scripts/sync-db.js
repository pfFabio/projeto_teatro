// =============================================================================
// Theatrum — Sincronizador de Provider do Prisma (SQLite <-> PostgreSQL)
// Garante compatibilidade automática entre dev local (SQLite) e Render (PostgreSQL)
// =============================================================================

const fs = require('fs');
const path = require('path');

const serverDir = path.resolve(__dirname, '..');
const envPath = path.join(serverDir, '.env');
const schemaPath = path.join(serverDir, 'prisma', 'schema.prisma');

// Ler DATABASE_URL do ambiente ou do arquivo .env
let databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      databaseUrl = trimmed.substring('DATABASE_URL='.length).replace(/['"]/g, '').trim();
      break;
    }
  }
}

if (!fs.existsSync(schemaPath)) {
  process.exit(0);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

const isPostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');
const isSqlite = databaseUrl.startsWith('file:');

if (isPostgres && schema.includes('provider = "sqlite"')) {
  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('🔄 [Prisma] Provider ajustado para "postgresql" (Render / Produção)');
} else if (isSqlite && schema.includes('provider = "postgresql"')) {
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('🔄 [Prisma] Provider ajustado para "sqlite" (Desenvolvimento Local)');
}

