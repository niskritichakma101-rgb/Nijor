import React from 'react';
import { useNews } from '../context/NewsContext';
import { ArrowLeft, FileText } from 'lucide-react';

export const StaticPageView: React.FC = () => {
  const { staticPages, selectedPageSlug, navigateToHome } = useNews();
  
  const page = staticPages.find(p => p.slug === selectedPageSlug) || staticPages[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={navigateToHome} className="hover:text-emerald-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> হোম
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-800">{page.title}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
          <div className="bg-emerald-100 text-emerald-800 p-3 rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-black text-slate-900">{page.title}</h1>
            <p className="text-xs text-slate-500 mt-1">সর্বশেষ আপডেট: {page.updatedAt}</p>
          </div>
        </div>

        <div 
          className="prose prose-slate max-w-none text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-line font-sans"
          dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }}
        />
      </div>
    </div>
  );
};
