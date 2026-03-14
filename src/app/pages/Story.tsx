import React from 'react';
import { BookOpen, AlertCircle, Quote, X, ZoomIn } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import originImage from 'figma:asset/2ece2aa7f929d95e8cee56cab6d6599dd51dc7e7.png';
import topImage from 'figma:asset/5904eb9eb72b5560bdc24189852159dc8ae88496.png';

export default function Story() {
  return (
    <div className="w-full max-w-md p-4 relative z-10 overflow-x-hidden pt-6 pb-24">
      {/* Header */}
      <header className="flex justify-center items-center mb-8">
        <div className="flex items-center gap-3 border-b-4 border-dashed border-[#FFB800] pb-2">
          <BookOpen className="text-[#FFB800]" size={24} strokeWidth={3} />
          <h1 className="text-xl font-black uppercase tracking-widest text-[#FFB800] drop-shadow-[2px_2px_0_#000]">
            A Origem da Pindaíba
          </h1>
        </div>
      </header>

      {/* Top Image */}
      <div className="relative mb-8 transform -rotate-1">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-900/40 backdrop-blur-sm rotate-2 z-10" 
          style={{ clipPath: 'polygon(5% 0%, 95% 5%, 90% 95%, 10% 100%)' }} />
        
        <div className="bg-[#1A1D24] border-4 border-[#FFB800] rounded-xl p-2 shadow-[8px_8px_0_0_#000]">
          <div className="relative overflow-hidden rounded-lg border-2 border-black">
            <img 
              src={topImage} 
              alt="Zé e o Duende Chicão" 
              className="w-full h-auto object-cover"
            />
            {/* Grit overlay */}
            <div className="absolute inset-0 bg-yellow-900/10 pointer-events-none mix-blend-multiply" />
          </div>
        </div>
      </div>

      {/* The Story Cards */}
      <div className="space-y-6 relative mb-12">
        {/* Connector Line */}
        <div className="absolute left-[1.375rem] top-8 bottom-8 border-l-4 border-dashed border-[#4A4E58] z-0" />

        {/* Step 1 */}
        <div className="relative z-10 flex gap-4 transform -rotate-1 hover:rotate-0 transition-transform">
          <div className="w-12 h-12 shrink-0 bg-[#FFB800] rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
            <span className="text-black font-black text-xl">1</span>
          </div>
          <div className="flex-1 bg-[#1A1D24] border-2 border-dashed border-[#FFB800] p-4 rounded-xl rounded-tl-none shadow-[4px_4px_0_0_rgba(255,184,0,0.2)]">
            <h3 className="text-xs text-[#FFB800] font-black uppercase mb-2 flex items-center gap-1">
              <AlertCircle size={14} /> O Rei do Sofá
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-bold">
              Era uma vez em Juazeiro do Norte, o <span className="text-[#FF4B4B]">Zé Mesada</span>, 42 anos, rei absoluto do sofá da sala. Pais na cozinha brigando com panela, ele no PC 2005, fone no ouvido, alheio ao mundo real.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative z-10 flex gap-4 transform rotate-1 hover:rotate-0 transition-transform">
          <div className="w-12 h-12 shrink-0 bg-[#00D46A] rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
            <span className="text-black font-black text-xl">2</span>
          </div>
          <div className="flex-1 bg-[#1A1D24] border-2 border-dashed border-[#00D46A] p-4 rounded-xl rounded-tl-none shadow-[4px_4px_0_0_rgba(0,212,106,0.2)] relative overflow-hidden">
            
            <h3 className="text-xs text-[#00D46A] font-black uppercase mb-2">
              A Culpa é do Guaraná Quente
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-bold mb-3">
              "Carlão, meu brother, hoje tem jogo na Tailândia ou na Série D? Me salva da mesada de R$50 da mãe!" 
              <span className="block mt-2"><span className="text-white bg-[#00D46A] px-1 py-0.5 rounded text-[10px] uppercase">Carlão</span>, o duende falante que só Zé vê (culpa do guaraná quente), pisca a resposta de ouro.</span>
            </p>
            
            {/* Quote Bubble */}
            <div className="bg-[#0D0F14] border-2 border-[#4A4E58] p-3 rounded-lg relative mt-2 transform -rotate-2">
              <Quote className="absolute -top-2 -left-2 text-[#00D46A]" size={16} fill="#00D46A" />
              <p className="text-[10px] text-[#00D46A] font-black uppercase text-center italic tracking-wider">
                "Zé, vai na zebra do visitante!"
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative z-10 flex gap-4 transform -rotate-2 hover:rotate-0 transition-transform">
          <div className="w-12 h-12 shrink-0 bg-[#FF4B4B] rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
            <span className="text-black font-black text-xl">3</span>
          </div>
          <div className="flex-1 bg-[#1A1D24] border-4 border-[#FF4B4B] p-4 rounded-xl rounded-tl-none shadow-[6px_6px_0_0_#000]">
            <h3 className="text-xs text-[#FF4B4B] font-black uppercase mb-2">
              Milionário ou Busão?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-bold">
              Apostas US$1 fictício todo dia, pré-jogo global. Uns dias vira milionário virtual; outros, pede troco pro busão.
              <span className="block mt-3 text-[#FF4B4B] text-sm uppercase font-black text-center border-t-2 border-dashed border-[#FF4B4B]/30 pt-3">
                "Mãe, foi o Carlão que mandou!" 😂
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Info Card - "Será que o Chicão tem Razão?" */}
      <div className="w-full bg-[#FF4B4B] border-4 border-black p-4 rounded-xl shadow-[6px_6px_0_0_#000] mb-8 transform -rotate-1 hover:rotate-0 transition-transform relative overflow-hidden">
        {/* Decorative Tape */}
        <div className="absolute -top-3 right-4 w-16 h-5 bg-white/20 backdrop-blur-sm rotate-6 z-10 shadow-sm" />
        
        <h2 className="text-black font-black uppercase tracking-widest text-sm mb-2 drop-shadow-[1px_1px_0_#fff]">
          Será que o Chicão tem Razão?
        </h2>
        
        <p className="text-black font-bold text-[11px] leading-relaxed">
          <span className="bg-black text-[#FF4B4B] px-1 py-0.5 rounded uppercase tracking-wider text-[10px]">Bet</span> já é a segunda maior modalidade de investimento dos brasileiros. 
        </p>
        
        <div className="mt-3 border-t-2 border-dashed border-black/30 pt-2">
          <p className="text-white font-black text-center uppercase tracking-widest text-[12px] drop-shadow-[1px_1px_0_#000]">
            Haja Duende!!! 🍄🍀
          </p>
        </div>
      </div>

      {/* The Evidence Image */}
      <div className="relative mb-8 transform rotate-2">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-red-900/40 backdrop-blur-sm -rotate-3 z-10" 
          style={{ clipPath: 'polygon(5% 0%, 95% 5%, 90% 95%, 10% 100%)' }} />
        
        <div className="bg-[#1A1D24] border-4 border-[#4A4E58] rounded-xl p-3 shadow-[8px_8px_0_0_#000]">
          
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <div className="relative overflow-hidden rounded-lg border-2 border-black cursor-pointer group">
                <img 
                  src={originImage} 
                  alt="O post do Reddit que arruinou tudo" 
                  className="w-full h-auto object-contain bg-black mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-300"
                />
                {/* Grit overlay */}
                <div className="absolute inset-0 bg-yellow-900/10 pointer-events-none mix-blend-multiply group-hover:bg-transparent transition-colors" />
                
                {/* Hover UI */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="bg-[#FFB800] text-black font-black uppercase text-[10px] px-3 py-1.5 rounded flex items-center gap-1 transform rotate-2 shadow-[2px_2px_0_0_#000]">
                    <ZoomIn size={14} /> Ampliar Evidência
                  </div>
                </div>
              </div>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-[#0D0F14]/90 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border-4 border-[#FFB800] bg-[#1A1D24] p-3 shadow-[12px_12px_0_0_#000] duration-200 animate-in fade-in zoom-in-95 sm:rounded-2xl transform rotate-1">
                
                <div className="relative bg-black rounded-lg border-4 border-black overflow-hidden">
                  <img src={originImage} alt="O post do Reddit expandido" className="w-full h-auto" />
                </div>
                
                <p className="text-center text-[#FFB800] font-black uppercase tracking-widest text-[10px] mt-4 mb-2">
                  "Onde tudo começou..."
                </p>

                <Dialog.Close asChild>
                  <button className="absolute -top-5 -right-5 rounded-full bg-[#FF4B4B] p-2 border-4 border-black text-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-none transition-all">
                    <X size={20} strokeWidth={4} />
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <div className="mt-3 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              A prova do crime (Reddit, 2024)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
