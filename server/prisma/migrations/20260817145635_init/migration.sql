-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'ADMIN',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "celular" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "pecas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "dataEstreia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROGRAMADA',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "peca_colaboradores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pecaId" INTEGER NOT NULL,
    "colaboradorId" INTEGER NOT NULL,
    "funcaoNaPeca" TEXT NOT NULL,
    CONSTRAINT "peca_colaboradores_pecaId_fkey" FOREIGN KEY ("pecaId") REFERENCES "pecas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "peca_colaboradores_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fotos_pecas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pecaId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "tipo" TEXT NOT NULL DEFAULT 'IMAGEM',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "fotos_pecas_pecaId_fkey" FOREIGN KEY ("pecaId") REFERENCES "pecas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "config_site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'TEXT'
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_email_key" ON "colaboradores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "peca_colaboradores_pecaId_colaboradorId_key" ON "peca_colaboradores"("pecaId", "colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "config_site_chave_key" ON "config_site"("chave");
