import React, { useEffect, useRef } from 'react';
import { useNews } from '../context/NewsContext';

interface AdSlotProps {
  position: 'header' | 'homepage_top' | 'between_news' | 'sidebar' | 'article_top' | 'article_middle' | 'article_bottom' | 'footer' | 'mobile_sticky' | 'desktop_sticky' | 'popup_popunder' | 'in_article' | 'social_bar' | 'mobile';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ position, className = '' }) => {
  const { advertisements, trackAdClick, settings } = useNews();
  const containerRef = useRef<HTMLDivElement>(null);
  const ad = advertisements.find(a => a.position === position && a.active);

  // If ads are globally disabled, return null
  if (settings && settings.adsEnabled === false) {
    return null;
  }

  useEffect(() => {
    if (!ad || ad.type === 'banner' || !containerRef.current) return;

    // Clear previous scripts/HTML
    containerRef.current.innerHTML = '';

    // Create a temporary container wrapper
    const wrapper = document.createElement('div');
    wrapper.innerHTML = ad.adCode || '';

    // Find all script elements
    const scripts = Array.from(wrapper.querySelectorAll('script'));

    // Extract HTML without scripts and append to slot
    const contentOnly = document.createElement('div');
    contentOnly.innerHTML = ad.adCode || '';
    contentOnly.querySelectorAll('script').forEach(s => s.remove());
    containerRef.current.appendChild(contentOnly);

    // Run scripts sequentially by inserting real DOM script elements
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      
      // Copy all attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy inline text content
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
      }

      // Append to the container element to trigger execution
      containerRef.current?.appendChild(newScript);
    });

  }, [ad]);

  if (!ad) {
    return (
      <div className={`border border-dashed border-slate-300 bg-slate-50 p-4 text-center rounded text-slate-400 text-xs ${className}`}>
        <span>বিজ্ঞাপন স্পেস ({position})</span>
      </div>
    );
  }

  // Optional: Apply size restrictions if ad.adSize is specified and is in format WxH (e.g. 728x90)
  let containerStyle: React.CSSProperties = {};
  if (ad && ad.adSize && ad.adSize.toLowerCase() !== 'responsive' && ad.adSize.includes('x')) {
    const [w, h] = ad.adSize.split('x').map(Number);
    if (!isNaN(w) && !isNaN(h)) {
      containerStyle = {
        maxWidth: `${w}px`,
        maxHeight: `${h}px`,
        width: '100%',
        height: 'auto',
        margin: '0 auto',
      };
    }
  }

  if (ad.type === 'banner' && ad.imageUrl) {
    return (
      <div className={`overflow-hidden rounded-lg shadow-xs ${className}`} style={containerStyle}>
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
      ref={containerRef}
      onClick={() => trackAdClick(ad.id)} 
      className={`overflow-hidden ${className}`} 
      style={containerStyle}
    />
  );
};
