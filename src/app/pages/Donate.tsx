import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle2, QrCode, Heart, Star, MessageSquareHeart } from 'lucide-react';
import { api } from '../../lib/api';

export default function Donate() {
  const [copied, setCopied] = useState(false);
  const [pixKey, setPixKey] = useState('ze.mesada@pindaiba.com.br');
  const [helpMessage, setHelpMessage] = useState('O milagre não vai se pagar sozinho! Me paga um salgado pra eu ter energia no meu próximo green "garantido" pelo Chicão!');
  const [qrCodeImage, setQrCodeImage] = useState('');

  useEffect(() => {
    api.getContent().then(blocks => {
      if (blocks.pix_key?.value) setPixKey(blocks.pix_key.value);
      if (blocks.help_message?.value) setHelpMessage(blocks.help_message.value);
      if (blocks.qr_code_image?.value) setQrCodeImage(blocks.qr_code_image.value);
    }).catch(() => {/* usa defaults */});
  }, []);

  const pixComments = [
    {
      id: 1,
      name: "Tia Cotinha",
      amount: "R$ 5,00",
      message: "Compra um pão de queijo, meu filho. Sai dessa vida!",
      date: "Há 1 hora"
    },
    {
      id: 2,
      name: "João do Grau",
      amount: "R$ 10,00",
      message: "Pro salgado antes do próximo ALL-IN no futsal do Uzbequistão 🚀",
      date: "Há 3 horas"
    },
    {
      id: 3,
      name: "Anônimo",
      amount: "R$ 1,50",
      message: "A odd de 1.01 é certa, Zé. Confia no Chicão!",
      date: "Ontem"
    }
  ];

  const handleCopyPix = () => {
    try {
      navigator.clipboard.writeText(pixKey);
    } catch (e) {
      // Ignora erro caso não haja suporte a clipboard, apenas mostra o feedback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSupport = (value: number) => {
    // Apenas simula a ação de escolher um valor
    handleCopyPix();
  };

  return (
    <div className="w-full max-w-md p-4 relative z-10 overflow-x-hidden pt-6 flex flex-col items-center pb-24">
      
      {/* Header */}
      <header className="flex justify-center items-center mb-6">
        <div className="flex items-center gap-3 border-b-4 border-dashed border-[#FF4B4B] pb-2">
          <Heart className="text-[#FF4B4B] fill-[#FF4B4B]" size={24} strokeWidth={3} />
          <h1 className="text-xl font-black uppercase tracking-widest text-[#FF4B4B] drop-shadow-[2px_2px_0_#000]">
            Ajude o Zé!
          </h1>
        </div>
      </header>

      {/* Description / Story */}
      <div className="bg-[#1A1D24] p-4 border-4 border-[#0D0F14] rounded-2xl shadow-[6px_6px_0_0_#000] transform rotate-1 mb-8 w-full">
        <p className="text-gray-300 text-[11px] font-bold uppercase tracking-wider text-center leading-relaxed">
          {helpMessage}
        </p>
      </div>

      {/* Buy me a coffee style buttons */}
      <div className="w-full flex justify-between gap-3 mb-8">
        {[
          { icon: '☕', name: 'Café', price: 5, color: '#FFB800' },
          { icon: '🥟', name: 'Salgado', price: 10, color: '#00D46A' },
          { icon: '🥤', name: 'Guaraná', price: 15, color: '#00D46A' },
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={() => handleSupport(item.price)}
            className="flex-1 bg-[#1A1D24] border-4 border-[#0D0F14] rounded-xl py-3 px-1 flex flex-col items-center gap-2 transform transition-transform hover:-translate-y-1 hover:rotate-2 active:translate-y-1 active:shadow-none shadow-[4px_4px_0_0_#000]"
            style={{ 
              transform: `rotate(${idx === 1 ? '0' : idx === 0 ? '-2deg' : '2deg'})` 
            }}
          >
            <span className="text-2xl drop-shadow-md">{item.icon}</span>
            <div className="flex flex-col items-center w-full">
              <span className="text-[9px] font-black uppercase text-gray-400 truncate max-w-[80px]">
                {item.name}
              </span>
              <span className={`text-[12px] font-black text-[${item.color}]`}>
                R$ {item.price}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* QR Code Section */}
      <div className="w-full bg-[#1A1D24] border-4 border-[#0D0F14] rounded-2xl p-6 shadow-[8px_8px_0_0_#000] transform -rotate-1 relative flex flex-col items-center">
        
        {/* Decorative Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#FFB800]/80 backdrop-blur-sm -rotate-2 z-10 shadow-sm" />

        <h2 className="text-[#FF4B4B] font-black uppercase tracking-widest text-sm mb-4 text-center w-full border-b-2 border-dashed border-[#0D0F14]/50 pb-2">
          Manda o PIX!
        </h2>

        {/* QR Code Area */}
        <div className="bg-white p-4 rounded-xl border-4 border-black mb-6 transform rotate-2 shadow-inner group cursor-pointer" onClick={handleCopyPix}>
          <div className="w-40 h-40 flex items-center justify-center bg-gray-50 relative overflow-hidden rounded-lg">
            {qrCodeImage ? (
              <img src={qrCodeImage} alt="QR Code PIX" className="w-full h-full object-contain" />
            ) : (
              <>
                <div className="border-4 border-dashed border-gray-300 rounded-lg absolute inset-0" />
                <QrCode size={100} className="text-black opacity-80 group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
              </>
            )}
          </div>
        </div>

        {/* Copy Paste Input */}
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 bg-[#0D0F14] border-2 border-[#4A4E58] rounded-xl px-3 py-3 overflow-hidden">
            <p className="text-[#00D46A] font-mono text-[10px] sm:text-xs truncate font-bold">
              {pixKey}
            </p>
          </div>
          <button 
            onClick={handleCopyPix}
            className={`flex items-center justify-center p-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] transition-all active:translate-y-1 active:shadow-none min-w-[56px] ${
              copied ? 'bg-[#00D46A] text-black' : 'bg-[#FFB800] text-black hover:-translate-y-1'
            }`}
          >
            {copied ? <CheckCircle2 size={20} strokeWidth={3} /> : <Copy size={20} strokeWidth={3} />}
          </button>
        </div>

        {copied && (
          <div className="absolute -bottom-8 bg-[#00D46A] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-black animate-bounce shadow-md">
            Copiado pro milagre!
          </div>
        )}

      </div>

      {/* Thank you / Comments Section */}
      <div className="w-full mt-12 mb-4 relative z-10">
        <div className="flex items-center gap-2 mb-6 border-b-2 border-dashed border-[#FFB800] pb-3">
          <MessageSquareHeart size={20} className="text-[#FFB800]" />
          <h2 className="text-[14px] font-black text-[#FFB800] uppercase tracking-widest drop-shadow-[2px_2px_0_#000]">
            Mural do Pix
          </h2>
        </div>

        <div className="space-y-4">
          {pixComments.map((comment, index) => (
            <div 
              key={comment.id}
              className={`bg-[#1A1D24] border-4 border-[#0D0F14] rounded-xl p-4 shadow-[4px_4px_0_0_#000] relative transform transition-transform hover:scale-[1.02] ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
            >
              {/* Decorative tape for odd/even */}
              {index % 2 !== 0 && (
                <div className="absolute -top-2 right-4 w-10 h-4 bg-[#FF4B4B]/80 backdrop-blur-sm rotate-6 z-10 shadow-sm" />
              )}
              {index % 2 === 0 && (
                <div className="absolute -top-2 left-4 w-10 h-4 bg-[#00D46A]/80 backdrop-blur-sm -rotate-6 z-10 shadow-sm" />
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-[#FFB800] fill-[#FFB800]" />
                  <h3 className="text-white font-black text-[12px] uppercase tracking-wider">{comment.name}</h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[#00D46A] font-black text-[12px] bg-[#00D46A]/10 px-2 py-0.5 rounded border border-[#00D46A]/30">
                    {comment.amount}
                  </span>
                  <span className="text-gray-500 text-[9px] uppercase tracking-widest mt-1">
                    {comment.date}
                  </span>
                </div>
              </div>
              
              <div className="bg-[#0D0F14] p-3 rounded-lg border-2 border-[#4A4E58] relative mt-3">
                <p className="text-gray-300 text-[11px] font-bold italic leading-relaxed">
                  "{comment.message}"
                </p>
                {/* Speech bubble tail */}
                <div className="absolute -top-2 left-6 w-3 h-3 bg-[#0D0F14] border-t-2 border-l-2 border-[#4A4E58] transform rotate-45" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
