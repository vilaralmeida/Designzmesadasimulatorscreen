import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [direction, setDirection] = useState(1); // 1 = próximo, -1 = anterior
  const { signInWithGoogle } = useAuth();

  // Swipe
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  function goTo(index: number) {
    setDirection(index > slide ? 1 : -1);
    setSlide(index);
  }

  function next() {
    if (slide < SLIDES.length - 1) {
      goTo(slide + 1);
    } else {
      dismiss();
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && slide < SLIDES.length - 1) goTo(slide + 1);
      if (diff < 0 && slide > 0) goTo(slide - 1);
    }
    touchStartX.current = null;
  }

  async function handleCompete() {
    dismiss();
    await signInWithGoogle();
  }

  if (!visible) return null;

  const s = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`w-full max-w-md bg-[#1A1D24] border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] transform ${s.rotate} overflow-hidden`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Close */}
        <div className="flex justify-end p-3 pb-0">
          <button onClick={dismiss} className="text-[#4A4E58] hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Slide content animado */}
        <div className="px-6 pb-6 flex flex-col gap-4 min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex flex-col gap-4"
            >
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots + Actions — fora do AnimatePresence para não piscar */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <div className="flex justify-center gap-2">
            {SLIDES.map((s2, i) => (
              <button
                key={s2.emoji}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === slide ? 'w-6 bg-[#FFB800]' : 'w-2 bg-[#333]'
                }`}
              />
            ))}
          </div>

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
      </motion.div>
    </div>
  );
}
