-- CreateTable
CREATE TABLE "locais_pecas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pecaId" INTEGER NOT NULL,
    "nomeLocal" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "dataEstreia" TEXT,
    "dataFim" TEXT,
    "horario" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROGRAMADA',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "locais_pecas_pecaId_fkey" FOREIGN KEY ("pecaId") REFERENCES "pecas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pecas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "endereco" TEXT NOT NULL DEFAULT '',
    "latitude" REAL,
    "longitude" REAL,
    "dataEstreia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROGRAMADA',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_pecas" ("criadoEm", "dataEstreia", "endereco", "id", "latitude", "longitude", "resumo", "status", "titulo") SELECT "criadoEm", "dataEstreia", "endereco", "id", "latitude", "longitude", "resumo", "status", "titulo" FROM "pecas";
DROP TABLE "pecas";
ALTER TABLE "new_pecas" RENAME TO "pecas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
