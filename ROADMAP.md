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
| 8 | Deploy (Vercel + Railway + CI/CD via GitHub Actions) | ✅ Concluído |
| 9 | Monitoramento (Sentry + UptimeRobot) | ✅ Concluído |
| 10 | Extras: PWA · Cache · Fallback offline | 🔲 Pendente |
| 11 | Aposta contínua — Série A exclusiva, janela 14 dias, máx 8/dia | ✅ Concluído |
| 12 | Módulo de Engajamento — Ranking de Competidores | ✅ Concluído |
| 13 | Card "Bata o Duende" na Home + reorganização de cards | ✅ Concluído |
| 14 | Chat Duende integrado ao perfil logado no Ranking | ✅ Concluído |
| 15 | Domínio pindaiba.red (Vercel) | ✅ Concluído |
| 16 | Timer de rodada + Compartilhamento no Ranking | ✅ Concluído |
| 17 | Histórico de Rodadas no Ranking | ✅ Concluído |
| 18 | Fix: saldo da Home não atualizava (bug bankroll.id) | ✅ Concluído |
| 19 | Frases do Duende expandidas (13 → 43 quotes) | ✅ Concluído |
| 20 | Fix: nome do jogo truncado no BetHistoryCard | ✅ Concluído |
| 21 | Monitoramento (Sentry + UptimeRobot) | ✅ Concluído |
| 22 | PWA — instalar como app no celular | 🔲 Pendente |
| 23 | Onboarding — explicação para novos usuários | ✅ Concluído |
| 24 | Página de perfil do usuário | 🔲 Pendente |
| 25 | Bug: saldo da Home travado em R$100 (bankroll não atualiza após apostas) | ✅ Concluído |
| 26 | UX: URL do Supabase exposta no login Google ("Prosseguir para ymxtvynhodvmsmqdxjij.supabase.co") | 🔲 Pendente |
| 27 | UX: Menu hambúrguer (Home) sem função — implementar drawer com os mesmos links do BottomTabBar | 🔲 Pendente |
| 28 | Redesign Home — remover histórico de apostas, foco em jogos ao vivo/próximos | 🔲 Pendente |
| 29 | App de futebol moderno — live scores, detalhe de partida, tabela com forma recente | 🔲 Pendente |
| 30 | Catálogo de rodadas da Série A — página /serie-a com navegação por rodada | ✅ Concluído |

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

---

## 🐛 FASE 25 — Bug: Saldo da Home travado em R$100

**Sintoma:** O `BalanceCard` exibe R$100 mesmo após apostas liquidadas com perda/ganho. O valor nunca se afasta do saldo inicial.

**Causa suspeita:** Race condition no `betEngine.js` ao liquidar múltiplas apostas no mesmo ciclo do scheduler. Cada aposta lê `bankroll.balance` de forma independente (sem lock), calcula o novo saldo sobre o valor lido e faz o `UPDATE`. Se duas apostas lêem `balance = 100` antes de qualquer update ser concluído, o segundo update sobrescreve o primeiro — e o saldo final ignora uma das apostas. O resultado é que o `bankroll.balance` no Supabase permanece em 100 ou sofre variações parciais.

**Arquivos envolvidos:**
- `backend/src/services/betEngine.js` — seção que atualiza `bankroll` após cada aposta (linhas ~319–334)
- `backend/src/routes/bankroll.js` — endpoint `GET /api/bankroll`
- `src/app/components/BalanceCard.tsx` — exibe `d.balance`

**Fix recomendado:**
1. Processar a liquidação das apostas **sequencialmente** (não em paralelo) para eliminar a race condition
2. OU usar uma operação atômica de incremento no Supabase: `UPDATE bankroll SET balance = balance + $delta WHERE id = $id` em vez de ler→calcular→escrever
3. Verificar no Admin se o `bankroll.balance` no banco já está desatualizado (se sim, corrigir manualmente via `POST /admin/bankroll/set`)

**Observação:** A Phase 18 corrigiu um bug relacionado ao `bankroll.id` sendo undefined — este é um problema diferente (race condition na liquidação em lote).

---

---

## 🔲 FASE 26 — UX: Esconder URL do Supabase no Login Google

**Sintoma:** Ao clicar em "Entrar com Google", o modal do Google exibe:
> "Prosseguir para **ymxtvynhodvmsmqdxjij.supabase.co**"
— URL técnica e sem sentido para o usuário, passa impressão de insegurança.

**Por que acontece:** O Supabase é o intermediário do fluxo OAuth. O Google mostra o domínio do callback de redirecionamento, que aponta para o projeto Supabase.

**Opções para resolver:**

| Abordagem | Resultado | Custo |
|-----------|-----------|-------|
| **Supabase Custom Domain** | Google passa a exibir `auth.pindaiba.red` | Requer plano Pro ($25/mês) |
| **Vanity subdomain** | Troca para algo como `pindaiba.supabase.co` | Gratuito, mas ainda expõe `.supabase.co` |
| **Proxy OAuth no backend** | Backend (Railway) recebe o callback do Google e repassa ao Supabase | Gratuito, mas implementação complexa |

**Solução recomendada:** Supabase Custom Domain (Pro).

**Passos (Supabase Pro):**
1. Fazer upgrade do projeto para plano Pro no dashboard Supabase
2. Ir em **Project Settings → Custom Domains**
3. Adicionar `auth.pindaiba.red` e configurar CNAME na Vercel/DNS
4. Supabase emite TLS automático
5. Atualizar `VITE_SUPABASE_URL` na Vercel para `https://auth.pindaiba.red`
6. Atualizar `SUPABASE_URL` no Railway para `https://auth.pindaiba.red`
7. No Google Cloud Console → Credenciais OAuth → adicionar `https://auth.pindaiba.red` como Authorized redirect URI

**Resultado:** Google exibe "Prosseguir para **pindaiba.red**" — domínio reconhecível pelo usuário.

---

---

## 🔲 FASE 27 — UX: Menu Hambúrguer funcional

**Situação atual:** O botão `AlignJustify` (hambúrguer) no canto superior direito da `Home.tsx` existe visualmente mas não tem `onClick` — é um botão inerte.

**Objetivo:** Ao clicar no hambúrguer, abrir um **drawer lateral ou bottom sheet** com os mesmos destinos do `BottomTabBar`, para que o usuário possa navegar sem precisar alcançar a barra inferior.

**Links que devem aparecer no menu:**

| Rota | Label | Ícone |
|------|-------|-------|
| `/` | Home | `Home` |
| `/historia` | Origem | `BookOpen` |
| `/stats` | Stats | `LineChart` |
| `/ranking` | Ranking | `Trophy` |
| `/ajuda` | Ajuda | `Coffee` |

**Arquivos envolvidos:**
- `src/app/pages/Home.tsx` — adicionar `useState` para controle do drawer + `onClick` no botão hambúrguer
- Novo componente `src/app/components/HamburgerMenu.tsx` — drawer com os links (reutilizar estilos do `BottomTabBar`)

**Comportamento esperado:**
- Clique no hambúrguer → abre drawer (slide from right ou bottom sheet)
- Clique em qualquer link → navega e fecha o drawer
- Clique fora do drawer ou em botão "X" → fecha
- Item da rota atual → destacado (mesmo comportamento de `active` do `BottomTabBar`)

---

## 🔲 FASE 28 — Redesign da Home

**Motivação:** A Home atual mistura muita coisa — disclaimer, card de ranking, tabela de apostas futuras, CTA de doação, saldo, gráfico e histórico de apostas. O histórico de apostas do Duende (últimos resultados) ocupa espaço nobre sem agregar valor imediato ao usuário.

**Proposta de nova hierarquia de informação:**

| Prioridade | Componente | Motivo |
|-----------|-----------|--------|
| 1 | Jogos ao vivo / próximos (novo — Fase 29) | Coração do app moderno |
| 2 | Card "Bata o Duende" | Engajamento com ranking |
| 3 | Saldo + gráfico do Duende | Identidade do app |
| 4 | DonateCTA | Apoio financeiro |
| — | ~~BetHistoryCard (histórico de apostas)~~ | Remover da Home → mover para Stats ou aba própria |

**O que remover da Home:**
- `BetHistoryCard` — histórico de apostas passadas do Duende (mover para `/stats` ou sub-aba)

**O que permanece:**
- Header Zé Mesada
- Disclaimer banner
- BeatDuendeCard
- BalanceCard + BankrollChart
- DonateCTA

---

## 🔲 FASE 29 — App de Futebol Moderno

### Análise de Viabilidade (cruzada com API-Football)

> Contexto: plano PRO (7.500 calls/dia). Uso atual: ~106 calls/dia (1,4%). Margem disponível: ~7.400 calls/dia.

#### Funcionalidades e viabilidade por feature

| Feature | Endpoint API-Football | Série A (71) | Série B (72) | Custo estimado/dia | Viável? |
|---------|----------------------|:------------:|:------------:|-------------------|:-------:|
| Placar ao vivo + minuto | `GET /fixtures?live=all` | ✅ | ✅ | ~90 calls/jogo (poll 60s × 90min) | ✅ |
| Indicador pulsante (minuto) | Frontend only | — | — | 0 | ✅ |
| Eventos ao vivo (gols, cartões) | `GET /fixtures/events?fixture=id` | ✅ | ❌ | Incluído no live poll | ✅ S.A. / ❌ S.B. |
| Mini-stats ao vivo (posse, finalizações) | `GET /fixtures/statistics?fixture=id` | ✅ | ❌ | +1 call/poll por jogo | ✅ S.A. / ❌ S.B. |
| Previsão pré-jogo com probabilidades | `GET /predictions?fixture=id` | ✅ | ✅ | 1 call/jogo (once) | ✅ |
| Timeline de eventos (tela detalhe) | `GET /fixtures/events?fixture=id` | ✅ | ❌ | 1 call por abertura | ✅ S.A. / ❌ S.B. |
| Estatísticas comparativas (barras) | `GET /fixtures/statistics?fixture=id` | ✅ | ❌ | 1 call por abertura | ✅ S.A. / ❌ S.B. |
| Escalação + formação no campo | `GET /fixtures/lineups?fixture=id` | ✅ | ❌ | 1 call por abertura | ✅ S.A. / ❌ S.B. |
| Resultado do intervalo | Incluído em `/fixtures` | ✅ | ✅ | 0 (já buscado) | ✅ |
| Tabela com posição + zona | `GET /standings?league&season` | ✅ | ✅ | 1 call/dia por liga | ✅ |
| Forma recente (últimos 5 jogos) | Campo `form` em `/standings` | ✅ | ✅ | 0 (incluído em standings) | ✅ |
| Push notifications (gols/cartões) | Backend → Web Push API | S.A. ✅ | ❌ | Infra nova (FCM/VAPID) | ⚠️ complexo |
| Favoritar times/ligas | Supabase `user_profiles` | ✅ | ✅ | 0 (BD existente) | ✅ |
| Dark mode nativo | Já implementado | ✅ | ✅ | 0 | ✅ já pronto |

#### Impacto de quota para live polling

```
Cenário: 5 jogos simultâneos da Série A, polling a cada 60s

Por jogo:
  /fixtures?live=all     → 1 call/min (resposta inclui todos os jogos ao vivo)
  /fixtures/statistics   → 1 call/min por jogo × 5 = 5 calls/min

Total por partida (90min):
  fixtures: 90 calls
  statistics: 5 jogos × 90 = 450 calls

Total diário estimado com live:
  Uso atual:         ~106 calls
  Live (rodada):     ~540 calls
  TOTAL:             ~650 calls/dia  →  8,7% da quota PRO

✅ Confortavelmente dentro do limite.
```

#### Restrição principal: Série B não tem eventos/lineups/stats
A cobertura da Série B 2026 é mínima — apenas standings, predictions e odds. Tudo que envolve eventos ao vivo, escalação e estatísticas de partida só funciona para a Série A. A cobertura da Série B pode expandir ao longo da temporada (vale re-checar mensalmente).

---

### Arquitetura proposta

#### Novas telas

| Tela | Rota | Descrição |
|------|------|-----------|
| Live / Jogos | `/` (nova Home) ou `/jogos` | Lista de jogos ao vivo + próximos do dia |
| Detalhe da partida | `/jogo/:id` | Placar, eventos, stats, escalação em tabs |
| Tabela | `/tabela/:leagueId` | Standings com forma recente e zonas coloridas |

#### Novos endpoints backend

| Método | Rota | Fonte | Descrição |
|--------|------|-------|-----------|
| GET | `/api/live` | `/fixtures?live=all` | Jogos ao vivo agora |
| GET | `/api/match/:id` | `/fixtures?id=` | Dados completos de uma partida |
| GET | `/api/match/:id/events` | `/fixtures/events` | Timeline de eventos |
| GET | `/api/match/:id/stats` | `/fixtures/statistics` | Stats comparativas |
| GET | `/api/match/:id/lineups` | `/fixtures/lineups` | Escalações e formação |
| GET | `/api/standings/:leagueId` | `/standings` | Tabela com forma |

#### Cache recomendado (evitar quota desnecessária)

| Dado | TTL sugerido |
|------|-------------|
| Standings | 30 min |
| Predictions | 6h |
| Lineups | 5 min (mudam só no início) |
| Live scores | 30s–60s (poll ativo) |
| Eventos de jogo finalizado | Indefinido (imutável) |

#### Push notifications (fase futura separada)
Requer: Service Worker + VAPID keys + tabela `push_subscriptions` no Supabase + lógica no scheduler de live para disparar push quando detectar novo evento.

---

### Ordem de implementação sugerida

1. **Standings + forma recente** — mais simples, alto valor, sem live polling
2. **Previsões pré-jogo** — endpoint já confirmado, integra bem na Home
3. **Tela de detalhe** — events + stats + lineups (Série A)
4. **Live scoring** — requer poll no frontend ou SSE no backend
5. **Push notifications** — maior complexidade, fase isolada

---

*Última atualização: 2026-03-17 — Fases 1–20 concluídas. Produção ativa em pindaiba.red. CI/CD via GitHub Actions. Pendentes: monitoramento (21), PWA (22), onboarding (23), perfil (24), bug saldo (25), URL Supabase (26), hambúrguer (27), redesign home (28), app futebol moderno (29).*
