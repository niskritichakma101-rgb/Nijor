export type UserRole = 'super_admin' | 'admin' | 'editor' | 'senior_reporter' | 'reporter' | 'content_manager' | 'ad_manager' | 'moderator';

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  assignedDistrict?: string;
  assignedCategory?: string;
  assignedArea?: string;
  status: 'active' | 'blocked' | 'suspended';
  lastLogin?: string;
  activityHistory?: UserActivity[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subheadline?: string;
  content: string;
  excerpt: string;
  category: string;
  subcategory?: string;
  district?: string;
  upazila?: string;
  reporterName: string;
  reporterAvatar?: string;
  reporterRole?: string;
  publishedAt: string;
  updatedAt?: string;
  views: number;
  isFeatured: boolean;
  isBreaking: boolean;
  isLead: boolean;
  image: string;
  images?: string[];
  imageCaption?: string;
  imageSource?: string;
  tags: string[];
  status: 'published' | 'draft' | 'scheduled' | 'pending_review' | 'trash' | 'returned' | 'review';
  scheduledFor?: string;
  readTime: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogImage?: string;
  relatedNews?: string[];
  editorialNote?: string;
}

export interface BreakingNewsItem {
  id: string;
  text: string;
  link?: string;
  active: boolean;
  startTime?: string;
  endTime?: string;
  priority: number;
  order?: number;
  autoExpire?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
}

export interface District {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
}

export interface Advertisement {
  id: string;
  name: string;
  network: 'adsterra' | 'monetag' | 'adsense' | 'custom_html';
  position: 'header' | 'homepage_top' | 'between_news' | 'sidebar' | 'article_top' | 'article_middle' | 'article_bottom' | 'footer' | 'mobile_sticky' | 'desktop_sticky' | 'popup_popunder' | 'in_article' | 'social_bar' | 'mobile';
  device: 'all' | 'desktop' | 'mobile';
  active: boolean;
  type: 'script' | 'banner' | 'adsense' | 'adsterra' | 'monetag' | 'native';
  adCode?: string;
  imageUrl?: string;
  targetUrl?: string;
  adSize?: string;
  startDate?: string;
  endDate?: string;
  priority: number;
  impressions: number;
  clicks: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  active: boolean;
  totalVotes: number;
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  invitedAt: string;
  status: 'pending' | 'accepted';
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'video' | 'document';
  uploadedAt: string;
  size?: string;
  altText?: string;
  caption?: string;
  source?: string;
  folder?: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  articleTitle?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  createdAt: string;
}

export interface RevisionItem {
  id: string;
  articleId: string;
  articleTitle: string;
  editedBy: string;      // Editor name
  editorEmail: string;   // Editor Gmail
  editorRole: string;    // Editor role
  editedAt: string;      // Exact timestamp
  changeSummary: string; // Summary of changes
  title: string;         // Article Snapshot: Title
  subheadline?: string;  // Article Snapshot: Subtitle
  excerpt: string;       // Article Snapshot: Excerpt
  content: string;       // Article Snapshot: Content
  category: string;      // Article Snapshot: Category
  district?: string;     // Article Snapshot: District
  upazila?: string;      // Article Snapshot: Upazila
  image: string;         // Article Snapshot: Featured Image
  tags: string[];        // Article Snapshot: Tags
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export interface SecurityLog {
  id: string;
  userEmail: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  status: 'success' | 'failed' | 'deleted' | 'edit' | 'logout' | 'info';
  deviceInfo?: string;
}

export interface SiteSettings {
  siteName: string;
  siteTitle: string;
  siteSubtitle: string;
  logoUrl: string;
  faviconUrl: string;
  tagline?: string;
  timezone?: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  youtube: string;
  twitter: string;
  instagram: string;
  telegram: string;
  whatsapp?: string;
  aboutUs?: string;
  analyticsId: string;
  googleVerification: string;
  metaKeywords?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  robotsTxt?: string;
  customSitemap?: string;
  customSchemaMarkup?: string;
  customHtmlHeader?: string;
  customHtmlFooter?: string;
  customHtmlSidebar?: string;
  customCss?: string;
  customJs?: string;
  customWidget?: string;
  redirects?: { fromPath: string; toPath: string }[];
  defaultAuthor: string;
  defaultImage?: string;
  adsterraScript: string;
  monetagScript: string;
  footerText: string;
  language: string;
  theme: 'light' | 'dark' | 'editorial';
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  adsEnabled?: boolean;
  homepageLayout: {
    showBreaking: boolean;
    showHero: boolean;
    showFeatured: boolean;
    showDistricts: boolean;
    showPhotoVideo: boolean;
  };
  headerConfig?: {
    showLogo: boolean;
    showMenu: boolean;
    showSearch: boolean;
    showSocial: boolean;
  };
  footerConfig?: {
    footerText: string;
    showMenu: boolean;
    showSocial: boolean;
    copyright: string;
  };
  newsConfig?: {
    defaultAuthor: string;
    defaultImage: string;
    showRelated: boolean;
    showViewCounter: boolean;
    showReadTime: boolean;
  };
  emailConfig?: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    senderName: string;
    senderEmail: string;
  };
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
  seoTitle?: string;
  metaDescription?: string;
  status?: 'published' | 'draft';
}

export interface MagicToken {
  email: string;
  token: string;
  expiresAt: number;
  used: boolean;
}
