import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { Shield, Mail, Lock, X, LogIn } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser } = useNews();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    // Run login handler
    setTimeout(() => {
      const res = loginUser(email, password);
      setLoading(false);
      if (res.success) {
        setSuccess(true);
        // Automatically close modal on success
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || 'ভুল ইমেইল অথবা পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    }, 500); // realistic check duration
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 text-xs text-slate-800">
        
        {/* Header */}
        <div className="bg-emerald-800 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2.5 rounded-lg text-slate-950 shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">স্টাফ লগইন প্যানেল</h3>
              <p className="text-[10px] text-emerald-200 mt-0.5 uppercase tracking-wider font-sans font-bold">Nijor News Secure Authentication</p>
            </div>
          </div>
        </div>

        {success ? (
          /* Success Animation */
          <div className="p-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-xl">✔️</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-black text-slate-900 text-base">সফলভাবে লগইন হয়েছে!</h4>
              <p className="text-slate-500 text-[11px]">আপনাকে স্টাফ প্যানেলে রিডাইরেক্ট করা হচ্ছে...</p>
            </div>
          </div>
        ) : (
          /* Secure Manual Login Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg font-bold border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="bg-slate-50 border p-3 rounded-lg text-slate-600 leading-relaxed space-y-1">
              <p className="font-bold text-slate-800">🔒 প্রবেশাধিকার নোটিশ (Notice):</p>
              <p>এটি নিজোর নিউজ পোর্টালের একটি সম্পূর্ণ সুরক্ষিত স্টাফ প্যানেল। আপনার অনুমোদিত প্রাতিষ্ঠানিক ইমেইল এবং পাসওয়ার্ড প্রদান করে সিস্টেমে প্রবেশ করুন।</p>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">আপনার স্টাফ ইমেইল</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrorMessage(''); }}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono text-xs font-bold"
                  placeholder="যেমন: editor@nijornews.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">নিরাপত্তা পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMessage(''); }}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono text-xs font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>যাচাই করা হচ্ছে...</>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> সিস্টেমে প্রবেশ করুন (Login)
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
