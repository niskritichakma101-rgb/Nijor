import React from 'react';
import { useNews } from '../context/NewsContext';
import { NewsCard } from '../components/NewsCard';
import { AdSlot } from '../components/AdSlot';
import { PollWidget } from '../components/PollWidget';
import { Flame, TrendingUp, MapPin, Sparkles, ChevronRight, Award } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { articles, districts, navigateToCategory, navigateToDistrict, navigateToArticle } = useNews();

  // Filter articles by section
  const leadArticle = articles.find(a => a.isLead) || articles[0];
  const featuredArticles = articles.filter(a => a.isFeatured && a.id !== leadArticle?.id).slice(0, 4);
  const latestArticles = articles.slice(0, 8);
  const mostReadArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  // District specific
  const rangamatiArticles = articles.filter(a => a.district === 'রাঙামাটি').slice(0, 4);
  const khagrachhariArticles = articles.filter(a => a.district === 'খাগড়াছড়ি').slice(0, 4);
  const bandarbanArticles = articles.filter(a => a.district === 'বান্দরবান').slice(0, 4);

  // Categories
  const educationArticles = articles.filter(a => a.category === 'শিক্ষা').slice(0, 3);
  const sportsArticles = articles.filter(a => a.category === 'খেলাধুলা').slice(0, 3);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero & Lead Section */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Lead News (2 Columns) */}
          <div className="lg:col-span-2">
            {leadArticle && <NewsCard article={leadArticle} variant="hero" />}
          </div>

          {/* Most Read / Sidebar Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b-2 border-emerald-700">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">সর্বাধিক পঠিত</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {mostReadArticles.map((art, idx) => (
                    <div 
                      key={art.id} 
                      onClick={() => navigateToArticle(art.id)}
                      className="group cursor-pointer py-3 flex gap-3 items-start hover:bg-emerald-50/40 px-2 rounded transition"
                    >
                      <span className="font-serif font-bold text-xl text-emerald-700 w-6 shrink-0">
                        ০{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mb-1 inline-block">
                          {art.category}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                          {art.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <AdSlot position="sidebar" />
              </div>
            </div>

            {/* Poll Widget */}
            <PollWidget />
          </div>

        </div>
      </section>

      {/* Featured News Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-bold text-xl text-slate-900">বিশেষ সংবাদ ও প্রতিবেদন</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArticles.map(art => (
            <NewsCard key={art.id} article={art} variant="vertical" />
          ))}
        </div>
      </section>

      {/* Hill Tracts Districts Special Focus Section (Rangamati, Khagrachhari, Bandarban) */}
      <section className="bg-emerald-900/5 py-10 border-y border-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          
          {/* Rangamati Section */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-emerald-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h2 className="font-serif font-bold text-xl text-slate-900">রাঙামাটি জেলা সংবাদ</h2>
              </div>
              <button 
                onClick={() => navigateToDistrict('rangamati')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                সব খবর <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rangamatiArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="vertical" />
              ))}
            </div>
          </div>

          {/* Khagrachhari & Bandarban Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Khagrachhari */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-amber-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <h2 className="font-serif font-bold text-xl text-slate-900">খাগড়াছড়ি জেলা সংবাদ</h2>
                </div>
                <button 
                  onClick={() => navigateToDistrict('khagrachhari')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  সব খবর <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {khagrachhariArticles.map(art => (
                  <NewsCard key={art.id} article={art} variant="horizontal" />
                ))}
              </div>
            </div>

            {/* Bandarban */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-teal-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <h2 className="font-serif font-bold text-xl text-slate-900">বান্দরবান জেলা সংবাদ</h2>
                </div>
                <button 
                  onClick={() => navigateToDistrict('bandarban')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  সব খবর <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {bandarbanArticles.map(art => (
                  <NewsCard key={art.id} article={art} variant="horizontal" />
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* In-Article / Mid Banner Ad */}
      <section className="max-w-7xl mx-auto px-4">
        <AdSlot position="in_article" />
      </section>

      {/* Latest News & Education / Sports Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Latest News (2 Cols) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-slate-800">
              <h2 className="font-serif font-bold text-xl text-slate-900">সর্বশেষ সংবাদ</h2>
            </div>
            <div className="space-y-4">
              {latestArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="horizontal" />
              ))}
            </div>
          </div>

          {/* Education & Sports Sidebar */}
          <div className="space-y-8">
            {/* Education */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <h3 className="font-serif font-bold text-base text-slate-900">শিক্ষা ও গবেষণা</h3>
                <button onClick={() => navigateToCategory('শিক্ষা')} className="text-xs text-emerald-700 font-bold hover:underline">সব</button>
              </div>
              <div className="space-y-3">
                {educationArticles.map(art => (
                  <NewsCard key={art.id} article={art} variant="compact" />
                ))}
              </div>
            </div>

            {/* Sports */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <h3 className="font-serif font-bold text-base text-slate-900">খেলাধুলা</h3>
                <button onClick={() => navigateToCategory('খেলাধুলা')} className="text-xs text-emerald-700 font-bold hover:underline">সব</button>
              </div>
              <div className="space-y-3">
                {sportsArticles.map(art => (
                  <NewsCard key={art.id} article={art} variant="compact" />
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
