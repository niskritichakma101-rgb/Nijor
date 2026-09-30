import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { NewsCard } from '../components/NewsCard';
import { Search, ArrowLeft } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { articles, searchQuery, navigateToHome } = useNews();
  const [query, setQuery] = useState(searchQuery);

  const results = query.trim() === '' ? articles : articles.filter(art => 
    art.title.toLowerCase().includes(query.toLowerCase()) ||
    art.excerpt.toLowerCase().includes(query.toLowerCase()) ||
    art.category.toLowerCase().includes(query.toLowerCase()) ||
    (art.district && art.district.toLowerCase().includes(query.toLowerCase())) ||
    art.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={navigateToHome} className="hover:text-emerald-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> হোম
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-800">অনুসন্ধান ফলাফল</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-emerald-700" />
          <h1 className="text-2xl font-serif font-bold text-slate-900">সংবাদ অনুসন্ধান</h1>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="কীওয়ার্ড দিয়ে খুঁজুন..." 
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <p className="text-xs text-slate-500">"{query}" এর জন্য মোট {results.length} টি ফলাফল পাওয়া গেছে।</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(art => (
          <NewsCard key={art.id} article={art} variant="vertical" />
        ))}
      </div>
    </div>
  );
};
