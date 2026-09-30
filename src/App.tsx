/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NewsProvider, useNews } from './context/NewsContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { BreakingTicker } from './components/BreakingTicker';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { DistrictPage } from './pages/DistrictPage';
import { StaticPageView } from './pages/StaticPageView';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { X, Home, MapPin, Shield, LogOut } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentView, currentUser, logoutUser, navigateToHome, navigateToCategory, navigateToDistrict, navigateToAdmin, categories, districts } = useNews();
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If viewing admin dashboard
  if (currentView === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white font-sans">
      
      {/* Header */}
      <Header 
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Breaking News Ticker */}
      <BreakingTicker />

      {/* Main Navbar */}
      <Navbar 
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Router View Switcher */}
      <div className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'article' && <ArticleDetailPage />}
        {currentView === 'category' && <CategoryPage />}
        {currentView === 'district' && <DistrictPage />}
        {currentView === 'page' && <StaticPageView />}
        {currentView === 'search' && <SearchPage />}
        {currentView === 'library' && <LibraryPage />}
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-80 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-700 text-white font-serif font-bold text-lg px-2.5 py-1 rounded">
                    নিজোর
                  </div>
                  <span className="font-bold font-serif text-lg">নিজোর নিউজ</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="w-6 h-6 text-slate-700" />
                </button>
              </div>

              {currentUser && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-emerald-900">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-700 uppercase">{currentUser.role}</p>
                  </div>
                  <button onClick={() => { navigateToAdmin(); setMobileMenuOpen(false); }} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold">
                    ড্যাশবোর্ড
                  </button>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">পাহাড়ি জেলা পোর্টাল</p>
                <div className="space-y-1">
                  {districts.map(d => (
                    <button
                      key={d.id}
                      onClick={() => { navigateToDistrict(d.slug); setMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-800 transition flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-amber-600" /> {d.name} জেলা
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">সকল বিভাগ</p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { navigateToCategory(c.slug); setMobileMenuOpen(false); }}
                      className="text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              {currentUser ? (
                <button 
                  onClick={() => { logoutUser(); setMobileMenuOpen(false); }}
                  className="w-full bg-red-100 text-red-700 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> লগআউট করুন
                </button>
              ) : (
                <button 
                  onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}
                  className="w-full bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" /> স্টাফ লগইন
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <NewsProvider>
      <MainApp />
    </NewsProvider>
  );
}
