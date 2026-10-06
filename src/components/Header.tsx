import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { Search, Shield, User, LogOut, Menu, Facebook, Youtube, Twitter, Send, Globe, X } from 'lucide-react';
import { AdSlot } from './AdSlot';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAuth, onOpenMobileMenu }) => {
  const { settings, currentUser, logoutUser, navigateToHome, navigateToAdmin } = useNews();
  
  // Format current date in Bengali
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const dateStrBn = today.toLocaleDateString('bn-BD', options);

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs">
      {settings.customHtmlHeader && (
        <div dangerouslySetInnerHTML={{ __html: settings.customHtmlHeader }} />
      )}
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              পাহাড় ও সমতলের দর্পণ
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-300">{dateStrBn}</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden lg:inline text-amber-300 font-medium">রাঙামাটি: ২৮°C, রোদোজ্জ্বল</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a href={settings.facebook} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition" aria-label="Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href={settings.youtube} target="_blank" rel="noreferrer" className="hover:text-red-400 transition" aria-label="YouTube">
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a href={settings.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-400 transition" aria-label="Twitter">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href={settings.telegram} target="_blank" rel="noreferrer" className="hover:text-sky-400 transition" aria-label="Telegram">
                <Send className="w-3.5 h-3.5" />
              </a>
            </div>

            <span className="text-slate-600">|</span>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={navigateToAdmin}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                >
                  <Shield className="w-3 h-3" />
                  অ্যাডমিন ড্যাশবোর্ড
                </button>
                <span className="font-medium text-white">{currentUser.name}</span>
                <button 
                  onClick={logoutUser}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1"
                  title="লগআউট"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Branding & Header Banner Area */}
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="text-center md:text-left cursor-pointer animate-in fade-in" onClick={navigateToHome}>
          <div className="flex items-center justify-center md:justify-start gap-4">
            
            {/* Left Block: Image Logo (if uploaded) or Styled Text Box "নিজোর" */}
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.siteName || "নিজোর নিউজ"} 
                className="max-h-16 max-w-[180px] object-contain rounded-lg shadow-xs hover:opacity-95 transition shrink-0"
              />
            ) : (
              <div className="bg-emerald-700 text-white font-serif font-black text-3xl px-3.5 py-1.5 rounded-lg shadow-md tracking-wider shrink-0">
                নিজোর
              </div>
            )}

            {/* Right Block: Always shows the Site Name and Tagline */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-serif flex items-center flex-wrap gap-1.5">
                <span>নিজোর নিউজ</span>
                <span className="text-emerald-600 font-sans text-lg sm:text-xl font-bold">| NIJOR NEWS</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 font-bold mt-0.5 tracking-wide leading-relaxed max-w-md">
                {settings.siteSubtitle || 'পার্বত্য চট্টগ্রাম ও বাংলাদেশের প্রবাসীর বিশ্বস্ত সংবাদ মাধ্যম'}
              </p>
            </div>

          </div>
        </div>

        {/* Top Header Ad / Banner */}
        <div className="w-full md:w-[480px]">
          <AdSlot position="header" />
        </div>
      </div>
    </header>
  );
};
