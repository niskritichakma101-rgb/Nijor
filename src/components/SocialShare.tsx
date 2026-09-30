import React, { useState } from 'react';
import { Facebook, Twitter, Send, Share2, Copy, Check, Printer } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ title, url = window.location.href }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  const shareMessenger = () => {
    window.open(`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`, '_blank');
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-4 border-y border-slate-200 my-6">
      <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mr-2">
        <Share2 className="w-4 h-4 text-emerald-600" /> শেয়ার করুন:
      </span>

      <button 
        onClick={shareFacebook}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        title="ફેसबुक"
      >
        <Facebook className="w-3.5 h-3.5" /> ফেসবুক
      </button>

      <button 
        onClick={shareWhatsApp}
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        title="হোয়াটসঅ্যাপ"
      >
        <Send className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপ
      </button>

      <button 
        onClick={shareTwitter}
        className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        title="টুইটার / এক্স"
      >
        <Twitter className="w-3.5 h-3.5" /> এক্স
      </button>

      <button 
        onClick={shareTelegram}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        title="টেলিগ্রাম"
      >
        <Send className="w-3.5 h-3.5" /> টেলিগ্রাম
      </button>

      <button 
        onClick={handleCopy}
        className="bg-slate-200 hover:bg-slate-300 text-slate-800 p-2 rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        title="লিংক কপি করুন"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'কপি হয়েছে!' : 'লিংক কপি'}
      </button>

      <button 
        onClick={handlePrint}
        className="bg-slate-700 hover:bg-slate-800 text-white p-2 rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-xs ml-auto"
        title="প্রিন্ট করুন"
      >
        <Printer className="w-3.5 h-3.5" /> প্রিন্ট
      </button>
    </div>
  );
};
