import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock, LogOut, DollarSign, FileText, Calendar,
  ScrollText, Zap, RefreshCw, XCircle, CheckCircle2,
  AlertTriangle, Info, Plus, Save, Activity,
} from 'lucide-react';
import { api, Bankroll, ContentBlock, UpcomingBet, SystemLog, QuotaStatus } from '../../lib/api';

// ── Auth helpers ─────────────────────────────────────────────
const TOKEN_KEY = 'ze_admin_token';
function getToken() { return sessionStorage.getItem(TOKEN_KEY) || ''; }
function saveToken(t: string) { sessionStorage.setItem(TOKEN_KEY, t); }
function clearToken() { sessionStorage.removeItem(TOKEN_KEY); }

// ── Pequenos helpers de UI ───────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[#1A1D24] border-4 border-[#0D0F14] rounded-2xl p-5 shadow-[6px_6px_0_0_#000] mb-6">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-dashed border-[#4A4E58] pb-3">
        {icon}
        <h2 className="text-[12px] font-black text-gray-300 uppercase tracking-[0.2em]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Btn({ onClick, disabled, color = '#FFB800', children }: {
  onClick: () => void; disabled?: boolean; color?: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 rounded-xl border-4 border-black text-black text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
      style={{ backgroundColor: color }}
    >
      {children}
    </button>
  );
}

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border-4 border-black text-black text-[11px] font-black uppercase tracking-wider shadow-[4px_4px_0_0_#000] ${type === 'ok' ? 'bg-[#00D46A]' : 'bg-[#FF4B4B]'}`}>
      {msg}
    </div>
  );
}

// ── Tela de login ────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (t: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.admin.getQuota(password); // testa o token
      saveToken(password);
      onLogin(password);
    } catch {
      setError('Senha incorreta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-[#1A1D24] border-4 border-[#FFB800] rounded-2xl p-6 shadow-[8px_8px_0_0_#000] transform -rotate-1">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#FFB800] p-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] mb-3">
            <Lock size={24} className="text-black" strokeWidth={3} />
          </div>
          <h1 className="text-white font-black text-lg uppercase tracking-widest">Admin</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Zé Mesada Simulator</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#0D0F14] border-2 border-[#4A4E58] rounded-xl py-3 px-4 text-white font-mono text-sm focus:border-[#FFB800] focus:outline-none"
            required
          />
          {error && <p className="text-[#FF4B4B] text-[10px] font-black uppercase text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFB800] text-black font-black uppercase tracking-widest py-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Painel principal ─────────────────────────────────────────
export default function Admin() {
  const [token, setToken] = useState(getToken);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Dados
  const [bankroll, setBankroll] = useState<Bankroll | null>(null);
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingBet[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [logLevel, setLogLevel] = useState('');

  // Form states
  const [newBalance, setNewBalance] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const setBusyKey = (key: string, val: boolean) => setBusy(b => ({ ...b, [key]: val }));

  const loadAll = useCallback(async () => {
    if (!token) return;
    try {
      const [br, ct, up, lg, qt] = await Promise.all([
        api.admin.getBankroll(token),
        api.admin.getContent(token),
        api.admin.getUpcoming(token),
        api.admin.getLogs(token, logLevel || undefined),
        api.admin.getQuota(token),
      ]);
      setBankroll(br);
      setContent(ct);
      setEditContent(Object.fromEntries(ct.map(c => [c.key, c.value])));
      setUpcoming(up);
      setLogs(lg.data);
      setQuota(qt);
    } catch (e: any) {
      if (e.message === '401') { clearToken(); setToken(''); }
    }
  }, [token, logLevel]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleLogout = () => { clearToken(); setToken(''); };

  // ── Saldo ──────────────────────────────────────────────────
  const handleSetBalance = async () => {
    const val = parseFloat(newBalance);
    if (isNaN(val) || val < 0) return notify('Valor inválido', 'err');
    setBusyKey('set', true);
    try {
      const res = await api.admin.setBalance(token, val);
      setBankroll(b => b ? { ...b, balance: res.balance } : b);
      setNewBalance('');
      notify(`Saldo definido para R$${res.balance.toFixed(2)}`);
    } catch { notify('Erro ao definir saldo', 'err'); }
    setBusyKey('set', false);
  };

  const handleAddBalance = async () => {
    const val = parseFloat(addAmount);
    if (isNaN(val)) return notify('Valor inválido', 'err');
    setBusyKey('add', true);
    try {
      const res = await api.admin.addBalance(token, val);
      setBankroll(b => b ? { ...b, balance: res.balance } : b);
      setAddAmount('');
      notify(`R$${val > 0 ? '+' : ''}${val.toFixed(2)} aplicado. Novo saldo: R$${res.balance.toFixed(2)}`);
    } catch { notify('Erro ao adicionar saldo', 'err'); }
    setBusyKey('add', false);
  };

  // ── Conteúdo ───────────────────────────────────────────────
  const handleSaveContent = async (key: string) => {
    setBusyKey(`content_${key}`, true);
    try {
      await api.admin.updateContent(token, key, editContent[key]);
      notify(`"${key}" atualizado!`);
    } catch { notify('Erro ao salvar', 'err'); }
    setBusyKey(`content_${key}`, false);
  };

  // ── Apostas ────────────────────────────────────────────────
  const handleGenerate = async () => {
    setBusyKey('gen', true);
    try {
      const res = await api.admin.generateBets(token);
      notify(`${res.generated} apostas geradas!`);
      loadAll();
    } catch (e: any) { notify(e.message || 'Erro', 'err'); }
    setBusyKey('gen', false);
  };

  const handleSettle = async () => {
    setBusyKey('settle', true);
    try {
      await api.admin.settleBets(token);
      notify('Liquidação executada!');
      loadAll();
    } catch { notify('Erro ao liquidar', 'err'); }
    setBusyKey('settle', false);
  };

  const handleCancel = async (id: string) => {
    setBusyKey(`cancel_${id}`, true);
    try {
      await api.admin.cancelBet(token, id);
      notify('Aposta cancelada');
      setUpcoming(u => u.filter(b => b.id !== id));
    } catch { notify('Erro ao cancelar', 'err'); }
    setBusyKey(`cancel_${id}`, false);
  };

  if (!token) return <LoginScreen onLogin={setToken} />;

  const LOG_COLORS: Record<string, string> = { info: '#00D46A', warn: '#FFB800', error: '#FF4B4B' };

  return (
    <div className="min-h-screen bg-[#0D0F14] p-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-2">
          <div>
            <h1 className="text-[#FFB800] font-black text-xl uppercase tracking-widest">Painel Admin</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Zé Mesada Simulator</p>
          </div>
          <div className="flex gap-2">
            <Btn onClick={loadAll} color="#4A4E58"><RefreshCw size={12} /> Atualizar</Btn>
            <Btn onClick={handleLogout} color="#FF4B4B"><LogOut size={12} /> Sair</Btn>
          </div>
        </div>

        {/* QUOTA */}
        {quota && (
          <div className="mb-6 bg-[#1A1D24] border-4 border-[#0D0F14] rounded-xl px-4 py-3 flex items-center justify-between shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[#FFB800]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quota API hoje</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-[#0D0F14] h-2 rounded-full overflow-hidden border border-black">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(quota.used / quota.limit) * 100}%`, backgroundColor: quota.safe ? '#00D46A' : '#FF4B4B' }}
                />
              </div>
              <span className="text-[11px] font-black text-white">{quota.used} / {quota.limit}</span>
            </div>
          </div>
        )}

        {/* SALDO */}
        <Section title="Saldo Virtual" icon={<DollarSign size={16} className="text-[#FFB800]" />}>
          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-[#FFB800] text-2xl font-black">R$</span>
            <span className="text-white text-5xl font-black tracking-tighter">
              {bankroll ? Number(bankroll.balance).toFixed(2) : '...'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Definir saldo exato</p>
              <div className="flex gap-2">
                <input
                  type="number" min="0" step="0.01" placeholder="100.00"
                  value={newBalance} onChange={e => setNewBalance(e.target.value)}
                  className="flex-1 bg-[#0D0F14] border-2 border-[#4A4E58] rounded-lg py-2 px-3 text-white font-mono text-sm focus:border-[#FFB800] focus:outline-none w-0"
                />
                <Btn onClick={handleSetBalance} disabled={busy.set}><Save size={12} /></Btn>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Adicionar / Remover</p>
              <div className="flex gap-2">
                <input
                  type="number" step="0.01" placeholder="+50 ou -10"
                  value={addAmount} onChange={e => setAddAmount(e.target.value)}
                  className="flex-1 bg-[#0D0F14] border-2 border-[#4A4E58] rounded-lg py-2 px-3 text-white font-mono text-sm focus:border-[#FFB800] focus:outline-none w-0"
                />
                <Btn onClick={handleAddBalance} disabled={busy.add} color="#00D46A"><Plus size={12} /></Btn>
              </div>
            </div>
          </div>
        </Section>

        {/* CONTEÚDO */}
        <Section title="Conteúdo Editável" icon={<FileText size={16} className="text-[#B854FF]" />}>
          <div className="space-y-4">
            {content.map(block => (
              <div key={block.key}>
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">{block.key}</p>
                <div className="flex gap-2">
                  {block.type === 'text' || block.type === 'image_url' ? (
                    <input
                      type="text"
                      value={editContent[block.key] ?? block.value}
                      onChange={e => setEditContent(c => ({ ...c, [block.key]: e.target.value }))}
                      className="flex-1 bg-[#0D0F14] border-2 border-[#4A4E58] rounded-lg py-2 px-3 text-white font-mono text-[11px] focus:border-[#B854FF] focus:outline-none min-w-0"
                    />
                  ) : (
                    <textarea
                      value={editContent[block.key] ?? block.value}
                      onChange={e => setEditContent(c => ({ ...c, [block.key]: e.target.value }))}
                      rows={2}
                      className="flex-1 bg-[#0D0F14] border-2 border-[#4A4E58] rounded-lg py-2 px-3 text-white font-mono text-[11px] focus:border-[#B854FF] focus:outline-none resize-none min-w-0"
                    />
                  )}
                  <Btn onClick={() => handleSaveContent(block.key)} disabled={busy[`content_${block.key}`]} color="#B854FF">
                    <Save size={12} />
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* APOSTAS */}
        <Section title="Apostas" icon={<Calendar size={16} className="text-[#00D46A]" />}>
          <div className="flex gap-2 mb-4">
            <Btn onClick={handleGenerate} disabled={busy.gen} color="#00D46A">
              <Zap size={12} /> Gerar apostas
            </Btn>
            <Btn onClick={handleSettle} disabled={busy.settle} color="#FFB800">
              <CheckCircle2 size={12} /> Liquidar pendentes
            </Btn>
          </div>

          {upcoming.filter(b => b.status === 'pending').length === 0 ? (
            <p className="text-gray-600 text-[10px] font-black uppercase text-center py-4">Nenhuma aposta pendente</p>
          ) : (
            <div className="space-y-2">
              {upcoming.filter(b => b.status === 'pending').map(bet => (
                <div key={bet.id} className="bg-[#0D0F14] rounded-xl p-3 border-2 border-[#4A4E58] flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-[10px] font-black truncate">
                      {bet.home_team} × {bet.away_team}
                    </p>
                    <p className="text-gray-500 text-[9px] font-bold uppercase">
                      {bet.league} · {bet.bet_type} @ {Number(bet.odds).toFixed(2)} · R${bet.amount}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancel(bet.id)}
                    disabled={busy[`cancel_${bet.id}`]}
                    className="shrink-0 text-[#FF4B4B] hover:text-white transition-colors disabled:opacity-40"
                    title="Cancelar aposta"
                  >
                    <XCircle size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* LOGS */}
        <Section title="Logs do Sistema" icon={<ScrollText size={16} className="text-[#FF4B4B]" />}>
          <div className="flex gap-2 mb-4">
            {['', 'info', 'warn', 'error'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setLogLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border-2 transition-all ${
                  logLevel === lvl
                    ? 'border-[#FFB800] text-[#FFB800] bg-[#FFB800]/10'
                    : 'border-[#4A4E58] text-gray-500 hover:border-gray-400'
                }`}
              >
                {lvl || 'Todos'}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-gray-600 text-[10px] font-black uppercase text-center py-4">Sem logs</p>
            ) : logs.map(log => (
              <div key={log.id} className="bg-[#0D0F14] rounded-lg p-2.5 border border-[#4A4E58]/50 flex gap-2 items-start">
                <span
                  className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                  style={{ color: '#000', backgroundColor: LOG_COLORS[log.level] ?? '#4A4E58' }}
                >
                  {log.level}
                </span>
                <div className="min-w-0">
                  <p className="text-white text-[10px] font-bold">{log.event}</p>
                  {log.payload && Object.keys(log.payload).length > 0 && (
                    <p className="text-gray-500 text-[9px] font-mono truncate">
                      {JSON.stringify(log.payload)}
                    </p>
                  )}
                  <p className="text-gray-600 text-[8px]">
                    {new Date(log.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="h-8" />
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
