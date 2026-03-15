import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  balance: number;
  created_at: string;
};

export type UserBet = {
  id: string;
  user_id: string;
  upcoming_bet_id: string;
  bet_type: 'home' | 'draw' | 'away';
  amount: number;
  odds: number;
  result: 'win' | 'loss' | null;
  payout: number | null;
  created_at: string;
};

export type RankingEntry = {
  id: string;
  round_date: string;
  user_id: string | null; // null = Duende
  username: string;
  avatar_url: string | null;
  balance: number;
  daily_pnl: number;
  position: number;
  vs_duende: 'above' | 'below' | 'equal';
};
