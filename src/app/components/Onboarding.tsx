import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'pindaiba_onboarding_seen';

const SLIDES = [
  {
    emoji: '💸',
    title: 'Deixa de perder dinheiro no mundo real!',
    body: 'No Pindaiba você perde só no virtual.\nMuito mais saudável pro bolso.',
    sub: 'Simulação 100% gratuita. Nenhum centavo real envolvido.',
    bg: '#FF4B4B',
    rotate: '-rotate-1',
  },
  {
    emoji: '👻',
    title: 'Conheça o Duende Chicão.',
    body: 'Ele tem R$100 imaginários e palpita em jogos reais todo dia.\nOs palpites são... criativos.',
    sub: '"Sonhei com uma galinha laranja. É certeza absoluta."',
    bg: '#B854FF',
    rotate: 'rotate-1',
  },
  {
    emoji: '🏆',
    title: 'Você consegue fazer pior que o Duende?',
    body: 'Faça seus palpites nos mesmos jogos.\nVeja quem vai à pindaiba primeiro.',
    sub: 'Spoiler: provavelmente o Duende. Mas não garantimos nada.',
    bg: '#FFB800',
    rotate: '-rotate-1',
  },
];

export function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0);
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Pequeno delay para não mostrar antes da página carregar
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  function next() {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1);
    } else {
      dismiss();
    }
  }

  async function handleCompete() {
    dismiss();
    await signInWithGoogle();
  }

  if (!visible) return null;

  const s = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className={`w-full max-w-md bg-[#1A1D24] border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] transform ${s.rotate} transition-all`}>

        {/* Close */}
        <div className="flex justify-end p-3 pb-0">
          <button onClick={dismiss} className="text-[#4A4E58] hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Emoji badge */}
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center text-4xl"
              style={{ backgroundColor: s.bg }}
            >
              {s.emoji}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-white font-black text-xl uppercase tracking-wider text-center leading-tight">
            {s.title}
          </h2>

          {/* Body */}
          <p className="text-gray-300 text-sm font-mono text-center leading-relaxed whitespace-pre-line">
            {s.body}
          </p>

          {/* Sub */}
          <div className="bg-[#0D0F14] rounded-xl p-3 border-2 border-[#333]">
            <p className="text-[#4A4E58] text-[11px] font-bold uppercase tracking-wider text-center">
              {s.sub}
            </p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-[#FFB800]' : 'w-2 bg-[#333]'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {isLast ? (
              <>
                <button
                  onClick={handleCompete}
                  className="w-full bg-[#FFB800] text-black font-black uppercase tracking-widest py-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Aceitar o desafio 👊
                </button>
                <button
                  onClick={dismiss}
                  className="w-full text-[#4A4E58] text-xs font-mono py-2 hover:text-white transition-colors"
                >
                  Só quero ver o Chicão perder
                </button>
              </>
            ) : (
              <button
                onClick={next}
                className="w-full bg-[#FFB800] text-black font-black uppercase tracking-widest py-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-sm"
              >
                Continua <ChevronRight size={18} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
