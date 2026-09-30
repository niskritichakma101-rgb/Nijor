import React from 'react';
import { useNews } from '../context/NewsContext';
import { NewsCard } from '../components/NewsCard';
import { AdSlot } from '../components/AdSlot';
import { MapPin, ArrowLeft } from 'lucide-react';

export const DistrictPage: React.FC = () => {
  const { districts, articles, selectedDistrictSlug, navigateToHome } = useNews();
  
  const district = districts.find(d => d.slug === selectedDistrictSlug) || districts[0];
  const districtArticles = articles.filter(a => a.district === district?.name || a.district?.toLowerCase() === district?.slug.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={navigateToHome} className="hover:text-amber-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> হোম
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-800">জেলা সংবাদ</span>
      </div>

      {/* District Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> পার্বত্য জেলা পোর্টাল
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black">{district.name} জেলা</h1>
          {district.description && (
            <p className="text-amber-100 text-sm mt-2 max-w-2xl">{district.description}</p>
          )}
        </div>
        <div className="bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-amber-600">
          সংবাদ সংখ্যা: {districtArticles.length} টি
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Articles Grid (2 Cols) */}
        <div className="lg:col-span-2">
          {districtArticles.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
              {district.name} জেলার এই মুহূর্তে কোনো নতুন সংবাদ প্রকাশিত হয়নি।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {districtArticles.map(art => (
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
              অন্যান্য পাহাড়ি জেলা
            </h3>
            <div className="flex flex-col gap-2">
              {districts.map(d => (
                <button
                  key={d.id}
                  onClick={() => useNews().navigateToDistrict(d.slug)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${d.slug === selectedDistrictSlug ? 'bg-amber-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  <MapPin className="w-4 h-4" /> {d.name} জেলা পোর্টাল
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
