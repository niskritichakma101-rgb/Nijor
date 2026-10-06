import React from 'react';
import { useNews } from '../context/NewsContext';
import { Facebook, Youtube, Twitter, Send, MapPin, Phone, Mail, Globe, Shield } from 'lucide-react';
import { AdSlot } from './AdSlot';

export const Footer: React.FC = () => {
  const { settings, categories, districts, navigateToCategory, navigateToDistrict, navigateToPage, navigateToHome } = useNews();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t-4 border-emerald-600">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Footer Ad Slot */}
        <div className="mb-10">
          <AdSlot position="footer" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={navigateToHome}>
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteName || "NIJOR NEWS"} 
                  className="h-10 w-auto object-contain rounded-md animate-in fade-in" 
                />
              ) : (
                <div className="bg-emerald-600 text-white font-serif font-bold text-2xl px-3 py-1 rounded">
                  নিজোর
                </div>
              )}
              <span className="text-xl font-bold font-serif text-white">
                নিজোর নিউজ <span className="text-emerald-400 font-sans text-xs">| NIJOR NEWS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              পার্বত্য চট্টগ্রাম (রাঙামাটি, খাগড়াছড়ি, বান্দরবান), চট্টগ্রাম এবং বাংলাদেশের নির্ভরযোগ্য স্বাধীন ডিজিটাল সংবাদ মাধ্যম। সত্যের সন্ধানে পাহাড়ে ও সমতলে।
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-white mb-2">আমাদের সাথে যুক্ত থাকুন:</p>
              <div className="flex items-center gap-2">
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-emerald-600 flex items-center justify-center text-white transition">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={settings.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-red-600 flex items-center justify-center text-white transition">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href={settings.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-sky-500 flex items-center justify-center text-white transition">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href={settings.telegram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-blue-500 flex items-center justify-center text-white transition">
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Districts & Hill Tracts */}
          <div>
            <h3 className="font-serif font-bold text-base text-white mb-4 border-b border-emerald-600 pb-2 inline-block">
              পার্বত্য অঞ্চল
            </h3>
            <ul className="space-y-2 text-xs">
              {districts.map(d => (
                <li key={d.id}>
                  <button onClick={() => navigateToDistrict(d.slug)} className="hover:text-emerald-400 transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {d.name} জেলা সংবাদ
                  </button>
                </li>
              ))}
              <li><button onClick={() => navigateToCategory('hill-tracts')} className="hover:text-emerald-400 transition flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>পার্বত্য চট্টগ্রাম সমগ্র</button></li>
              <li><button onClick={() => navigateToCategory('chittagong')} className="hover:text-emerald-400 transition flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>চট্টগ্রাম মহানগরী</button></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h3 className="font-serif font-bold text-base text-white mb-4 border-b border-emerald-600 pb-2 inline-block">
              প্রধান বিভাগসমূহ
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {categories.slice(0, 8).map(c => (
                <li key={c.id}>
                  <button onClick={() => navigateToCategory(c.slug)} className="hover:text-emerald-400 transition">
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Important Links & Contact */}
          <div>
            <h3 className="font-serif font-bold text-base text-white mb-4 border-b border-emerald-600 pb-2 inline-block">
              জরুরি লিংক ও যোগাযোগ
            </h3>
            <ul className="space-y-2 text-xs mb-4">
              <li><button onClick={() => navigateToPage('about-us')} className="hover:text-emerald-400 transition">আমাদের সম্পর্কে</button></li>
              <li><button onClick={() => navigateToPage('contact-us')} className="hover:text-emerald-400 transition">যোগাযোগ</button></li>
              <li><button onClick={() => navigateToPage('privacy-policy')} className="hover:text-emerald-400 transition">গোপনীয়তা নীতি</button></li>
              <li><button onClick={() => navigateToPage('terms-and-conditions')} className="hover:text-emerald-400 transition">শর্তাবলী</button></li>
              <li><button onClick={() => navigateToPage('editorial-policy')} className="hover:text-emerald-400 transition">সম্পাদকীয় নীতি</button></li>
            </ul>
            <div className="text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-400" /> {settings.email}</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {settings.phone}</p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>{settings.footerText}</p>
        </div>

        {settings.customHtmlFooter && (
          <div className="mt-4 border-t border-slate-800 pt-4" dangerouslySetInnerHTML={{ __html: settings.customHtmlFooter }} />
        )}

      </div>
    </footer>
  );
};
