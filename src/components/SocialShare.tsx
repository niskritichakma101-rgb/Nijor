import React, { useState } from 'react';
import { Facebook, Twitter, Send, Share2, Copy, Check, Printer, MessageCircle, MessageSquare } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url?: string;
  image?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ title, url, image }) => {
  const [copied, setCopied] = useState(false);
  const [copiedBypass, setCopiedBypass] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Normalize share URL: If on localhost or internal preview, always use the public live Netlify domain so Facebook/Messenger scraper can crawl it!
  const getShareUrl = (bypassCache = false) => {
    let base = url;
    if (!base && typeof window !== 'undefined') {
      const origin = window.location.origin;
      const isInternal = origin.includes('localhost') || origin.includes('run.app') || origin.includes('127.0.0.1');
      const publicOrigin = isInternal ? 'https://nijornews.netlify.app' : origin;
      base = `${publicOrigin}${window.location.pathname}`;
    } else if (base && (base.includes('localhost') || base.includes('run.app') || base.includes('127.0.0.1'))) {
      base = base.replace(/^https?:\/\/[^\/]+/, 'https://nijornews.netlify.app');
    }
    if (!base) base = 'https://nijornews.netlify.app';

    if (bypassCache) {
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}fb=${Date.now().toString().slice(-4)}`;
    }
    return base;
  };

  const effectiveUrl = getShareUrl(false);
  const bypassUrl = getShareUrl(true);
  const encodedUrl = encodeURIComponent(effectiveUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveUrl).then(() => {
      setCopied(true);
      setCopyNotice('ক্লিন লিংক কপি হয়েছে! মেসেঞ্জার বা ফেসবুকে পেস্ট করুন।');
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setCopyNotice(null), 5000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyBypass = () => {
    navigator.clipboard.writeText(bypassUrl).then(() => {
      setCopiedBypass(true);
      setCopyNotice('🚀 ক্যাশ-বাইপাস লিংক কপি হয়েছে! ফেসবুকে পূর্বে শেয়ার করা হলেও এখন তাৎক্ষণিক নতুন ছবি ও টাইটেল আসবে।');
      setTimeout(() => setCopiedBypass(false), 2500);
      setTimeout(() => setCopyNotice(null), 6000);
    }).catch(() => {
      setCopiedBypass(true);
      setTimeout(() => setCopiedBypass(false), 2000);
    });
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=500');
  };

  const shareMessenger = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    handleCopy();
    if (isMobile) {
      window.location.href = `fb-messenger://share?link=${encodedUrl}`;
    } else {
      // On desktop, open Messenger web or Facebook Sharer which supports Send in Messenger
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=500');
    }
  };

  const openFbDebugger = () => {
    window.open(`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(effectiveUrl)}`, '_blank');
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
    <div className="py-4 border-y border-slate-200 my-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mr-1">
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
          title="অফিসিয়াল নিউজ লিংক কপি করুন"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'কপি সম্পন্ন!' : 'লিংক কপি'}
        </button>

        {/* Bypass Cache Copy Button */}
        <button 
          onClick={handleCopyBypass}
          className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer border ${copiedBypass ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-50/70 hover:bg-amber-100 text-amber-900 border-amber-200'}`}
          title="ফেসবুক ক্যাশ বাইপাস ফ্রেশ লিংক (যদি ফেসবুকে পূর্বে পুরনো প্রিভিউ এসে থাকে)"
        >
          <span>⚡</span>
          <span>{copiedBypass ? 'ফ্রেশ লিংক কপি!' : 'ক্যাশ-মুক্ত লিংক'}</span>
        </button>

        {/* Facebook Debugger Tool Button */}
        <button 
          onClick={openFbDebugger}
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
          title="ফেসবুক শেয়ারিং ডিবাগার (Facebook Scraper Test & Re-scrape)"
        >
          <Facebook className="w-3 h-3 text-blue-600" />
          <span>প্রিভিউ টেস্ট</span>
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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-bold">{copyNotice}</p>
            <p className="font-mono text-[11px] text-emerald-700 break-all select-all">{effectiveUrl}</p>
            <p className="text-[10px] text-slate-500">
              💡 ফেসবুক বা মেসেঞ্জারে প্রথমবার পেস্ট করার সময় ফেসবুক স্ক্র্যাপার স্বয়ংক্রিয়ভাবে ফিচার্ড ছবি ও শিরোনাম ক্যাশ করে নেয়।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
