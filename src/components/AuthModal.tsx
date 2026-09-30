import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { Shield, Lock, Mail, X, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser } = useNews();
  const [email, setEmail] = useState('admin@nijornews.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginUser(email);
    if (success) {
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-emerald-800 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2.5 rounded-lg text-slate-950">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl">স্টাফ ও অ্যাডমিন পোর্টাল</h3>
              <p className="text-xs text-emerald-200 mt-0.5">নিজোর নিউজ নিউজ রুম ম্যানেজমেন্ট</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold border border-red-200">
              ইমেইল বা পাসওয়ার্ড সঠিক নয়। দয়া করে সঠিক তথ্য দিন।
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ইমেইল ঠিকানা</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                placeholder="admin@nijornews.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-700">ডেমো অ্যাকাউন্ট তথ্য:</p>
            <p>অ্যাডমিন ইমেইল: <span className="font-mono font-bold text-emerald-700">admin@nijornews.com</span></p>
            <p>পাসওয়ার্ড: যেকোনো পাসওয়ার্ড দিন</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg transition shadow-md flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" /> লগইন করুন
          </button>
        </form>

      </div>
    </div>
  );
};
