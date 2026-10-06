import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, Heading, List, ListOrdered, Quote, 
  Image as ImageIcon, Link as LinkIcon, Youtube, Facebook, 
  Layers, FileVideo, Highlighter, AlignCenter, Minus, 
  Type, Table, Upload, HelpCircle
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isInternalLink, setIsInternalLink] = useState(false);

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'এখানে টেক্সট লিখুন';
    const replacement = `${openTag}${selectedText}${closeTag}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
    }, 0);
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    const styleClass = isInternalLink 
      ? "text-emerald-700 font-bold hover:underline" 
      : "text-blue-700 underline font-semibold";
    const targetAttr = isInternalLink ? "" : ' target="_blank" rel="noopener noreferrer"';
    const anchorTag = `<a href="${linkUrl}"${targetAttr} class="${styleClass}">${linkText || linkUrl}</a>`;
    onChange(value + '\n' + anchorTag);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  // 1. Image upload and base64 insertion (local file selection)
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit for performance (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ ফাইল সাইজ অনেক বড়! অনুগ্রহ করে ৫ মেগাবাইটের কম সাইজের ছবি সিলেক্ট করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const caption = prompt('ছবির ক্যাপশন দিন (ঐচ্ছিক):') || '';
      const source = prompt('কপিরাইট/উৎস দিন (ঐচ্ছিক):') || '';
      
      const imgHtml = `\n<figure class="my-6">\n  <img src="${base64Data}" alt="${caption}" class="w-full rounded-lg shadow-md" />\n  <figcaption class="text-center text-xs text-slate-500 mt-2">${caption} ${source ? `(ছবি: ${source})` : ''}</figcaption>\n</figure>\n`;
      onChange(value + imgHtml);
    };
    reader.readAsDataURL(file);
    
    e.target.value = ''; // Reset
  };

  // 2. Video upload and base64 HTML5 video tag insertion
  const triggerVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit video file to 15MB to prevent performance bottleneck in LocalStorage / Firestore
    if (file.size > 15 * 1024 * 1024) {
      alert('⚠️ ভিডিও ফাইল সাইজ অনেক বড়! অনুগ্রহ করে ১৫ মেগাবাইটের কম সাইজের ভিডিও সিলেক্ট করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const caption = prompt('ভিডিওর ক্যাপশন/টাইটেল দিন (ঐচ্ছিক):') || '';
      
      const videoHtml = `\n<div class="my-6 max-w-full">\n  <video src="${base64Data}" controls class="w-full rounded-lg shadow-md border bg-black"></video>\n  ${caption ? `<p class="text-center text-xs text-slate-500 mt-2">🎥 ${caption}</p>` : ''}\n</div>\n`;
      onChange(value + videoHtml);
    };
    reader.readAsDataURL(file);
    
    e.target.value = ''; // Reset
  };

  // Image insertion via URL (optional fallback)
  const insertImageByUrl = () => {
    const imgUrl = prompt('ছবির সরাসরি অনলাইন URL দিন:');
    if (imgUrl) {
      const caption = prompt('ছবির ক্যাপশন দিন (ঐচ্ছিক):') || '';
      const source = prompt('কপিরাইট/উৎস দিন (ঐচ্ছিক):') || '';
      const imgHtml = `\n<figure class="my-6">\n  <img src="${imgUrl}" alt="${caption}" class="w-full rounded-lg shadow-md" />\n  <figcaption class="text-center text-xs text-slate-500 mt-2">${caption} ${source ? `(ছবি: ${source})` : ''}</figcaption>\n</figure>\n`;
      onChange(value + imgHtml);
    }
  };

  const insertGalleryPrompt = () => {
    const url1 = prompt('১ম ছবির সরাসরি অনলাইন URL দিন:');
    const url2 = prompt('২য় ছবির সরাসরি অনলাইন URL দিন:');
    if (url1 && url2) {
      const galleryHtml = `\n<div class="grid grid-cols-2 gap-4 my-6">\n  <img src="${url1}" class="w-full h-48 object-cover rounded-lg shadow-sm" />\n  <img src="${url2}" class="w-full h-48 object-cover rounded-lg shadow-sm" />\n</div>\n`;
      onChange(value + galleryHtml);
    }
  };

  const insertYoutubePrompt = () => {
    const videoUrl = prompt('YouTube ভিডিও লিংক বা ভিডিও ID দিন:');
    if (videoUrl) {
      const id = videoUrl.includes('v=') ? videoUrl.split('v=')[1]?.substring(0, 11) : videoUrl;
      const videoHtml = `\n<div class="my-6 aspect-video">\n  <iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full rounded-lg shadow-md" allowfullscreen></iframe>\n</div>\n`;
      onChange(value + videoHtml);
    }
  };

  const insertFacebookPrompt = () => {
    const postUrl = prompt('Facebook পোস্ট বা ভিডিও লিংক দিন:');
    if (postUrl) {
      const fbHtml = `\n<div class="my-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">\n  <iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(postUrl)}&show_text=true" width="500" height="290" class="border-none overflow-hidden" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>\n</div>\n`;
      onChange(value + fbHtml);
    }
  };

  // Helper to generate elegant responsive tables
  const insertTable = () => {
    const rows = parseInt(prompt('টেবিলের রো (Row) সংখ্যা লিখুন:', '3') || '3');
    const cols = parseInt(prompt('টেবিলের কলাম (Column) সংখ্যা লিখুন:', '3') || '3');
    
    if (isNaN(rows) || isNaN(cols)) return;
    
    let tableHtml = '\n<div class="overflow-x-auto my-6">\n  <table class="min-w-full border-collapse border border-slate-300 text-xs text-slate-850">\n    <thead>\n      <tr class="bg-slate-100 font-bold">\n';
    for (let c = 0; c < cols; c++) {
      tableHtml += `        <th class="border border-slate-300 p-2 text-left font-bold bg-slate-100">কলাম ${c + 1}</th>\n`;
    }
    tableHtml += '      </tr>\n    </thead>\n    <tbody>\n';
    for (let r = 0; r < rows; r++) {
      tableHtml += '      <tr class="hover:bg-slate-50">\n';
      for (let c = 0; c < cols; c++) {
        tableHtml += '        <td class="border border-slate-300 p-2">ডেটা</td>\n';
      }
      tableHtml += '      </tr>\n';
    }
    tableHtml += '    </tbody>\n  </table>\n</div>\n';
    onChange(value + tableHtml);
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
      
      {/* Hidden File Inputs for Local Media Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        onChange={handleVideoUpload} 
        accept="video/*" 
        className="hidden" 
      />

      {/* Toolbar Layout */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-100 border-b border-slate-300 p-2 select-none">
        
        {/* Core Styling group */}
        <button
          type="button"
          onClick={() => insertTag('<strong>', '</strong>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="বোল্ড (Bold)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<em>', '</em>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="ইটালিক (Italic)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<u>', '</u>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="আন্ডারলাইন (Underline)"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        {/* Headings */}
        <button
          type="button"
          onClick={() => insertTag('<h2>', '</h2>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition text-[11px] font-bold"
          title="বড় শিরোনাম (Heading 2)"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertTag('<h3>', '</h3>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="ছোট শিরোনাম (Heading 3)"
        >
          <Heading className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1"></span>

        {/* Lists */}
        <button
          type="button"
          onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="বুলেট লিস্ট"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="নাম্বার লিস্ট"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<blockquote>', '</blockquote>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="উদ্ধৃতি (Blockquote)"
        >
          <Quote className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1"></span>

        {/* Highlight tools */}
        <button
          type="button"
          onClick={() => insertTag('<mark class="bg-yellow-200 px-1 font-semibold rounded text-slate-950">', '</mark>')}
          className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1 text-[10px] font-bold"
          title="লাইন হাইলাইট (হলুদ ব্যাকগ্রাউন্ড)"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-600" /> হাইলাইট টেক্সট
        </button>
        
        <button
          type="button"
          onClick={() => insertTag('<div class="my-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-slate-800 font-medium rounded-r-lg">', '</div>')}
          className="p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1 text-[10px] font-bold"
          title="হাইলাইট কোট বক্স (সবুজ বর্ডার)"
        >
          <Quote className="w-3.5 h-3.5 text-emerald-600" /> হাইলাইট বক্স
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1"></span>

        {/* Media Upload Buttons */}
        <button
          type="button"
          onClick={triggerImageUpload}
          className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 text-xs"
          title="কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন"
        >
          <Upload className="w-3.5 h-3.5" /> ছবি আপলোড
        </button>

        <button
          type="button"
          onClick={triggerVideoUpload}
          className="p-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1 text-xs"
          title="কম্পিউটার/মোবাইল থেকে সরাসরি ভিডিও আপলোড করুন"
        >
          <FileVideo className="w-3.5 h-3.5" /> ভিডিও আপলোড
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1"></span>

        {/* Formatting/Layout extras */}
        <button
          type="button"
          onClick={() => insertTag('<div class="text-center">', '</div>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="সেন্টার অ্যালাইন (Center Text)"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onChange(value + '\n<hr class="my-6 border-slate-200" />\n')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="ডিভাইডার লাইন (Horizontal Divider)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<span class="text-red-600 font-bold">', '</span>')}
          className="p-1.5 rounded hover:bg-slate-200 text-red-600 transition"
          title="লাল টেক্সট (Red Warning)"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={insertTable}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 text-xs"
          title="টেবিল যোগ করুন (Insert Table)"
        >
          <Table className="w-4 h-4" /> টেবিল
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1"></span>

        {/* Links & Prompts fallback */}
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className="p-1.5 rounded hover:bg-slate-200 text-emerald-700 font-semibold transition flex items-center gap-1 text-xs"
          title="হাইপারলিংক যোগ করুন"
        >
          <LinkIcon className="w-3.5 h-3.5" /> লিংক
        </button>
        <button
          type="button"
          onClick={insertGalleryPrompt}
          className="p-1.5 rounded hover:bg-slate-200 text-teal-700 font-semibold transition flex items-center gap-1 text-xs"
          title="অনলাইন গ্যালারি যোগ করুন"
        >
          <Layers className="w-3.5 h-3.5" /> গ্যালারি
        </button>
        <button
          type="button"
          onClick={insertYoutubePrompt}
          className="p-1.5 rounded hover:bg-slate-200 text-red-600 font-semibold transition flex items-center gap-1 text-xs"
          title="ইউটিউব ভিডিও এমবেড"
        >
          <Youtube className="w-3.5 h-3.5" /> YT ভিডিও
        </button>
        <button
          type="button"
          onClick={insertFacebookPrompt}
          className="p-1.5 rounded hover:bg-slate-200 text-blue-600 font-semibold transition flex items-center gap-1 text-xs"
          title="ফেসবুক পোস্ট এমবেড"
        >
          <Facebook className="w-3.5 h-3.5" /> FB পোস্ট
        </button>
        <button
          type="button"
          onClick={insertImageByUrl}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-500 transition"
          title="অনলাইন ইমেজ লিংক পেস্ট করুন (অনলাইন লিংক)"
        >
          <HelpCircle className="w-4 h-4" /> URL ইমেজ
        </button>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="bg-emerald-50 p-4 border-b border-emerald-200 space-y-3 animate-fadeIn">
          <p className="text-xs font-bold text-emerald-900">হাইপারলিংক যুক্ত করুন (Insert Hyperlink)</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="লিঙ্কের টেক্সট (যেমন: বিস্তারিত পড়ুন)" 
              value={linkText} 
              onChange={e => setLinkText(e.target.value)}
              className="px-3 py-1.5 text-xs border rounded bg-white flex-1 focus:ring-emerald-500"
            />
            <input 
              type="text" 
              placeholder="URL (https://...)" 
              value={linkUrl} 
              onChange={e => setLinkUrl(e.target.value)}
              className="px-3 py-1.5 text-xs border rounded bg-white flex-1 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-1 text-xs px-2 shrink-0">
              <input 
                type="checkbox" 
                id="internal-link-chk"
                checked={isInternalLink}
                onChange={e => setIsInternalLink(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="internal-link-chk" className="font-semibold text-slate-700">Internal Link</label>
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleInsertLink} 
                className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-emerald-700 shrink-0"
              >
                Insert
              </button>
              <button 
                type="button" 
                onClick={() => setShowLinkModal(false)} 
                className="bg-slate-300 text-slate-800 px-3 py-1.5 rounded text-xs font-bold shrink-0"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        rows={14}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-4 font-sans text-sm focus:outline-hidden text-slate-800 placeholder-slate-400"
        placeholder="সংবাদের বিস্তারিত এখানে লিখুন (HTML বা সাধারণ টেক্সট)..."
      />
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
        <span>HTML ট্যাগ সমর্থিত (<strong>&lt;strong&gt;</strong>, <strong>&lt;p&gt;</strong>, <strong>&lt;blockquote&gt;</strong> ইত্যাদি)</span>
        <span>অক্ষর সংখ্যা: {value.length}</span>
      </div>
    </div>
  );
};
