#!/usr/bin/env bash
#
# novo-cliente.sh — sobe uma instância nova da Lari pra uma imobiliária.
# Reusa o build de /opt/lari (não recompila). Cada cliente fica isolado:
#   • banco SQLite próprio   -> /opt/clientes-data/<slug>.db
#   • porta própria          -> a partir de 3010
#   • processo PM2 próprio   -> lari-<slug>
#   • subdomínio + SSL       -> <slug>.newflowsys.cloud
#
# Uso:   bash scripts/novo-cliente.sh <slug>
# Ex.:   bash scripts/novo-cliente.sh imobiliariaxpto
#
# Pré-requisito (1x só): registro DNS curinga  *.newflowsys.cloud  A  <IP da VPS>
# (assim qualquer subdomínio novo já resolve sozinho, sem mexer no DNS por cliente)

set -euo pipefail

# --- entrada ---------------------------------------------------------------
SLUG="${1:-}"
if [[ -z "$SLUG" || ! "$SLUG" =~ ^[a-z0-9-]+$ ]]; then
  echo "Uso: bash scripts/novo-cliente.sh <slug>   (só minúsculas, números e hífen)"
  exit 1
fi

APP="/opt/lari"                      # codebase + build compartilhado
DATA="/opt/clientes-data"            # bancos dos clientes
CONF="/opt/clientes"                 # ecosystem files dos clientes
DOMINIO_BASE="newflowsys.cloud"
EMAIL="new.company.sys@gmail.com"
DOMAIN="$SLUG.$DOMINIO_BASE"
DB_FILE="$DATA/$SLUG.db"
DB_URL="file:$DB_FILE"

mkdir -p "$DATA" "$CONF"

if pm2 describe "lari-$SLUG" >/dev/null 2>&1; then
  echo "❌ Já existe um cliente com slug '$SLUG' (processo lari-$SLUG)."
  exit 1
fi

# --- escolhe a próxima porta livre a partir de 3010 ------------------------
PORT=3010
while ss -tlnp 2>/dev/null | grep -q ":$PORT "; do PORT=$((PORT+1)); done
echo "→ Porta escolhida: $PORT"

# --- pega a chave do Groq do .env principal --------------------------------
GROQ_KEY="$(grep -E '^GROQ_API_KEY=' "$APP/.env" | cut -d= -f2- | tr -d '"')"
if [[ -z "$GROQ_KEY" ]]; then
  echo "❌ GROQ_API_KEY não encontrada em $APP/.env"; exit 1
fi

# --- gera login automático desta instância ---------------------------------
LOGIN_USER="admin"
LOGIN_SENHA="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 8)"

# --- 1) cria e migra o banco do cliente ------------------------------------
echo "→ Criando/migrando banco $DB_FILE ..."
cd "$APP"
DATABASE_URL="$DB_URL" pnpm prisma migrate deploy

# --- 2) ecosystem PM2 do cliente (fonte da verdade, sobrevive a reboot) ----
ECO="$CONF/$SLUG.config.js"
cat > "$ECO" <<EOF
module.exports = {
  apps: [{
    name: "lari-$SLUG",
    cwd: "$APP",
    script: "node_modules/next/dist/bin/next",
    args: "start -p $PORT",
    env: {
      NODE_ENV: "production",
      PORT: "$PORT",
      DATABASE_URL: "$DB_URL",
      GROQ_API_KEY: "$GROQ_KEY",
      LARI_USUARIO: "$LOGIN_USER",
      LARI_SENHA: "$LOGIN_SENHA"
    }
  }]
};
EOF

echo "→ Subindo processo PM2 lari-$SLUG ..."
pm2 start "$ECO"
pm2 save

# --- 3) nginx --------------------------------------------------------------
echo "→ Configurando nginx para $DOMAIN ..."
cat > "/etc/nginx/sites-available/lari-$SLUG" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 50m;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
}
EOF
ln -sf "/etc/nginx/sites-available/lari-$SLUG" "/etc/nginx/sites-enabled/lari-$SLUG"
nginx -t && systemctl reload nginx

# --- 4) SSL (Let's Encrypt) ------------------------------------------------
echo "→ Emitindo certificado SSL para $DOMAIN ..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

echo ""
echo "✅ PRONTO!"
echo "   URL:      https://$DOMAIN"
echo "   Usuário:  $LOGIN_USER"
echo "   Senha:    $LOGIN_SENHA"
echo "   ---"
echo "   Porta:    $PORT"
echo "   Processo: lari-$SLUG"
echo "   Banco:    $DB_FILE"
echo ""
echo "   👉 Manda pro cliente:  $DOMAIN  |  login: $LOGIN_USER  |  senha: $LOGIN_SENHA"
