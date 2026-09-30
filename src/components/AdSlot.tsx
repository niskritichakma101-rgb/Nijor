import React from 'react';
import { useNews } from '../context/NewsContext';

interface AdSlotProps {
  position: 'header' | 'homepage_top' | 'between_news' | 'sidebar' | 'article_top' | 'article_middle' | 'article_bottom' | 'footer' | 'mobile_sticky' | 'desktop_sticky' | 'popup_popunder' | 'in_article' | 'social_bar' | 'mobile';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ position, className = '' }) => {
  const { advertisements, trackAdClick } = useNews();
  const ad = advertisements.find(a => a.position === position && a.active);

  if (!ad) {
    return (
      <div className={`border border-dashed border-slate-300 bg-slate-50 p-4 text-center rounded text-slate-400 text-xs ${className}`}>
        <span>বিজ্ঞাপন স্পেস ({position})</span>
      </div>
    );
  }

  if (ad.type === 'banner' && ad.imageUrl) {
    return (
      <div className={`overflow-hidden rounded-lg shadow-xs ${className}`}>
        <a 
          href={ad.targetUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={() => trackAdClick(ad.id)}
          className="block group relative"
        >
          <img src={ad.imageUrl} alt={ad.name} className="w-full h-auto object-cover rounded-lg group-hover:opacity-95 transition" />
          <span className="absolute bottom-1 right-1 bg-slate-900/70 text-white text-[9px] px-1.5 py-0.5 rounded font-sans">স্পন্সরড</span>
        </a>
      </div>
    );
  }

  return (
    <div 
      onClick={() => trackAdClick(ad.id)} 
      className={`overflow-hidden ${className}`} 
      dangerouslySetInnerHTML={{ __html: ad.adCode || '' }} 
    />
  );
};
