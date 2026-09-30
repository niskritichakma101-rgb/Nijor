import React from 'react';
import { useNews } from '../context/NewsContext';
import { Flame, ArrowRight } from 'lucide-react';

export const BreakingTicker: React.FC = () => {
  const { breakingNews, navigateToArticle } = useNews();
  const activeItems = breakingNews.filter(b => b.active);

  if (activeItems.length === 0) return null;

  return (
    <div className="bg-red-700 text-white py-2 px-4 shadow-inner overflow-hidden border-y border-red-800">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1 bg-red-900 text-amber-200 font-bold px-3 py-1 rounded text-xs tracking-wider uppercase shrink-0 shadow-xs">
          <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          ব্রেকিং নিউজ
        </div>

        <div className="relative overflow-hidden w-full flex items-center">
          <div className="animate-ticker flex space-x-12 text-sm font-medium">
            {activeItems.map((item) => (
              <span 
                key={item.id} 
                className="cursor-pointer hover:underline flex items-center gap-2"
                onClick={() => {
                  if (item.link) {
                    window.location.href = item.link;
                  }
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {item.text}
                <ArrowRight className="w-3.5 h-3.5 text-amber-300 opacity-80" />
              </span>
            ))}
            {/* Duplicate for infinite feel */}
            {activeItems.map((item) => (
              <span 
                key={`dup-${item.id}`} 
                className="cursor-pointer hover:underline flex items-center gap-2"
                onClick={() => {
                  if (item.link) {
                    window.location.href = item.link;
                  }
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
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
