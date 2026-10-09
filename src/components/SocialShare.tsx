import React, { useState } from 'react';
import { Facebook, Twitter, Send, Share2, Copy, Check, Printer, MessageCircle, MessageSquare } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url?: string;
  image?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ title, url, image }) => {
  const [copied, setCopied] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);

  // Determine effective share URL: prefer live Netlify domain if in localhost, or use current origin
  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // If running on netlify live or production domain
      return `${origin}${window.location.pathname}`;
    }
    return 'https://nijornews.netlify.app';
  };

  const effectiveUrl = getShareUrl();
  const encodedUrl = encodeURIComponent(effectiveUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveUrl).then(() => {
      setCopied(true);
      setCopyNotice(true);
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setCopyNotice(false), 4000);
    }).catch(() => {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=500');
  };

  const shareMessenger = () => {
    // Try mobile messenger deep link or web send dialog
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `fb-messenger://share/?link=${encodedUrl}&app_id=291494419107518`;
      setTimeout(() => {
        window.open(`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`, '_blank');
      }, 500);
    } else {
      window.open(`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`, '_blank', 'width=600,height=500');
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%0A${encodedUrl}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank', 'width=600,height=450');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-4 border-y border-slate-200 my-6 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mr-2">
          <Share2 className="w-4 h-4 text-emerald-600" /> শেয়ার করুন:
        </span>

        {/* Facebook */}
        <button 
          onClick={shareFacebook}
          className="bg-[#1877F2] hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          title="ফেসবুকে শেয়ার করুন"
        >
          <Facebook className="w-3.5 h-3.5 fill-current" /> ফেসবুক
        </button>

        {/* Messenger */}
        <button 
          onClick={shareMessenger}
          className="bg-gradient-to-r from-[#00B2FE] via-[#006AFF] to-[#9900FF] hover:opacity-95 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          title="মেসেঞ্জারে পাঠান"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" /> মেসেঞ্জার
        </button>

        {/* WhatsApp */}
        <button 
          onClick={shareWhatsApp}
          className="bg-[#25D366] hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          title="হোয়াটসঅ্যাপে শেয়ার করুন"
        >
          <Send className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপ
        </button>

        {/* Twitter / X */}
        <button 
          onClick={shareTwitter}
          className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          title="টুইটার / এক্স-এ পোস্ট করুন"
        >
          <Twitter className="w-3.5 h-3.5" /> এক্স
        </button>

        {/* Telegram */}
        <button 
          onClick={shareTelegram}
          className="bg-[#229ED9] hover:bg-sky-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          title="টেলিগ্রামে পাঠান"
        >
          <Send className="w-3.5 h-3.5" /> টেলিগ্রাম
        </button>

        {/* Copy Link Button */}
        <button 
          onClick={handleCopy}
          className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer border ${copied ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'}`}
          title="নিউজ লিংক কপি করুন"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'কপি সম্পন্ন!' : 'লিংক কপি'}
        </button>

        {/* Print Button */}
        <button 
          onClick={handlePrint}
          className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ml-auto cursor-pointer"
          title="সংবাদটি প্রিন্ট করুন"
        >
          <Printer className="w-3.5 h-3.5" /> প্রিন্ট
        </button>
      </div>

      {copyNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-2.5 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>লিংক কপি হয়েছে!</strong> ফেসবুক, মেসেঞ্জার বা হোয়াটসঅ্যাপে পেস্ট করলে সংবাদের <strong>ফিচার্ড ছবি</strong> ও <strong>নিউজ টাইটেল</strong> স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 truncate max-w-xs">{effectiveUrl}</span>
        </div>
      )}
    </div>
  );
};
