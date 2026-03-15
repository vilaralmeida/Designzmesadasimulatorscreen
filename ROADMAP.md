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
| 11 | Aposta contínua — sempre ter pelo menos 1 aposta ativa | ✅ Concluído |
| 12 | Módulo de Engajamento — Ranking de Competidores | 🔲 Pendente |

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

---

## 🔲 FASE 11 — Aposta Contínua (Pendente)

**Objetivo:** Garantir que o Zé Mesada tenha sempre pelo menos 1 aposta pendente ativa, mesmo em dias sem jogos nas ligas principais.

### Problema atual
O scheduler gera apostas uma vez por dia às 08h, mas se não houver jogos nos próximos 7 dias nas ligas monitoradas, a tabela fica vazia e o app parece inativo.

### Estratégias a investigar

| Estratégia | Descrição | Custo de quota |
|------------|-----------|----------------|
| **Ampliar janela de busca** | Aumentar `daysAhead` de 7 para 14 dias | Baixo |
| **Ampliar ligas monitoradas** | Adicionar ligas de outros continentes (MLS, Eredivisie, Ligue 1, etc.) para cobrir mais datas | Baixo |
| **Busca de fallback** | Se `generateDailyBets` retornar 0 apostas, tentar ligas secundárias automaticamente | Baixo |
| **Verificação no scheduler** | Adicionar job às 14h: se `upcoming_bets` estiver vazio, forçar nova geração | Zero (sem chamada extra à API) |
| **Aposta simulada de contingência** | Se não houver jogo real disponível, gerar aposta em jogo simulado com odds fictícias e flag `simulated: true` | Zero |

### Implementação recomendada (sem aumentar quota)

1. No `scheduler.js`, adicionar verificação às 14h:
   - Contar apostas pendentes em `upcoming_bets`
   - Se 0 → chamar `generateDailyBets()` com `daysAhead=14` e lista expandida de ligas
2. Em `betEngine.js`, ampliar `PRIORITY_LEAGUES` com ligas de backup:
   - Ligue 1 (61), Eredivisie (88), Liga MX (262), MLS (253), Champions League (2)
3. Se ainda retornar 0 → logar aviso e aguardar próximo ciclo (não gerar aposta fake)

### Critério de sucesso
- `upcoming_bets` nunca fica vazio por mais de 24h
- Sem aumento relevante no consumo de quota da API

---

---

## 🔲 FASE 12 — Módulo de Engajamento: Ranking de Competidores

**Objetivo:** Permitir que usuários reais façam seus próprios palpites nos mesmos jogos do Zé Mesada e compitam contra o Duende Chicão num ranking diário.

---

### Conceito

- Cada usuário começa com **R$100 virtual** (igual ao Zé)
- Ao abrir o app, vê os **mesmos jogos** que o Duende vai apostar no dia
- Faz seu palpite: escolhe o time/empate e o valor (R$1–R$10)
- No final do dia, o **ranking é atualizado** com o saldo de cada um
- Quem está **acima do Duende** → verde; **abaixo** → vermelho
- Cada dia é uma nova rodada — os saldos acumulam entre as rodadas

---

### Arquitetura

#### Banco de Dados — novas tabelas Supabase

```sql
-- Perfis de usuário (complementa auth.users do Supabase Auth)
user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text UNIQUE NOT NULL,
  avatar_url text,
  balance numeric DEFAULT 100,
  created_at timestamptz DEFAULT now()
)

-- Apostas feitas pelos usuários nos jogos do dia
user_bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles,
  upcoming_bet_id uuid REFERENCES upcoming_bets,  -- jogo que o Duende também apostou
  bet_type text CHECK (bet_type IN ('home','draw','away')),
  amount numeric CHECK (amount BETWEEN 1 AND 10),
  odds numeric,
  result text,        -- 'win' | 'loss' | null (pending)
  payout numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, upcoming_bet_id)  -- 1 palpite por jogo por usuário
)

-- Snapshot diário do ranking (gerado pelo scheduler ao liquidar apostas)
daily_ranking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_date date NOT NULL,
  user_id uuid REFERENCES user_profiles,
  balance numeric,
  daily_pnl numeric,   -- ganho/perda no dia
  position int,
  vs_duende text,      -- 'above' | 'below' | 'equal'
  created_at timestamptz DEFAULT now()
)
```

---

### Backend — novos endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cria conta (Supabase Auth + user_profiles) |
| POST | `/auth/login` | Login, retorna JWT do Supabase |
| GET | `/api/me` | Perfil + saldo do usuário logado |
| GET | `/api/games/today` | Jogos do dia disponíveis para palpite |
| POST | `/api/user-bets` | Submete palpite do usuário |
| GET | `/api/user-bets` | Histórico de palpites do usuário |
| GET | `/api/ranking` | Ranking do dia (todos + posição do Duende) |
| GET | `/api/ranking/history` | Histórico de rounds anteriores |

**Auth:** JWT do Supabase passado no header `Authorization: Bearer <token>`

---

### Frontend — novas páginas e componentes

| Página / Componente | Descrição |
|---------------------|-----------|
| `LoginPage.tsx` | Login / cadastro com email+senha |
| `GameCard.tsx` | Card de jogo do dia com botões Casa / Empate / Fora + slider de valor |
| `MyBetsPage.tsx` | Palpites do usuário no dia + resultado pendente/ganhou/perdeu |
| `RankingPage.tsx` | Tabela do ranking: posição, avatar, username, saldo, vs Duende (verde/vermelho) |
| `ProfileCard.tsx` | Saldo atual do usuário + comparação com Duende |

**Nova aba no tab bar:** Ranking (ícone de troféu)

---

### Scheduler — nova rotina

```
Ao liquidar apostas do dia (settlePendingBets):
  1. Para cada user_bet pendente com jogo finalizado:
     - Calcular resultado (win/loss)
     - Atualizar user_profiles.balance
  2. Gerar snapshot em daily_ranking para todos os usuários
  3. Calcular posição do Duende no ranking
  4. Marcar rodada do dia como encerrada
```

---

### Regras de negócio

- Palpites só são aceitos **antes do horário do jogo**
- Usuário pode apostar em **quantos jogos quiser** do dia (1 por jogo)
- Saldo não vai abaixo de R$0 — se zerar, usuário recebe R$10 de bônus para continuar
- Ranking exibe no máximo **top 50** + posição do usuário logado
- Duende aparece sempre no ranking como participante fixo

---

### Dependências técnicas

- **Supabase Auth** — já incluído no `@supabase/supabase-js`, sem custo adicional
- **RLS** — policies por `auth.uid()` nas tabelas `user_bets` e `user_profiles`
- **Frontend auth context** — `AuthContext` + `useAuth` hook para proteger rotas

---

### Critério de sucesso
- Usuário consegue se cadastrar, fazer palpite e ver seu nome no ranking
- Ranking atualiza automaticamente após liquidação das apostas
- Verde/vermelho vs Duende visível claramente

---

*Última atualização: 2026-03-15 — Fases 1–11 concluídas. Deploy ativo. Fase 12 planejada: Ranking de Competidores.*
