-- Limites mensais + bônus da roleta.
-- Renomeia Carteira: descricoes/leads viram bônus/uso; vídeos continuam créditos.

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Carteira" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "descricoesUsadas" INTEGER NOT NULL DEFAULT 0,
    "interacoesUsadas" INTEGER NOT NULL DEFAULT 0,
    "cicloMes" INTEGER NOT NULL DEFAULT 0,
    "cicloAno" INTEGER NOT NULL DEFAULT 0,
    "bonusDescricoes" INTEGER NOT NULL DEFAULT 0,
    "bonusInteracoes" INTEGER NOT NULL DEFAULT 0,
    "videos" INTEGER NOT NULL DEFAULT 0,
    "ultimoGiro" DATETIME,
    CONSTRAINT "Carteira_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migra os dados existentes: videos continua, descricoes vira bonus (não estamos usando ainda), leads também
INSERT INTO "new_Carteira" ("id","contaId","videos","bonusDescricoes","bonusInteracoes","ultimoGiro")
SELECT "id","contaId","videos","descricoes","leads","ultimoGiro" FROM "Carteira";

DROP TABLE "Carteira";
ALTER TABLE "new_Carteira" RENAME TO "Carteira";
CREATE UNIQUE INDEX "Carteira_contaId_key" ON "Carteira"("contaId");

PRAGMA foreign_keys=ON;
