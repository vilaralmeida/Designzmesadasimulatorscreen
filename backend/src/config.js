import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adminSecret: process.env.ADMIN_SECRET,
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  apiFootball: {
    key: process.env.API_FOOTBALL_KEY,
    baseUrl: 'https://v3.football.api-sports.io',
    dailyLimit: 7500,
    safeLimit: 6000, // parar em ~80% do limite (plano PRO)
  },
};
