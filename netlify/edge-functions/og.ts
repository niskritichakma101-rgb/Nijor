// Netlify Edge Function for Dynamic Social Media Meta Previews (Facebook, Messenger, WhatsApp, Twitter, Telegram)
// Runs globally at the Edge on https://nijornews.netlify.app/n/:id and /article/:id

interface ArticleMeta {
  title: string;
  excerpt: string;
  image: string;
  author?: string;
  category?: string;
  publishedAt?: string;
}

const FIREBASE_CONFIG = {
  projectId: 'refined-vista-kcbh2',
  apiKey: 'AIzaSyDv8YizE4IrTzMIzWacbnh4_axojnjAeqo',
  databaseId: 'ai-studio-nijornews-1efdbe8e-44bf-4d08-8903-51b8518e074d'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fm=jpg&q=80&w=1200&h=630&fit=crop';

const FALLBACK_ARTICLES: Record<string, ArticleMeta> = {
  'art-1': {
    title: 'কাপ্তাই হ্রদের অপরূপ সৌন্দর্যে মুগ্ধ দেশি-বিদেশি পর্যটকরা, বাড়ছে স্থানীয় অর্থনীতি',
    excerpt: 'রাঙামাটির প্রধান আকর্ষণ কাপ্তাই হ্রদে শীতের শুরুতেই পর্যটকদের ঢল নেমেছে। ঝুলন্ত সেতু, পলওয়েল পার্ক ও সুবলং ঝরনায় প্রতিদিন হাজারো পর্যটক ভিড় করছেন...',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fm=jpg&q=80&w=1200&h=630&fit=crop',
    category: 'পার্বত্য চট্টগ্রাম',
    author: 'নিখিলেশ চাকমা',
    publishedAt: '২০২৬-০৯-২৯'
  },
  'art-2': {
    title: 'পাহাড়ে জুম চাষের বাম্পার ফলন, হাসি ফুটেছে জুমিয়া কৃষকদের মুখে',
    excerpt: 'চলতি মৌসুমে তিন পার্বত্য জেলায় জুমের ধানের বাম্পার ফলন হয়েছে। সোনালী ধানের শীষে ভরে উঠেছে পাহাড়ের ঢাল...',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?fm=jpg&q=80&w=1200&h=630&fit=crop',
    category: 'কৃষি ও অর্থনীতি',
    author: 'সুপ্রিয়া মারমা',
    publishedAt: '২০২৬-০৯-২৮'
  },
  'art-3': {
    title: 'বান্দরবানে নতুন ইকোট্যুরিজম জোনের উদ্বোধন করলেন পরিবেশ উপদেষ্টা',
    excerpt: 'প্রকৃতি ও আদিবাসী সংস্কৃতিকে অক্ষুণ্ণ রেখে টেকসই পর্যটনের নতুন দ্বার উন্মোচিত হলো বান্দরবানে...',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?fm=jpg&q=80&w=1200&h=630&fit=crop',
    category: 'পর্যটন ও প্রকৃতি',
    author: 'চিংহ্লামং মারমা',
    publishedAt: '২০২৬-০৯-২৭'
  }
};

async function fetchArticleFromFirestore(id: string): Promise<ArticleMeta | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/${FIREBASE_CONFIG.databaseId}/documents/articles/${id}?key=${FIREBASE_CONFIG.apiKey}`;

  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      return FALLBACK_ARTICLES[id] || null;
    }
    const json: any = await res.json();
    const fields = json.fields || {};

    return {
      title: fields.title?.stringValue || 'NIJOR NEWS | নিজোর নিউজ',
      excerpt: fields.excerpt?.stringValue || fields.subheadline?.stringValue || 'পার্বত্য চট্টগ্রাম এবং সারা বাংলাদেশের নির্ভরযোগ্য স্বাধীন ডিজিটাল সংবাদ মাধ্যম।',
      image: fields.image?.stringValue || DEFAULT_IMAGE,
      category: fields.category?.stringValue || 'সংবাদ',
      author: fields.reporterName?.stringValue || 'নিজোর নিউজ ডেস্ক',
      publishedAt: fields.publishedAt?.stringValue || '২০২৬'
    };
  } catch (err) {
    console.error('Edge function firestore lookup error:', err);
    return FALLBACK_ARTICLES[id] || null;
  }
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Extract id: from /n/:id or /article/:id or search param
  let id = '';
  if (pathParts.length >= 2) {
    id = pathParts[1];
  } else if (url.searchParams.get('id')) {
    id = url.searchParams.get('id') || '';
  }

  if (!id) {
    id = 'art-1';
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  
  // Comprehensive crawler and social scraper detection including Facebook, Messenger, WhatsApp, Twitter, Telegram, LinkedIn
  const isCrawler = /facebookexternalhit|facebot|meta-externalagent|messenger|fb_iab|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|skypeuripreview|pinterest|google-inspectiontool|googlebot|bingbot|applebot/i.test(userAgent);

  // Fetch article metadata from live Firestore with fallback
  const article = await fetchArticleFromFirestore(id) || FALLBACK_ARTICLES[id] || {
    title: 'নিজোর নিউজ | পার্বত্য চট্টগ্রাম ও বাংলাদেশের সংবাদ',
    excerpt: 'পার্বত্য চট্টগ্রাম (রাঙামাটি, খাগড়াছড়ি, বান্দরবান), চট্টগ্রাম এবং সারা দেশের সর্বশেষ খবর, বিশ্লেষণ ও লাইভ আপডেট।',
    image: DEFAULT_IMAGE,
    category: 'সংবাদ',
    author: 'নিজোর নিউজ ডেস্ক'
  };

  const canonicalUrl = `https://nijornews.netlify.app/n/${id}`;
  const appHashUrl = `https://nijornews.netlify.app/#/article/${id}`;
  
  // Determine direct, high-resolution image URL for crawlers
  let imageUrl = DEFAULT_IMAGE;
  if (article.image) {
    if (article.image.startsWith('http://') || article.image.startsWith('https://')) {
      imageUrl = article.image;
      if (imageUrl.includes('images.unsplash.com')) {
        imageUrl = imageUrl.replace(/auto=format/g, 'fm=jpg');
        if (!imageUrl.includes('fm=')) {
          imageUrl += (imageUrl.includes('?') ? '&' : '?') + 'fm=jpg&w=1200&h=630&fit=crop&q=80';
        }
      }
    } else if (article.image.startsWith('data:')) {
      // Base64-uploaded image converted via serverless image endpoint
      imageUrl = `https://nijornews.netlify.app/api/image/${id}.jpg`;
    }
  }

  // NOTE: We deliberately DO NOT include <meta http-equiv="refresh"> in the head.
  // Facebook/Messenger crawlers follow http-equiv="refresh" like a 302 redirect,
  // which stripped the hash fragment and redirected to index.html (the homepage)!
  // Instead, human visitors are redirected instantly via JavaScript window.location.replace,
  // which crawlers ignore, keeping the Open Graph tags intact for Facebook, Messenger, WhatsApp, etc.
  const html = `<!DOCTYPE html>
<html lang="bn" prefix="og: https://ogp.me/ns# article: https://ogp.me/ns/article#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <title>${escapeHtml(article.title)} | নিজোর নিউজ</title>
  <meta name="description" content="${escapeHtml(article.excerpt)}" />
  
  <!-- Open Graph / Facebook / Messenger / WhatsApp -->
  <meta property="og:site_name" content="নিজোর নিউজ | NIJOR NEWS" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(article.title)}" />
  <meta property="og:description" content="${escapeHtml(article.excerpt)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(article.title)}" />
  <meta property="og:locale" content="bn_BD" />
  <meta property="article:section" content="${escapeHtml(article.category || 'সংবাদ')}" />
  <meta property="article:author" content="${escapeHtml(article.author || 'নিজোর নিউজ ডেস্ক')}" />
  
  <!-- Legacy image tags for Messenger & legacy SMS/chat scrapers -->
  <link rel="image_src" href="${imageUrl}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@nijornews" />
  <meta name="twitter:title" content="${escapeHtml(article.title)}" />
  <meta name="twitter:description" content="${escapeHtml(article.excerpt)}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:image:alt" content="${escapeHtml(article.title)}" />

  <!-- Schema.org NewsArticle for Google Rich Results -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": ${JSON.stringify(article.title)},
    "description": ${JSON.stringify(article.excerpt)},
    "image": [${JSON.stringify(imageUrl)}],
    "url": "${canonicalUrl}",
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Nijor News",
      "url": "https://nijornews.netlify.app"
    }
  }
  </script>

  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 'Hind Siliguri', sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; text-align: center; margin: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .card { max-width: 680px; width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: left; }
    .badge { display: inline-block; background: #059669; color: #fff; font-size: 13px; font-weight: bold; padding: 4px 12px; border-radius: 6px; margin-bottom: 12px; }
    h1 { font-size: 24px; line-height: 1.4; margin: 0 0 16px 0; color: #ffffff; }
    img { width: 100%; height: 340px; object-fit: cover; border-radius: 12px; margin-bottom: 16px; background-color: #0f172a; }
    p { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
    .btn { display: inline-block; width: 100%; text-align: center; background: #059669; color: #ffffff; font-weight: bold; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-size: 16px; box-sizing: border-box; }
    .btn:hover { background: #047857; }
  </style>

  ${!isCrawler ? `
  <script>
    // Smooth instant redirection for human readers in web or in-app browsers
    try {
      window.location.replace("${appHashUrl}");
    } catch (e) {
      window.location.href = "${appHashUrl}";
    }
  </script>
  ` : ''}
</head>
<body>
  <div class="card">
    <span class="badge">${escapeHtml(article.category || 'নিজোর নিউজ')}</span>
    <h1>${escapeHtml(article.title)}</h1>
    <img src="${imageUrl}" alt="${escapeHtml(article.title)}" />
    <p>${escapeHtml(article.excerpt)}</p>
    <a href="${appHashUrl}" class="btn">👉 সম্পূর্ণ সংবাদ পড়ুন (Read Full News)</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=120, s-maxage=600',
    }
  });
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
