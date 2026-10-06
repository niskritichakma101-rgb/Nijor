import React from 'react';
import { useNews } from '../context/NewsContext';
import { Flame, ArrowRight } from 'lucide-react';

export const BreakingTicker: React.FC = () => {
  const { breakingNews } = useNews();
  const activeItems = breakingNews.filter(b => b.active);

  if (activeItems.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-950 via-red-800 to-red-950 text-white py-2 px-4 shadow-md overflow-hidden border-y border-red-900/60">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        
        {/* Modern ultra-premium angled gradient badge with pulsing neon broadcast indicator */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white font-serif font-black px-4 py-1.5 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.7)] border-2 border-amber-300 select-none relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          {/* Subtle golden shine reflection sweep animation */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-150%] animate-[pulse_1.5s_infinite]"></div>
          
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-white opacity-50"></span>
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-200 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_10px_rgba(255,255,255,1)]"></span>
          </div>
          
          <div className="bg-white/20 p-1 rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.4)] animate-[bounce_2s_infinite]">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
          </div>
          
          <span className="text-xs tracking-wider uppercase font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
            ব্রেকিং নিউজ
          </span>
        </div>

        <div className="relative overflow-hidden w-full flex items-center">
          <div className="animate-ticker flex space-x-12 text-xs sm:text-sm font-bold text-slate-50">
            {activeItems.map((item) => (
              <span 
                key={item.id} 
                className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                onClick={() => {
                  if (item.link) {
                    window.location.href = item.link;
                  }
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs"></span>
                {item.text}
                <ArrowRight className="w-3.5 h-3.5 text-amber-300 opacity-80" />
              </span>
            ))}
            {/* Duplicate for infinite feel */}
            {activeItems.map((item) => (
              <span 
                key={`dup-${item.id}`} 
                className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                onClick={() => {
                  if (item.link) {
                    window.location.href = item.link;
                  }
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs"></span>
                {item.text}
                <ArrowRight className="w-3.5 h-3.5 text-amber-300 opacity-80" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
