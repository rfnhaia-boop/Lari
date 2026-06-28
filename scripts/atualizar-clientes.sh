#!/usr/bin/env bash
#
# atualizar-clientes.sh — atualiza a Lari pra TODOS (principal + clientes).
# Faz UM build só (compartilhado) e aplica em todas as instâncias.
#
# Uso:  bash scripts/atualizar-clientes.sh

set -euo pipefail

APP="/opt/lari"
DATA="/opt/clientes-data"

cd "$APP"

echo "→ Baixando código novo ..."
git pull

echo "→ Instalando dependências ..."
pnpm install

echo "→ Gerando Prisma Client + build ..."
pnpm prisma generate
pnpm build

echo "→ Migrando banco principal ..."
pnpm prisma migrate deploy

if compgen -G "$DATA/*.db" > /dev/null; then
  for db in "$DATA"/*.db; do
    echo "→ Migrando banco do cliente: $db"
    DATABASE_URL="file:$db" pnpm prisma migrate deploy
  done
else
  echo "→ Nenhum banco de cliente em $DATA ainda."
fi

echo "→ Reiniciando todas as instâncias (PM2) ..."
pm2 restart all

echo ""
echo "✅ Tudo atualizado e no ar."
pm2 list
