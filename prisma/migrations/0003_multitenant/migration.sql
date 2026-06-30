-- Multi-tenant: cada dado passa a pertencer a uma Conta (imobiliária).
-- Os dados que já existem são migrados para uma "conta padrão".

-- CreateTable Conta
CREATE TABLE "Conta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "plano" TEXT NOT NULL DEFAULT 'trial',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable Usuario
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'admin',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuario_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE INDEX "Usuario_contaId_idx" ON "Usuario"("contaId");

-- Conta padrão para os dados pré-existentes
INSERT INTO "Conta" ("id", "nome", "plano", "status") VALUES ('conta_default', 'Imobiliária', 'trial', 'ativo');

PRAGMA foreign_keys=OFF;

-- Redefine Imovel (+ contaId)
CREATE TABLE "new_Imovel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "finalidade" TEXT NOT NULL DEFAULT 'venda',
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "quartos" INTEGER NOT NULL DEFAULT 0,
    "banheiros" INTEGER NOT NULL DEFAULT 0,
    "vagas" INTEGER NOT NULL DEFAULT 0,
    "area" REAL NOT NULL DEFAULT 0,
    "preco" REAL NOT NULL DEFAULT 0,
    "descricao" TEXT NOT NULL DEFAULT '',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Imovel_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Imovel" ("id","contaId","titulo","tipo","finalidade","bairro","cidade","quartos","banheiros","vagas","area","preco","descricao","criadoEm")
SELECT "id",'conta_default',"titulo","tipo","finalidade","bairro","cidade","quartos","banheiros","vagas","area","preco","descricao","criadoEm" FROM "Imovel";
DROP TABLE "Imovel";
ALTER TABLE "new_Imovel" RENAME TO "Imovel";
CREATE INDEX "Imovel_contaId_idx" ON "Imovel"("contaId");

-- Redefine Anuncio (+ contaId)
CREATE TABLE "new_Anuncio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Anuncio_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Anuncio_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Anuncio" ("id","contaId","canal","conteudo","imovelId","criadoEm")
SELECT "id",'conta_default',"canal","conteudo","imovelId","criadoEm" FROM "Anuncio";
DROP TABLE "Anuncio";
ALTER TABLE "new_Anuncio" RENAME TO "Anuncio";
CREATE INDEX "Anuncio_contaId_idx" ON "Anuncio"("contaId");

-- Redefine Cliente (+ contaId)
CREATE TABLE "new_Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "etapa" TEXT NOT NULL DEFAULT 'Novo',
    "interesse" TEXT NOT NULL DEFAULT '',
    "observacao" TEXT NOT NULL DEFAULT '',
    "historico" TEXT NOT NULL DEFAULT '',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" DATETIME NOT NULL,
    CONSTRAINT "Cliente_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cliente" ("id","contaId","nome","telefone","email","instagram","etapa","interesse","observacao","historico","criadoEm","atualizado")
SELECT "id",'conta_default',"nome","telefone","email","instagram","etapa","interesse","observacao","historico","criadoEm","atualizado" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE INDEX "Cliente_contaId_idx" ON "Cliente"("contaId");

-- Redefine Carteira (singleton -> uma por conta)
CREATE TABLE "new_Carteira" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "videos" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "descricoes" INTEGER NOT NULL DEFAULT 0,
    "ultimoGiro" DATETIME
);
INSERT INTO "new_Carteira" ("id","contaId","videos","leads","descricoes","ultimoGiro")
SELECT "id",'conta_default',"videos","leads","descricoes","ultimoGiro" FROM "Carteira";
DROP TABLE "Carteira";
ALTER TABLE "new_Carteira" RENAME TO "Carteira";
CREATE UNIQUE INDEX "Carteira_contaId_key" ON "Carteira"("contaId");

PRAGMA foreign_keys=ON;
