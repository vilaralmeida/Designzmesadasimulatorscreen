import React from 'react';
import { Home, LineChart, BookOpen, Coffee, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export const BottomTabBar = () => {
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isStats = location.pathname === '/stats';
  const isStory = location.pathname === '/historia';
  const isDonate = location.pathname === '/ajuda';
  const isRanking = location.pathname === '/ranking';

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#0D0F14] via-[#0D0F14]/90 to-transparent z-50 pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto bg-[#1A1D24] border-4 border-[#333] rounded-2xl flex justify-between items-center px-4 py-2 shadow-[0_8px_0_0_#000] relative transform -rotate-1">

        <Link
          to="/historia"
          className={`py-3 px-2 flex flex-col items-center gap-1.5 transform hover:-translate-y-2 active:translate-y-0 transition-transform ${isStory ? 'text-[#FFB800]' : 'text-[#4A4E58] hover:text-[#FFB800]'}`}
        >
          <BookOpen size={22} className={isStory ? "drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" : ""} strokeWidth={isStory ? 3 : 2.5} />
          <span className="text-[10px] font-black uppercase tracking-wider">Origem</span>
        </Link>

        <Link
          to="/stats"
          className={`py-3 px-2 flex flex-col items-center gap-1.5 transform hover:-translate-y-2 active:translate-y-0 transition-transform ${isStats ? 'text-[#00D46A]' : 'text-[#4A4E58] hover:text-[#00D46A]'}`}
        >
          <LineChart size={22} className={isStats ? "drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" : ""} strokeWidth={isStats ? 3 : 2.5} />
          <span className="text-[10px] font-black uppercase tracking-wider">Stats</span>
        </Link>

        <div className="relative -top-7">
          <Link to="/">
            <button className={`p-4 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] transform rotate-6 hover:rotate-12 active:translate-y-2 active:shadow-none transition-all ${isHome ? 'bg-[#FFB800] text-black scale-110' : 'bg-[#00D46A] text-black'}`}>
              <Home size={28} className="drop-shadow-sm" strokeWidth={3} />
            </button>
          </Link>
        </div>

        <Link
          to="/ranking"
          className={`py-3 px-2 flex flex-col items-center gap-1.5 transform hover:-translate-y-2 active:translate-y-0 transition-transform ${isRanking ? 'text-[#FFB800]' : 'text-[#4A4E58] hover:text-[#FFB800]'}`}
        >
          <Trophy size={22} className={isRanking ? "drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" : ""} strokeWidth={isRanking ? 3 : 2.5} />
          <span className="text-[10px] font-black uppercase tracking-wider">Ranking</span>
        </Link>

        <Link
          to="/ajuda"
          className={`py-3 px-2 flex flex-col items-center gap-1.5 transform hover:-translate-y-2 active:translate-y-0 transition-transform ${isDonate ? 'text-[#FF4B4B]' : 'text-[#4A4E58] hover:text-[#FF4B4B]'}`}
        >
          <Coffee size={22} className={isDonate ? "drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" : ""} strokeWidth={isDonate ? 3 : 2.5} />
          <span className="text-[10px] font-black uppercase tracking-wider">Ajuda</span>
        </Link>

      </div>
    </div>
  );
};
