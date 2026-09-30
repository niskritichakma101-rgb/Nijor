import React from 'react';
import { useNews } from '../context/NewsContext';
import { NewsCard } from '../components/NewsCard';
import { AdSlot } from '../components/AdSlot';
import { Folder, ArrowLeft } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { categories, articles, selectedCategorySlug, navigateToHome } = useNews();
  
  const category = categories.find(c => c.slug === selectedCategorySlug) || categories[0];
  const categoryArticles = articles.filter(a => a.category === category?.name || a.category.toLowerCase() === category?.slug.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={navigateToHome} className="hover:text-emerald-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> হোম
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-800">ক্যাটাগরি</span>
      </div>

      {/* Category Header */}
      <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
              ক্যাটাগরি আর্কাইভ
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black">{category.name}</h1>
          {category.description && (
            <p className="text-emerald-200 text-sm mt-2 max-w-2xl">{category.description}</p>
          )}
        </div>
        <div className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-700">
          মোট সংবাদ: {categoryArticles.length} টি
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Articles Grid (2 Cols) */}
        <div className="lg:col-span-2">
          {categoryArticles.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
              এই ক্যাটাগরিতে বর্তমানে কোনো সংবাদ নেই।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categoryArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="vertical" />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AdSlot position="sidebar" />
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-serif font-bold text-base text-slate-900 mb-4 pb-2 border-b border-slate-200">
              অন্যান্য ক্যাটাগরি
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => useNews().navigateToCategory(c.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${c.slug === selectedCategorySlug ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
