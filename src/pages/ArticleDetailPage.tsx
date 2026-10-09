import React, { useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { NewsCard } from '../components/NewsCard';
import { SocialShare } from '../components/SocialShare';
import { AdSlot } from '../components/AdSlot';
import { Breadcrumb } from '../components/Breadcrumb';
import { Eye, Clock, MapPin, User, Tag, ArrowLeft, MessageSquare, Send, Edit } from 'lucide-react';

export const ArticleDetailPage: React.FC = () => {
  const { articles, selectedArticleId, navigateToHome, navigateToCategory, navigateToDistrict, currentUser } = useNews();
  
  const article = articles.find(a => a.id === selectedArticleId) || articles[0];

  // Dynamic Open Graph metadata update for Facebook sharing & clean URL syncing
  useEffect(() => {
    if (article) {
      document.title = `${article.title} - NIJOR NEWS`;

      // Update clean address bar URL for sharing
      try {
        if (window.location.pathname !== `/n/${article.id}`) {
          window.history.replaceState({ articleId: article.id }, '', `/n/${article.id}`);
        }
      } catch (e) {}
      
      // Update meta tags
      const setMeta = (name: string, content: string, isProp = false) => {
        const attr = isProp ? 'property' : 'name';
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMeta('description', article.excerpt);
      setMeta('og:title', article.title, true);
      setMeta('og:description', article.excerpt, true);
      setMeta('og:image', article.image, true);
      setMeta('og:image:secure_url', article.image, true);
      setMeta('og:url', `https://nijornews.netlify.app/n/${article.id}`, true);
      setMeta('og:type', 'article', true);
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', article.title);
      setMeta('twitter:description', article.excerpt);
      setMeta('twitter:image', article.image);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">সংবাদটি পাওয়া যায়নি</h2>
        <button onClick={navigateToHome} className="bg-emerald-600 text-white px-4 py-2 rounded">হোমে ফিরে যান</button>
      </div>
    );
  }

  const relatedArticles = articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);
  const latestArticles = articles.slice(0, 5);

  // News SEO Structured Data (NewsArticle Schema)
  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt,
    "image": [article.image],
    "datePublished": article.publishedAt || "2026-09-30T12:00:00+06:00",
    "dateModified": article.updatedAt || article.publishedAt || "2026-09-30T14:30:00+06:00",
    "author": {
      "@type": "Person",
      "name": article.reporterName || "নিজোর নিউজ ডেস্ক"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Nijor News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nijornews.com/logo.png"
      }
    }
  };

  const breadcrumbItems = [
    { label: article.category, onClick: () => navigateToCategory(article.category) },
    ...(article.district ? [{ label: article.district, onClick: () => navigateToDistrict(article.district || '') }] : []),
    { label: article.title }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Dynamic NewsArticle Schema Markup Injection */}
      <script type="application/ld+json">
        {JSON.stringify(newsArticleSchema)}
      </script>

      {/* Breadcrumb Navigation (News & Structural SEO) */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* Main Article Content (2 Cols) */}
        <main className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-xs">
          
          {/* Category & District Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span 
              onClick={() => navigateToCategory(article.category)}
              className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded cursor-pointer hover:bg-emerald-800"
            >
              {article.category}
            </span>
            {article.district && (
              <span 
                onClick={() => navigateToDistrict(article.district || '')}
                className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded cursor-pointer hover:bg-amber-600 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" /> {article.district}
              </span>
            )}
            {currentUser && (
              <button 
                onClick={() => {
                  window.location.hash = `#/admin-edit-art-${article.id}`;
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs transition duration-200"
                title="ভুল সংশোধন বা এডিট করুন"
              >
                <Edit className="w-3.5 h-3.5" /> এডিট করুন
              </button>
            )}
            <span className="text-slate-400 text-xs ml-auto flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> প্রকাশিত: {article.publishedAt}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 leading-tight mb-4">
            {article.title}
          </h1>

          {/* Subheadline */}
          {article.subheadline && (
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-6 bg-slate-50 p-4 rounded-lg border-l-4 border-emerald-600">
              {article.subheadline}
            </p>
          )}

          {/* Reporter Bio & Stats */}
          <div className="flex items-center justify-between py-4 border-y border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <img 
                src={article.reporterAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                alt={article.reporterName} 
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-600"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{article.reporterName}</h4>
                <p className="text-xs text-slate-500">{article.reporterRole || 'বিশেষ প্রতিনিধি, নিজোর নিউজ'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {article.readTime}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-[380px] md:h-[460px] object-cover rounded-xl shadow-md"
            />
            {article.imageCaption && (
              <p className="text-xs text-slate-500 text-center mt-2 italic">
                {article.imageCaption}
              </p>
            )}
          </div>

          {/* Article Body */}
          <div 
            className="prose prose-slate max-w-none text-slate-800 text-base md:text-lg leading-relaxed space-y-4 font-sans"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
          />

          {/* Social Share Bar */}
          <SocialShare title={article.title} url={`${window.location.origin}/n/${article.id}`} />

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-600" /> ট্যাগসমূহ:
            </span>
            {article.tags.map((tag, i) => (
              <span key={i} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full transition cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

          {/* In-Article Ad */}
          <div className="my-8">
            <AdSlot position="in_article" />
          </div>

          {/* Comments Section Mockup */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="font-serif font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> পাঠকের মতামত
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
              <p className="text-xs font-bold text-slate-700">আপনার মতামত লিখুন:</p>
              <input type="text" placeholder="আপনার নাম" className="w-full px-3 py-2 text-xs bg-white border rounded" />
              <textarea placeholder="আপনার মন্তব্য..." rows={3} className="w-full px-3 py-2 text-xs bg-white border rounded"></textarea>
              <button onClick={() => alert('আপনার মন্তব্যটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে।')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-bold transition">
                মন্তব্য প্রকাশ করুন
              </button>
            </div>
          </div>

        </main>

        {/* Sidebar (1 Col) */}
        <aside className="space-y-6">
          
          {/* Sidebar Ad */}
          <AdSlot position="sidebar" />

          {/* Related News */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-serif font-bold text-base text-slate-900 mb-4 pb-2 border-b border-slate-200">
              সম্পর্কিত সংবাদ
            </h3>
            <div className="space-y-4">
              {relatedArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="compact" />
              ))}
            </div>
          </div>

          {/* Latest News Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-serif font-bold text-base text-slate-900 mb-4 pb-2 border-b border-slate-200">
              সর্বশেষ খবর
            </h3>
            <div className="space-y-4">
              {latestArticles.map(art => (
                <NewsCard key={art.id} article={art} variant="compact" />
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
};
