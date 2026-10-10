import { Article, BreakingNewsItem, Category, District, Advertisement, SiteSettings, User, StaticPage, Poll, Invitation, MediaItem, CommentItem, RevisionItem, NewsletterSubscriber, SecurityLog } from '../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'পার্বত্য চট্টগ্রাম', slug: 'hill-tracts', description: 'রাঙামাটি, খাগড়াছড়ি ও বান্দরবান পার্বত্য জেলার সার্বিক সংবাদ', order: 1, active: true },
  { id: 'cat-2', name: 'রাঙামাটি', slug: 'rangamati', description: 'রাঙামাটি জেলার সর্বশেষ খবর, পর্যটন ও সংস্কৃতি', order: 2, active: true },
  { id: 'cat-3', name: 'খাগড়াছড়ি', slug: 'khagrachhari', description: 'খাগড়াছড়ি জেলার আপডেট ও জনজীবন', order: 3, active: true },
  { id: 'cat-4', name: 'বান্দরবান', slug: 'bandarban', description: 'বান্দরবান পার্বত্য জেলার পাহাড় ও সমতলের সংবাদ', order: 4, active: true },
  { id: 'cat-5', name: 'চট্টগ্রাম', slug: 'chittagong', description: 'চট্টগ্রাম মহানগর ও জেলার খবর', order: 5, active: true },
  { id: 'cat-6', name: 'বাংলাদেশ', slug: 'bangladesh', description: 'সারাদেশের গুরুত্বপূর্ণ খবর', order: 6, active: true },
  { id: 'cat-7', name: 'জাতীয়', slug: 'national', description: 'জাতীয় রাজনীতি ও নীতিনির্ধারণী সংবাদ', order: 7, active: true },
  { id: 'cat-8', name: 'আন্তর্জাতিক', slug: 'international', description: 'বিশ্বের নানা প্রান্তের খবর', order: 8, active: true },
  { id: 'cat-9', name: 'রাজনীতি', slug: 'politics', description: 'রাজনৈতিক বিশ্লেষণ ও কর্মসূচি', order: 9, active: true },
  { id: 'cat-10', name: 'অর্থনীতি', slug: 'economy', description: 'ব্যবসা-বাণিজ্য, ব্যাংক ও অর্থনীতি', order: 10, active: true },
  { id: 'cat-11', name: 'শিক্ষা', slug: 'education', description: 'বিদ্যালয়, বিশ্ববিদ্যালয় ও শিক্ষা ব্যবস্থা', order: 11, active: true },
  { id: 'cat-12', name: 'স্বাস্থ্য', slug: 'health', description: 'স্বাস্থ্যসেবা ও সচেতনতা', order: 12, active: true },
  { id: 'cat-13', name: 'প্রযুক্তি', slug: 'technology', description: 'তথ্যপ্রযুক্তি, গেজেট ও সাইবার বিশ্ব', order: 13, active: true },
  { id: 'cat-14', name: 'খেলাধুলা', slug: 'sports', description: 'ক্রিকেট, ফুটবল ও অন্যান্য খেলা', order: 14, active: true },
  { id: 'cat-15', name: 'বিনোদন', slug: 'entertainment', description: 'চলচ্চিত্র, নাটক ও সংস্কৃতি', order: 15, active: true },
  { id: 'cat-16', name: 'জীবনযাপন', slug: 'lifestyle', description: 'খাবার, ভ্রমণ ও লাইফস্টাইল', order: 16, active: true },
  { id: 'cat-17', name: 'মতামত', slug: 'opinion', description: 'কলাম, সম্পাদকীয় ও কৃতি মতামত', order: 17, active: true },
  { id: 'cat-18', name: 'ছবি', slug: 'photo', description: 'ছবির গল্প ও ফটো গ্যালারি', order: 18, active: true },
  { id: 'cat-19', name: 'ভিডিও', slug: 'video', description: 'ভিডিও রিপোর্ট ও প্রামাণ্যচিত্র', order: 19, active: true },
];

export const initialDistricts: District[] = [
  { id: 'dis-1', name: 'রাঙামাটি', slug: 'rangamati', description: 'কাপ্তাই হ্রদ ও সবুজে ঘেরা রাঙামাটি জেলা', active: true },
  { id: 'dis-2', name: 'খাগড়াছড়ি', slug: 'khagrachhari', description: 'আলুটিলা গুহা ও রিসাং ঝরনার খাগড়াছড়ি', active: true },
  { id: 'dis-3', name: 'বান্দরবান', slug: 'bandarban', description: 'বগালেক ও পাহাড়ের রানী বান্দরবান', active: true },
];

export const initialBreakingNews: BreakingNewsItem[] = [
  { id: 'bn-1', text: 'কাপ্তাই হ্রদে পর্যটকবাহী বোট চলাচল নিরাপদ করতে নতুন নির্দেশনা জারি করেছে জেলা প্রশাসন।', active: true, order: 1, priority: 1 },
  { id: 'bn-2', text: 'খাগড়াছড়িতে আধুনিক ইকো-পার্ক নির্মাণের কাজ দ্রুত এগিয়ে চলেছে।', active: true, order: 2, priority: 2 },
  { id: 'bn-3', text: 'বান্দরবানের নীলাচল ও মেঘলায় পর্যটকদের উপচে পড়া ভিড়।', active: true, order: 3, priority: 3 },
];

export const initialArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'kaptai-lake-tourism-boom-2026',
    title: 'কাপ্তাই হ্রদের অপরূপ সৌন্দর্যে মুগ্ধ দেশি-বিদেশি পর্যটকরা, বাড়ছে স্থানীয় অর্থনীতি',
    subheadline: 'শীতের আমেজে রাঙামাটির ঝুলন্ত সেতু ও সুবলং ঝরনায় পর্যটকদের উপচে পড়া ভিড়, চাঙ্গা হয়ে উঠেছে স্থানীয় হোটেল ও বোট ব্যবসা।',
    excerpt: 'রাঙামাটির প্রধান আকর্ষণ কাপ্তাই হ্রদে শীতের শুরুতেই পর্যটকদের ঢল নেমেছে। ঝুলন্ত সেতু, পলওয়েল পার্ক ও সুবলং ঝরনায় প্রতিদিন হাজারো পর্যটক ভিড় করছেন...',
    content: 'রাঙামাটির প্রধান আকর্ষণ কাপ্তাই হ্রদে শীতের শুরুতেই পর্যটকদের ঢল নেমেছে। ঝুলন্ত সেতু, পলওয়েল পার্ক ও সুবলং ঝরনায় প্রতিদিন হাজারো পর্যটক ভিড় করছেন। পাহাড়ি কনকনে ঠান্ডায় হ্রদের নীল জলরাশি আর চারপাশের সবুজ পাহাড়ের মিতালি দেশি-বিদেশি ভ্রমণপিপাসুদের দারুণভাবে আকর্ষণ করছে।\n\nস্থানীয় বোট চালক ও ব্যবসায়ীরা জানান, গত বছরের তুলনায় এ বছর পর্যটকদের আগমন অনেক বেশি। এতে হোটেল-মোটেল, রেস্টুরেন্ট এবং হস্তশিল্পের ব্যবসা জমজমাট হয়ে উঠেছে। জেলা প্রশাসন ও পুলিশ প্রশাসনের পক্ষ থেকে পর্যটকদের নিরাপত্তা ও সুবিধার্থে বিশেষ নজরদারি রাখা হয়েছে।',
    category: 'পার্বত্য চট্টগ্রাম',
    district: 'রাঙামাটি',
    reporterName: 'নিখিলেশ চাকমা',
    reporterRole: 'সিনিয়র স্টাফ রিপোর্টার',
    reporterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    publishedAt: '২০২৬-০৯-২৯ টি ১০:৩০',
    views: 4520,
    isFeatured: true,
    isBreaking: false,
    isLead: true,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
    imageCaption: 'কাপ্তাই হ্রদের জলে নৌভ্রমণ করছেন পর্যটকরা। ছবি: নিজোর নিউজ',
    tags: ['রাঙামাটি', 'কাপ্তাই হ্রদ', 'পর্যটন', 'পার্বত্য চট্টগ্রাম'],
    status: 'published',
    readTime: '৪ মিনিট',
    seoTitle: 'কাপ্তাই হ্রদ পর্যটন ২০২৬ - রাঙামাটি সংবাদ',
    seoDescription: 'রাঙামাটি কাপ্তাই হ্রদে পর্যটকদের উপচে পড়া ভিড় ও স্থানীয় অর্থনীতির চাকা সচল হওয়ার সর্বশেষ খবর।'
  },
  {
    id: 'art-2',
    slug: 'alutila-cave-khagrachhari-development',
    title: 'খাগড়াছড়ির আলুটিলা রহস্যময় সুড়ঙ্গ ও রিসাং ঝরনায় নতুন সুযোগ-সুবিধা সংযোজন',
    subheadline: 'পর্যটকদের নিরাপত্তা ও চলাচলের সুবিধা বাড়াতে জেলা পরিষদের উদ্যোগে নেওয়া হয়েছে বহুমুখী উন্নয়ন প্রকল্প।',
    excerpt: 'খাগড়াছড়ির অন্যতম জনপ্রিয় পর্যটন কেন্দ্র আলুটিলা পর্যটন কেন্দ্র ও রিসাং ঝরনায় আধুনিক সুযোগ-সুবিধা বৃদ্ধি করা হয়েছে। নতুন সিঁড়ি ও বিশ্রামাগার নির্মাণ করা হয়েছে...',
    content: 'খাগড়াছড়ির অন্যতম জনপ্রিয় পর্যটন কেন্দ্র আলুটিলা পর্যটন কেন্দ্র ও রিসাং ঝরনায় আধুনিক সুযোগ-সুবিধা বৃদ্ধি করা হয়েছে। নতুন সিঁড়ি ও বিশ্রামাগার নির্মাণ করা হয়েছে যাতে পর্যটকরা সহজে ও নিরাপদে ঘুরে বেড়াতে পারেন।\n\nখাগড়াছড়ি জেলা পরিষদের চেয়ারম্যান জানান, পাহাড়ি অঞ্চলের পর্যটন শিল্পের বিকাশে সরকার সব ধরনের সহায়তা প্রদান করছে। স্থানীয় আদিবাসী সংস্কৃতির সাথে পরিচিত হওয়ার জন্য পর্যটকদের বিশেষ গাইড সেবাও চালু করা হয়েছে।',
    category: 'খাগড়াছড়ি',
    district: 'খাগড়াছড়ি',
    reporterName: 'মং শৈ প্রু চৌধুরী',
    reporterRole: 'খাগড়াছড়ি প্রতিনিধি',
    reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    publishedAt: '২০২৬-০৯-২৯ টি ০৯:১৫',
    views: 3120,
    isFeatured: true,
    isBreaking: false,
    isLead: false,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    imageCaption: 'খাগড়াছড়ির পাহাড়ি পথ ও প্রাকৃতিক সৌন্দর্য।',
    tags: ['খাগড়াছড়ি', 'আলুটিলা', 'রিসাং ঝরনা'],
    status: 'published',
    readTime: '৩ মিনিট'
  }
];

export const initialAdvertisements: Advertisement[] = [
  {
    id: 'ad-1',
    name: 'Google AdSense Leaderboard',
    network: 'adsense',
    position: 'header',
    device: 'desktop',
    active: true,
    type: 'adsense',
    adCode: '<div class="bg-slate-100 border border-slate-300 p-3 text-center rounded text-xs text-slate-500">[Google AdSense 728x90 Header Ad]</div>',
    adSize: '728x90',
    priority: 1,
    impressions: 4520,
    clicks: 142
  },
  {
    id: 'ad-2',
    name: 'Hill Tracts Banner Ad (Image)',
    network: 'custom_html',
    position: 'sidebar',
    device: 'all',
    active: true,
    type: 'banner',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
    targetUrl: 'https://nijornews.com/tours',
    adSize: '300x250',
    priority: 2,
    impressions: 8910,
    clicks: 389
  },
  {
    id: 'ad-3',
    name: 'Adsterra Social Bar',
    network: 'adsterra',
    position: 'popup_popunder',
    device: 'all',
    active: true,
    type: 'adsterra',
    adCode: '<script type="text/javascript" src="//adsterra-script-mock.js"></script>',
    adSize: 'Responsive',
    priority: 1,
    impressions: 12400,
    clicks: 520
  }
];

export const initialPolls: Poll[] = [
  {
    id: 'poll-1',
    question: 'পার্বত্য চট্টগ্রামে পর্যটন শিল্পের বিকাশে সবচেয়ে বেশি কোন বিষয়ে জোর দেওয়া উচিত?',
    options: [
      { id: 'opt-1', text: 'যোগাযোগ ব্যবস্থার উন্নয়ন', votes: 412 },
      { id: 'opt-2', text: 'পর্যটকদের নিরাপত্তা ও ইকো-ট্যুরিজম', votes: 689 },
      { id: 'opt-3', text: 'হোটেল-রিসোর্ট ও আবাসন সুবিধা বৃদ্ধি', votes: 245 },
      { id: 'opt-4', text: 'স্থানীয় সংস্কৃতির প্রচার ও প্রসার', votes: 310 }
    ],
    active: true,
    totalVotes: 1656,
    createdAt: '২০২৬-০৯-২৮'
  }
];

export const initialInvitations: Invitation[] = [
  { id: 'inv-1', email: 'reporter.priti@nijornews.com', role: 'reporter', invitedAt: '২০২৬-০৯-২৮', status: 'accepted' },
  { id: 'inv-2', email: 'editor.sujon@nijornews.com', role: 'editor', invitedAt: '২০২৬-০৯-২৯', status: 'pending' }
];

export const initialMediaLibrary: MediaItem[] = [
  { id: 'med-1', title: 'কাপ্তাই হ্রদ বোট রাইড', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200', type: 'image', uploadedAt: '২০২৬-০৯-২৯', size: '1.2 MB', altText: 'Kaptai Lake Boat Ride', caption: 'কাপ্তাই হ্রদের জলরাশি', source: 'নিজোর নিউজ আর্কাইভ', folder: 'Rangamati' },
  { id: 'med-2', title: 'আলুটিলা সুড়ঙ্গ খাগড়াছড়ি', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800', type: 'image', uploadedAt: '২০২৬-০৯-২৯', size: '940 KB', altText: 'Alutila Cave', caption: 'আলুটিলার রহস্যময় গুহা', source: 'নিজোর নিউজ', folder: 'Khagrachhari' }
];

export const initialComments: CommentItem[] = [
  { id: 'com-1', articleId: 'art-1', articleTitle: 'কাপ্তাই হ্রদের অপরূপ সৌন্দর্যে মুগ্ধ...', authorName: 'সুমন চাকমা', authorEmail: 'sumon@gmail.com', content: 'খুব চমৎকার প্রতিবেদন! রাঙামাটির সৌন্দর্য অসাধারণ।', status: 'approved', createdAt: '২০২৬-০৯-২৯ টি ১২:০০' },
  { id: 'com-2', articleId: 'art-2', articleTitle: 'খাগড়াছড়ির আলুটিলা রহস্যময় সুড়ঙ্গ...', authorName: 'রতন ত্রিপুরা', authorEmail: 'ratan@gmail.com', content: 'আলুটিলা গুহা সম্পর্কে আরও তথ্য দেওয়া উচিত ছিল।', status: 'pending', createdAt: '২০২৬-০৯-২৯ টি ১৪:১৫' }
];

export const initialRevisions: RevisionItem[] = [
  { 
    id: 'rev-1', 
    articleId: 'art-1', 
    articleTitle: 'কাপ্তাই হ্রদের অপরূপ সৌন্দর্যে মুগ্ধ দেশি-বিদেশি পর্যটকরা, বাড়ছে স্থানীয় অর্থনীতি', 
    editedBy: 'নিখিলেশ চাকমা', 
    editorEmail: 'admin@nijornews.com',
    editorRole: 'super_admin',
    editedAt: '২০২৬-০৯-২৯T১১:০০:০০+০৬:০০', 
    changeSummary: 'শিরোনাম ও উপশিরোনাম সংশোধন করা হয়েছে।',
    title: 'কাপ্তাই হ্রদের অপরূপ সৌন্দর্যে মুগ্ধ দেশি-বিদেশি পর্যটকরা, বাড়ছে স্থানীয় অর্থনীতি',
    subheadline: 'শীতের আমেজে রাঙামাটির ঝুলন্ত সেতু ও সুবলং ঝরনায় পর্যটকদের উপচে পড়া ভিড়, চাঙ্গা হয়ে উঠেছে স্থানীয় হোটেল ও বোট ব্যবসা।',
    excerpt: 'রাঙামাটির প্রধান আকর্ষণ কাপ্তাই হ্রদে শীতের শুরুতেই পর্যটকদের ঢল নেমেছে। ঝুলন্ত সেতু, পলওয়েল পার্ক ও সুবলং ঝরনায় প্রতিদিন হাজারো পর্যটক ভিড় করছেন...',
    content: 'রাঙামাটির প্রধান আকর্ষণ কাপ্তাই হ্রদে শীতের শুরুতেই পর্যটকদের ঢল নেমেছে। ঝুলন্ত সেতু, পলওয়েল পার্ক ও সুবলং ঝরনায় প্রতিদিন হাজারো পর্যটক ভিড় করছেন। পাহাড়ি কনকনে ঠান্ডায় হ্রদের নীল জলরাশি আর চারপাশের সবুজ পাহাড়ের মিতালি দেশি-বিদেশি ভ্রমণপিপাসুদের দারুণভাবে আকর্ষণ করছে।\n\nস্থানীয় বোট চালক ও ব্যবসায়ীরা জানান, গত বছরের তুলনায় এ বছর পর্যটকদের আগমন অনেক বেশি। এতে হোটেল-মোটেল, রেস্টুরেন্ট এবং হস্তশিল্পের ব্যবসা জমজমাট হয়ে উঠেছে। জেলা প্রশাসন ও পুলিশ প্রশাসনের পক্ষ থেকে পর্যটকদের নিরাপত্তা ও সুবিধার্থে বিশেষ নজরদারি রাখা হয়েছে।',
    category: 'পার্বত্য চট্টগ্রাম',
    district: 'রাঙামাটি',
    upazila: 'সদর',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
    tags: ['রাঙামাটি', 'কাপ্তাই হ্রদ', 'পর্যটন', 'পার্বত্য চট্টগ্রাম']
  }
];

export const initialSubscribers: NewsletterSubscriber[] = [
  { id: 'sub-1', email: 'reader1@gmail.com', subscribedAt: '২০২৬-০৯-২৮', active: true },
  { id: 'sub-2', email: 'reader2@yahoo.com', subscribedAt: '২০২৬-০৯-২৯', active: true }
];

export const initialSecurityLogs: SecurityLog[] = [
  { id: 'log-1', userEmail: 'admin@nijornews.com', action: 'Admin Login Success', ipAddress: '192.168.1.50', timestamp: '২০২৬-০৯-২৯ টি ০৯:০০', status: 'success' },
  { id: 'log-2', userEmail: 'unknown@hacker.com', action: 'Failed Password Attempt', ipAddress: '45.12.33.10', timestamp: '২০২৬-০৯-২৯ টি ২২:১৫', status: 'failed' }
];

export const initialUsers: User[] = [
  {
    id: 'usr-super-admin',
    name: 'নিষ্কৃত চাকমা (Super Admin)',
    email: 'niskritichakma101@gmail.com',
    role: 'super_admin',
    password: 'Niskriti123super',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'সুপার অ্যাডমিন ও প্রকাশক, নিজোর নিউজ। সম্পূর্ণ সিস্টেম ও ইউজার নিয়ন্ত্রণ।',
    status: 'active',
    phone: '+৮৮ ০১৭১১-১১১১১১',
    assignedDistrict: 'রাঙামাটি',
    assignedCategory: 'সার্বিক নিয়ন্ত্রণ',
    lastLogin: 'আজ, সক্রিয়',
    activityHistory: [
      { id: 'act-1', action: 'ড্যাশবোর্ড সুপার এডমিন প্রবেশ', timestamp: '২০২৬-১০-১০ ১২:০০', ip: '192.168.1.1' }
    ]
  },
  {
    id: 'usr-admin',
    name: 'সাইট অ্যাডমিন (Admin)',
    email: 'admin@nijornews.com',
    role: 'admin',
    password: 'Admin100',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    bio: 'সাইট অ্যাডমিন ও অপারেশনাল এক্সিকিউটিভ। সংবাদ, বিজ্ঞাপন ও পাতা নিয়ন্ত্রণ।',
    status: 'active',
    phone: '+৮৮ ০১৭১১-২২২২২২',
    assignedDistrict: 'খাগড়াছড়ি',
    assignedCategory: 'প্রশাসনিক ব্যবস্থাপনা',
    lastLogin: 'আজ',
    activityHistory: [
      { id: 'act-2', action: 'বিজ্ঞাপন ও পাতা হালনাগাদ', timestamp: '২০২৬-১০-১০ ১১:১৫', ip: '192.168.1.2' }
    ]
  },
  {
    id: 'usr-editor',
    name: 'প্রধান সম্পাদক (Editor)',
    email: 'editor@nijornews.com',
    role: 'editor',
    password: 'Cht1001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'প্রধান সম্পাদক ও বার্তা প্রধান। সম্পাদকীয় রিভিউ, সংবাদ প্রকাশ ও ব্রেকিং নিউজ।',
    status: 'active',
    phone: '+৮৮ ০১৭১১-৩৩৩৩৩৩',
    assignedDistrict: 'বান্দরবান',
    assignedCategory: 'সম্পাদকীয় বিভাগ',
    lastLogin: 'আজ',
    activityHistory: [
      { id: 'act-3', action: 'সম্পাদকীয় অনুমোদন ও প্রকাশ', timestamp: '২০২৬-১০-১০ ১০:৩০', ip: '192.168.1.3' }
    ]
  },
  {
    id: 'usr-reporter',
    name: 'স্টাফ রিপোর্টার (Reporter)',
    email: 'reporter@nijornews.com',
    role: 'reporter',
    password: 'nijor100',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    bio: 'মাঠ পর্যায়ের সংবাদ সংগ্রহকারী ও স্টাফ রিপোর্টার।',
    status: 'active',
    phone: '+৮৮ ০১৭১১-৪৪৪৪৪৪',
    assignedDistrict: 'রাঙামাটি',
    assignedCategory: 'পার্বত্য চট্টগ্রাম',
    lastLogin: 'আজ',
    activityHistory: [
      { id: 'act-4', action: 'সংবাদ খসড়া ও প্রতিবেদন জমা', timestamp: '২০২৬-১০-১০ ০৯:৪৫', ip: '192.168.1.4' }
    ]
  }
];

export const initialSettings: SiteSettings = {
  siteName: 'NIJOR NEWS',
  siteTitle: 'নিজোর নিউজ | পার্বত্য চট্টগ্রাম ও বাংলাদেশের সংবাদ',
  siteSubtitle: 'সত্যের সন্ধানে পার্বত্য জনপদের মুখপত্র',
  tagline: 'সত্যের সন্ধানে পার্বত্য জনপদের মুখপত্র',
  timezone: 'Asia/Dhaka',
  logoUrl: '',
  faviconUrl: '',
  phone: '+৮৮ ০১৭০০-০০০০০০',
  email: 'contact@nijornews.com',
  address: 'কেন্দ্রীয় কার্যালয়: বনরূপা, রাঙামাটি সদর, রাঙামাটি-৪৫০ বরকল রোড।',
  facebook: 'https://facebook.com/nijornews',
  youtube: 'https://youtube.com/@nijornews',
  twitter: 'https://twitter.com/nijornews',
  instagram: 'https://instagram.com/nijornews',
  telegram: 'https://t.me/nijornews',
  whatsapp: '+৮৮ ০১৭১১-০০০০০০',
  analyticsId: 'G-XXXXXXXXXX',
  googleVerification: 'google-site-verification=xxxxxx',
  metaKeywords: 'Nijor News, পার্বত্য চট্টগ্রাম, রাঙামাটি খবর, খাগড়াছড়ি সংবাদ, বান্দরবান খবর, পাহাড়ের খবর, পাহাড় সমতল দর্পণ, Chittagong Hill Tracts',
  ogImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
  canonicalUrl: 'https://nijornews.com',
  robotsTxt: "User-agent: *\nAllow: /\n\nSitemap: https://nijornews.com/sitemap.xml",
  customSitemap: "",
  customSchemaMarkup: `{
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "Nijor News",
  "url": "https://nijornews.com",
  "logo": "https://nijornews.com/logo.png",
  "sameAs": [
    "https://facebook.com/nijornews",
    "https://youtube.com/@nijornews"
  ],
  "publishingPrinciples": "https://nijornews.com/editorial-policy"
}`,
  redirects: [
    { fromPath: '/old-about', toPath: '/about-us' },
    { fromPath: '/contact', toPath: '/contact-us' }
  ],
  defaultAuthor: 'নিজোর নিউজ ডেস্ক',
  defaultImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
  adsterraScript: '',
  monetagScript: '',
  footerText: '© ২০২৬ নিজোর নিউজ (NIJOR NEWS). সর্বস্বত্ব সংরক্ষিত। পার্বত্য চট্টগ্রাম ও বাংলাদেশের বিশ্বস্ত সংবাদ মাধ্যম।',
  language: 'bn',
  theme: 'editorial',
  maintenanceMode: false,
  maintenanceMessage: 'আমরা আমাদের সার্ভার রক্ষণাবেক্ষণ করছি। অনুগ্রহ করে কিছুক্ষণের মধ্যে আবার চেষ্টা করুন।',
  homepageLayout: {
    showBreaking: true,
    showHero: true,
    showFeatured: true,
    showDistricts: true,
    showPhotoVideo: true
  },
  headerConfig: {
    showLogo: true,
    showMenu: true,
    showSearch: true,
    showSocial: true
  },
  footerConfig: {
    footerText: '© ২০২৬ নিজোর নিউজ (NIJOR NEWS). সর্বস্বত্ব সংরক্ষিত।',
    showMenu: true,
    showSocial: true,
    copyright: '© ২০২৬ নিজোর নিউজ'
  },
  newsConfig: {
    defaultAuthor: 'নিজোর নিউজ ডেস্ক',
    defaultImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
    showRelated: true,
    showViewCounter: true,
    showReadTime: true
  },
  emailConfig: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'contact@nijornews.com',
    smtpPass: '',
    senderName: 'Nijor News Support',
    senderEmail: 'contact@nijornews.com'
  }
};

export const initialStaticPages: StaticPage[] = [
  {
    id: 'page-about',
    slug: 'about-us',
    title: 'আমাদের সম্পর্কে (About Us)',
    content: 'নিজোর নিউজ (NIJOR NEWS) হলো পার্বত্য চট্টগ্রাম (রাঙামাটি, খাগড়াছড়ি ও বান্দরবান) এবং বাংলাদেশের একটি স্বাধীন ও আধুনিক ডিজিটাল সংবাদ মাধ্যম। পাহাড়ের মানুষের জীবনযাত্রা, সংস্কৃতি, উন্নয়ন, শিক্ষা, অর্থনীতি এবং জাতীয় ও আন্তর্জাতিক সমসাময়িক খবরের নির্ভুল পরিবেশন আমাদের লক্ষ্য।',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'আমাদের সম্পর্কে | নিজোর নিউজ',
    metaDescription: 'নিজোর নিউজ (NIJOR NEWS) হলো পার্বত্য চট্টগ্রামের একটি স্বাধীন ও আধুনিক ডিজিটাল সংবাদ মাধ্যম।',
    status: 'published'
  },
  {
    id: 'page-contact',
    slug: 'contact-us',
    title: 'যোগাযোগ (Contact Us)',
    content: 'আমাদের সাথে যোগাযোগের ঠিকানা:\nঠিকানা: বনরূপা, রাঙামাটি সদর, রাঙামাটি-৪৫০\nইমেইল: contact@nijornews.com\nফোন: +৮৮ ০১৭০০-০০০০০০',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'যোগাযোগ করুন | নিজোর নিউজ',
    metaDescription: 'যোগাযোগ করুন নিজোর নিউজের সাথে - বনরূপা, রাঙামাটি সদর কার্যালয়।',
    status: 'published'
  },
  {
    id: 'page-privacy',
    slug: 'privacy-policy',
    title: 'গোপনীয়তা নীতি (Privacy Policy)',
    content: 'নিজোর নিউজ আপনার গোপনীয়তাকে সম্মান করে। আমরা আমাদের পাঠকদের ব্যক্তিগত তথ্য সুরক্ষা করতে বদ্ধপরিকর। বিস্তারিত জানতে আমাদের গোপনীয়তা নীতি পড়ুন।',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'গোপনীয়তা নীতি | নিজোর নিউজ',
    metaDescription: 'নিজোর নিউজ পোর্টালের গোপনীয়তা নীতি ও ইউজার ডেটা সুরক্ষা গাইডলাইন।',
    status: 'published'
  },
  {
    id: 'page-terms',
    slug: 'terms-and-conditions',
    title: 'শর্তাবলী (Terms & Conditions)',
    content: 'নিজোর নিউজ পোর্টালে প্রকাশিত সকল কন্টেন্ট, ছবি এবং ভিডিওর কপিরাইট নিজোর নিউজ কতৃপক্ষের। অনুমতি ছাড়া কোনো কন্টেন্ট পুনঃপ্রকাশ আইনত দণ্ডনীয়।',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'ব্যবহারের শর্তাবলী | নিজোর নিউজ',
    metaDescription: 'নিজোর নিউজ ব্যবহারের শর্তাবলী এবং আইনগত গাইডলাইন।',
    status: 'published'
  },
  {
    id: 'page-disclaimer',
    slug: 'disclaimer',
    title: 'দাবিত্যাগ (Disclaimer)',
    content: 'নিজোর নিউজে প্রকাশিত বিভিন্ন মতামত লেখকদের নিজস্ব। প্রকাশিত সংবাদের কোনো তথ্যের নির্ভুলতা নিশ্চিত করতে আমরা সর্বোচ্চ সতর্ক থাকি, তবুও যেকোনো তথ্য যাচাই করে ব্যবহারের অনুরোধ করা হলো।',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'দাবিত্যাগ ও আইনগত নোটিশ | নিজোর নিউজ',
    metaDescription: 'নিজোর নিউজ দাবিত্যাগ (Disclaimer) এবং সাধারণ আইনগত সীমাবদ্ধতা নোটিশ।',
    status: 'published'
  },
  {
    id: 'page-editorial',
    slug: 'editorial-policy',
    title: 'সম্পাদকীয় নীতি (Editorial Policy)',
    content: 'আমরা নির্ভুল, নিরপেক্ষ ও বস্তুনিষ্ঠ সাংবাদিকতায় বিশ্বাসী। পার্বত্য অঞ্চলের মানুষের কণ্ঠস্বর বিশ্ববাসীর কাছে পৌঁছে দেওয়াই আমাদের মূল অঙ্গীকার। আমাদের সম্পাদকীয় পরিষদ সম্পূর্ণ স্বাধীন মতামত প্রকাশে প্রতিজ্ঞাবদ্ধ।',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'সম্পাদকীয় নীতিমালা | নিজোর নিউজ',
    metaDescription: 'নিজোর নিউজের স্বাধীন, বস্তুনিষ্ঠ ও নির্ভুল সম্পাদকীয় নীতিমালা।',
    status: 'published'
  },
  {
    id: 'page-advertisement',
    slug: 'advertisement',
    title: 'বিজ্ঞাপন প্রচার (Advertisement)',
    content: 'নিজোর নিউজ পার্বত্য চট্টগ্রাম ও বাংলাদেশের প্রবাসীদের মাঝে অত্যন্ত জনপ্রিয় একটি পোর্টাল। আমাদের পোর্টালে বিজ্ঞাপন দিতে চাইলে অনুগ্রহ করে ইমেইলে যোগাযোগ করুন।',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'বিজ্ঞাপন দিন | নিজোর নিউজ',
    metaDescription: 'কম খরচে রাঙামাটি, খাগড়াছড়ি ও বান্দরবান পোর্টালে বিজ্ঞাপন প্রচার করুন।',
    status: 'published'
  },
  {
    id: 'page-careers',
    slug: 'careers',
    title: 'ক্যারিয়ার (Careers)',
    content: 'আমরা সবসময় দক্ষ ও আগ্রহী সাংবাদিক ও কন্টেন্ট রাইটারদের খুঁজি। আমাদের দলে যোগ দিতে চাইলে আপনার জীবনবৃত্তান্ত (CV) এবং কাজের নমুনা পাঠিয়ে দিন careers@nijornews.com ঠিকানায়।',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'ক্যারিয়ার ও চাকুরীর সুযোগ | নিজোর নিউজ',
    metaDescription: 'নিজোর নিউজের সাথে সাংবাদিকতায় যোগ দিন - ক্যারিয়ার সুযোগ।',
    status: 'published'
  },
  {
    id: 'page-reporter',
    slug: 'reporter-author-page',
    title: 'প্রতিনিধি পাতা (Reporter/Author Page)',
    content: 'পাহাড় ও সমতলের দর্পণ হিসেবে নিজোর নিউজের প্রতিটি জেলা ও উপজেলা প্রতিনিধি বস্তুনিষ্ঠ সংবাদ সংগ্রহ করে আসছেন। তাঁদের তালিকা এবং প্রকাশিত সংবাদসমূহ দেখতে এই পাতাটি ব্রাউজ করুন।',
    updatedAt: '২০২৬-০৯-৩০',
    seoTitle: 'আমাদের রিপোর্টার ও লেখক প্যানেল | নিজোর নিউজ',
    metaDescription: 'পার্বত্য রাঙামাটি, খাগড়াছড়ি ও বান্দরবান জেলার উপজেলা প্রতিনিধিদের বিবরণ।',
    status: 'published'
  }
];
