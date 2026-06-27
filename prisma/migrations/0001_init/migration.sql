-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Anuncio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "canal" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("imovelId") REFERENCES "Imovel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "etapa" TEXT NOT NULL DEFAULT 'Novo',
    "interesse" TEXT NOT NULL DEFAULT '',
    "observacao" TEXT NOT NULL DEFAULT '',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Carteira" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "videos" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "descricoes" INTEGER NOT NULL DEFAULT 0,
    "ultimoGiro" DATETIME
);
