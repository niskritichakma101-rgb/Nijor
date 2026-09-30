import React from 'react';
import { Article } from '../types';
import { useNews } from '../context/NewsContext';
import { Eye, Clock, MapPin, Play, Image as ImageIcon } from 'lucide-react';

interface NewsCardProps {
  article: Article;
  variant?: 'hero' | 'horizontal' | 'vertical' | 'compact' | 'district' | 'photo' | 'video';
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'vertical' }) => {
  const { navigateToArticle, navigateToCategory, navigateToDistrict } = useNews();

  if (variant === 'hero') {
    return (
      <div 
        onClick={() => navigateToArticle(article.id)}
        className="group cursor-pointer relative rounded-xl overflow-hidden shadow-lg bg-slate-900 text-white flex flex-col justify-end h-[420px] md:h-[480px] transition transform hover:-translate-y-1"
      >
        <div className="absolute inset-0">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        <div className="relative p-6 md:p-8 z-10">
          <div className="flex items-center gap-2 mb-3">
            <span 
              onClick={(e) => { e.stopPropagation(); navigateToCategory(article.category); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded shadow"
            >
              {article.category}
            </span>
            {article.district && (
              <span 
                onClick={(e) => { e.stopPropagation(); navigateToDistrict(article.district || ''); }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow"
              >
                <MapPin className="w-3 h-3" />
                {article.district}
              </span>
            )}
            <span className="text-slate-300 text-xs ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.publishedAt}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight group-hover:text-emerald-300 transition mb-3">
            {article.title}
          </h2>

          <p className="text-slate-200 text-sm md:text-base line-clamp-2 font-light mb-4">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-305 pt-3 border-t border-slate-700/60">
            <span className="font-medium text-emerald-400">প্রতিবেদক: {article.reporterName}</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Eye className="w-3.5 h-3.5" /> {article.views} বার পঠিত
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div 
        onClick={() => navigateToArticle(article.id)}
        className="group cursor-pointer bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row gap-4 items-center"
      >
        <div className="w-full sm:w-48 h-32 shrink-0 rounded overflow-hidden bg-slate-100">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded">
              {article.category}
            </span>
            {article.district && (
              <span className="text-amber-700 font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded">
                {article.district}
              </span>
            )}
            <span className="text-slate-400 text-xs ml-auto">{article.publishedAt}</span>
          </div>
          <h3 className="font-serif font-bold text-base md:text-lg text-slate-900 group-hover:text-emerald-700 transition leading-snug mb-1.5">
            {article.title}
          </h3>
          <p className="text-slate-600 text-xs md:text-sm line-clamp-2 mb-2 font-light">
            {article.excerpt}
          </p>
          <div className="flex items-center text-xs text-slate-500">
            <span>{article.reporterName}</span>
            <span className="ml-auto flex items-center gap-1">
              <Eye className="w-3 h-3" /> {article.views}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        onClick={() => navigateToArticle(article.id)}
        className="group cursor-pointer py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 px-2 rounded transition"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            {article.category}
          </span>
          <span className="text-slate-400 text-xs ml-auto">{article.readTime}</span>
        </div>
        <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition leading-snug">
          {article.title}
        </h4>
      </div>
    );
  }

  // Default vertical card
  return (
    <div 
      onClick={() => navigateToArticle(article.id)}
      className="group cursor-pointer bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col h-full"
    >
      <div className="h-48 overflow-hidden bg-slate-100 relative">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="bg-emerald-700 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">
            {article.category}
          </span>
          {article.district && (
            <span className="bg-amber-500 text-slate-950 text-xs font-semibold px-2 py-0.5 rounded shadow">
              {article.district}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-emerald-700 transition leading-snug mb-2 flex-1">
          {article.title}
        </h3>
        <p className="text-slate-600 text-xs line-clamp-2 font-light mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 mt-auto">
          <span>{article.publishedAt}</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Eye className="w-3 h-3" /> {article.views}
          </span>
        </div>
      </div>
    </div>
  );
};
