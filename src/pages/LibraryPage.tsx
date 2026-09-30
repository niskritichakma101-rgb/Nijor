import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { NewsCard } from '../components/NewsCard';
import { Folder, Image as ImageIcon, Video, FileText, ArrowLeft, Search, Filter, Calendar, MapPin, Tag } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const { articles, mediaLibrary, categories, districts, navigateToHome, navigateToArticle, navigateToCategory, navigateToDistrict } = useNews();
  const [tab, setTab] = useState<'all' | 'articles' | 'photos' | 'categories' | 'districts'>('all');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const filteredArticles = articles.filter(a => {
    const matchesQuery = a.title.toLowerCase().includes(query.toLowerCase()) || 
                         a.excerpt.toLowerCase().includes(query.toLowerCase()) ||
                         a.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchesCat = selectedCategory ? a.category === selectedCategory : true;
    const matchesDis = selectedDistrict ? a.district === selectedDistrict : true;
    return matchesQuery && matchesCat && matchesDis;
  });

  const filteredMedia = mediaLibrary.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={navigateToHome} className="hover:text-emerald-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> হোম
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-800">পোর্টাল ইউনিভার্সাল লাইব্রেরি</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 text-white p-8 md:p-10 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
              মাস্টার শর্টকাট ফাইন্ডার
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-black">ইউনিভার্সাল লাইব্রেরি ও আর্কাইভ</h1>
          <p className="text-emerald-200 text-sm mt-2 max-w-xl">পোর্টালে থাকা সমস্ত সংবাদ, ছবি, ক্যাটাগরি ও জেলা ডকুমেন্টস এক ক্লিকে খুঁজে পাওয়ার আধুনিক শর্টকাট।</p>
        </div>

        <div className="w-full md:w-96 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text" 
              placeholder="যেকোনো নথি, খবর বা ট্যাগ খুঁজুন..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white placeholder-slate-300 focus:outline-hidden focus:bg-white/20"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-700" /> ফিল্টার:
        </div>
        
        <select 
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 font-medium"
        >
          <option value="">সকল ক্যাটাগরি</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select 
          value={selectedDistrict} 
          onChange={e => setSelectedDistrict(e.target.value)}
          className="px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 font-medium"
        >
          <option value="">সকল পাহাড়ি জেলা</option>
          {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>

        {(selectedCategory || selectedDistrict || query) && (
          <button 
            onClick={() => { setSelectedCategory(''); setSelectedDistrict(''); setQuery(''); }}
            className="text-xs text-red-600 hover:underline font-semibold ml-auto"
          >
            ফিল্টার রিসেট করুন
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-6">
        <button 
          onClick={() => setTab('all')}
          className={`pb-3 font-serif font-bold text-sm transition border-b-2 ${tab === 'all' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          সকল নথিপত্র ({filteredArticles.length + filteredMedia.length})
        </button>
        <button 
          onClick={() => setTab('articles')}
          className={`pb-3 font-serif font-bold text-sm transition border-b-2 flex items-center gap-1.5 ${tab === 'articles' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          <FileText className="w-4 h-4" /> সংবাদ ডকুমেন্টস ({filteredArticles.length})
        </button>
        <button 
          onClick={() => setTab('photos')}
          className={`pb-3 font-serif font-bold text-sm transition border-b-2 flex items-center gap-1.5 ${tab === 'photos' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          <ImageIcon className="w-4 h-4" /> ছবি ও মিডিয়া ({filteredMedia.length})
        </button>
        <button 
          onClick={() => setTab('categories')}
          className={`pb-3 font-serif font-bold text-sm transition border-b-2 flex items-center gap-1.5 ${tab === 'categories' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          <Folder className="w-4 h-4" /> ক্যাটাগরি শর্টকাট ({categories.length})
        </button>
        <button 
          onClick={() => setTab('districts')}
          className={`pb-3 font-serif font-bold text-sm transition border-b-2 flex items-center gap-1.5 ${tab === 'districts' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          <MapPin className="w-4 h-4" /> জেলা পোর্টাল ({districts.length})
        </button>
      </div>

      {/* Main Results */}
      <div className="space-y-10">
        {(tab === 'all' || tab === 'articles') && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" /> সংবাদ পোস্ট ও আর্কাইভ
            </h3>
            {filteredArticles.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center bg-white rounded-xl border">কোনো সংবাদ পাওয়া যায়নি।</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(art => (
                  <NewsCard key={art.id} article={art} variant="vertical" />
                ))}
              </div>
            )}
          </div>
        )}

        {(tab === 'all' || tab === 'photos') && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-700" /> ছবি ও মিডিয়া লাইব্রেরি
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMedia.map(med => (
                <div key={med.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs group">
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img src={med.url} alt={med.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-serif font-bold text-sm text-slate-900 truncate mb-1">{med.title}</h4>
                    <p className="text-xs text-slate-400">আপলোড: {med.uploadedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === 'all' || tab === 'categories') && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
              <Folder className="w-5 h-5 text-emerald-700" /> ক্যাটাগরি শর্টকাট
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => navigateToCategory(cat.slug)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition cursor-pointer text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-bold">
                    {cat.name[0]}
                  </div>
                  <h4 className="font-serif font-bold text-sm text-slate-900">{cat.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{cat.description || 'খবর ও বিশ্লেষণ'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === 'all' || tab === 'districts') && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" /> পাহাড়ি জেলা পোর্টাল শর্টকাট
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {districts.map(dis => (
                <div 
                  key={dis.id} 
                  onClick={() => navigateToDistrict(dis.slug)}
                  className="bg-gradient-to-br from-amber-700 to-amber-900 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-300" />
                    <span className="text-xs uppercase tracking-wider bg-amber-600 px-2 py-0.5 rounded font-bold">জেলা পোর্টাল</span>
                  </div>
                  <h3 className="font-serif font-black text-2xl">{dis.name} জেলা</h3>
                  <p className="text-xs text-amber-100">{dis.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
