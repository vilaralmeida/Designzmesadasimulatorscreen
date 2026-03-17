// Em dev: URL vazia → proxy do Vite encaminha para o backend (sem CORS)
// Em produção: VITE_API_URL aponta para o Railway
const BASE_URL = import.meta.env.VITE_API_URL || '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export interface UpcomingBet {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  league: string;
  league_logo: string;
  league_country: string;
  match_date: string;
  bet_type: 'home' | 'draw' | 'away';
  odds: number;
  amount: number;
  duende_quote: string;
  status: string;
}

export interface Bet {
  id: string;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  league: string;
  match_date: string;
  bet_type: 'home' | 'draw' | 'away';
  odds: number;
  amount: number;
  result: 'win' | 'loss' | 'pending';
  payout: number;
  home_score: number;
  away_score: number;
  duende_quote: string;
}

export interface Bankroll {
  id: string;
  balance: number;
  updated_at: string;
}

export interface BetStats {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  wagered: number;
  returned: number;
  roi: number;
}

export interface Tip {
  id: string;
  name: string;
  email: string;
  suggestion: string;
  created_at: string;
}

export interface RoundFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
    venue: { name: string; city: string };
  };
  league: { round: string };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: { halftime: { home: number | null; away: number | null } };
}

export interface ContentBlock {
  id: string;
  key: string;
  value: string;
  type: string;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  event: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface QuotaStatus {
  used: number;
  limit: number;
  safe: boolean;
}

async function post<T>(path: string, body: object, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-admin-token'] = token;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

async function adminGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-admin-token': token },
  });
  if (res.status === 401) throw new Error('401');
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function adminPut<T>(path: string, body: object, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ── Público ─────────────────────────────────────────────
  getUpcomingBets: () => get<UpcomingBet[]>('/api/fixtures/upcoming'),
  getBets: (limit = 10) => get<{ data: Bet[]; total: number }>(`/api/bets?limit=${limit}`),
  getBetStats: () => get<BetStats>('/api/bets/stats'),
  getBankroll: () => get<Bankroll>('/api/bankroll'),
  getBankrollHistory: (days = 30) => get<{ date: string; delta: number; balance: number; result: string }[]>(`/api/bankroll/history?days=${days}`),
  getTips: (limit = 20) => get<{ data: Tip[]; total: number }>(`/api/tips?limit=${limit}`),
  postTip: (body: { name: string; email: string; suggestion: string }) => post<Tip>('/api/tips', body),
  getContent: () => get<Record<string, { value: string; type: string }>>('/api/content'),
  getSerieARounds: () => get<string[]>('/api/serie-a/rounds'),
  getSerieARoundFixtures: (round: string) =>
    get<RoundFixture[]>(`/api/serie-a/rounds/${encodeURIComponent(round)}`),

  // ── Admin ────────────────────────────────────────────────
  admin: {
    // Saldo
    getBankroll:    (t: string) => adminGet<Bankroll>('/api/bankroll', t),
    setBalance:     (t: string, balance: number) => post<{ok:boolean;balance:number}>('/admin/bankroll/set', { balance }, t),
    addBalance:     (t: string, amount: number)  => post<{ok:boolean;balance:number}>('/admin/bankroll/add', { amount }, t),
    // Conteúdo
    getContent:     (t: string) => adminGet<ContentBlock[]>('/admin/content', t),
    updateContent:  (t: string, key: string, value: string) => adminPut<{ok:boolean}>(`/admin/content/${key}`, { value }, t),
    // Apostas
    getUpcoming:    (t: string) => adminGet<UpcomingBet[]>('/admin/upcoming-bets', t),
    generateBets:   (t: string) => post<{ok:boolean;generated:number}>('/admin/bets/generate', {}, t),
    settleBets:     (t: string) => post<{ok:boolean}>('/admin/bets/settle', {}, t),
    cancelBet:      (t: string, id: string) => post<{ok:boolean}>(`/admin/bets/${id}/cancel`, {}, t),
    // Logs
    getLogs:        (t: string, level?: string) => adminGet<{data:SystemLog[];total:number}>(`/admin/logs?limit=50${level ? `&level=${level}` : ''}`, t),
    // Quota
    getQuota:       (t: string) => adminGet<QuotaStatus>('/admin/quota', t),
  },
};
