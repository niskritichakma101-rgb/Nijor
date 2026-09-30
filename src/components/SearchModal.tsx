import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { Search, X, Eye, Clock, MapPin } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { articles, navigateToArticle } = useNews();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim() === '' ? [] : articles.filter(art => 
    art.title.toLowerCase().includes(query.toLowerCase()) ||
    art.excerpt.toLowerCase().includes(query.toLowerCase()) ||
    art.category.toLowerCase().includes(query.toLowerCase()) ||
    (art.district && art.district.toLowerCase().includes(query.toLowerCase())) ||
    art.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="খবর, জেলা, ক্যাটাগরি বা ট্যাগ দিয়ে খুঁজুন..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-hidden text-base"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[420px] overflow-y-auto p-4 divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              অনুসন্ধান করতে যেকোনো শব্দ লিখুন। যেমন: <span className="text-emerald-700 font-semibold cursor-pointer" onClick={() => setQuery('রাঙামাটি')}>রাঙামাটি</span>, <span className="text-emerald-700 font-semibold cursor-pointer" onClick={() => setQuery('কাপ্তাই')}>কাপ্তাই</span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              দুঃখিত! "{query}" সম্পর্কিত কোনো সংবাদ পাওয়া যায়নি।
            </div>
          ) : (
            results.map(art => (
              <div 
                key={art.id}
                onClick={() => {
                  navigateToArticle(art.id);
                  onClose();
                }}
                className="group cursor-pointer py-3.5 hover:bg-emerald-50/50 px-3 rounded-lg transition flex gap-3 items-start"
              >
                <img src={art.image} alt={art.title} className="w-20 h-16 object-cover rounded shrink-0 bg-slate-100" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    {art.district && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {art.district}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">{art.publishedAt}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm md:text-base text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                    {art.title}
                  </h4>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
          <span>মোট ফলাফল: {results.length} টি</span>
          <span>বন্ধ করতে ESC বা X চাপুন</span>
        </div>

      </div>
    </div>
  );
};
