import React, { useState } from 'react';
import { MessageCircle, Send, User, AtSign, Lightbulb, MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  email: string;
  suggestion: string;
  date: string;
}

export default function Tips() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [suggestion, setSuggestion] = useState('');
  
  // Mock data inicial
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      name: 'Carlinhos da Bet',
      email: 'carlinhos@bet.com.br',
      suggestion: 'Manda all-in no empate do Íbis! A odd tá 15.00, confia que é sucesso absoluto!',
      date: 'Há 2 horas'
    },
    {
      id: '2',
      name: 'João Sem Sorte',
      email: 'joao.loss@email.com',
      suggestion: 'Esquece futebol, o negócio agora é apostar na corrida de galgos. O galgo 4 tá voando baixo.',
      date: 'Há 5 horas'
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !suggestion) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      name,
      email,
      suggestion,
      date: 'Agora mesmo'
    };

    setComments([newComment, ...comments]);
    setName('');
    setEmail('');
    setSuggestion('');
  };

  return (
    <div className="w-full max-w-md p-4 relative z-10 overflow-x-hidden pt-6 flex flex-col items-center pb-24">
      {/* Header */}
      <header className="flex justify-center items-center mb-6 w-full">
        <div className="flex items-center gap-3 border-b-4 border-dashed border-[#B854FF] pb-2">
          <MessageCircle className="text-[#B854FF]" size={24} strokeWidth={3} />
          <h1 className="text-xl font-black uppercase tracking-widest text-[#B854FF] drop-shadow-[2px_2px_0_#000]">
            Fale com o Duende
          </h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full bg-[#1A1D24] border-4 border-[#0D0F14] rounded-2xl p-4 shadow-[6px_6px_0_0_#000] transform rotate-1 mb-8 relative">
        {/* Tape highlight piece */}
        <div className="absolute -top-3 -left-3 w-16 h-5 bg-[#B854FF]/80 backdrop-blur-sm -rotate-6 z-10 shadow-sm" />

        <p className="text-gray-300 text-[10px] font-bold uppercase tracking-wider mb-4 text-center">
          Tem uma "barbada"? Manda pro Chicão analisar (e provavelmente perder tudo)!
        </p>

        <div className="space-y-3">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Seu Nome" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0D0F14] border-2 border-[#4A4E58] rounded-xl py-2 pl-10 pr-3 text-white font-mono text-sm focus:border-[#B854FF] focus:outline-none transition-colors placeholder:text-gray-600"
              required
            />
          </div>

          <div className="relative">
            <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="email" 
              placeholder="Seu E-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0D0F14] border-2 border-[#4A4E58] rounded-xl py-2 pl-10 pr-3 text-white font-mono text-sm focus:border-[#B854FF] focus:outline-none transition-colors placeholder:text-gray-600"
              required
            />
          </div>

          <div className="relative">
            <Lightbulb size={16} className="absolute left-3 top-3 text-gray-500" />
            <textarea 
              placeholder="Qual a boa de hoje?" 
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full bg-[#0D0F14] border-2 border-[#4A4E58] rounded-xl py-2 pl-10 pr-3 text-white font-mono text-sm focus:border-[#B854FF] focus:outline-none transition-colors placeholder:text-gray-600 min-h-[80px] resize-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#B854FF] text-black font-black uppercase tracking-widest py-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2 mt-2"
          >
            <Send size={18} strokeWidth={3} />
            Mandar Palpite
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4 border-b-2 border-dashed border-[#4A4E58] pb-3">
          <MessageSquare size={18} className="text-[#B854FF]" />
          <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Conselhos Duvidosos
          </h2>
        </div>

        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div 
              key={comment.id}
              className={`bg-[#1A1D24] border-4 border-[#0D0F14] rounded-xl p-3 shadow-[4px_4px_0_0_#000] relative transform transition-transform hover:scale-[1.02] ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[#B854FF] font-black text-[11px] uppercase tracking-wider">{comment.name}</h3>
                  <p className="text-gray-500 text-[9px] font-bold tracking-widest">{comment.email}</p>
                </div>
                <span className="text-gray-500 text-[8px] uppercase tracking-widest bg-[#0D0F14] px-2 py-1 rounded border border-[#0D0F14]/50">
                  {comment.date}
                </span>
              </div>
              
              <div className="bg-[#0D0F14] p-3 rounded-lg border-2 border-[#4A4E58] relative mt-2">
                <p className="text-white text-xs font-bold leading-relaxed">
                  "{comment.suggestion}"
                </p>
                {/* Tail for chat bubble vibe */}
                <div className="absolute -top-2 left-4 w-4 h-4 bg-[#0D0F14] border-t-2 border-l-2 border-[#4A4E58] transform rotate-45" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
