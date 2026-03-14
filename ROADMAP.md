# Roadmap de Implementação — Zé Mesada Simulator

> Guia de implementação completo para o Claude. Stack atual: **React + Vite + TailwindCSS + React Router**.
> Este documento define a arquitetura, integrações, fluxos e prioridades de desenvolvimento.

---

## Status Geral

| # | Fase | Status |
|---|------|--------|
| 1 | Infraestrutura Base (Supabase + Backend) | ✅ Concluído |
| 2 | Integração API-Football + Motor de Apostas | ✅ Concluído |
| 3 | Frontend conectado a dados reais | ✅ Concluído |
| 4 | Chat com o Duende (Tips) persistido | ✅ Concluído |
| 5 | Página de Stats com dados reais | ✅ Concluído |
| 6 | Página Ajuda — PIX e QR Code reais | ✅ Concluído |
| 7 | Painel Admin (frontend UI) | ✅ Concluído |
| 8 | Deploy (Vercel + Railway + CI/CD) | 🔲 Pendente |
| 9 | Monitoramento (Sentry + UptimeRobot) | 🔲 Pendente |
| 10 | Extras: PWA · Cache · Fallback offline | 🔲 Pendente |

---

## Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React/Vite)                 │
│  Home · História · Stats · Ajuda · Dicas · Admin       │
└────────────────────┬────────────────────────────────────┘
                     │ Proxy Vite (dev) / HTTPS (prod)
┌────────────────────▼────────────────────────────────────┐
│               BACKEND / BFF (Node.js + Express)         │
│  /api/fixtures · /api/bets · /api/bankroll             │
│  /api/content  · /api/tips · /admin/*                  │
└──────┬──────────────────────────────────────┬───────────┘
       │                                      │
┌──────▼──────────┐                ┌──────────▼──────────┐
│  API-Football   │                │      Supabase        │
│  Plano Basic    │                │  bankroll · bets     │
│  ~21 req/dia    │                │  upcoming_bets       │
│  (limite: 100)  │                │  content_blocks      │
└─────────────────┘                │  system_logs · tips  │
                                   └─────────────────────┘
```

---

## ✅ FASE 1 — Infraestrutura Base (Concluído)

### Supabase — Tabelas criadas

| Tabela | Arquivo SQL | Finalidade |
|--------|-------------|------------|
| `bankroll` | `supabase/schema.sql` | Saldo virtual do Zé Mesada |
| `bets` | `supabase/schema.sql` | Histórico de apostas liquidadas |
| `upcoming_bets` | `supabase/schema.sql` | Próximas apostas pendentes |
| `content_blocks` | `supabase/schema.sql` | Textos editáveis pelo admin (PIX, mensagens) |
| `system_logs` | `supabase/schema.sql` | Logs do sistema (Winston + Supabase) |
| `tips` | `supabase/tips.sql` | Palpites do chat "Fale com o Duende" |

### Backend — Estrutura criada

```
backend/
├── src/
│   ├── index.js                  ← entry point + rotas registradas
│   ├── config.js                 ← variáveis de ambiente
│   ├── lib/
│   │   ├── supabase.js           ← cliente Supabase (service_role)
│   │   └── logger.js             ← Winston + persiste logs no Supabase
│   ├── services/
│   │   ├── apiFootball.js        ← wrapper com contador de quota diária
│   │   ├── betEngine.js          ← gera apostas e liquida resultados
│   │   └── scheduler.js          ← cron: 08h gera · 12h/18h/23h30 liquida
│   ├── middleware/
│   │   └── adminAuth.js          ← header x-admin-token
│   └── routes/
│       ├── fixtures.js           ← GET /api/fixtures/upcoming · /quota
│       ├── bets.js               ← GET /api/bets · /api/bets/stats
│       ├── bankroll.js           ← GET /api/bankroll · /history
│       ├── content.js            ← GET /api/content · /:key
│       ├── tips.js               ← GET/POST /api/tips
│       └── admin.js              ← POST /admin/* (protegido)
```

### Variáveis de ambiente (backend/.env)

```env
API_FOOTBALL_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...   # service_role (JWT eyJ...)
ADMIN_SECRET=...
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## ✅ FASE 2 — Integração API-Football (Concluído)

- **Plano:** Basic (~$14/mês) — necessário para temporada atual (free só até 2024)
- **Quota:** ~21 chamadas/dia estimadas de 100 disponíveis
- **Parâmetro:** `from/to` com datas explícitas (o parâmetro `next=` não funciona no plano free)
- **Odds:** Endpoint `/odds` tentado; se indisponível, usa odds simuladas (1.5–5.0)
- **Ligas ativas:** Brasileirão (71) · Premier League (39) · La Liga (140) · Serie A (135) · Primeira Liga (94)

### Scheduler (horário de Brasília)

| Hora | Job | Chamadas à API |
|------|-----|----------------|
| 08:00 | `generate_daily_bets` — busca fixtures e gera até 3 apostas | ~6 |
| 12:00 | `settle_pending_bets` — verifica resultados | ~5 |
| 18:00 | `settle_pending_bets` | ~5 |
| 23:30 | `settle_pending_bets` | ~5 |

---

## ✅ FASE 3 — Frontend Conectado (Concluído)

### Componentes com dados reais

| Componente | Endpoint consumido | Observação |
|------------|--------------------|------------|
| `BalanceCard` | `GET /api/bankroll` | Verde se lucro, vermelho se rombo |
| `UpcomingBetsTable` | `GET /api/fixtures/upcoming` | Logos, data em BRT, palpite do Chicão |
| `BankrollChart` | `GET /api/bankroll/history` | Linha de referência em R$100 |
| `BetHistoryCard` (Home) | `GET /api/bets` | Imagem win/loss condicional |
| `Stats` (página) | `GET /api/bets/stats` + `GET /api/bets` | P&L, winRate, pior/melhor aposta |
| `Tips` (Fale com Duende) | `GET/POST /api/tips` | Persistido no Supabase, email mascarado |

### Proxy Vite (desenvolvimento)

```typescript
// vite.config.ts — sem CORS em dev
server: { proxy: { '/api': 'http://localhost:3001', '/admin': '...' } }
```

Em produção: definir `VITE_API_URL` na Vercel apontando para o Railway.

### Arquivo de cliente API

```
src/lib/api.ts   ← todos os métodos tipados: getUpcomingBets, getBets,
                    getBetStats, getBankroll, getBankrollHistory,
                    getTips, postTip
```

---

## ✅ FASE 4 — Página Ajuda: PIX e QR Code Reais (Concluído)

**Arquivo:** `src/app/pages/Donate.tsx`

### O que fazer:

1. Buscar `GET /api/content` e ler as chaves:
   - `pix_key` → substituir o email hardcoded
   - `pix_name` → nome do destinatário
   - `help_message` → texto da descrição
   - `qr_code_image` → URL da imagem real (Supabase Storage)

2. Substituir o ícone `<QrCode>` (SVG placeholder) pela `<img>` real quando `qr_code_image` tiver valor

3. O admin faz upload da imagem PNG do QR Code via painel admin → salva no Supabase Storage → URL gravada em `content_blocks`

### Observação sobre QR Code:
Gerar o QR Code via app do banco (Nubank, Inter, etc.) e salvar a imagem. **Não gerar programaticamente** para evitar incompatibilidades.

---

## ✅ FASE 5 — Painel Admin Frontend (Concluído)

**Rota:** `/admin` no React Router
**Auth:** Formulário de senha → salva token em `sessionStorage` → envia como `x-admin-token` em todas as requisições

### Funcionalidades

| Seção | Ação | Endpoint |
|-------|------|----------|
| **Saldo** | Ver + definir + adicionar | `POST /admin/bankroll/set` · `/add` |
| **Conteúdo** | Editar PIX, mensagens, QR Code | `PUT /admin/content/:key` |
| **Apostas** | Listar pendentes, cancelar, forçar geração/liquidação | `POST /admin/bets/generate` · `/settle` · `/:id/cancel` |
| **Logs** | Listar por nível, paginar | `GET /admin/logs?level=error` |
| **Quota** | Ver uso diário da API | `GET /admin/quota` |

---

## 🔲 FASE 6 — Deploy (Pendente)

### Frontend — Vercel

```
1. Conectar repositório GitHub à Vercel
2. Root directory: . (raiz)
3. Build command: npm run build
4. Output: dist/
5. Variável de ambiente: VITE_API_URL=https://seu-backend.railway.app
```

### Backend — Railway

```
1. Novo projeto Railway → conectar repositório
2. Root directory: backend/
3. Start command: node src/index.js
4. Variáveis: copiar todas do backend/.env
5. Variável adicional: FRONTEND_URL=https://seu-app.vercel.app
```

### Fluxo de atualização

```
git push origin main
  → Vercel faz deploy automático do frontend
  → Railway faz deploy automático do backend
  → Verificar: GET https://seu-backend.railway.app/health
  → Verificar logs: GET /admin/logs
```

---

## 🔲 FASE 7 — Monitoramento (Pendente)

### UptimeRobot (gratuito)
- Cadastrar em uptimerobot.com
- Novo monitor: `https://seu-backend.railway.app/health`
- Intervalo: 5 minutos
- Alerta por email se cair

### Sentry (gratuito — 5k erros/mês)

```bash
# Frontend
npm install @sentry/react
# Backend
npm install @sentry/node
```

```javascript
// main.tsx
Sentry.init({ dsn: "SEU_DSN", environment: "production" });

// backend/src/index.js
Sentry.init({ dsn: "SEU_DSN" });
```

---

## 🔲 FASE 8 — Extras / Polimento (Pendente)

### PWA — instalar como app no celular
```bash
npm install -D vite-plugin-pwa
```
Adicionar ao `vite.config.ts`: ícones, manifest, service worker.

### Cache de requisições da API
Evitar chamadas repetidas dentro da mesma hora. Usar variável em memória no backend com TTL de 30 min para respostas de fixtures.

### Modo offline / Fallback
- Se `/api/fixtures/upcoming` falhar → frontend exibe últimos dados do cache local
- Nunca mostrar tela em branco

---

## Checklist de Segurança

- [x] Chave da API-Football apenas no backend
- [x] Supabase: RLS habilitado em todas as tabelas
- [x] Supabase: `service_role` apenas no backend
- [x] Rate limiting no backend (60 req/min por IP)
- [x] CORS configurado via `FRONTEND_URL`
- [x] Admin protegido por `x-admin-token`
- [x] Email dos usuários mascarado na exibição pública
- [ ] CORS restrito ao domínio Vercel em produção
- [ ] Sentry configurado para captura de erros

---

## Referências Rápidas

| Serviço | Uso |
|---------|-----|
| api-football.com | Dados de jogos, odds, resultados |
| supabase.com → ymxtvynhodvmsmqdxjij | Banco de dados do projeto |
| vercel.com | Hosting do frontend |
| railway.app | Hosting do backend |
| uptimerobot.com | Monitoramento de uptime |
| sentry.io | Rastreamento de erros |

---

*Última atualização: 2026-03-14 — Fases 1–5 concluídas (Backend, API-Football, Frontend, Tips/Stats, Admin Panel, Página Ajuda PIX)*
