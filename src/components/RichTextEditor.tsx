import React, { useState, useRef } from 'react';
import { Bold, Italic, Underline, Heading, List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon, Youtube, Facebook, Code, Layers } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const insertImagePrompt = () => {
    const imgUrl = prompt('ছবির URL দিন:');
    if (imgUrl) {
      const caption = prompt('ছবির ক্যাপশন দিন (ঐচ্ছিক):') || '';
      const source = prompt('কপিরাইট/উৎস দিন (ঐচ্ছিক):') || '';
      const imgHtml = `\n<figure class="my-6">\n  <img src="${imgUrl}" alt="${caption}" class="w-full rounded-lg shadow-md" />\n  <figcaption class="text-center text-xs text-slate-500 mt-2">${caption} ${source ? `(ছবি: ${source})` : ''}</figcaption>\n</figure>\n`;
      onChange(value + imgHtml);
    }
  };

  const insertGalleryPrompt = () => {
    const url1 = prompt('১ম ছবির URL দিন:');
    const url2 = prompt('২য় ছবির URL দিন:');
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

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-100 border-b border-slate-300 p-2">
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
        <button
          type="button"
          onClick={() => insertTag('<h3>', '</h3>')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
          title="শিরোনাম (Heading 3)"
        >
          <Heading className="w-4 h-4" />
        </button>
        <span className="w-px h-5 bg-slate-300 mx-1"></span>
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
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className="p-1.5 rounded hover:bg-slate-200 text-emerald-700 font-semibold transition flex items-center gap-1 text-xs"
          title="হাইপারলিংক যোগ করুন"
        >
          <LinkIcon className="w-4 h-4" /> লিংক
        </button>
        <button
          type="button"
          onClick={insertImagePrompt}
          className="p-1.5 rounded hover:bg-slate-200 text-emerald-700 font-semibold transition flex items-center gap-1 text-xs"
          title="ছবি যোগ করুন"
        >
          <ImageIcon className="w-4 h-4" /> ছবি
        </button>
        <button
          type="button"
          onClick={insertGalleryPrompt}
          className="p-1.5 rounded hover:bg-slate-200 text-teal-700 font-semibold transition flex items-center gap-1 text-xs"
          title="গ্যালারি যোগ করুন"
        >
          <Layers className="w-4 h-4" /> গ্যালারি
        </button>
        <button
          type="button"
          onClick={insertYoutubePrompt}
          className="p-1.5 rounded hover:bg-slate-200 text-red-600 font-semibold transition flex items-center gap-1 text-xs"
          title="ইউটিউব ভিডিও"
        >
          <Youtube className="w-4 h-4" /> YT ভিডিও
        </button>
        <button
          type="button"
          onClick={insertFacebookPrompt}
          className="p-1.5 rounded hover:bg-slate-200 text-blue-600 font-semibold transition flex items-center gap-1 text-xs"
          title="ফেসবুক পোস্ট এমবেড"
        >
          <Facebook className="w-4 h-4" /> FB পোস্ট
        </button>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="bg-emerald-50 p-4 border-b border-emerald-200 space-y-3">
          <p className="text-xs font-bold text-emerald-900">হাইপারলিংক যুক্ত করুন (Insert Hyperlink)</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="লিঙ্কের টেক্সট (যেমন: বিস্তারিত পড়ুন)" 
              value={linkText} 
              onChange={e => setLinkText(e.target.value)}
              className="px-3 py-1.5 text-xs border rounded bg-white flex-1"
            />
            <input 
              type="text" 
              placeholder="URL (https://...)" 
              value={linkUrl} 
              onChange={e => setLinkUrl(e.target.value)}
              className="px-3 py-1.5 text-xs border rounded bg-white flex-1"
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
        rows={12}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-4 font-sans text-sm focus:outline-hidden text-slate-800"
        placeholder="সংবাদের বিস্তারিত এখানে লিখুন (HTML বা সাধারণ টেক্সট)..."
      />
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
        <span>HTML ট্যাগ সমর্থিত (<strong>&lt;strong&gt;</strong>, <strong>&lt;p&gt;</strong>, <strong>&lt;blockquote&gt;</strong> ইত্যাদি)</span>
        <span>অক্ষর সংখ্যা: {value.length}</span>
      </div>
    </div>
  );
};
