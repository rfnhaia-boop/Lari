# Lari — Multi-instância (uma cópia por imobiliária)

Cada cliente roda **isolado** na mesma VPS, reusando o mesmo build:

| Item | Por cliente |
|---|---|
| Banco | `/opt/clientes-data/<slug>.db` (SQLite, separado) |
| Processo | PM2 `lari-<slug>` |
| Porta | a partir de `3010` (escolhida automaticamente) |
| Endereço | `https://<slug>.newflowsys.cloud` (SSL automático) |

A instância principal de demonstração continua em `https://lari.newflowsys.cloud` (porta 3005, processo `lari`).

---

## Pré-requisito (configurar 1 vez só)

No painel da Hostinger (DNS de `newflowsys.cloud`), criar **um** registro curinga:

```
Tipo: A   |   Nome: *   |   Valor: 72.62.107.199
```

Com isso, **qualquer** subdomínio novo (`fulano.newflowsys.cloud`) já resolve sozinho —
não precisa mexer no DNS a cada cliente.

---

## Subir um cliente novo (~2 min)

Na VPS:

```bash
cd /opt/lari
bash scripts/novo-cliente.sh imobiliariaxpto
```

O script faz tudo: cria o banco, sobe o processo PM2, configura o nginx e emite o SSL.
No fim ele imprime a URL pronta: `https://imobiliariaxpto.newflowsys.cloud`.

> `slug` = só letras minúsculas, números e hífen. É o que vira o subdomínio.

---

## Atualizar a Lari pra todos (depois de mexer no código)

```bash
cd /opt/lari
bash scripts/atualizar-clientes.sh
```

Faz **um build só** e aplica em todas as instâncias (principal + clientes),
migrando todos os bancos e reiniciando tudo.

---

## Comandos úteis

```bash
pm2 list                       # ver todas as instâncias
pm2 logs lari-<slug>           # ver logs de um cliente
pm2 restart lari-<slug>        # reiniciar um cliente
pm2 delete lari-<slug>         # parar/remover (não apaga o banco)
```

Remover um cliente por completo (cuidado, apaga os dados):

```bash
pm2 delete lari-<slug> && pm2 save
rm -f /opt/clientes/<slug>.config.js /opt/clientes-data/<slug>.db
rm -f /etc/nginx/sites-enabled/lari-<slug> /etc/nginx/sites-available/lari-<slug>
systemctl reload nginx
```
