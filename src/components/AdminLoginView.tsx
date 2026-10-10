import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { Shield, Lock, Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { loginUser, navigateToHome } = useNews();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('অনুগ্রহ করে আপনার ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন।');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = loginUser(email, password);
      setLoading(false);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'ভুল ইমেইল অথবা পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    }, 400);
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative selection:bg-emerald-600 selection:text-white"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(5, 150, 105, 0.15), transparent 70%), linear-gradient(rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.98)), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top Bar Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <button
          onClick={navigateToHome}
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> মূল ওয়েবসাইটে ফিরে যান
        </button>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
          https://nijornews.netlify.app/admin
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-6 border-b border-emerald-700/40 relative">
          <div className="flex items-center gap-3.5">
            <div className="bg-amber-400 p-3 rounded-xl text-slate-950 shadow-lg ring-2 ring-amber-300/40">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white font-serif font-black text-xs px-2 py-0.5 rounded">নিজোর</span>
                <h1 className="font-serif font-black text-xl text-white tracking-wide">এডমিন ও স্টাফ পোর্টাল</h1>
              </div>
              <p className="text-[11px] text-emerald-200 mt-1 font-sans">
                NIJOR NEWS • সুরক্ষিত প্রশাসনিক নিয়ন্ত্রণ কক্ষ
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 p-4 rounded-xl text-xs flex items-center gap-3 animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">লগইন সফল হয়েছে!</p>
                <p className="text-[11px] text-emerald-300">আপনাকে ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে...</p>
              </div>
            </div>
          )}

          {/* Secure Standard Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300">
                স্টাফ বা এডমিন ইমেইল (Staff Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="আপনার অনুমোদিত ইমেইল লিখুন"
                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="আপনার গোপন পাসওয়ার্ড লিখুন"
                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition duration-200 text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <span>যাচাই করা হচ্ছে...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>এডমিন প্যানেলে লগইন করুন</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              নিরাপত্তা নোটিশ:
            </p>
            <p className="text-[10px] leading-relaxed text-slate-400">
              শুধুমাত্র অনুমোদিত স্টাফ এবং এডমিনের প্রবেশাধিকার রয়েছে। আপনার নির্দিষ্ট পদবী অনুযায়ী সংশ্লিষ্ট ইমেইল ও পাসওয়ার্ড প্রদান করে প্রবেশ করুন।
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            নিরাপদ এনক্রিপশন ও ফায়ারবেস অথেন্টিকেশন দ্বারা সুরক্ষিত • নিজোর ডিজিটাল মিডিয়া
          </p>
        </div>

      </div>

    </div>
  );
};
