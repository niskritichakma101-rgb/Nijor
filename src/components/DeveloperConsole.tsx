import React, { useState, useEffect } from 'react';
import { 
  Globe, Sliders, Monitor, FileText, Home, Newspaper, Folder, 
  Smartphone, LayoutDashboard, Megaphone, Search, Users, Code, 
  Phone, BarChart2, Shield, Zap, Database, Sparkles, RefreshCw, 
  Paperclip, ArrowRight, Upload, X, LogOut, CheckCircle2, Flame
} from 'lucide-react';
import { SiteSettings, User, Category } from '../types';

interface DeveloperConsoleProps {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  addCategory: (cat: { name: string; slug: string; description?: string }) => void;
  addBreakingNews: (item: { text: string; active: boolean; priority: number }) => void;
  updateStaticPage: (slug: string, content: string) => void;
  currentUser: User | null;
  addSecurityLog: (log: any) => void;
  categories: Category[];
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({
  settings, updateSettings, addCategory, addBreakingNews, updateStaticPage, currentUser, addSecurityLog, categories
}) => {
  const [settingsMainTab, setSettingsMainTab] = useState<'ai_dev' | 'site_dev'>('ai_dev');
  const [siteDevTab, setSiteDevTab] = useState<string>('GENERAL');
  
  // AI Developer States
  const [settingsAiLoading, setSettingsAiLoading] = useState(false);
  const [settingsAiPrompt, setSettingsAiPrompt] = useState('');
  const [settingsAiFile, setSettingsAiFile] = useState<string>('');
  const [settingsAiFileMime, setSettingsAiFileMime] = useState<string>('');
  const [settingsAiFileName, setSettingsAiFileName] = useState<string>('');
  
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiPreviousSettings, setAiPreviousSettings] = useState<any | null>(null);
  const [aiConsoleError, setAiConsoleError] = useState<string>('');
  const [aiShowConfirmation, setAiShowConfirmation] = useState<boolean>(false);
  const [aiChangeHistory, setAiChangeHistory] = useState<{ id: string; timestamp: string; description: string }[]>(() => {
    const saved = localStorage.getItem('nijor_ai_change_history');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSettingsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSettingsAiFileName(file.name);
    const mimeType = file.type || 'application/octet-stream';
    setSettingsAiFileMime(mimeType);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawData = event.target?.result as string;
      setSettingsAiFile(rawData);
    };
    reader.readAsDataURL(file);
  };

  const handleSettingsAi = async (action: string) => {
    setSettingsAiLoading(true);
    setAiConsoleError('');
    try {
      const response = await fetch('/api/gemini/develop-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          currentSettings: settings,
          prompt: settingsAiPrompt,
          fileData: settingsAiFile,
          fileMime: settingsAiFileMime
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gemini API call failed.');
      }

      const data = await response.json();
      
      if (action === 'optimize_seo' || action === 'generate_about') {
        const updatedFields = data.updatedSettings || {};
        if (updatedFields.aboutUs) {
          updateStaticPage('about-us', updatedFields.aboutUs);
        }
        updateSettings(updatedFields);
        alert('✨ Google AI-এর মাধ্যমে সফলভাবে আপডেট সম্পন্ন হয়েছে!');
        return;
      }

      setAiAnalysisResult(data);
      if (data.unrelatedAlert?.isDestructiveOrUnrelated) {
        setAiConsoleError('⚠️ সতর্কবার্তা: ' + data.unrelatedAlert.warningMessage);
      }
    } catch (err: any) {
      console.error(err);
      setAiConsoleError('ত্রুটি: ' + err.message);
      alert('⚠️ সেটিংস বিশ্লেষণ করতে ত্রুটি ঘটেছে: ' + err.message);
    } finally {
      setSettingsAiLoading(false);
    }
  };

  const handleSettingsAiApply = async () => {
    if (!aiAnalysisResult) return;

    // Backup current settings before applying for Undo/Rollback
    setAiPreviousSettings({ ...settings });

    let appliedDescriptions: string[] = [];

    // 1. Apply updated site settings
    if (aiAnalysisResult.updatedSettings && Object.keys(aiAnalysisResult.updatedSettings).length > 0) {
      updateSettings(aiAnalysisResult.updatedSettings);
      
      // Update aboutUs page if present
      if (aiAnalysisResult.updatedSettings.aboutUs) {
        updateStaticPage('about-us', aiAnalysisResult.updatedSettings.aboutUs);
      }

      const keys = Object.keys(aiAnalysisResult.updatedSettings).join(', ');
      appliedDescriptions.push(`সেটিংস পরিবর্তন করা হয়েছে (${keys})`);
    }

    // 2. Create new category if requested
    if (aiAnalysisResult.newCategory && aiAnalysisResult.newCategory.name) {
      addCategory({
        name: aiAnalysisResult.newCategory.name,
        slug: aiAnalysisResult.newCategory.slug || aiAnalysisResult.newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        description: aiAnalysisResult.newCategory.description || ''
      });
      appliedDescriptions.push(`নতুন ক্যাটাগরি তৈরি করা হয়েছে (${aiAnalysisResult.newCategory.name})`);
    }

    // 3. Create new breaking news if requested
    if (aiAnalysisResult.newBreakingNews && aiAnalysisResult.newBreakingNews.text) {
      addBreakingNews({
        text: aiAnalysisResult.newBreakingNews.text,
        active: aiAnalysisResult.newBreakingNews.active !== undefined ? aiAnalysisResult.newBreakingNews.active : true,
        priority: aiAnalysisResult.newBreakingNews.priority || 1
      });
      appliedDescriptions.push(`নতুন ব্রেকিং নিউজ যুক্ত করা হয়েছে (${aiAnalysisResult.newBreakingNews.text.substring(0, 30)}...)`);
    }

    // Save description in history log
    if (appliedDescriptions.length > 0) {
      const description = appliedDescriptions.join(', ');
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('bn-BD'),
        description
      };
      const updatedHistory = [newLog, ...aiChangeHistory];
      setAiChangeHistory(updatedHistory);
      localStorage.setItem('nijor_ai_change_history', JSON.stringify(updatedHistory));
    }

    // Clear inputs and result state
    setAiAnalysisResult(null);
    setSettingsAiPrompt('');
    setSettingsAiFile('');
    setSettingsAiFileMime('');
    setSettingsAiFileName('');
    setAiConsoleError('');
    alert('✨ পরিবর্তনগুলো সফলভাবে সাইটে সংরক্ষণ ও লাইভ করা হয়েছে!');
  };

  const handleSettingsAiUndo = () => {
    if (aiPreviousSettings) {
      updateSettings(aiPreviousSettings);
      
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('bn-BD'),
        description: 'পূর্ববর্তী সেটিংসে রোলব্যাক (Undo) করা হয়েছে'
      };
      const updatedHistory = [newLog, ...aiChangeHistory];
      setAiChangeHistory(updatedHistory);
      localStorage.setItem('nijor_ai_change_history', JSON.stringify(updatedHistory));

      setAiPreviousSettings(null);
      alert('⏪ সফলভাবে রোলব্যাক সম্পন্ন হয়েছে এবং পূর্ববর্তী সেটিংস ফেরত আনা হয়েছে!');
    } else {
      alert('কোনো রোলব্যাক পয়েন্ট পাওয়া যায়নি!');
    }
  };

  const handleSettingsAiCancel = () => {
    setAiAnalysisResult(null);
    setSettingsAiPrompt('');
    setSettingsAiFile('');
    setSettingsAiFileMime('');
    setSettingsAiFileName('');
    setAiConsoleError('');
  };

  return (
    <div className="space-y-6">
      {/* TOP BAR TOGGLE FOR AI vs SITE DEVELOPER */}
      <div className="flex border-b border-slate-200 pb-1 mb-6 gap-2">
        <button 
          onClick={() => setSettingsMainTab('ai_dev')}
          className={`px-5 py-2.5 font-serif font-black text-xs sm:text-sm tracking-wide rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${settingsMainTab === 'ai_dev' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> AI DEVELOPER (এআই সহকারী)
        </button>
        <button 
          onClick={() => setSettingsMainTab('site_dev')}
          className={`px-5 py-2.5 font-serif font-black text-xs sm:text-sm tracking-wide rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${settingsMainTab === 'site_dev' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
        >
          <Sliders className="w-4 h-4 text-emerald-400" /> SITE DEVELOPER (ম্যানুয়াল সেটিংস)
        </button>
      </div>

      {/* 1. AI DEVELOPER CONSOLE */}
      {settingsMainTab === 'ai_dev' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn text-xs">
          
          {/* Left Column: Natural Language Prompt Interface & Examples */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Assistant Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-xl p-6 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-sm font-serif font-black tracking-wider text-slate-100 uppercase">
                    Google AI Studio Developer Console
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                প্রাকৃতিক ভাষায় আপনার আপডেট কমান্ড টাইপ করুন বা কোনো সেটিংসের স্ক্রিনশট আপলোড করে নির্দেশনা দিন। আমাদের জেনারেটিভ ডেভেলপার সিস্টেম সেটি বিশ্লেষণ করে পরিবর্তন প্রাকদর্শন (Preview) তৈরি করবে।
              </p>

              {/* Example Prompts */}
              <div className="space-y-2 pt-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  💡 Example Instructions (কমান্ডের উদাহরণ):
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { text: 'Change phone number to +8801700-111111', query: 'আমাদের ফোন নম্বর পরিবর্তন করে +৮৮ ০১৭০০-১১১১১১ কর।' },
                    { text: 'Set Facebook URL to facebook.com/nijornews', query: 'ফেসবুক পেজ লিঙ্ক আপডেট করে https://facebook.com/nijornews কর।' },
                    { text: 'Set main subtitle/tagline to CHT voice', query: 'সাইটের মূল স্লোগান পরিবর্তন করে লিখুন: "পার্বত্য জনপদের নির্ভরযোগ্য ডিজিটাল কণ্ঠস্বর"' },
                    { text: 'Create CHT Development category', query: 'পার্বত্য উন্নয়ন নামে নতুন একটি ক্যাটাগরি তৈরি কর যার স্ল্যাগ হবে cht-development' },
                    { text: 'Add breaking news alert', query: 'একটি ব্রেকিং নিউজ টিকেট যুক্ত করো: "রাঙামাটি-বান্দরবান সড়কে পাহাড় ধসে যোগাযোগ বিচ্ছিন্ন"' }
                  ].map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSettingsAiPrompt(ex.query)}
                      className="bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer text-left leading-normal"
                    >
                      ⚡ {ex.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden Multimodal File Picker */}
              <input
                type="file"
                id="ai-console-file-picker"
                accept="image/*,video/*,application/pdf,text/plain"
                onChange={handleSettingsFileChange}
                className="hidden"
              />

              {/* Input Prompt Box & Controls */}
              <div className="space-y-3 pt-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={settingsAiPrompt}
                      onChange={e => setSettingsAiPrompt(e.target.value)}
                      placeholder="যেমন: আমাদের অফিসিয়াল ফেসবুক পেজের লিঙ্ক আপডেট করো..."
                      className="w-full pl-3 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-amber-400 text-xs font-semibold text-white placeholder-slate-500"
                    />
                    <label
                      htmlFor="ai-console-file-picker"
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-amber-400 cursor-pointer p-1.5 rounded transition"
                      title="স্ক্রিনশট বা ফাইল যুক্ত করুন"
                    >
                      <Paperclip className="w-4 h-4" />
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={settingsAiLoading || (!settingsAiPrompt.trim() && !settingsAiFile)}
                    onClick={() => handleSettingsAi('custom_settings')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-serif font-black text-xs px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {settingsAiLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        বিশ্লেষণ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Analyze Prompt (বিশ্লেষণ)
                      </>
                    )}
                  </button>
                </div>

                {/* File Upload Preview */}
                {settingsAiFileName && (
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-semibold w-fit animate-fadeIn text-slate-200">
                    {settingsAiFileMime.startsWith('image/') ? (
                      <img src={settingsAiFile} alt="Attachment Preview" className="h-6 w-10 object-cover rounded border border-white/20 shrink-0" />
                    ) : (
                      <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span className="truncate max-w-[150px] font-bold">{settingsAiFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsAiFile('');
                        setSettingsAiFileMime('');
                        setSettingsAiFileName('');
                      }}
                      className="text-red-400 hover:text-red-500 font-bold ml-1 text-xs shrink-0 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Analysis Console Error/Alert Messages */}
            {aiConsoleError && (
              <div className="bg-red-50 text-red-900 border border-red-200 rounded-xl p-4 text-xs font-bold animate-fadeIn">
                {aiConsoleError}
              </div>
            )}

            {/* PREVIEW & COMMITTING OF CHANGES */}
            {aiAnalysisResult && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    🔍 Proposed Changes Preview (প্রস্তাবিত পরিবর্তনসমূহ প্রাকদর্শন)
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                    Awaiting Confirmation
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* 1. Settings updates */}
                  {aiAnalysisResult.updatedSettings && Object.keys(aiAnalysisResult.updatedSettings).length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 block border-b pb-1">⚙️ Site Settings Modifying:</span>
                      <div className="divide-y divide-slate-100 bg-slate-50 border rounded-lg overflow-hidden">
                        {Object.keys(aiAnalysisResult.updatedSettings).map(key => {
                          const oldVal = (settings as any)[key];
                          const newVal = aiAnalysisResult.updatedSettings[key];
                          return (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2.5 text-[11px]">
                              <span className="font-bold text-slate-600 font-mono text-[10px]">{key}:</span>
                              <div className="text-red-600 line-through truncate">
                                Old: {oldVal !== undefined && oldVal !== null ? String(oldVal) : 'N/A'}
                              </div>
                              <div className="text-emerald-700 font-bold truncate">
                                New: {String(newVal)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. Category updates */}
                  {aiAnalysisResult.newCategory && aiAnalysisResult.newCategory.name && (
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 block border-b pb-1">📁 New Category Creation:</span>
                      <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1.5 text-[11px]">
                        <p>✓ Category Name: <strong>{aiAnalysisResult.newCategory.name}</strong></p>
                        <p>✓ Category Slug: <strong className="font-mono text-[10px] text-amber-800">{aiAnalysisResult.newCategory.slug}</strong></p>
                        <p>✓ Description: <span className="text-slate-600">{aiAnalysisResult.newCategory.description || 'None'}</span></p>
                      </div>
                    </div>
                  )}

                  {/* 3. Breaking news ticker */}
                  {aiAnalysisResult.newBreakingNews && aiAnalysisResult.newBreakingNews.text && (
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 block border-b pb-1">🚨 New Homepage Breaking News Alert:</span>
                      <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg space-y-1.5 text-[11px]">
                        <p>✓ Alert Text: <strong>{aiAnalysisResult.newBreakingNews.text}</strong></p>
                        <p>✓ Status: <strong className="text-red-700">Active (পাবলিশ হবে)</strong></p>
                        <p>✓ Priority: <strong>{aiAnalysisResult.newBreakingNews.priority || 1}</strong></p>
                      </div>
                    </div>
                  )}

                  {/* If unrelated action was detected but allowed */}
                  {aiAnalysisResult.unrelatedAlert?.isDestructiveOrUnrelated && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg font-semibold space-y-2">
                      <p>⚠️ এই প্রম্পটটি সেটিংসের বাইরে সিস্টেম ফাইল পরিবর্তন বা ডিলিট করার চেষ্টা করছে!</p>
                      <label className="flex items-center gap-2 cursor-pointer font-bold select-none pt-1">
                        <input 
                          type="checkbox" 
                          checked={aiShowConfirmation} 
                          onChange={e => setAiShowConfirmation(e.target.checked)} 
                          className="rounded text-red-600 focus:ring-red-500 border-red-300"
                        />
                        <span>আমি ঝুঁকিটি বুঝেছি এবং পরিবর্তনটি প্রয়োগ করতে নিশ্চিত করছি (Confirm Change)</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Preview Action Buttons */}
                <div className="flex gap-2 justify-end border-t pt-4">
                  <button
                    type="button"
                    onClick={handleSettingsAiCancel}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancel (বাতিল)
                  </button>
                  <button
                    type="button"
                    onClick={handleSettingsAiApply}
                    disabled={aiAnalysisResult.unrelatedAlert?.isDestructiveOrUnrelated && !aiShowConfirmation}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-xs disabled:opacity-40 cursor-pointer"
                  >
                    Apply Changes (পরিবর্তন প্রয়োগ করুন)
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Undo, Rollback, Change Log History */}
          <div className="space-y-6">
            
            {/* Rollback & Safety Control */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <span className="block text-xs font-serif font-black uppercase text-slate-800 tracking-wider border-b pb-1.5">
                ⏪ Quick Rollback Console
              </span>
              <p className="text-[11px] text-slate-500 font-sans">
                ভুল আপডেট সংশোধন করার জন্য সহজেই পূর্ববর্তী সেটিংসে ফেরত যান।
              </p>
              
              {aiPreviousSettings ? (
                <div className="space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] font-bold text-amber-850 animate-pulse">
                    ✓ একটি পূর্ববর্তী সেটিংস ব্যাকআপ পয়েন্ট সক্রিয় আছে।
                  </div>
                  <button
                    type="button"
                    onClick={handleSettingsAiUndo}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Rollback (Undo Last Apply)
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-400 font-bold text-center">
                  কোনো পরিবর্তন হিস্টোরি ব্যাকআপ পয়েন্ট এই সেশনে নেই।
                </div>
              )}
            </div>

            {/* Change History Logs */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="text-xs font-serif font-black uppercase text-slate-800 tracking-wider">
                  📜 Applied Change History
                </span>
                {aiChangeHistory.length > 0 && (
                  <button
                    onClick={() => {
                      setAiChangeHistory([]);
                      localStorage.removeItem('nijor_ai_change_history');
                    }}
                    className="text-[9px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 font-sans">
                {aiChangeHistory.length > 0 ? (
                  aiChangeHistory.map(log => (
                    <div key={log.id} className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[10px] leading-relaxed">
                      <span className="block font-bold text-slate-400 mb-0.5">{log.timestamp}</span>
                      <p className="text-slate-700 font-bold">{log.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold text-center py-6">কোনো পরিবর্তনের লগ হিস্টোরি নেই।</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. SITE DEVELOPER MANUAL CONFIGURATION PANEL */}
      {settingsMainTab === 'site_dev' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start animate-fadeIn text-xs">
          
          {/* 19 manual configuration sidebar subtabs */}
          <div className="bg-slate-900 text-white rounded-xl overflow-hidden p-2 space-y-0.5 shadow-md border border-slate-800 max-h-[640px] overflow-y-auto font-sans">
            <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-3 py-2 border-b border-slate-800 mb-1.5">Manual A-Z Tabs</span>
            {[
              { id: 'GENERAL', label: 'General', icon: Globe },
              { id: 'APPEARANCE', label: 'Appearance', icon: Sliders },
              { id: 'HEADER', label: 'Header Layout', icon: Monitor },
              { id: 'NAVIGATION', label: 'Navigation Links', icon: FileText },
              { id: 'HOMEPAGE', label: 'Homepage Layout', icon: Home },
              { id: 'NEWS/ARTICLE', label: 'News Posting Config', icon: Newspaper },
              { id: 'CATEGORY', label: 'Categories Order', icon: Folder },
              { id: 'SIDEBAR', label: 'Sidebar Layout', icon: Smartphone },
              { id: 'FOOTER', label: 'Footer Settings', icon: LayoutDashboard },
              { id: 'ADVERTISEMENT', label: 'Ad Placements', icon: Megaphone },
              { id: 'SEO', label: 'SEO & Search Meta', icon: Search },
              { id: 'SOCIAL', label: 'Social Networks', icon: Users },
              { id: 'MOBILE', label: 'Mobile Design', icon: Smartphone },
              { id: 'CUSTOM CODE', label: 'Custom HTML & Code', icon: Code },
              { id: 'CONTACT', label: 'Contact Details', icon: Phone },
              { id: 'ANALYTICS', label: 'Analytics IDs', icon: BarChart2 },
              { id: 'SECURITY', label: 'Security & Access', icon: Shield },
              { id: 'PERFORMANCE', label: 'Optimization & Speed', icon: Zap },
              { id: 'ADVANCED', label: 'Advanced Tools', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSiteDevTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${siteDevTab === tab.id ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'hover:bg-slate-800/60 text-slate-300'}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Configuration Content Box */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            
            {/* GENERAL */}
            {siteDevTab === 'GENERAL' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" /> General Configuration (সাধারণ সেটিংস)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Site Name (সাইটের নাম)</label>
                    <input type="text" value={settings.siteName || ''} onChange={e => updateSettings({ siteName: e.target.value })} className="w-full px-3 py-2 border rounded font-bold text-slate-850" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Tagline / Subtitle (স্লোগান)</label>
                    <input type="text" value={settings.siteSubtitle || ''} onChange={e => updateSettings({ siteSubtitle: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Default Brand Slogan (ব্র্যান্ড স্লোগান)</label>
                    <input type="text" value={settings.tagline || ''} onChange={e => updateSettings({ tagline: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Language (ভাষা)</label>
                    <select value={settings.language || 'bn'} onChange={e => updateSettings({ language: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800">
                      <option value="bn">Bengali (বাংলা)</option>
                      <option value="en">English (ইংরেজি)</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-slate-700">Timezone (সময় অঞ্চল)</label>
                    <input type="text" value={settings.timezone || 'Asia/Dhaka'} onChange={e => updateSettings({ timezone: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850" />
                  </div>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {siteDevTab === 'APPEARANCE' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" /> Appearance & Theme Layout
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Theme Mode Selection</label>
                    <select value={settings.theme || 'light'} onChange={e => updateSettings({ theme: e.target.value as any })} className="w-full px-3 py-2 border rounded text-slate-800">
                      <option value="light">Classic Light (লাইট)</option>
                      <option value="dark">Professional Dark (ডার্ক)</option>
                      <option value="editorial">Traditional Editorial (সংবাদপত্র লেআউট)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Accent Brand Color Theme</label>
                    <select value="emerald" className="w-full px-3 py-2 border rounded text-slate-800" disabled>
                      <option value="emerald">Premium Emerald Green (পার্বত্য সবুজ)</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-slate-700">Custom Favicon URL (ফেভিকন লিঙ্ক)</label>
                    <input type="text" value={settings.faviconUrl || ''} onChange={e => updateSettings({ faviconUrl: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800 font-mono text-[10px]" />
                  </div>
                </div>
              </div>
            )}

            {/* HEADER */}
            {siteDevTab === 'HEADER' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-600" /> Header Configuration & Elements
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Logo URL (লোগোর লিঙ্ক)</label>
                    <input type="text" value={settings.logoUrl || ''} onChange={e => updateSettings({ logoUrl: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800 font-mono text-[10px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-850">
                      <input type="checkbox" checked={settings.headerConfig?.showSearch ?? true} onChange={e => updateSettings({ headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showSearch: e.target.checked } })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span>Show Search Bar in header (সার্চ বার প্রদর্শন)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-850">
                      <input type="checkbox" checked={settings.headerConfig?.showSocial ?? true} onChange={e => updateSettings({ headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showSocial: e.target.checked } })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span>Show Social Icons in header (সোশ্যাল বাটন প্রদর্শন)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION */}
            {siteDevTab === 'NAVIGATION' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> Navigation Menu & Sticky Links
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-850">
                    <input type="checkbox" checked={true} className="rounded text-emerald-600" disabled />
                    <span>Enable Floating/Sticky Menu (ভাসমান হেডার সক্রিয়)</span>
                  </label>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    * সাইটের বিভাগসমূহ (Categories) এবং পার্বত্য জেলাসমূহ (Rangamati, Khagrachhari, Bandarban) স্বয়ংক্রিয়ভাবে নেভিগেশন মেনুতে ডাইনামিকভাবে লিংক আকারে লোড হবে।
                  </p>
                </div>
              </div>
            )}

            {/* HOMEPAGE */}
            {siteDevTab === 'HOMEPAGE' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Home className="w-4 h-4 text-emerald-600" /> Homepage Layout Manager
                </h3>
                <div className="space-y-3 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={settings.homepageLayout?.showBreaking ?? true} onChange={e => updateSettings({ homepageLayout: { ...(settings.homepageLayout || { showBreaking: true, showHero: true, showFeatured: true, showDistricts: true, showPhotoVideo: true }), showBreaking: e.target.checked } })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span>Show Breaking News ticker at top (ব্রেকিং নিউজ বার প্রদর্শন)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={settings.homepageLayout?.showHero ?? true} onChange={e => updateSettings({ homepageLayout: { ...(settings.homepageLayout || { showBreaking: true, showHero: true, showFeatured: true, showDistricts: true, showPhotoVideo: true }), showHero: e.target.checked } })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span>Show Hero Slider Section (মূল ফিচার্ড খবর অংশ)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={settings.homepageLayout?.showFeatured ?? true} onChange={e => updateSettings({ homepageLayout: { ...(settings.homepageLayout || { showBreaking: true, showHero: true, showFeatured: true, showDistricts: true, showPhotoVideo: true }), showFeatured: e.target.checked } })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span>Show Featured News Grid (বিশেষ সংবাদ গ্রিড প্রদর্শন)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={settings.homepageLayout?.showDistricts ?? true} onChange={e => updateSettings({ homepageLayout: { ...(settings.homepageLayout || { showBreaking: true, showHero: true, showFeatured: true, showDistricts: true, showPhotoVideo: true }), showDistricts: e.target.checked } })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span>Show Hill Tracts Special Focus blocks (তিন পার্বত্য জেলার সংবাদ ব্লক)</span>
                  </label>
                </div>
              </div>
            )}

            {/* NEWS/ARTICLE */}
            {siteDevTab === 'NEWS/ARTICLE' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-emerald-600" /> News Posting & Editor Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Default News Status on Publish</label>
                    <select value="published" className="w-full px-3 py-2 border rounded text-slate-800" disabled>
                      <option value="published">Auto-Publish Immediately (প্রকাশিত)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Default Newsroom Reporter</label>
                    <input type="text" value={settings.defaultAuthor || 'নিজোর নিউজ ব্যুরো'} onChange={e => updateSettings({ defaultAuthor: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850 font-bold" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-slate-700">Default News Placeholder Image Link (ডিফল্ট খবর ফিচার্ড ছবি)</label>
                    <input type="text" value={settings.defaultImage || ''} onChange={e => updateSettings({ defaultImage: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-[10px] text-slate-800" />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY */}
            {siteDevTab === 'CATEGORY' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-emerald-600" /> Portal Categories Management
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                  বর্তমানে পোর্টালে সক্রিয় সকল বিভাগসমূহ (যেমন: CHT, পার্বত্য সংবাদ, রাজনীতি, বিনোদন, ইত্যাদি) ক্যাটাগরি প্যানেলের মাধ্যমে সরাসরি তৈরি ও সাজানো হয়।
                </p>
                <div className="bg-slate-50 p-4 border rounded-xl divide-y text-[11px]">
                  {categories.map((c, i) => (
                    <div key={c.id} className="py-2.5 flex justify-between items-center">
                      <span className="font-bold text-slate-800">{i+1}. {c.name}</span>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">{c.slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SIDEBAR */}
            {siteDevTab === 'SIDEBAR' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" /> Sidebar Layout Configuration
                </h3>
                <div className="space-y-3 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={true} className="rounded text-emerald-600" disabled />
                    <span>Show Sidebar Ad Slots (অ্যাডস স্লট সক্রিয়)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={true} className="rounded text-emerald-600" disabled />
                    <span>Show Recent News Widget (সাম্প্রতিক সংবাদ প্যানেল)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={!!settings.customHtmlSidebar} className="rounded text-emerald-600" disabled />
                    <span>Show Custom HTML Sidebar Widget (হেডার স্ক্রিপ্ট/প্লাগইন ডাইনামিক রেন্ডারিং)</span>
                  </label>
                </div>
              </div>
            )}

            {/* FOOTER */}
            {siteDevTab === 'FOOTER' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Footer Configuration & Branding
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Footer Copyright Info (ফুটারে কপিরাইট লেখা)</label>
                    <input type="text" value={settings.footerText || ''} onChange={e => updateSettings({ footerText: e.target.value })} className="w-full px-3 py-2 border rounded font-bold text-slate-850" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Footer Brand About Profile (আমাদের সম্পর্কে ফুটারে বিবরণী)</label>
                    <textarea rows={3} value={settings.aboutUs || ''} onChange={e => updateSettings({ aboutUs: e.target.value })} className="w-full px-3 py-2 border rounded leading-relaxed text-slate-800" />
                  </div>
                </div>
              </div>
            )}

            {/* ADVERTISEMENT */}
            {siteDevTab === 'ADVERTISEMENT' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-600" /> Monetization & Ad Placements
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-850">
                    <input type="checkbox" checked={settings.adsEnabled ?? true} onChange={e => updateSettings({ adsEnabled: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span>Enable Global Monetization (অ্যাডস চালু করুন)</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Adsterra Ad Script/Code:</label>
                      <textarea rows={3} value={settings.adsterraScript || ''} onChange={e => updateSettings({ adsterraScript: e.target.value })} className="w-full p-2 border rounded font-mono text-[9px] text-slate-800 bg-slate-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Monetag Ad Script/Code:</label>
                      <textarea rows={3} value={settings.monetagScript || ''} onChange={e => updateSettings({ monetagScript: e.target.value })} className="w-full p-2 border rounded font-mono text-[9px] text-slate-800 bg-slate-50" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO */}
            {siteDevTab === 'SEO' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-600" /> SEO Configuration (অনুসন্ধান ইঞ্জিন অপ্টিমাইজেশন)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-slate-700">SEO Meta Title (এসইও মেটা শিরোনাম)</label>
                    <input type="text" value={settings.seoTitle || ''} onChange={e => updateSettings({ seoTitle: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850 font-bold" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-slate-700">SEO Meta Description (এসইও মেটা বিবরণ)</label>
                    <textarea rows={2} value={settings.seoDescription || ''} onChange={e => updateSettings({ seoDescription: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800 leading-normal" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-slate-700">SEO Keywords (মেটা কীওয়ার্ডস)</label>
                    <input type="text" value={settings.metaKeywords || ''} onChange={e => updateSettings({ metaKeywords: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850 font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Canonical Website URL (প্রধান লিঙ্ক)</label>
                    <input type="text" value={settings.canonicalUrl || 'https://nijornews.com'} onChange={e => updateSettings({ canonicalUrl: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-[10px] text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Google Search Verification Token</label>
                    <input type="text" value={settings.googleVerification || ''} onChange={e => updateSettings({ googleVerification: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-[10px] text-slate-800" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-slate-700">Robots.txt Configuration</label>
                    <textarea rows={3} value={settings.robotsTxt || ''} onChange={e => updateSettings({ robotsTxt: e.target.value })} className="w-full p-2 border rounded font-mono text-[10px] text-slate-800 bg-slate-50" />
                  </div>
                </div>
              </div>
            )}

            {/* SOCIAL */}
            {siteDevTab === 'SOCIAL' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Official Social Media Profiles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10px]">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 font-sans text-xs">Facebook Page URL:</label>
                    <input type="text" value={settings.facebook || ''} onChange={e => updateSettings({ facebook: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 font-sans text-xs">YouTube Channel URL:</label>
                    <input type="text" value={settings.youtube || ''} onChange={e => updateSettings({ youtube: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 font-sans text-xs">Twitter/X Profile URL:</label>
                    <input type="text" value={settings.twitter || ''} onChange={e => updateSettings({ twitter: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 font-sans text-xs">Instagram Profile URL:</label>
                    <input type="text" value={settings.instagram || ''} onChange={e => updateSettings({ instagram: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 font-sans text-xs">Telegram Channel Link:</label>
                    <input type="text" value={settings.telegram || ''} onChange={e => updateSettings({ telegram: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 font-sans text-xs">WhatsApp Business Link:</label>
                    <input type="text" value={settings.whatsapp || ''} onChange={e => updateSettings({ whatsapp: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800" />
                  </div>
                </div>
              </div>
            )}

            {/* MOBILE */}
            {siteDevTab === 'MOBILE' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" /> Mobile Optimization & Adjustments
                </h3>
                <div className="space-y-3 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={true} className="rounded text-emerald-600" disabled />
                    <span>Optimize Images on Cellular Connection (মোবাইল ডাটা সাশ্রয়)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-850">
                    <input type="checkbox" checked={true} className="rounded text-emerald-600" disabled />
                    <span>Show Sticky Quick Navigation bottom-bar (মোবাইল কুইক নেভিগেশন বার)</span>
                  </label>
                </div>
              </div>
            )}

            {/* CUSTOM CODE */}
            {siteDevTab === 'CUSTOM CODE' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-600" /> Inject Custom HTML, CSS & Scripts
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">1. Header HTML (হেডারে কোড বসান):</label>
                    <textarea rows={2} value={settings.customHtmlHeader || ''} onChange={e => updateSettings({ customHtmlHeader: e.target.value })} placeholder="e.g. <div style='background: red; color: white; text-align: center; padding: 4px;'>জরুরি নোটিশ!</div>" className="w-full p-2.5 border rounded font-mono text-[9px] text-slate-800 bg-slate-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">2. Footer HTML (ফুটারে কোড বসান):</label>
                    <textarea rows={2} value={settings.customHtmlFooter || ''} onChange={e => updateSettings({ customHtmlFooter: e.target.value })} placeholder="e.g. <script>console.log('Footer Script');</script>" className="w-full p-2.5 border rounded font-mono text-[9px] text-slate-800 bg-slate-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">3. Sidebar HTML (সাইডবারে কোড বসান):</label>
                    <textarea rows={2} value={settings.customHtmlSidebar || ''} onChange={e => updateSettings({ customHtmlSidebar: e.target.value })} placeholder="e.g. ফেসবুক উইজেট আইফ্রেম..." className="w-full p-2.5 border rounded font-mono text-[9px] text-slate-800 bg-slate-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">4. Custom CSS (কাস্টম স্টাইলশীট):</label>
                    <textarea rows={3} value={settings.customCss || ''} onChange={e => updateSettings({ customCss: e.target.value })} placeholder="body { background-color: #f1f5f9; }" className="w-full p-2.5 border rounded font-mono text-[9px] text-slate-800 bg-slate-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">5. Custom JavaScript (কাস্টম স্ক্রিপ্ট):</label>
                    <textarea rows={2} value={settings.customJs || ''} onChange={e => updateSettings({ customJs: e.target.value })} placeholder="console.log('Nijor News Custom JS Active');" className="w-full p-2.5 border rounded font-mono text-[9px] text-slate-800 bg-slate-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">6. Custom Sidebar Widget (কাস্টম উইজেট):</label>
                    <textarea rows={2} value={settings.customWidget || ''} onChange={e => updateSettings({ customWidget: e.target.value })} placeholder="উইজেট কোড বা কোনো ব্যানার লিঙ্ক..." className="w-full p-2.5 border rounded font-mono text-[9px] text-slate-800 bg-slate-50" />
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT */}
            {siteDevTab === 'CONTACT' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" /> Contact Details (যোগাযোগের বিবরণী)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Mobile / Phone Number</label>
                    <input type="text" value={settings.phone || ''} onChange={e => updateSettings({ phone: e.target.value })} className="w-full px-3 py-2 border rounded font-bold text-slate-850" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Email Address (ইমেইল)</label>
                    <input type="text" value={settings.email || ''} onChange={e => updateSettings({ email: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850 font-semibold" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="block font-bold text-slate-700">Office / Physical Address (কার্যালয় ঠিকানা)</label>
                    <input type="text" value={settings.address || ''} onChange={e => updateSettings({ address: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850" />
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS */}
            {siteDevTab === 'ANALYTICS' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600" /> Integration Analytics IDs
                </h3>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Google Analytics ID (যেমন: G-XXXXXXXXXX)</label>
                  <input type="text" value={settings.analyticsId || ''} onChange={e => updateSettings({ analyticsId: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-[10px] text-slate-850 font-bold" />
                </div>
              </div>
            )}

            {/* SECURITY */}
            {siteDevTab === 'SECURITY' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" /> Security, SSL & Login Constraints
                </h3>
                <div className="space-y-3 font-semibold text-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={true} className="rounded text-emerald-600" disabled />
                    <span>Force HTTPS Security (এসএসএল রিডাইরেক্ট সক্রিয়)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings.maintenanceMode ?? false} onChange={e => updateSettings({ maintenanceMode: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span>Maintenance Mode Toggle (রক্ষণাবেক্ষণ মোড)</span>
                  </label>
                  {settings.maintenanceMode && (
                    <div className="space-y-1 pt-1.5 animate-fadeIn font-normal">
                      <label className="block font-bold text-slate-700">Maintenance/Notice Message</label>
                      <input type="text" value={settings.maintenanceMessage || 'পোর্টালে রক্ষণাবেক্ষণের কাজ চলছে। সাময়িক অসুবিধার জন্য দুঃখিত।'} onChange={e => updateSettings({ maintenanceMessage: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-850" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PERFORMANCE */}
            {siteDevTab === 'PERFORMANCE' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" /> Performance & Optimization Speed
                </h3>
                <div className="bg-slate-50 p-4 border rounded-xl space-y-2.5 font-semibold text-slate-800">
                  <p className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    WebP Dynamic Image compression is <strong>Active</strong>
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    Resource lazy-loading is <strong>Enabled</strong>
                  </p>
                </div>
              </div>
            )}

            {/* ADVANCED */}
            {siteDevTab === 'ADVANCED' && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" /> Advanced System Tools
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `nijor_news_settings_${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold p-3 rounded-xl transition text-center shrink-0 cursor-pointer"
                  >
                    📥 Export Settings JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'application/json';
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event: any) => {
                            try {
                              const parsed = JSON.parse(event.target.result);
                              updateSettings(parsed);
                              alert('✓ সেটিংস সফলভাবে ইম্পোর্ট ও সংরক্ষণ করা হয়েছে!');
                            } catch (err) {
                              alert('ত্রুটি: ভুল জেসন ফাইল আপলোড করেছেন!');
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold p-3 rounded-xl transition text-center shrink-0 cursor-pointer"
                  >
                    📤 Import Settings JSON
                  </button>
                </div>
              </div>
            )}

            {/* Manual configurations save buttons */}
            <div className="flex justify-end pt-4 border-t mt-4 gap-2">
              <button 
                onClick={() => alert('কনফিগারেশন ডাটাবেজে সফলভাবে সংরক্ষণ করা হয়েছে!')}
                className="bg-emerald-600 text-white text-xs px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-xs transition cursor-pointer"
              >
                Save Settings (সেটিংস সংরক্ষণ)
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
