import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { UserRole } from '../types';
import { RichTextEditor } from '../components/RichTextEditor';
import { 
  LayoutDashboard, Newspaper, Flame, Folder, MapPin, Megaphone, 
  Users, Settings, FileText, Globe, LogOut, Plus, Edit, Trash2, 
  Eye, Check, X, Shield, Search, Sparkles, Image as ImageIcon, 
  BarChart2, Mail, Send, Video, Library, UserCheck, Bell, MessageSquare, 
  Database, Download, Upload, Home, DollarSign, Calendar, Zap, CheckCircle2, Clock,
  Sliders, ShieldAlert, Cpu, RefreshCw, Key, Lock, Smartphone, Monitor, Phone
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    articles, breakingNews, categories, districts, advertisements, settings, users, staticPages,
    polls, invitations, mediaLibrary, comments, revisions, subscribers, securityLogs,
    currentUser, logoutUser, navigateToHome,
    addArticle, updateArticle, deleteArticle,
    addBreakingNews, updateBreakingNews, deleteBreakingNews,
    addCategory, updateCategory, deleteCategory,
    addDistrict, updateDistrict, deleteDistrict,
    updateAdvertisement, addAdvertisement, deleteAdvertisement,
    votePoll, addPoll, deletePoll,
    sendInvitation, deleteInvitation,
    addUser, updateUser, deleteUser,
    addMediaItem, updateMediaItem, deleteMediaItem,
    updateCommentStatus, deleteComment,
    addSubscriber,
    updateSettings, updateStaticPage, addStaticPage, deleteStaticPage, addSecurityLog, deleteSecurityLog
  } = useNews();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [newsFilterSub, setNewsFilterSub] = useState<string>('all'); 
  const [usersFilterSub, setUsersFilterSub] = useState<string>('all'); 
  const [adFilterSub, setAdFilterSub] = useState<string>('banner'); 
  const [settingsSubTab, setSettingsSubTab] = useState<string>('general');
  const [securitySubTab, setSecuritySubTab] = useState<string>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [realtimeVisitors, setRealtimeVisitors] = useState(48);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setRealtimeVisitors(prev => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const nextVal = prev + delta;
        return nextVal > 15 ? (nextVal < 90 ? nextVal : 80) : 25;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // News Editor state
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    subheadline: '',
    excerpt: '',
    content: '',
    category: categories[0]?.name || 'পার্বত্য চট্টগ্রাম',
    subcategory: 'পর্যটন',
    district: 'রাঙামাটি',
    upazila: 'সদর',
    reporterName: currentUser?.name || 'নিজোর নিউজ ডেস্ক',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
    imageCaption: '',
    imageSource: 'নিজোর নিউজ আর্কাইভ',
    tags: 'রাঙামাটি, পাহাড়, সংবাদ',
    isFeatured: false,
    isBreaking: false,
    isLead: false,
    status: 'published' as 'published' | 'draft' | 'scheduled' | 'pending_review' | 'trash',
    scheduledFor: '',
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
    canonicalUrl: '',
    ogImage: '',
    readTime: '৩ মিনিট',
    relatedNews: [] as string[]
  });

  // Local revision history state for the editor
  const [editorRevisions, setEditorRevisions] = useState<any[]>([]);
  const [autosaveBadge, setAutosaveBadge] = useState(false);

  // Autosave simulation effect
  React.useEffect(() => {
    if (isEditingNews && newsForm.title) {
      const handler = setTimeout(() => {
        localStorage.setItem('nijor_news_form_autosave', JSON.stringify(newsForm));
        setAutosaveBadge(true);
        setTimeout(() => setAutosaveBadge(false), 1500);

        // Auto-create a revision checkpoint in our local array
        setEditorRevisions(prev => {
          const checkpoint = {
            id: `rev-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            title: newsForm.title,
            subheadline: newsForm.subheadline,
            content: newsForm.content,
            excerpt: newsForm.excerpt,
            category: newsForm.category,
            district: newsForm.district,
            tags: newsForm.tags
          };
          // limit to max 5 revisions for clarity
          return [checkpoint, ...prev.slice(0, 4)];
        });
      }, 5000); // Trigger autosave after 5 seconds of idle editing

      return () => clearTimeout(handler);
    }
  }, [newsForm, isEditingNews]);

  // Breaking news advanced state
  const [breakingText, setBreakingText] = useState('');
  const [breakingPriority, setBreakingPriority] = useState(1);
  const [breakingAutoExpire, setBreakingAutoExpire] = useState('24h');

  // Category advanced state
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // District advanced state
  const [disName, setDisName] = useState('');
  const [upazilaName, setUpazilaName] = useState('');

  // Ad advanced state
  const [adName, setAdName] = useState('');
  const [adNetwork, setAdNetwork] = useState<'adsterra' | 'monetag' | 'adsense' | 'custom_html'>('adsense');
  const [adPlacement, setAdPlacement] = useState<'header' | 'homepage_top' | 'between_news' | 'sidebar' | 'article_top' | 'article_middle' | 'article_bottom' | 'footer' | 'mobile_sticky' | 'desktop_sticky' | 'popup_popunder'>('sidebar');
  const [adDevice, setAdDevice] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [adType, setAdType] = useState<'script' | 'banner' | 'adsense' | 'adsterra' | 'monetag' | 'native'>('adsense');
  const [adCode, setAdCode] = useState('');
  const [adSize, setAdSize] = useState('300x250');
  const [adPriority, setAdPriority] = useState(1);
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');

  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Advanced User & RBAC state
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({
    super_admin: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Approve: true, 'Manage Ads': true, 'Manage Users': true, 'Manage Settings': true },
    admin: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Approve: true, 'Manage Ads': true, 'Manage Users': true, 'Manage Settings': false },
    editor: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Approve: true, 'Manage Ads': false, 'Manage Users': false, 'Manage Settings': false },
    senior_reporter: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Approve: false, 'Manage Ads': false, 'Manage Users': false, 'Manage Settings': false },
    reporter: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Approve: false, 'Manage Ads': false, 'Manage Users': false, 'Manage Settings': false },
    content_manager: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Approve: false, 'Manage Ads': false, 'Manage Users': false, 'Manage Settings': false },
    ad_manager: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Approve: false, 'Manage Ads': true, 'Manage Users': false, 'Manage Settings': false },
    moderator: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Approve: true, 'Manage Ads': false, 'Manage Users': false, 'Manage Settings': false },
  });

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPhone, setUserFormPhone] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormRole, setUserFormRole] = useState<UserRole>('reporter');
  const [userFormDistrict, setUserFormDistrict] = useState('রাঙামাটি');
  const [userFormCategory, setUserFormCategory] = useState('পার্বত্য চট্টগ্রাম');
  const [userFormStatus, setUserFormStatus] = useState<'active' | 'blocked' | 'suspended'>('active');
  const [userFormAvatar, setUserFormAvatar] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('reporter');

  // Static Page management local states
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [pageFormTitle, setPageFormTitle] = useState('');
  const [pageFormSlug, setPageFormSlug] = useState('');
  const [pageFormContent, setPageFormContent] = useState('');
  const [pageFormSeoTitle, setPageFormSeoTitle] = useState('');
  const [pageFormMetaDesc, setPageFormMetaDesc] = useState('');
  const [pageFormStatus, setPageFormStatus] = useState<'published' | 'draft'>('published');

  // Security Configurations & Live Sessions
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', userEmail: 'admin@nijornews.com', ipAddress: '192.168.1.50', device: 'Chrome / Windows 11', location: 'রাঙামাটি সদর', status: 'Active (Current)' },
    { id: 'sess-2', userEmail: 'editor@nijornews.com', ipAddress: '103.112.54.21', device: 'Safari / iPhone 15 Pro', location: 'খাগড়াছড়ি সদর', status: 'Active' },
    { id: 'sess-3', userEmail: 'reporter.priti@nijornews.com', ipAddress: '182.52.203.111', device: 'Firefox / Mac OS Monterey', location: 'বান্দরবান সদর', status: 'Active' }
  ]);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState(true);
  const [loginAttemptLimit, setLoginAttemptLimit] = useState(5);

  // Media upload state
  const [mediaUploadTitle, setMediaUploadTitle] = useState('');
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [selectedMediaItem, setSelectedMediaItem] = useState<any | null>(null);
  const [compressQuality, setCompressQuality] = useState(80);
  const [resizeWidth, setResizeWidth] = useState('1200');
  const [useWebp, setUseWebp] = useState(true);
  const [newMediaAltText, setNewMediaAltText] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [newMediaSource, setNewMediaSource] = useState('');

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Calculate simulated optimized size
          const originalKB = file.size / 1024;
          let optimizedKB = originalKB;
          
          if (file.type.startsWith('image/')) {
            // Apply compression factor
            optimizedKB = originalKB * (compressQuality / 100);
            if (useWebp) {
              optimizedKB = optimizedKB * 0.75; // WebP is typically 25% smaller
            }
            // Apply resize factor
            if (resizeWidth === '1200' && originalKB > 500) {
              optimizedKB = Math.min(optimizedKB, 180);
            } else if (resizeWidth === '800' && originalKB > 300) {
              optimizedKB = Math.min(optimizedKB, 110);
            }
          }

          const fileFormat = file.type.startsWith('image/') 
            ? (useWebp ? 'image/webp' : file.type) 
            : file.type;

          addMediaItem({
            title: mediaUploadTitle || file.name.split('.')[0],
            url: reader.result as string,
            type: file.type.includes('video') ? 'video' : (file.type.includes('audio') ? 'video' : (file.type.startsWith('image/') ? 'image' : 'document')),
            size: `${optimizedKB.toFixed(1)} KB`,
            altText: newMediaAltText || mediaUploadTitle || 'Media asset',
            caption: newMediaCaption || 'নিজোর নিউজ মিডিয়া গ্যালারি',
            source: newMediaSource || 'অ্যাডমিন আপলোড'
          });
        };
        reader.readAsDataURL(file);
      });
      // Clear inputs
      setMediaUploadTitle('');
      setNewMediaAltText('');
      setNewMediaCaption('');
      setNewMediaSource('');
    }
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = newsForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const slug = newsForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0980-\u09ff-]/g, '') || `news-${Date.now()}`;

    if (editingArticleId) {
      updateArticle(editingArticleId, { ...newsForm, slug, tags: tagArray });
      setEditingArticleId(null);
    } else {
      addArticle({ ...newsForm, slug, tags: tagArray });
    }

    setIsEditingNews(false);
    setNewsForm({
      title: '',
      subheadline: '',
      excerpt: '',
      content: '',
      category: categories[0]?.name || 'পার্বত্য চট্টগ্রাম',
      subcategory: 'পর্যটন',
      district: 'রাঙামাটি',
      upazila: 'সদর',
      reporterName: currentUser?.name || 'নিজোর নিউজ ডেস্ক',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
      imageCaption: '',
      imageSource: 'নিজোর নিউজ আর্কাইভ',
      tags: 'রাঙামাটি, পাহাড়, সংবাদ',
      isFeatured: false,
      isBreaking: false,
      isLead: false,
      status: 'published' as 'published' | 'draft' | 'scheduled' | 'pending_review' | 'trash',
      scheduledFor: '',
      seoTitle: '',
      seoDescription: '',
      focusKeyword: '',
      canonicalUrl: '',
      ogImage: '',
      readTime: '৩ মিনিট',
      relatedNews: []
    });
    setEditorRevisions([]);
  };

  const startEditArticle = (art: typeof articles[0]) => {
    setEditingArticleId(art.id);
    setNewsForm({
      title: art.title,
      subheadline: art.subheadline || '',
      excerpt: art.excerpt,
      content: art.content,
      category: art.category,
      subcategory: art.subcategory || 'पर्यटन',
      district: art.district || 'রাঙামাটি',
      upazila: art.upazila || 'সদর',
      reporterName: art.reporterName,
      image: art.image,
      imageCaption: art.imageCaption || '',
      imageSource: art.imageSource || 'নিজোর নিউজ আর্কাইভ',
      tags: art.tags.join(', '),
      isFeatured: art.isFeatured,
      isBreaking: art.isBreaking,
      isLead: art.isLead,
      status: art.status,
      scheduledFor: art.scheduledFor || '',
      seoTitle: art.seoTitle || '',
      seoDescription: art.seoDescription || '',
      focusKeyword: art.focusKeyword || art.tags[0] || '',
      canonicalUrl: art.canonicalUrl || '',
      ogImage: art.ogImage || art.image || '',
      readTime: art.readTime,
      relatedNews: art.relatedNews || []
    });
    setIsEditingNews(true);
    setActiveTab('news');
  };

  const totalViews = articles.reduce((sum, art) => sum + art.views, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={navigateToHome}>
            <div className="bg-emerald-600 text-white font-serif font-bold text-lg px-2.5 py-1 rounded">
              নিজোর
            </div>
            <div>
              <h2 className="font-serif font-bold text-white text-base">Advanced CMS</h2>
              <p className="text-xs text-emerald-400">NIJOR NEWS ROOM</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
          <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0">
            {currentUser?.name?.[0] || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-white truncate">{currentUser?.name || 'অ্যাডমিন'}</p>
            <p className="text-xs text-emerald-400 uppercase tracking-wider">{currentUser?.role || 'Super Admin'}</p>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1 text-xs font-medium">
          
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'home' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <LayoutDashboard className="w-4 h-4 text-emerald-400" /> 1. Dashboard
          </button>

          {/* 2. সংবাদ ব্যবস্থাপনা */}
          <div className="space-y-1 pt-1">
            <button onClick={() => { setActiveTab('news'); setNewsFilterSub('all'); setIsEditingNews(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition ${activeTab === 'news' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <span className="flex items-center gap-3"><Newspaper className="w-4 h-4 text-emerald-400" /> 2. সংবাদ ব্যবস্থাপনা</span>
            </button>
            {activeTab === 'news' && (
              <div className="pl-8 space-y-1 text-slate-400 text-[11px]">
                <button onClick={() => { setNewsFilterSub('all'); setIsEditingNews(false); }} className={`w-full text-left py-1 hover:text-white ${newsFilterSub === 'all' && !isEditingNews ? 'text-emerald-400 font-bold' : ''}`}>├─ All News</button>
                <button onClick={() => { setIsEditingNews(true); setEditingArticleId(null); }} className={`w-full text-left py-1 hover:text-white ${isEditingNews ? 'text-emerald-400 font-bold' : ''}`}>├─ Add New News</button>
                <button onClick={() => { setNewsFilterSub('published'); setIsEditingNews(false); }} className={`w-full text-left py-1 hover:text-white ${newsFilterSub === 'published' ? 'text-emerald-400 font-bold' : ''}`}>├─ Published</button>
                <button onClick={() => { setNewsFilterSub('draft'); setIsEditingNews(false); }} className={`w-full text-left py-1 hover:text-white ${newsFilterSub === 'draft' ? 'text-emerald-400 font-bold' : ''}`}>├─ Draft</button>
                <button onClick={() => { setNewsFilterSub('pending'); setIsEditingNews(false); }} className={`w-full text-left py-1 hover:text-white ${newsFilterSub === 'pending' ? 'text-emerald-400 font-bold' : ''}`}>├─ Pending Review</button>
                <button onClick={() => { setNewsFilterSub('scheduled'); setIsEditingNews(false); }} className={`w-full text-left py-1 hover:text-white ${newsFilterSub === 'scheduled' ? 'text-emerald-400 font-bold' : ''}`}>├─ Scheduled</button>
                <button onClick={() => { setNewsFilterSub('featured'); setIsEditingNews(false); }} className={`w-full text-left py-1 hover:text-white ${newsFilterSub === 'featured' ? 'text-emerald-400 font-bold' : ''}`}>├─ Featured News</button>
                <button onClick={() => { setNewsFilterSub('most_viewed'); setIsEditingNews(false); }} className={`w-full text-left py-1 hover:text-white ${newsFilterSub === 'most_viewed' ? 'text-emerald-400 font-bold' : ''}`}>├─ Most Viewed</button>
                <button onClick={() => { setNewsFilterSub('trash'); setIsEditingNews(false); }} className={`w-full text-left py-1 hover:text-white ${newsFilterSub === 'trash' ? 'text-emerald-400 font-bold' : ''}`}>└─ Trash</button>
              </div>
            )}
          </div>

          <button onClick={() => setActiveTab('breaking')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'breaking' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Flame className="w-4 h-4 text-amber-400" /> 3. Breaking News
          </button>

          <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'categories' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Folder className="w-4 h-4 text-emerald-400" /> 4. Category & Tags
          </button>

          <button onClick={() => setActiveTab('districts')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'districts' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <MapPin className="w-4 h-4 text-amber-400" /> 5. জেলা ও উপজেলা
          </button>

          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'users' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Users className="w-4 h-4 text-emerald-400" /> 6. Staff & Users
          </button>

          <button onClick={() => setActiveTab('editorial')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'editorial' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 7. Editorial Workflow
          </button>

          <button onClick={() => setActiveTab('scheduled')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'scheduled' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Clock className="w-4 h-4 text-amber-400" /> 8. Scheduled News
          </button>

          <button onClick={() => setActiveTab('ads')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'ads' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Megaphone className="w-4 h-4 text-emerald-400" /> 9. Advertisement
          </button>

          <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'media' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Library className="w-4 h-4 text-emerald-400" /> 10. Media Library
          </button>

          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'analytics' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <BarChart2 className="w-4 h-4 text-emerald-400" /> 11. Analytics
          </button>

          <button onClick={() => setActiveTab('revenue')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'revenue' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <DollarSign className="w-4 h-4 text-emerald-400" /> 12. Revenue
          </button>

          <button onClick={() => setActiveTab('seo')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'seo' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Globe className="w-4 h-4 text-emerald-400" /> 13. SEO
          </button>

          <button onClick={() => setActiveTab('homepage')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'homepage' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Home className="w-4 h-4 text-emerald-400" /> 14. Homepage Manager
          </button>

          <button onClick={() => setActiveTab('comments')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'comments' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <MessageSquare className="w-4 h-4 text-emerald-400" /> 15. Comments ({comments.length})
          </button>

          <button onClick={() => setActiveTab('newsletter')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'newsletter' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Mail className="w-4 h-4 text-emerald-400" /> 16. Newsletter
          </button>

          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'notifications' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Bell className="w-4 h-4 text-amber-400" /> 17. Notifications
          </button>

          <button onClick={() => setActiveTab('pages')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'pages' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <FileText className="w-4 h-4 text-emerald-400" /> 18. Pages
          </button>

          <button onClick={() => setActiveTab('reporters')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'reporters' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <UserCheck className="w-4 h-4 text-emerald-400" /> 19. Reporters Management
          </button>

          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'security' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Shield className="w-4 h-4 text-emerald-400" /> 20. Security & Activity Log
          </button>

          <button onClick={() => setActiveTab('backup')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'backup' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Database className="w-4 h-4 text-emerald-400" /> 21. Backup & Restore
          </button>

          <button onClick={() => setActiveTab('performance')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'performance' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Zap className="w-4 h-4 text-amber-400" /> 22. Performance
          </button>

          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'settings' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Settings className="w-4 h-4 text-emerald-400" /> 23. Site Settings
          </button>

        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={navigateToHome} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-semibold transition">
            ওয়েবসাইট দেখুন
          </button>
          <button onClick={logoutUser} className="w-full bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> লগআউট করুন
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* 1. Dashboard */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-serif font-black text-slate-900">1. Advanced Dashboard</h1>
              <p className="text-xs text-slate-500 mt-1">নিজোর নিউজ নিউজ রুমের রিয়েল-টাইম মেট্রিকস ও কুইক কন্ট্রোল প্যানেল</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Total News</p>
                <h3 className="text-3xl font-black text-slate-900">{articles.length} টি</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <p className="text-xs font-bold text-emerald-600 uppercase">Published News</p>
                <h3 className="text-3xl font-black text-emerald-700">{articles.filter(a => a.status === 'published').length} টি</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <p className="text-xs font-bold text-amber-600 uppercase">Draft & Pending</p>
                <h3 className="text-3xl font-black text-amber-700">{articles.filter(a => a.status === 'draft').length} টি</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <p className="text-xs font-bold text-blue-600 uppercase">Total Views</p>
                <h3 className="text-3xl font-black text-blue-700">{totalViews.toLocaleString('bn-BD')}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900">クイックアクション (Quick Actions)</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setIsEditingNews(true); setActiveTab('news'); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><Plus className="w-4 h-4" /> New News</button>
                <button onClick={() => setActiveTab('breaking')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><Flame className="w-4 h-4" /> Breaking News</button>
                <button onClick={() => setActiveTab('users')} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><Users className="w-4 h-4" /> Add User</button>
                <button onClick={() => setActiveTab('media')} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><Library className="w-4 h-4" /> Upload Media</button>
              </div>
            </div>
          </div>
        )}

        {/* 2. সংবাদ ব্যবস্থাপনা */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-serif font-black text-slate-900">2. সংবাদ ব্যবস্থাপনা ({newsFilterSub})</h1>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" placeholder="সংবাদ খুঁজুন..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-xs" />
                </div>
                <button onClick={() => { setIsEditingNews(true); setEditingArticleId(null); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <Plus className="w-4 h-4" /> Add New News
                </button>
              </div>
            </div>

            {isEditingNews ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
                
                {/* Header with Autosave Status */}
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900">{editingArticleId ? 'সংবাদ সম্পাদনা (Edit Article)' : 'অ্যাডভান্সড নিউজ এডিটর (Create News)'}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">সবগুলো কলাম এবং এসইও ট্যাগ সঠিকভাবে পূরণ করুন</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {autosaveBadge && (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded border border-emerald-200 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                        Autosaved
                      </span>
                    )}
                    <button onClick={() => setIsEditingNews(false)} className="p-1.5 rounded-full hover:bg-slate-100">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveArticle} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT COLUMN: Main News Fields (2 cols wide) */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Title & Subtitle */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">News Title (সংবাদের শিরোনাম)*</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="এখানে আকর্ষক শিরোনাম লিখুন..." 
                            value={newsForm.title} 
                            onChange={e => {
                              const title = e.target.value;
                              const generatedSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0980-\u09ff-]/g, '');
                              setNewsForm({ ...newsForm, title, seoTitle: title, canonicalUrl: `https://nijornews.com/article/${generatedSlug}` });
                            }} 
                            className="w-full px-4 py-2.5 border rounded-lg text-sm font-bold bg-slate-50 focus:bg-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtitle (উপ-শিরোনাম)</label>
                          <input 
                            type="text" 
                            placeholder="সংবাদের আকর্ষণ বাড়াতে ছোট উপ-শিরোনাম..." 
                            value={newsForm.subheadline} 
                            onChange={e => setNewsForm({ ...newsForm, subheadline: e.target.value })} 
                            className="w-full px-4 py-2 border rounded-lg text-xs bg-slate-50 focus:bg-white" 
                          />
                        </div>
                      </div>

                      {/* Author & Taxonomy (Category, Subcategory, District, Upazila) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Author / Reporter</label>
                          <input type="text" value={newsForm.reporterName} onChange={e => setNewsForm({ ...newsForm, reporterName: e.target.value })} className="w-full px-3 py-2 bg-white border rounded text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                          <select value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })} className="w-full px-3 py-2 bg-white border rounded text-xs">
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Subcategory</label>
                          <select value={newsForm.subcategory} onChange={e => setNewsForm({ ...newsForm, subcategory: e.target.value })} className="w-full px-3 py-2 bg-white border rounded text-xs font-bold text-emerald-800">
                            <option value="পর্যটন">পর্যটন (Tourism)</option>
                            <option value="রাজনীতি">রাজনীতি (Politics)</option>
                            <option value="বিনোদন">বিনোদন (Entertainment)</option>
                            <option value="খেলাধুলা">খেলাধুলা (Sports)</option>
                            <option value="ইতিহাস">ইতিহাস (History)</option>
                            <option value="জলবায়ু">জলবায়ু (Climate Change)</option>
                            <option value="অর্থনীতি">অর্থনীতি (Business)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">District (জেলা)</label>
                          <select value={newsForm.district} onChange={e => setNewsForm({ ...newsForm, district: e.target.value })} className="w-full px-3 py-2 bg-white border rounded text-xs">
                            {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Upazila (উপজেলা)</label>
                          <select value={newsForm.upazila} onChange={e => setNewsForm({ ...newsForm, upazila: e.target.value })} className="w-full px-3 py-2 bg-white border rounded text-xs">
                            {newsForm.district === 'খাগড়াছড়ি' ? (
                              <>
                                <option value="সদর">সদর</option>
                                <option value="দীঘিনালা">দীঘিনালা</option>
                                <option value="পানছড়ি">পানছড়ি</option>
                                <option value="মাটিরাঙ্গা">মাটিরাঙ্গা</option>
                                <option value="মহালছড়ি">মহালছড়ি</option>
                                <option value="মানিকছড়ি">মানিকছড়ি</option>
                              </>
                            ) : newsForm.district === 'বান্দরবান' ? (
                              <>
                                <option value="সদর">সদর</option>
                                <option value="রুমা">রুমা</option>
                                <option value="থানচি">থানচি</option>
                                <option value="লামা"> Lama</option>
                                <option value="রোয়াংছড়ি">রোয়াংছড়ি</option>
                                <option value="নাইক্ষ্যংছড়ি">নাইক্ষ্যংছড়ি</option>
                              </>
                            ) : (
                              <>
                                <option value="সদর">সদর</option>
                                <option value="কাপ্তাই">কাপ্তাই</option>
                                <option value="কাউখালী">কাউখালী</option>
                                <option value="বাঘাইছড়ি">বাঘাইছড়ি</option>
                                <option value="লংগদু">লংগদু</option>
                                <option value="নানিয়ারচর">নানিয়ারচর</option>
                                <option value="রাজস্থলী">রাজস্থলী</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Tags (কমা দিয়ে আলাদা করুন)</label>
                          <input type="text" placeholder="যেমন: ঝুলন্ত সেতু, রাঙামাটি, পর্যটন" value={newsForm.tags} onChange={e => setNewsForm({ ...newsForm, tags: e.target.value })} className="w-full px-3 py-2 bg-white border rounded text-xs font-semibold" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Read Time (পড়ার সময়)</label>
                          <input type="text" value={newsForm.readTime} onChange={e => setNewsForm({ ...newsForm, readTime: e.target.value })} className="w-full px-3 py-2 bg-white border rounded text-xs" />
                        </div>
                      </div>

                      {/* Featured Image URL & Captions */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Featured Image URL (ফিচার্ড ছবি লিঙ্ক)*</label>
                            <input type="text" required value={newsForm.image} onChange={e => setNewsForm({ ...newsForm, image: e.target.value, ogImage: e.target.value })} className="w-full px-3 py-2 bg-white border rounded text-xs font-mono" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Image Caption</label>
                              <input type="text" placeholder="ছবির ক্যাপশন লিখুন..." value={newsForm.imageCaption} onChange={e => setNewsForm({ ...newsForm, imageCaption: e.target.value })} className="w-full px-3 py-1.5 bg-white border rounded text-xs" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Image Source / Copyright</label>
                              <input type="text" placeholder="কপিরাইট সূত্র..." value={newsForm.imageSource} onChange={e => setNewsForm({ ...newsForm, imageSource: e.target.value })} className="w-full px-3 py-1.5 bg-white border rounded text-xs" />
                            </div>
                          </div>
                        </div>
                        <div className="border rounded-lg bg-white p-2 flex items-center justify-center h-28 md:h-auto">
                          {newsForm.image ? (
                            <img src={newsForm.image} alt="Featured Preview" className="max-w-full max-h-24 object-cover rounded shadow-2xs" />
                          ) : (
                            <span className="text-[10px] text-slate-400">Featured Image Preview</span>
                          )}
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Excerpt / Summary (সংক্ষিপ্ত পরিচিতি)*</label>
                        <textarea rows={2} required placeholder="সংবাদের প্রথম ২-৩টি আকর্ষণীয় বাক্য এখানে লিখুন..." value={newsForm.excerpt} onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs" />
                      </div>

                      {/* Rich Text News Body */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rich Text News Body (সংবাদ বিস্তারিত)</label>
                        <RichTextEditor value={newsForm.content} onChange={val => setNewsForm({ ...newsForm, content: val })} />
                      </div>

                      {/* Related News List (checkboxes) */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Related Articles (সম্পর্কিত সংবাদ লিংক করুন)</span>
                        <p className="text-[10px] text-slate-400">এই সংবাদের নিচে সম্পর্কিত পড়ার সাজেশন হিসেবে দেখাতে ২/৩টি সংবাদ সিলেক্ট করুন।</p>
                        <div className="max-h-[120px] overflow-y-auto space-y-1.5 border bg-white p-2 rounded-lg">
                          {articles.filter(a => a.id !== editingArticleId).map(art => (
                            <label key={art.id} className="flex items-start gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                              <input 
                                type="checkbox" 
                                checked={newsForm.relatedNews.includes(art.id)} 
                                onChange={e => {
                                  const currentRelated = [...newsForm.relatedNews];
                                  if (e.target.checked) {
                                    setNewsForm({ ...newsForm, relatedNews: [...currentRelated, art.id] });
                                  } else {
                                    setNewsForm({ ...newsForm, relatedNews: currentRelated.filter(id => id !== art.id) });
                                  }
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 shrink-0" 
                              />
                              <span className="truncate">{art.title}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Sidebar for Actions, SEO & Revisions (1 col wide) */}
                    <div className="space-y-6">
                      
                      {/* Action Box */}
                      <div className="bg-slate-900 text-white p-5 rounded-xl space-y-4 shadow-sm border border-slate-800">
                        <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">Publish Settings</span>
                        
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-400 mb-1">Status (সংবাদ স্ট্যাটাস)</label>
                            <select 
                              value={newsForm.status} 
                              onChange={e => setNewsForm({ ...newsForm, status: e.target.value as any })} 
                              className="w-full px-2 py-1.5 bg-slate-800 text-white border border-slate-700 rounded"
                            >
                              <option value="published">Published (প্রকাশিত)</option>
                              <option value="draft">Draft (খসড়া)</option>
                              <option value="pending_review">Pending Review (রিভিউ পেন্ডিং)</option>
                              <option value="scheduled">Scheduled (শিডিউলড)</option>
                              <option value="trash">Trash (আবর্জনা)</option>
                            </select>
                          </div>

                          {newsForm.status === 'scheduled' && (
                            <div className="space-y-1 bg-slate-850 p-2.5 rounded border border-slate-800 animate-fadeIn">
                              <label className="block text-slate-400">Publish Date & Time (শিডিউল সময়)</label>
                              <input 
                                type="datetime-local" 
                                value={newsForm.scheduledFor} 
                                onChange={e => setNewsForm({ ...newsForm, scheduledFor: e.target.value })} 
                                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded font-mono text-white text-[11px]" 
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={newsForm.isBreaking} 
                                onChange={e => setNewsForm({ ...newsForm, isBreaking: e.target.checked })} 
                                className="rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700" 
                              />
                              Breaking News Ticker
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={newsForm.isFeatured} 
                                onChange={e => setNewsForm({ ...newsForm, isFeatured: e.target.checked })} 
                                className="rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700" 
                              />
                              Featured Home Section
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                          <button 
                            type="submit" 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs transition shadow-xs flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" /> সংবাদটি সংরক্ষণ করুন
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              alert(`সংবাদের লাইভ প্রিভিউ:\n----------------------------------------\nশিরোনাম: ${newsForm.title}\nক্যাটাগরি: ${newsForm.category}\nস্টাফ: ${newsForm.reporterName}\nবডি সাইজ: ${newsForm.content.length} অক্ষর\n----------------------------------------\nসংবাদটি প্রিভিউ করা হয়েছে!`);
                            }}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded text-xs transition border border-slate-700"
                          >
                            👁️ Preview Post
                          </button>
                        </div>
                      </div>

                      {/* SEO Fields Box */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b pb-1.5">SEO Optimization (এসইও)</span>
                        
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Focus Keyword (মূল কিওয়ার্ড)</label>
                            <input type="text" placeholder="যেমন: রাঙামাটি ঝুলন্ত সেতু" value={newsForm.focusKeyword} onChange={e => setNewsForm({ ...newsForm, focusKeyword: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs font-semibold" />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">SEO Title (গুগল সার্চ টাইটেল)</label>
                            <input type="text" value={newsForm.seoTitle} onChange={e => setNewsForm({ ...newsForm, seoTitle: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs" />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Meta Description</label>
                            <textarea rows={3} placeholder="গুগল সার্চের জন্য ১৬০ অক্ষরের সারাংশ লিখুন..." value={newsForm.seoDescription} onChange={e => setNewsForm({ ...newsForm, seoDescription: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs" />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Canonical URL (ক্যানোনিকাল)</label>
                            <input type="text" value={newsForm.canonicalUrl} onChange={e => setNewsForm({ ...newsForm, canonicalUrl: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-500" />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Open Graph Image (সোশ্যাল শেয়ার ছবি)</label>
                            <input type="text" value={newsForm.ogImage} onChange={e => setNewsForm({ ...newsForm, ogImage: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-500" />
                          </div>
                        </div>
                      </div>

                      {/* Revision History Safetynet */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b pb-1.5">Revision History & Safetynet</span>
                        <p className="text-[10px] text-slate-400">অটোসেভ ব্যাকআপ এবং পূর্ববর্তী সংস্করণগুলো রি-স্টোর করুন।</p>
                        
                        <div className="space-y-2">
                          {editorRevisions.map((rev) => (
                            <div key={rev.id} className="p-2.5 bg-slate-50 border rounded-lg text-xs space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[10px] font-bold text-emerald-700">⏱️ Checkpoint {rev.timestamp}</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setNewsForm({
                                      ...newsForm,
                                      title: rev.title,
                                      subheadline: rev.subheadline,
                                      content: rev.content,
                                      excerpt: rev.excerpt,
                                      category: rev.category,
                                      district: rev.district,
                                      tags: rev.tags
                                    });
                                    alert(`⏱️ ${rev.timestamp} সংস্করণে সংবাদের ড্রাফটটি সফলভাবে রি-স্টোর করা হয়েছে!`);
                                  }}
                                  className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded transition hover:bg-slate-800"
                                >
                                  Restore
                                </button>
                              </div>
                              <p className="font-bold text-[11px] truncate">{rev.title}</p>
                            </div>
                          ))}
                          {editorRevisions.length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center py-2">কোনো পরিবর্তনের ব্যাকআপ নেই (টাইপ করা শুরু করলে ৫ সেকেন্ড পরপর অটো ব্যাকআপ তৈরি হবে)।</p>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                      <th className="p-4">Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(() => {
                      let filtered = [...articles];
                      if (newsFilterSub === 'featured') {
                        filtered = filtered.filter(art => art.isFeatured);
                      } else if (newsFilterSub === 'most_viewed') {
                        filtered = filtered.sort((a, b) => b.views - a.views);
                      } else if (newsFilterSub !== 'all') {
                        const statusMapping: Record<string, string> = {
                          pending: 'pending_review',
                          published: 'published',
                          draft: 'draft',
                          scheduled: 'scheduled',
                          trash: 'trash'
                        };
                        const targetStatus = statusMapping[newsFilterSub] || newsFilterSub;
                        filtered = filtered.filter(art => art.status === targetStatus);
                      }
                      return filtered.filter(art => art.title.toLowerCase().includes(searchQuery.toLowerCase()));
                    })().map(art => (
                      <tr key={art.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-serif font-bold text-slate-900">{art.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1">📝 {art.reporterName} · 👁️ {art.views} views</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">{art.category}</span>
                          {art.subcategory && (
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[11px] font-bold ml-1">{art.subcategory}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : (art.status === 'draft' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800')}`}>
                            {art.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => startEditArticle(art)} className="bg-slate-100 p-1.5 rounded hover:bg-slate-200" title="Edit Article"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteArticle(art.id)} className="bg-slate-100 text-red-600 p-1.5 rounded hover:bg-red-50" title="Delete Article"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. Breaking News */}
        {activeTab === 'breaking' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">3. Breaking News Advanced Control</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" value={breakingText} onChange={e => setBreakingText(e.target.value)} placeholder="ব্রেকিং নিউজ টেক্সট..." className="md:col-span-2 px-4 py-2 border rounded text-sm" />
                <select value={breakingPriority} onChange={e => setBreakingPriority(Number(e.target.value))} className="px-3 py-2 border rounded text-xs">
                  <option value={1}>Priority: High (1)</option>
                  <option value={2}>Priority: Medium (2)</option>
                  <option value={3}>Priority: Normal (3)</option>
                </select>
              </div>
              <button onClick={() => { if (breakingText.trim()) { addBreakingNews({ text: breakingText, active: true, priority: breakingPriority }); setBreakingText(''); }}} className="bg-red-600 text-white px-5 py-2.5 rounded text-xs font-bold">Add Breaking Ticker</button>
            </div>
          </div>
        )}

        {/* 4. Category & Tags */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">4. Category & Tags Management</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Category Name" className="px-4 py-2 border rounded text-sm" />
                <input type="text" value={catSlug} onChange={e => setCatSlug(e.target.value)} placeholder="Category Slug" className="px-4 py-2 border rounded text-sm font-mono" />
              </div>
              <button onClick={() => { if (catName) { addCategory({ name: catName, slug: catSlug || catName.toLowerCase(), order: categories.length + 1, active: true }); setCatName(''); setCatSlug(''); }}} className="bg-emerald-600 text-white px-5 py-2.5 rounded text-xs font-bold">Add Category</button>
            </div>
          </div>
        )}

        {/* 5. জেলা ও উপজেলা */}
        {activeTab === 'districts' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">5. জেলা ও উপজেলা (Location Hierarchy)</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={disName} onChange={e => setDisName(e.target.value)} placeholder="নতুন জেলা নাম" className="px-4 py-2 border rounded text-sm" />
                <input type="text" value={upazilaName} onChange={e => setUpazilaName(e.target.value)} placeholder="উপজেলা / থানা নাম" className="px-4 py-2 border rounded text-sm" />
              </div>
              <button onClick={() => { if (disName) { addDistrict({ name: disName, slug: disName.toLowerCase(), active: true }); setDisName(''); setUpazilaName(''); }}} className="bg-amber-600 text-white px-5 py-2.5 rounded text-xs font-bold">Add Location Hierarchy</button>
            </div>
          </div>
        )}

        {/* 6. Staff & Users */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900">6. Staff & Permissions (RBAC)</h1>
                <p className="text-xs text-slate-500 mt-1">রোল-বেসড অ্যাক্সেস কন্ট্রোল, স্টাফ মেম্বারদের ইমেইল ইনভাইটেশন এবং কাজের বিবরণ পরিচালনা</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingUser(null);
                    setUserFormName('');
                    setUserFormEmail('');
                    setUserFormPhone('');
                    setUserFormPassword('');
                    setUserFormRole('reporter');
                    setUserFormDistrict('রাঙামাটি');
                    setUserFormCategory('পার্বত্য চট্টগ্রাম');
                    setUserFormStatus('active');
                    setUserFormAvatar('');
                    setIsAddingUser(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> নতুন স্টাফ যুক্ত করুন
                </button>
              </div>
            </div>

            {/* Inner Subtabs for Users View */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-lg w-full max-w-md">
              <button 
                onClick={() => setUsersFilterSub('all')} 
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${usersFilterSub === 'all' || usersFilterSub === 'active' || usersFilterSub === 'blocked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                স্টাফ ডিরেক্টরি (Directory)
              </button>
              <button 
                onClick={() => setUsersFilterSub('matrix')} 
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${usersFilterSub === 'matrix' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                অনুমোদন ম্যাট্রিক্স (Permissions)
              </button>
              <button 
                onClick={() => setUsersFilterSub('invitations')} 
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${usersFilterSub === 'invitations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                ইনভাইটেশন (Invitations)
              </button>
            </div>

            {/* A. STAFF DIRECTORY SUBTAB */}
            {(usersFilterSub === 'all' || usersFilterSub === 'active' || usersFilterSub === 'blocked') && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                      <th className="p-4">স্টাফ প্রোফাইল (Staff Profile)</th>
                      <th className="p-4">রোল ও মোবাইল (Role & Phone)</th>
                      <th className="p-4">বরাদ্দকৃত অঞ্চল ও ক্যাটাগরি (Area/Category)</th>
                      <th className="p-4">স্ট্যাটাস (Status)</th>
                      <th className="p-4">সর্বশেষ লগইন ও অ্যাক্টিভিটি (Last Login)</th>
                      <th className="p-4 text-right">পদক্ষেপ (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} alt={u.name} className="w-10 h-10 rounded-full object-cover border shrink-0 bg-slate-100" />
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider">{u.role.replace('_', ' ')}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.phone || 'মোবাইল নম্বর নেই'}</p>
                        </td>
                        <td className="p-4">
                          <div className="text-[11px] space-y-0.5">
                            <p><span className="text-slate-400">লোকেশন:</span> <span className="font-medium text-slate-800">{u.assignedDistrict || 'রাঙামাটি'}</span></p>
                            <p><span className="text-slate-400">ক্যাটাগরি:</span> <span className="font-medium text-slate-800">{u.assignedCategory || 'সব ক্যাটাগরি'}</span></p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === 'active' ? 'bg-emerald-50 text-emerald-800' : (u.status === 'blocked' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800')}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-slate-500">{u.lastLogin || 'কখনো নয়'}</p>
                          {u.activityHistory && u.activityHistory.length > 0 && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">লাস্ট অ্যাকশন: {u.activityHistory[0].action}</p>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          <button 
                            onClick={() => {
                              setEditingUser(u);
                              setUserFormName(u.name);
                              setUserFormEmail(u.email);
                              setUserFormPhone(u.phone || '');
                              setUserFormPassword(u.password || '');
                              setUserFormRole(u.role);
                              setUserFormDistrict(u.assignedDistrict || 'রাঙামাটি');
                              setUserFormCategory(u.assignedCategory || 'পার্বত্য চট্টগ্রাম');
                              setUserFormStatus(u.status || 'active');
                              setUserFormAvatar(u.avatar || '');
                              setIsAddingUser(true);
                            }}
                            className="bg-slate-100 p-1.5 rounded hover:bg-slate-200 text-slate-700 inline-flex items-center justify-center"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('আপনি কি নিশ্চিতভাবে এই স্টাফ মেম্বারকে ডিরেক্টরি থেকে ডিলিট করতে চান?')) {
                                deleteUser(u.id);
                              }
                            }}
                            className="bg-slate-100 p-1.5 rounded hover:bg-rose-50 text-rose-600 inline-flex items-center justify-center"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* B. PERMISSIONS MATRIX SUBTAB */}
            {usersFilterSub === 'matrix' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-serif font-bold text-base text-slate-900">Role Based Permissions Matrix</h3>
                  <p className="text-[11px] text-slate-400">নিচের গ্রিড থেকে প্রতিটি রোলের জন্য আলাদাভাবে পারমিশন অন বা অফ করা যাবে।</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-700 font-bold uppercase">
                        <th className="p-3">User Role</th>
                        {['View', 'Create', 'Edit', 'Delete', 'Publish', 'Approve', 'Manage Ads', 'Manage Users', 'Manage Settings'].map(perm => (
                          <th key={perm} className="p-3 text-center">{perm}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.keys(rolePermissions).map(role => (
                        <tr key={role} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900 uppercase font-mono">{role.replace('_', ' ')}</td>
                          {['View', 'Create', 'Edit', 'Delete', 'Publish', 'Approve', 'Manage Ads', 'Manage Users', 'Manage Settings'].map(perm => (
                            <td key={perm} className="p-3 text-center">
                              <input 
                                type="checkbox" 
                                checked={rolePermissions[role][perm] || false} 
                                onChange={e => {
                                  const updatedMatrix = { ...rolePermissions };
                                  updatedMatrix[role][perm] = e.target.checked;
                                  setRolePermissions(updatedMatrix);
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500" 
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-3 border-t">
                  <button 
                    onClick={() => alert('রোলের পারমিশন ম্যাট্রিক্স সফলভাবে আপডেট ও লক করা হয়েছে!')}
                    className="bg-emerald-600 text-white px-5 py-2 rounded text-xs font-bold transition hover:bg-emerald-700"
                  >
                    পারমিশন সেটিংস সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}

            {/* C. EMAIL INVITATIONS SUBTAB */}
            {usersFilterSub === 'invitations' && (
              <div className="space-y-6">
                {/* Send Invite Form */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2 border-b pb-2">
                    <Mail className="w-4 h-4 text-emerald-600" /> স্টাফ ইনভাইটেশন পাঠান (Email Invitation)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ইমেইল ঠিকানা (Email Address)</label>
                      <input 
                        type="email" 
                        placeholder="যেমন: editor.rangamati@nijornews.com" 
                        value={inviteEmail} 
                        onChange={e => setInviteEmail(e.target.value)} 
                        className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">বরাদ্দকৃত রোল (Assigned Role)</label>
                      <select 
                        value={inviteRole} 
                        onChange={e => setInviteRole(e.target.value as UserRole)} 
                        className="w-full px-3 py-2 bg-slate-50 border rounded text-xs"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="senior_reporter">Senior Reporter</option>
                        <option value="reporter">Reporter</option>
                        <option value="content_manager">Content Manager</option>
                        <option value="ad_manager">Ad Manager</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (inviteEmail) {
                        sendInvitation(inviteEmail, inviteRole);
                        alert(`ইনভাইটেশন লিংক সফলভাবে ${inviteEmail} ঠিকানায় ইমেইল করা হয়েছে!`);
                        setInviteEmail('');
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-4 h-4" /> ইনভাইটেশন ইমেইল পাঠান
                  </button>
                </div>

                {/* Sent Invitations List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b">
                    <h3 className="font-serif font-bold text-sm text-slate-900">Sent Invitations Queue (প্রেরিত ইনভাইটেশন সমূহ)</h3>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                        <th className="p-4">Invited Email</th>
                        <th className="p-4">Target Role</th>
                        <th className="p-4">Invited Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                      {invitations.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="p-4 font-mono font-medium text-slate-800">{inv.email}</td>
                          <td className="p-4 uppercase font-bold text-emerald-800 text-[10px]">{inv.role.replace('_', ' ')}</td>
                          <td className="p-4 text-slate-500">{inv.invitedAt}</td>
                          <td className="p-4">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{inv.status}</span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => deleteInvitation(inv.id)} 
                              className="bg-rose-50 text-rose-600 px-2.5 py-1 border border-rose-200 rounded hover:bg-rose-100 text-[10px] font-bold transition"
                            >
                              Cancel Invitation
                            </button>
                          </td>
                        </tr>
                      ))}
                      {invitations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">কোনো ইনভাইটেশন তালিকাভুক্ত নেই।</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* D. ADD USER / EDIT USER POPUP MODAL DIALOG */}
            {isAddingUser && (
              <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="flex justify-between items-center bg-slate-900 text-white px-5 py-4">
                    <h3 className="font-serif font-bold text-base">{editingUser ? 'স্টাফ মেম্বার প্রোফাইল এডিট' : 'নতুন স্টাফ মেম্বার যোগ করুন'}</h3>
                    <button onClick={() => setIsAddingUser(false)} className="text-slate-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form 
                    onSubmit={e => {
                      e.preventDefault();
                      const userPayload = {
                        name: userFormName,
                        email: userFormEmail,
                        phone: userFormPhone,
                        password: userFormPassword,
                        role: userFormRole,
                        avatar: userFormAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
                        assignedDistrict: userFormDistrict,
                        assignedCategory: userFormCategory,
                        status: userFormStatus
                      };

                      if (editingUser) {
                        updateUser(editingUser.id, userPayload);
                        alert('স্টাফ মেম্বার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
                      } else {
                        addUser(userPayload);
                        alert('নতুন স্টাফ মেম্বার সফলভাবে যুক্ত করা হয়েছে!');
                      }
                      setIsAddingUser(false);
                    }}
                    className="p-6 space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">নাম (Full Name)*</label>
                        <input type="text" required value={userFormName} onChange={e => setUserFormName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">ইমেইল ঠিকানা (Email)*</label>
                        <input type="email" required value={userFormEmail} onChange={e => setUserFormEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">ফোন নম্বর (Phone)</label>
                        <input type="text" value={userFormPhone} onChange={e => setUserFormPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">পাসওয়ার্ড (Password)</label>
                        <input type="password" placeholder="••••••••" value={userFormPassword} onChange={e => setUserFormPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">স্টাফ রোল (Role)</label>
                        <select value={userFormRole} onChange={e => setUserFormRole(e.target.value as UserRole)} className="w-full px-2 py-2 bg-slate-50 border rounded text-xs">
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="senior_reporter">Senior Reporter</option>
                          <option value="reporter">Reporter</option>
                          <option value="content_manager">Content Manager</option>
                          <option value="ad_manager">Ad Manager</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">স্ট্যাটাস (Account Status)</label>
                        <select value={userFormStatus} onChange={e => setUserFormStatus(e.target.value as any)} className="w-full px-2 py-2 bg-slate-50 border rounded text-xs font-bold">
                          <option value="active">Active (সক্রিয়)</option>
                          <option value="blocked">Blocked (ব্লকড)</option>
                          <option value="suspended">Suspended (স্থগিত)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">বরাদ্দকৃত জেলা (Assigned District)</label>
                        <select value={userFormDistrict} onChange={e => setUserFormDistrict(e.target.value)} className="w-full px-2 py-2 bg-slate-50 border rounded text-xs">
                          <option value="রাঙামাটি">রাঙামাটি (Rangamati)</option>
                          <option value="খাগড়াছড়ি">খাগড়াছড়ি (Khagrachhari)</option>
                          <option value="বান্দরবান">বান্দরবান (Bandarban)</option>
                          <option value="জাতীয়">জাতীয় (National)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">বরাদ্দকৃত ক্যাটাগরি (Assigned Category)</label>
                        <select value={userFormCategory} onChange={e => setUserFormCategory(e.target.value)} className="w-full px-2 py-2 bg-slate-50 border rounded text-xs">
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">প্রোফাইল ছবি ইউআরএল (Profile Photo URL)</label>
                      <input type="text" placeholder="https://..." value={userFormAvatar} onChange={e => setUserFormAvatar(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono" />
                    </div>

                    {editingUser && editingUser.activityHistory && (
                      <div className="border-t pt-3 space-y-1.5">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">অ্যাক্টিভিটি হিস্ট্রি (Activity Log)</span>
                        <div className="max-h-[80px] overflow-y-auto space-y-1 bg-slate-50 p-2 rounded border font-mono text-[9px] text-slate-500">
                          {editingUser.activityHistory.map((act: any) => (
                            <div key={act.id} className="flex justify-between">
                              <span>• {act.action}</span>
                              <span>{act.timestamp} ({act.ip})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button type="button" onClick={() => setIsAddingUser(false)} className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded font-bold text-slate-700 transition">বাতিল</button>
                      <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded font-bold transition shadow-xs">প্রোফাইল সংরক্ষণ করুন</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Editorial Workflow */}
        {activeTab === 'editorial' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">7. Editorial Workflow</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs text-xs space-y-3">
              <p className="font-bold">Newsroom Pipeline: Reporter → Submit → Editor Review → Approve / Reject → Publish</p>
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
                বর্তমানে সমস্ত সংবাদ সফলভাবে এডিটর কর্তৃক রিভিউ ও প্রকাশিত হয়েছে।
              </div>
            </div>
          </div>
        )}

        {/* 8. Scheduled News */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">8. Scheduled News Management</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs text-xs">
              <p>কোনো শিডিউল নিউজ পেন্ডিং নেই।</p>
            </div>
          </div>
        )}

        {/* 9. Advertisement */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-black text-slate-900">9. Advertisement Management System</h1>
              <p className="text-xs text-slate-500 mt-1">Adsterra, Monetag, Google AdSense ও Custom HTML অ্যাড স্লট পরিচালনা</p>
            </div>

            {/* Add Advertisement Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" /> নতুন বিজ্ঞাপন যুক্ত করুন
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ad Name</label>
                  <input type="text" placeholder="যেমন: Header AdSense 728" value={adName} onChange={e => setAdName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ad Network</label>
                  <select value={adNetwork} onChange={e => { setAdNetwork(e.target.value as any); setAdType(e.target.value === 'adsense' ? 'adsense' : e.target.value === 'adsterra' ? 'adsterra' : e.target.value === 'monetag' ? 'monetag' : 'script'); }} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs">
                    <option value="adsense">Google AdSense</option>
                    <option value="adsterra">Adsterra</option>
                    <option value="monetag">Monetag</option>
                    <option value="custom_html">Custom HTML / JavaScript</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Placement (স্থান)</label>
                  <select value={adPlacement} onChange={e => setAdPlacement(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs">
                    <option value="header">Header</option>
                    <option value="homepage_top">Homepage Top</option>
                    <option value="between_news">Between News</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="article_top">Article Top</option>
                    <option value="article_middle">Article Middle</option>
                    <option value="article_bottom">Article Bottom</option>
                    <option value="footer">Footer</option>
                    <option value="mobile_sticky">Mobile Sticky</option>
                    <option value="desktop_sticky">Desktop Sticky</option>
                    <option value="popup_popunder">Popup / Popunder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Device Targeting</label>
                  <select value={adDevice} onChange={e => setAdDevice(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs">
                    <option value="all">Both (Desktop & Mobile)</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ad Size</label>
                  <input type="text" placeholder="728x90, 300x250, Responsive" value={adSize} onChange={e => setAdSize(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Priority (ক্রম)</label>
                  <input type="number" value={adPriority} onChange={e => setAdPriority(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Banner Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleAdImageUpload} className="w-full text-xs text-slate-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target URL</label>
                  <input type="text" placeholder="https://..." value={adTargetUrl} onChange={e => setAdTargetUrl(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono" />
                </div>
                <div className="md:col-span-3 lg:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ad Code / Script / HTML</label>
                  <textarea rows={3} placeholder="<script type='text/javascript' ...></script> বা HTML কোড দিন..." value={adCode} onChange={e => setAdCode(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono" />
                </div>
              </div>

              <button 
                onClick={() => {
                  if (adName) {
                    addAdvertisement({
                      name: adName,
                      network: adNetwork,
                      position: adPlacement,
                      device: adDevice,
                      active: true,
                      type: adImageUrl ? 'banner' : adType,
                      adCode: adCode || `<div class="p-3 bg-slate-100 text-center text-xs text-slate-500">[${adName} - ${adPlacement}]</div>`,
                      imageUrl: adImageUrl,
                      targetUrl: adTargetUrl,
                      adSize,
                      priority: adPriority,
                      impressions: 100,
                      clicks: 0
                    });
                    setAdName('');
                    setAdCode('');
                    setAdImageUrl('');
                    setAdTargetUrl('');
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> বিজ্ঞাপন সংরক্ষণ ও প্রকাশ করুন
              </button>
            </div>

            {/* Advertisements Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                    <th className="p-4">Ad Name & Network</th>
                    <th className="p-4">Placement</th>
                    <th className="p-4">Device</th>
                    <th className="p-4">Impressions / Clicks</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {advertisements.map(ad => (
                    <tr key={ad.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{ad.name}</p>
                        <span className="text-[10px] uppercase font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{ad.network || ad.type}</span>
                      </td>
                      <td className="p-4 font-mono text-emerald-700 font-bold">{ad.position}</td>
                      <td className="p-4 uppercase">{ad.device}</td>
                      <td className="p-4 font-mono">👁️ {ad.impressions || 0} | 🖱️ {ad.clicks || 0}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => updateAdvertisement(ad.id, { active: !ad.active })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ad.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {ad.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteAdvertisement(ad.id)} className="bg-slate-100 text-red-600 p-1.5 rounded hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. Media Library */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900">10. Advanced Media Library</h1>
                <p className="text-xs text-slate-500 mt-1">ছবি, ভিডিও ও অডিও ফাইল আপলোড, কম্প্রেশন, রিসাইজ ও মেটাডেটা অপটিমাইজেশন</p>
              </div>
            </div>

            {/* Upload Options & Advanced Compression Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Library className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-sm text-slate-900">১. ফাইল আপলোড এবং অপ্টিমাইজেশন সেটিংস (Upload & Optimization)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Meta details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">মিডিয়া শিরোনাম (Optional)</label>
                    <input type="text" placeholder="যেমন: রাঙামাটি লেক রিসোর্ট" value={mediaUploadTitle} onChange={e => setMediaUploadTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Alt Text (এসইও বিকল্প টেক্সট)</label>
                    <input type="text" placeholder="যেমন: রাঙামাটি ঝুলন্ত সেতু সৌন্দর্য" value={newMediaAltText} onChange={e => setNewMediaAltText(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ক্যাপশন (Caption)</label>
                    <input type="text" placeholder="যেমন: ঝুলন্ত সেতুর মনোরম দৃশ্য।" value={newMediaCaption} onChange={e => setNewMediaCaption(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">উৎস / কপিরাইট (Source/Copyright)</label>
                    <input type="text" placeholder="যেমন: নিজোর নিউজ / মং শৈ প্রু" value={newMediaSource} onChange={e => setNewMediaSource(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                  </div>
                </div>

                {/* Compression Parameters */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compression & Resize</span>
                  
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 font-medium text-slate-700">
                      <input type="checkbox" checked={useWebp} onChange={e => setUseWebp(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      WebP/AVIF Convert
                    </label>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Recommeded</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-700">
                      <span>Quality (কোয়ালিটি):</span>
                      <span className="font-bold text-emerald-600">{compressQuality}%</span>
                    </div>
                    <input type="range" min="30" max="100" value={compressQuality} onChange={e => setCompressQuality(Number(e.target.value))} className="w-full accent-emerald-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-700">রিসাইজ প্রস্থ (Resize Width):</label>
                    <select value={resizeWidth} onChange={e => setResizeWidth(e.target.value)} className="w-full px-2 py-1 bg-white border rounded text-[11px]">
                      <option value="original">Original Dimensions</option>
                      <option value="1920">Resize to Full HD (1920px)</option>
                      <option value="1200">Resize to Web Standard (1200px)</option>
                      <option value="800">Resize to Mobile Optimized (800px)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Multiple Upload Drag Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 p-6 rounded-xl text-center transition cursor-pointer relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={handleMediaUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">ক্লিক করে ফাইল সিলেক্ট করুন অথবা ড্র্যাগ করুন</p>
                    <p className="text-[10px] text-slate-400 mt-1">Image, Video, Audio & Documents support (একসাথে একাধিক ফাইল আপলোড করা যাবে)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Gallery Grid with Search and Filter */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                {/* Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button onClick={() => setMediaFilter('all')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${mediaFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}>All Files</button>
                  <button onClick={() => setMediaFilter('image')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${mediaFilter === 'image' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}>Images Only</button>
                  <button onClick={() => setMediaFilter('video')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${mediaFilter === 'video' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}>Video / Audio</button>
                  <button onClick={() => setMediaFilter('document')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${mediaFilter === 'document' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}>Documents</button>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input type="text" placeholder="মিডিয়া খুঁজুন..." value={mediaSearch} onChange={e => setMediaSearch(e.target.value)} className="pl-9 pr-3 py-1.5 w-full sm:w-64 text-xs bg-slate-50 border rounded-lg focus:bg-white" />
                </div>
              </div>

              {/* Media Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaLibrary
                  .filter(m => mediaFilter === 'all' || m.type === mediaFilter)
                  .filter(m => m.title.toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map(m => {
                    const isImg = m.type === 'image';
                    const isVid = m.type === 'video';
                    return (
                      <div 
                        key={m.id} 
                        onClick={() => setSelectedMediaItem(m)}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition group cursor-pointer flex flex-col justify-between h-48"
                      >
                        <div className="w-full h-28 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                          {isImg ? (
                            <img src={m.url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : isVid ? (
                            <div className="text-center p-2 text-slate-500">
                              <Video className="w-8 h-8 mx-auto text-emerald-600" />
                              <span className="text-[10px] block mt-1 font-bold">Video / Audio</span>
                            </div>
                          ) : (
                            <div className="text-center p-2 text-slate-500">
                              <FileText className="w-8 h-8 mx-auto text-amber-500" />
                              <span className="text-[10px] block mt-1 font-bold">Document</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 min-w-0">
                          <p className="font-bold text-[11px] text-slate-900 truncate">{m.title}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span className="uppercase">{m.type}</span>
                            <span className="font-mono">{m.size || '142 KB'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {mediaLibrary.filter(m => mediaFilter === 'all' || m.type === mediaFilter).filter(m => m.title.toLowerCase().includes(mediaSearch.toLowerCase())).length === 0 && (
                <div className="bg-white p-12 rounded-xl text-center border text-slate-400 text-xs">
                  কোনো মিডিয়া ফাইল পাওয়া যায়নি।
                </div>
              )}
            </div>

            {/* Media Details / Preview Dialog Modal */}
            {selectedMediaItem && (
              <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-auto">
                  {/* Left Column: Preview */}
                  <div className="w-full md:w-1/2 bg-slate-900 flex items-center justify-center p-4 max-h-[300px] md:max-h-none">
                    {selectedMediaItem.type === 'image' ? (
                      <img src={selectedMediaItem.url} alt={selectedMediaItem.title} className="max-w-full max-h-[400px] object-contain rounded" />
                    ) : selectedMediaItem.type === 'video' ? (
                      <video src={selectedMediaItem.url} controls className="max-w-full max-h-[400px] rounded" />
                    ) : (
                      <div className="text-center text-slate-400 py-10">
                        <FileText className="w-16 h-16 mx-auto text-amber-500" />
                        <p className="mt-2 text-xs font-bold">Document Resource File</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Meta details editor & actions */}
                  <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[400px] md:max-h-none">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-base text-slate-900">Media Asset Properties</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{selectedMediaItem.type} · {selectedMediaItem.size || '120 KB'}</span>
                        </div>
                        <button onClick={() => setSelectedMediaItem(null)} className="p-1 rounded-full hover:bg-slate-100">
                          <X className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700">শিরোনাম (Asset Title)</label>
                          <input 
                            type="text" 
                            value={selectedMediaItem.title} 
                            onChange={e => updateMediaItem(selectedMediaItem.id, { title: e.target.value })} 
                            className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border rounded text-xs" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700">Alt Text (SEO বিকল্প লেখা)</label>
                          <input 
                            type="text" 
                            value={selectedMediaItem.altText || ''} 
                            onChange={e => updateMediaItem(selectedMediaItem.id, { altText: e.target.value })} 
                            className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border rounded text-xs" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700">ক্যাপশন (Caption)</label>
                          <input 
                            type="text" 
                            value={selectedMediaItem.caption || ''} 
                            onChange={e => updateMediaItem(selectedMediaItem.id, { caption: e.target.value })} 
                            className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border rounded text-xs" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700">কপিরাইট উৎস (Source/Copyright)</label>
                          <input 
                            type="text" 
                            value={selectedMediaItem.source || ''} 
                            onChange={e => updateMediaItem(selectedMediaItem.id, { source: e.target.value })} 
                            className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border rounded text-xs" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t mt-4">
                      {/* Replace Image option */}
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Replace Resource</span>
                        <input 
                          type="file" 
                          accept="image/*,video/*" 
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onloadend = () => {
                                updateMediaItem(selectedMediaItem.id, {
                                  url: r.result as string,
                                  size: `${(file.size / 1024).toFixed(1)} KB`
                                });
                                setSelectedMediaItem(null);
                                alert('মিডিয়া ফাইলটি সফলভাবে প্রতিস্থাপন করা হয়েছে!');
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-xs text-slate-500" 
                        />
                      </div>

                      <div className="flex gap-2 text-xs">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedMediaItem.url);
                            alert('মিডিয়া লিংকটি সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে!');
                          }}
                          className="flex-1 bg-slate-900 text-white font-bold py-2 rounded transition hover:bg-slate-800 flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> Copy URL
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('আপনি কি নিশ্চিতভাবে এই মিডিয়াটি মুছে ফেলতে চান?')) {
                              deleteMediaItem(selectedMediaItem.id);
                              setSelectedMediaItem(null);
                            }
                          }}
                          className="px-3 bg-red-50 text-red-600 border border-red-200 rounded transition hover:bg-red-100 flex items-center justify-center"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 11. Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900">11. Advanced Analytics & Traffic</h1>
                <p className="text-xs text-slate-500 mt-1">রিয়েল-টাইম ভিজিটর ট্র্যাকিং, ট্রাফিক সোর্স, ডিভাইস এবং সার্চ ইঞ্জিন অপ্টিমাইজেশন ডেটা</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs text-emerald-800 font-bold self-start sm:self-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Real-time: {realtimeVisitors} জন অনলাইন আছেন</span>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Visitors</p>
                <h3 className="text-xl font-serif font-black text-slate-950 mt-1">১,৫৪,২০৩ জন</h3>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">↑ ৯.৪% গত সপ্তাহ থেকে</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today Visitors</p>
                <h3 className="text-xl font-serif font-black text-slate-950 mt-1">৩,১২৪ জন</h3>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">↑ ১২.১% গতকাল থেকে</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yesterday Visitors</p>
                <h3 className="text-xl font-serif font-black text-slate-950 mt-1">২,৮৯০ জন</h3>
                <span className="text-[10px] text-slate-500 mt-1 inline-block">স্বাভাবিক ট্রাফিক ফ্লো</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Visitors</p>
                <h3 className="text-xl font-serif font-black text-slate-950 mt-1">১৯,৪৫০ জন</h3>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">↑ ৫.৮% বৃদ্ধি</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Visitors</p>
                <h3 className="text-xl font-serif font-black text-slate-950 mt-1">৮৪,২০০ জন</h3>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">↑ ১৫.৪% ওভারঅল বৃদ্ধি</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Page Views</p>
                <h3 className="text-xl font-serif font-black text-slate-950 mt-1">{totalViews.toLocaleString('bn-BD')} বার</h3>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">গড় রিডিং টাইম ৩:১২ মিনিট</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique Visitors</p>
                <h3 className="text-xl font-serif font-black text-slate-950 mt-1">১,১২,৫০০ জন</h3>
                <span className="text-[10px] text-slate-500 mt-1 inline-block">৭৪% নতুন ভিজিটর</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs bg-slate-950 text-white">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-time Visitors</p>
                <h3 className="text-2xl font-serif font-black text-emerald-400 mt-1">{realtimeVisitors} জন</h3>
                <span className="text-[10px] text-emerald-300 font-medium mt-1 inline-block">সরাসরি লাইভ সেশন অ্যাক্টিভিটি</span>
              </div>
            </div>

            {/* Top Articles, Categories & Locations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Top Articles */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-serif font-bold text-sm text-slate-900">Top Articles (সর্বাধিক পঠিত সংবাদ)</h3>
                  <span className="text-[10px] text-slate-400">রিয়েল-টাইম ভিউজ</span>
                </div>
                <div className="space-y-3">
                  {articles.slice(0, 5).map((art, idx) => (
                    <div key={art.id} className="flex items-start gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate hover:underline cursor-pointer">{art.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{art.category}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-700 shrink-0">{art.views.toLocaleString('bn-BD')} ভিউ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-serif font-bold text-sm text-slate-900">Top Categories (শীর্ষ ক্যাটাগরি)</h3>
                  <span className="text-[10px] text-slate-400">ভিজিটর পারসেন্টেজ</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'পার্বত্য চট্টগ্রাম', pct: 45, count: '৩৬,২০০ ভিউ' },
                    { name: 'জাতীয়', pct: 24, count: '১৯,৪০০ ভিউ' },
                    { name: 'খেলাধুলা', pct: 15, count: '১২,১০০ ভিউ' },
                    { name: 'রাজনীতি', pct: 10, count: '৮,০৫০ ভিউ' },
                    { name: 'অন্যান্য', pct: 6, count: '৪,৮২০ ভিউ' }
                  ].map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700 font-medium">
                        <span>{cat.name}</span>
                        <span className="font-bold">{cat.count} ({cat.pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${cat.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Locations */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-serif font-bold text-sm text-slate-900">Top Locations (শীর্ষ পাহাড়ি জেলা)</h3>
                  <span className="text-[10px] text-slate-400">লোকেশন পারসেন্টেজ</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'রাঙামাটি (Rangamati)', pct: 52, count: '৪২,১০০ ভিউ' },
                    { name: 'খাগড়াছড়ি (Khagrachhari)', pct: 28, count: '২২,৬০০ ভিউ' },
                    { name: 'বান্দরবান (Bandarban)', pct: 20, count: '১৬,৪০০ ভিউ' }
                  ].map((loc, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700 font-medium">
                        <span>{loc.name}</span>
                        <span className="font-bold">{loc.count} ({loc.pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${loc.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Traffic Sources & Tech Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Traffic Sources */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 md:col-span-2">
                <h3 className="font-serif font-bold text-sm text-slate-900 border-b pb-2">Traffic Sources (ট্রাফিক উৎসসমূহ)</h3>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  {[
                    { label: 'Direct (সরাসরি)', val: '৪৫%', sub: 'বুকমার্ক ও সরাসরি ভিজিট' },
                    { label: 'Google Search (সার্চ)', val: '৩০%', sub: 'অর্গানিক গুগল সার্চ' },
                    { label: 'Facebook Page (ফেসবুক)', val: '১৫%', sub: 'অফিসিয়াল সোশ্যাল লিংক' },
                    { label: 'Telegram Channels', val: '৬%', sub: 'খবর নোটিফিকেশন গ্রুপ' },
                    { label: 'Others Referrals', val: '৪%', sub: 'অন্যান্য সাইট লিংক' }
                  ].map((src, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border rounded-lg">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{src.label}</span>
                        <span className="font-mono text-emerald-600 font-black">{src.val}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{src.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stats (Browser, OS, Device) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 md:col-span-2">
                <h3 className="font-serif font-bold text-sm text-slate-900 border-b pb-2">User Environment Metrics (ডিভাইস ও ব্রাউজার)</h3>
                <div className="space-y-3 text-xs pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 uppercase font-bold">
                      <span>Device Statistics</span>
                      <span>Desktop: 58% · Mobile: 38% · Tablet: 4%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mt-1">
                      <div className="bg-emerald-600 h-full" style={{ width: '58%' }}></div>
                      <div className="bg-amber-500 h-full" style={{ width: '38%' }}></div>
                      <div className="bg-slate-300 h-full" style={{ width: '4%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 uppercase font-bold">
                      <span>Operating System</span>
                      <span>Windows: 45% · Android: 32% · iOS: 14% · macOS: 9%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mt-1">
                      <div className="bg-slate-900 h-full" style={{ width: '45%' }}></div>
                      <div className="bg-teal-500 h-full" style={{ width: '32%' }}></div>
                      <div className="bg-blue-500 h-full" style={{ width: '14%' }}></div>
                      <div className="bg-rose-500 h-full" style={{ width: '9%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 uppercase font-bold">
                      <span>Web Browser</span>
                      <span>Chrome: 62% · Safari: 18% · Firefox: 10% · Edge: 10%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: '62%' }}></div>
                      <div className="bg-amber-400 h-full" style={{ width: '18%' }}></div>
                      <div className="bg-slate-800 h-full" style={{ width: '10%' }}></div>
                      <div className="bg-blue-600 h-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Google Analytics & Search Console Integration Settings */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2 border-b pb-2">
                <Settings className="w-4 h-4 text-emerald-600" /> Google Analytics & Google Search Console Integration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Google Analytics Tracking ID (G-XXXXXXX)</label>
                  <p className="text-[10px] text-slate-400">গুগল অ্যানালিটিক্স ৪ ট্র্যাকিং কোড বসানোর জন্য আপনার পরিমাপ আইডি (Measurement ID) লিখুন।</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="G-1A2B3C4D5E" 
                      value={settings.analyticsId} 
                      onChange={e => updateSettings({ analyticsId: e.target.value })} 
                      className="flex-1 px-3 py-2 bg-slate-50 border rounded text-xs font-mono" 
                    />
                    <button 
                      onClick={() => alert('গুগল অ্যানালিটিক্স ট্র্যাকিং আইডি সফলভাবে সংরক্ষণ করা হয়েছে!')} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-bold transition shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Google Search Console Verification Tag</label>
                  <p className="text-[10px] text-slate-400">সার্চ কনসোল ভেরিফিকেশনের জন্য মেটা কোড বা সাইট মালিকানা ভেরিফিকেশন কন্টেন্ট ট্যাগ লিখুন।</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="google-site-verification=xxxx..." 
                      value={settings.googleVerification} 
                      onChange={e => updateSettings({ googleVerification: e.target.value })} 
                      className="flex-1 px-3 py-2 bg-slate-50 border rounded text-xs font-mono" 
                    />
                    <button 
                      onClick={() => alert('সার্চ কনসোল ভেরিফিকেশন কোড সফলভাবে সংরক্ষণ করা হয়েছে!')} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-bold transition shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12. Revenue */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">12. Revenue & Earnings</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs">
              <p className="text-xs text-slate-600">Estimated Monthly Revenue: <strong>$1,850.00</strong></p>
            </div>
          </div>
        )}

        {/* 13. SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">13. Advanced SEO Management</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs space-y-4">
              <label className="block text-xs font-bold">Google Search Console Verification Code</label>
              <input type="text" value={settings.googleVerification} onChange={e => updateSettings({ googleVerification: e.target.value })} className="w-full px-3 py-2 border rounded text-sm font-mono" />
            </div>
          </div>
        )}

        {/* 14. Homepage Manager */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">14. Homepage Section Manager</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={settings.homepageLayout.showBreaking} onChange={e => updateSettings({ homepageLayout: { ...settings.homepageLayout, showBreaking: e.target.checked } })} />
                Show Breaking News Ticker
              </label>
            </div>
          </div>
        )}

        {/* 15. Comments */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">15. Comments Management</h1>
            <div className="bg-white rounded-xl border shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                    <th className="p-4">Author</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comments.map(c => (
                    <tr key={c.id}>
                      <td className="p-4 font-bold">{c.authorName}</td>
                      <td className="p-4">{c.content}</td>
                      <td className="p-4 uppercase font-bold text-[10px] text-emerald-700">{c.status}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => updateCommentStatus(c.id, 'approved')} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Approve</button>
                        <button onClick={() => deleteComment(c.id)} className="bg-red-100 text-red-800 px-2 py-1 rounded">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 16. Newsletter */}
        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">16. Newsletter Campaign</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs space-y-4">
              <h3 className="font-bold text-sm">Subscribers: {subscribers.length}</h3>
              <button onClick={() => alert('Newsletter campaign sent!')} className="bg-emerald-600 text-white px-5 py-2 rounded text-xs font-bold">Send Campaign</button>
            </div>
          </div>
        )}

        {/* 17. Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">17. Notifications</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs text-xs">
              <p>No new system alerts.</p>
            </div>
          </div>
        )}

        {/* 18. Pages */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900">📄 Custom & Static Pages</h1>
                <p className="text-xs text-slate-500 mt-1">পোর্টালে প্রকাশিত আমাদের সম্পর্কে, শর্তাবলী এবং যেকোনো কাস্টম পৃষ্ঠা তৈরি ও পরিচালনা করুন</p>
              </div>
              {!isAddingPage && !editingPage && (
                <button 
                  onClick={() => {
                    setIsAddingPage(true);
                    setPageFormTitle('');
                    setPageFormSlug('');
                    setPageFormContent('');
                    setPageFormSeoTitle('');
                    setPageFormMetaDesc('');
                    setPageFormStatus('published');
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 self-start sm:self-auto shadow-xs"
                >
                  <Plus className="w-4 h-4" /> কাস্টম পেজ তৈরি করুন (Create Custom Page)
                </button>
              )}
            </div>

            {/* Form to Add or Edit Page */}
            {(isAddingPage || editingPage) ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    {editingPage ? `Edit Page: ${editingPage.title}` : 'নতুন কাস্টম পেজ যুক্ত করুন'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsAddingPage(false);
                      setEditingPage(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ফিরে যান (Back to List)
                  </button>
                </div>

                <form 
                  onSubmit={e => {
                    e.preventDefault();
                    if (!pageFormTitle.trim() || !pageFormSlug.trim()) {
                      alert('দয়া করে শিরোনাম এবং স্লুগ পূরণ করুন।');
                      return;
                    }

                    const pagePayload = {
                      title: pageFormTitle,
                      slug: pageFormSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      content: pageFormContent,
                      seoTitle: pageFormSeoTitle || pageFormTitle,
                      metaDescription: pageFormMetaDesc,
                      status: pageFormStatus
                    };

                    if (editingPage) {
                      updateStaticPage(editingPage.slug, pagePayload.content, pagePayload.title, pagePayload.seoTitle, pagePayload.metaDescription, pagePayload.status);
                      addSecurityLog({
                        userEmail: currentUser?.email || 'admin@nijornews.com',
                        action: `পেজ সম্পাদন (Edit Page): "${pagePayload.title}"`,
                        ipAddress: '192.168.1.102',
                        status: 'edit',
                        deviceInfo: 'Chrome / Linux'
                      });
                      alert('পেজটি সফলভাবে সংশোধন করা হয়েছে!');
                    } else {
                      addStaticPage(pagePayload);
                      addSecurityLog({
                        userEmail: currentUser?.email || 'admin@nijornews.com',
                        action: `নতুন পেজ তৈরি (Create Page): "${pagePayload.title}"`,
                        ipAddress: '192.168.1.102',
                        status: 'success',
                        deviceInfo: 'Chrome / Linux'
                      });
                      alert('নতুন কাস্টম পেজটি সফলভাবে তৈরি করা হয়েছে!');
                    }
                    setIsAddingPage(false);
                    setEditingPage(null);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">পৃষ্ঠার শিরোনাম (Page Title)*</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="আমাদের সম্পর্কে..." 
                        value={pageFormTitle} 
                        onChange={e => {
                          setPageFormTitle(e.target.value);
                          if (!editingPage) {
                            // auto-generate slug
                            setPageFormSlug(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 40));
                          }
                        }} 
                        className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-bold" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">পৃষ্ঠার স্লুগ (Page Slug)*</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="about-us" 
                        value={pageFormSlug} 
                        onChange={e => setPageFormSlug(e.target.value)} 
                        className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono font-bold text-slate-600" 
                        disabled={!!editingPage} // don't change slug for core pages
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">পৃষ্ঠার কন্টেন্ট (Page Content - HTML/Text)*</label>
                    <textarea 
                      rows={10} 
                      required 
                      placeholder="পৃষ্ঠার সমস্ত তথ্য বা টেক্সট এখানে লিখুন..." 
                      value={pageFormContent} 
                      onChange={e => setPageFormContent(e.target.value)} 
                      className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-sans leading-relaxed" 
                    />
                  </div>

                  {/* SEO Block */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider">SEO Optimization (পৃষ্ঠার জন্য এসইও কনফিগারেশন)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">SEO Meta Title (এসইও শিরোনাম)</label>
                        <input 
                          type="text" 
                          placeholder="About Us | Nijor News" 
                          value={pageFormSeoTitle} 
                          onChange={e => setPageFormSeoTitle(e.target.value)} 
                          className="w-full px-3 py-1.5 bg-white border rounded text-xs" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Status (পেজ স্ট্যাটাস)</label>
                        <select 
                          value={pageFormStatus} 
                          onChange={e => setPageFormStatus(e.target.value as any)} 
                          className="w-full px-2 py-1.5 bg-white border rounded text-xs font-bold"
                        >
                          <option value="published">Published (প্রকাশিত)</option>
                          <option value="draft">Draft (খসড়া)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="block font-bold text-slate-700">SEO Meta Description (এসইও সংক্ষেপ বিবরণ)</label>
                        <input 
                          type="text" 
                          placeholder="পৃষ্ঠাটি সম্পর্কে গুগলের জন্য একটি আকর্ষণীয় বর্ণনা লিখুন..." 
                          value={pageFormMetaDesc} 
                          onChange={e => setPageFormMetaDesc(e.target.value)} 
                          className="w-full px-3 py-1.5 bg-white border rounded text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAddingPage(false);
                        setEditingPage(null);
                      }} 
                      className="px-4 py-2 border rounded font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      বাতিল (Cancel)
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 shadow-xs"
                    >
                      পেজ সংরক্ষণ করুন (Save Page)
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                      <th className="p-4">Title (পৃষ্ঠা শিরোনাম)</th>
                      <th className="p-4">Slug (স্লুগ)</th>
                      <th className="p-4">SEO Details (এসইও বিবরণ)</th>
                      <th className="p-4">Status (স্ট্যাটাস)</th>
                      <th className="p-4">Last Updated (আপডেট)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {staticPages.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-900">{p.title}</td>
                        <td className="p-4 font-mono text-slate-500">/{p.slug}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{p.seoTitle || p.title}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{p.metaDescription || 'No description set.'}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'draft' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-50 text-emerald-800'}`}>
                            {p.status || 'published'}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-500">{p.updatedAt}</td>
                        <td className="p-4 text-right space-x-2 shrink-0">
                          <button 
                            onClick={() => {
                              setEditingPage(p);
                              setPageFormTitle(p.title);
                              setPageFormSlug(p.slug);
                              setPageFormContent(p.content);
                              setPageFormSeoTitle(p.seoTitle || p.title);
                              setPageFormMetaDesc(p.metaDescription || '');
                              setPageFormStatus(p.status || 'published');
                            }} 
                            className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded transition"
                            title="Edit Static Page"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {p.id.startsWith('page-custom') || !['about-us', 'contact-us', 'privacy-policy', 'terms-and-conditions', 'disclaimer', 'editorial-policy', 'advertisement', 'careers', 'reporter-author-page'].includes(p.slug) ? (
                            <button 
                              onClick={() => {
                                if (confirm(`আপনি কি নিশ্চিতভাবে "${p.title}" পেজটি চিরতরে ডিলিট করতে চান?`)) {
                                  deleteStaticPage(p.id);
                                  addSecurityLog({
                                    userEmail: currentUser?.email || 'admin@nijornews.com',
                                    action: `পেজ ডিলিট (Delete Page): "${p.title}"`,
                                    ipAddress: '192.168.1.102',
                                    status: 'deleted',
                                    deviceInfo: 'Chrome / Linux'
                                  });
                                  alert('পেজটি সফলভাবে মুছে ফেলা হয়েছে!');
                                }
                              }}
                              className="bg-slate-100 hover:bg-red-50 text-red-600 p-1.5 rounded transition"
                              title="Delete Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 19. Reporters Management */}
        {activeTab === 'reporters' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">19. Reporters Management</h1>
            <div className="bg-white rounded-xl border shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                    <th className="p-4">Reporter</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Assigned Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.filter(u => u.role === 'reporter' || u.role === 'admin').map(u => (
                    <tr key={u.id}>
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">পার্বত্য চট্টগ্রাম</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 20. Security & Activity Log */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900">20. Security & Activity Control</h1>
                <p className="text-xs text-slate-500 mt-1">লগইন ইতিহাস, স্টাফ কার্যক্রম ট্র্যাকিং, সেশন ম্যানেজমেন্ট এবং নিরাপত্তা নীতিমালা</p>
              </div>
              
              {/* Security Subtabs */}
              <div className="flex bg-slate-100 p-1 rounded-lg border text-xs shrink-0 self-start md:self-auto">
                <button 
                  onClick={() => setSecuritySubTab('logs')}
                  className={`px-3 py-1.5 rounded-md font-bold transition ${securitySubTab === 'logs' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  📝 Activity Logs
                </button>
                <button 
                  onClick={() => setSecuritySubTab('sessions')}
                  className={`px-3 py-1.5 rounded-md font-bold transition ${securitySubTab === 'sessions' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  💻 Active Sessions ({activeSessions.length})
                </button>
                <button 
                  onClick={() => setSecuritySubTab('policy')}
                  className={`px-3 py-1.5 rounded-md font-bold transition ${securitySubTab === 'policy' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  🔒 Security Policies & 2FA
                </button>
              </div>
            </div>

            {/* A. ACTIVITY LOGS SUBTAB */}
            {securitySubTab === 'logs' && (
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-2xs">
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="ইউজার মেইল বা কার্যকলাপে খুঁজুন..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs" 
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <button 
                      onClick={() => {
                        if (confirm('আপনি কি সমস্ত অডিট লগ মুছে ফেলতে চান?')) {
                          securityLogs.forEach(l => deleteSecurityLog(l.id));
                          alert('সমস্ত অ্যাক্টিভিটি লগ সফলভাবে মুছে ফেলা হয়েছে!');
                        }
                      }}
                      className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded text-xs font-bold shrink-0 transition"
                    >
                      🗑️ Clear All Logs
                    </button>
                  </div>
                </div>

                {/* Audit Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                        <th className="p-4">User Details (ব্যবহারকারী)</th>
                        <th className="p-4">Action Event (কার্যক্রম বিবরণ)</th>
                        <th className="p-4">IP Log (আইপি লগ)</th>
                        <th className="p-4">Device Info (ডিভাইস বিবরণ)</th>
                        <th className="p-4">Date/Time (তারিখ ও সময়)</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                      {securityLogs
                        .filter(l => 
                          l.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.action.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(l => (
                          <tr key={l.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-mono font-bold text-slate-900">{l.userEmail}</td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800">{l.action}</span>
                              <span className={`inline-block ml-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                l.status === 'success' || l.status === 'info' ? 'bg-emerald-50 text-emerald-800' :
                                l.status === 'failed' ? 'bg-red-50 text-red-800' :
                                l.status === 'deleted' ? 'bg-rose-50 text-rose-800' : 'bg-blue-50 text-blue-800'
                              }`}>
                                {l.status}
                              </span>
                            </td>
                            <td className="p-4 font-mono">📍 {l.ipAddress}</td>
                            <td className="p-4 text-slate-500 font-medium">{l.deviceInfo || 'Unknown Device'}</td>
                            <td className="p-4 text-slate-500 font-semibold">{l.timestamp}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => {
                                  deleteSecurityLog(l.id);
                                  alert('এই অডিট লগ এন্ট্রিটি সফলভাবে মুছে ফেলা হয়েছে!');
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete Log Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {securityLogs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-slate-400 font-bold">কোনো অ্যাক্টিভিটি সিকিউরিটি লগ রেকর্ড পাওয়া যায়নি।</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* B. ACTIVE SESSIONS SUBTAB */}
            {securitySubTab === 'sessions' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl space-y-1">
                  <p className="font-bold">🔐 রিয়েল-টাইম সেশন মনিটরিং (Real-time Session Management)</p>
                  <p>বর্তমানে পার্বত্য চট্টগ্রামের বিভিন্ন সদর কার্যালয় থেকে ড্যাশবোর্ডে লগইন থাকা সক্রিয় স্টাফ সেশনগুলোর তালিকা। আপনি চাইলে যেকোনো সেশনকে "Force Logout" করতে পারেন।</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeSessions.map((sess) => (
                    <div key={sess.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-900">{sess.userEmail}</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold mt-1.5 uppercase ${
                            sess.status.includes('Current') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {sess.status}
                          </span>
                        </div>
                        <span className="text-xs">💻</span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-600 border-t pt-3">
                        <p className="flex justify-between">
                          <span className="font-medium">আইপি এড্রেস:</span>
                          <span className="font-mono font-bold text-slate-800">{sess.ipAddress}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">ডিভাইস / ব্রাউজার:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[150px]">{sess.device}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">লোকেশন:</span>
                          <span className="font-bold text-emerald-800">📍 {sess.location}</span>
                        </p>
                      </div>

                      {!sess.status.includes('Current') && (
                        <button 
                          onClick={() => {
                            if (confirm(`আপনি কি নিশ্চিতভাবে ${sess.userEmail} এর এই সেশনটি বন্ধ (Force Logout) করতে চান?`)) {
                              setActiveSessions(prev => prev.filter(s => s.id !== sess.id));
                              addSecurityLog({
                                userEmail: sess.userEmail,
                                action: `সেশন ফোর্স লগআউট (Force Logout Session)`,
                                ipAddress: sess.ipAddress,
                                status: 'logout',
                                deviceInfo: sess.device
                              });
                              alert(`${sess.userEmail} এর সেশনটি সফলভাবে ফোর্স লগআউট করা হয়েছে!`);
                            }
                          }}
                          className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold py-1.5 rounded-lg text-[10px] transition uppercase tracking-wider"
                        >
                          Force Logout
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. SECURITY RULES & POLICY SUBTAB */}
            {securitySubTab === 'policy' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" /> Strict Security Policies & Staff Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Two Factor Auth Configuration */}
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-slate-800 text-xs">Two-Factor Authentication (2FA)</span>
                        <span className="text-[10px] text-slate-400">স্টাফদের জন্য ওটিপি বা জিমেইল টু-ফ্যাক্টর বাধ্যতামুলক করুন।</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={twoFactorAuth} 
                        onChange={e => {
                          setTwoFactorAuth(e.target.checked);
                          addSecurityLog({
                            userEmail: currentUser?.email || 'admin@nijornews.com',
                            action: `টু-ফ্যাক্টর সেটিংস পরিবর্তন: ${e.target.checked ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`,
                            ipAddress: '192.168.1.102',
                            status: 'info',
                            deviceInfo: 'Chrome / Windows'
                          });
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" 
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 bg-white p-2.5 rounded border">
                      ✓ ২-ফ্যাক্টর সক্রিয় থাকলে সমস্ত স্টাফদের লগইনের সময় তাদের ভেরিফাইড মেইল ঠিকানায় ৬ অঙ্কের ওয়ান-টাইম পাসওয়ার্ড (OTP) কোড পাঠানো হবে।
                    </p>
                  </div>

                  {/* Password Strength Policy */}
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-slate-800 text-xs">Strict Password Policy (পাসওয়ার্ড নীতি)</span>
                        <span className="text-[10px] text-slate-400">স্টাফ মেম্বারদের জন্য কঠিন পাসওয়ার্ড বাধ্যতামুলক করুন।</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={passwordPolicy} 
                        onChange={e => {
                          setPasswordPolicy(e.target.checked);
                          addSecurityLog({
                            userEmail: currentUser?.email || 'admin@nijornews.com',
                            action: `পাসওয়ার্ড সিকিউরিটি নীতি পরিবর্তন: ${e.target.checked ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`,
                            ipAddress: '192.168.1.102',
                            status: 'info',
                            deviceInfo: 'Chrome / Windows'
                          });
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" 
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 bg-white p-2.5 rounded border">
                      ✓ পাসওয়ার্ডের ন্যূনতম সাইজ ৮ অক্ষরের হতে হবে এবং তাতে অন্তত একটি বড় হাতের অক্ষর (A-Z), একটি ছোট হাতের অক্ষর (a-z) এবং একটি স্পেশাল ক্যারেক্টার (@, #, $) থাকতে হবে।
                    </p>
                  </div>

                  {/* Login Attempt Limits */}
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                    <span className="block font-bold text-slate-800 text-xs">Login Attempt Limit (সর্বোচ্চ লগইন চেষ্টা)</span>
                    <span className="text-[10px] text-slate-400 block -mt-1">ভুল পাসওয়ার্ড দিয়ে সর্বোচ্চ কতবার চেষ্টার পর অ্যাকাউন্ট লক হবে।</span>
                    <select 
                      value={loginAttemptLimit} 
                      onChange={e => {
                        const val = Number(e.target.value);
                        setLoginAttemptLimit(val);
                        addSecurityLog({
                          userEmail: currentUser?.email || 'admin@nijornews.com',
                          action: `লগইন অ্যাটেম্পট লিমিট নির্ধারণ: ${val} বার`,
                          ipAddress: '192.168.1.102',
                          status: 'info',
                          deviceInfo: 'Chrome / Windows'
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border rounded text-xs"
                    >
                      <option value={3}>৩ বার সর্বোচ্চ চেষ্টা (3 Attempts - Recommended)</option>
                      <option value={5}>৫ বার সর্বোচ্চ চেষ্টা (5 Attempts)</option>
                      <option value={10}>১০ বার সর্বোচ্চ চেষ্টা (10 Attempts)</option>
                    </select>
                  </div>

                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button 
                    onClick={() => {
                      alert('সিকিউরিটি পলিসি ডেটা সফলভাবে সংরক্ষণ করা হয়েছে!');
                    }}
                    className="bg-emerald-600 text-white px-5 py-2 rounded text-xs font-bold hover:bg-emerald-700 shadow-xs"
                  >
                    🔒 সেভ সিকিউরিটি পলিসি
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 21. Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">21. Backup & Restore</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs space-y-4">
              <button onClick={() => alert('Backup downloaded successfully!')} className="bg-emerald-600 text-white px-5 py-2.5 rounded text-xs font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Download Full Database Backup</button>
            </div>
          </div>
        )}

        {/* 22. Performance */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">22. Performance & Optimization</h1>
            <div className="bg-white p-6 rounded-xl border shadow-xs text-xs space-y-2">
              <p>✓ Cache Status: <strong>Active</strong></p>
              <p>✓ Lazy Loading: <strong>Enabled</strong></p>
              <p>✓ WebP Image Compression: <strong>Active</strong></p>
            </div>
          </div>
        )}

        {/* 23. Site Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-black text-slate-900">18. ⚙️ Site Settings & Configuration</h1>
              <p className="text-xs text-slate-500 mt-1">ওয়েবসাইটের জেনারেল কনফিগারেশন, যোগাযোগ, হেডার-ফুটার লেআউট, মেইল এবং রক্ষণাবেক্ষণ পরিচালনা</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Settings Navigation Sidebar */}
              <div className="bg-slate-900 text-white rounded-xl overflow-hidden p-2 space-y-1 shadow-sm border border-slate-800">
                <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-3 py-2 border-b border-slate-800">Settings Sections</span>
                <button 
                  onClick={() => setSettingsSubTab('general')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${settingsSubTab === 'general' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-850 text-slate-300'}`}
                >
                  <Globe className="w-3.5 h-3.5" /> General Configuration
                </button>
                <button 
                  onClick={() => setSettingsSubTab('contact')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${settingsSubTab === 'contact' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-850 text-slate-300'}`}
                >
                  <Phone className="w-3.5 h-3.5" /> Contact Details
                </button>
                <button 
                  onClick={() => setSettingsSubTab('header')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${settingsSubTab === 'header' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-850 text-slate-300'}`}
                >
                  <Sliders className="w-3.5 h-3.5" /> Header Layout
                </button>
                <button 
                  onClick={() => setSettingsSubTab('footer')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${settingsSubTab === 'footer' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-850 text-slate-300'}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Footer & Copyright
                </button>
                <button 
                  onClick={() => setSettingsSubTab('news')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${settingsSubTab === 'news' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-850 text-slate-300'}`}
                >
                  <Newspaper className="w-3.5 h-3.5" /> Newsroom Settings
                </button>
                <button 
                  onClick={() => setSettingsSubTab('email')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${settingsSubTab === 'email' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-850 text-slate-300'}`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email (SMTP / Gmail)
                </button>
                <button 
                  onClick={() => setSettingsSubTab('maintenance')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${settingsSubTab === 'maintenance' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-850 text-slate-300'}`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Maintenance Mode
                </button>
              </div>

              {/* Settings Content Panel */}
              <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
                
                {/* 1. GENERAL CONFIGURATION */}
                {settingsSubTab === 'general' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600" /> General Configuration (সাধারণ সেটিংস)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Site Name (সাইটের নাম)</label>
                        <input type="text" value={settings.siteName} onChange={e => updateSettings({ siteName: e.target.value })} className="w-full px-3 py-2 border rounded font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Tagline / Subtitle (স্লোগান)</label>
                        <input type="text" value={settings.siteSubtitle} onChange={e => updateSettings({ siteSubtitle: e.target.value, tagline: e.target.value })} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Logo URL (লোগো লিঙ্ক)</label>
                        <input type="text" placeholder="https://..." value={settings.logoUrl} onChange={e => updateSettings({ logoUrl: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Favicon URL (আইকন লিঙ্ক)</label>
                        <input type="text" placeholder="https://..." value={settings.faviconUrl} onChange={e => updateSettings({ faviconUrl: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Language (ভাষা)</label>
                        <select value={settings.language} onChange={e => updateSettings({ language: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold text-slate-800">
                          <option value="bn">বাংলা (Bengali)</option>
                          <option value="en">English (ইংরেজি)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Timezone (সময় অঞ্চল)</label>
                        <select value={settings.timezone || 'Asia/Dhaka'} onChange={e => updateSettings({ timezone: e.target.value })} className="w-full px-3 py-2 border rounded font-mono">
                          <option value="Asia/Dhaka">Asia/Dhaka (GMT +6:00)</option>
                          <option value="Asia/Kolkata">Asia/Kolkata (GMT +5:30)</option>
                          <option value="UTC">UTC (GMT +0:00)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CONTACT DETAILS */}
                {settingsSubTab === 'contact' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" /> Contact Details & Social (যোগাযোগ ও সোশ্যাল মিডিয়া)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Contact Email (ইমেইল ঠিকানা)</label>
                        <input type="email" value={settings.email} onChange={e => updateSettings({ email: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Contact Phone (টেলিফোন / মোবাইল)</label>
                        <input type="text" value={settings.phone} onChange={e => updateSettings({ phone: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="block font-bold text-slate-700">Office Address (কার্যালয়ের ঠিকানা)</label>
                        <textarea rows={2} value={settings.address} onChange={e => updateSettings({ address: e.target.value })} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Facebook Page Link</label>
                        <input type="text" value={settings.facebook} onChange={e => updateSettings({ facebook: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">YouTube Channel Link</label>
                        <input type="text" value={settings.youtube} onChange={e => updateSettings({ youtube: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Instagram Profile Link</label>
                        <input type="text" value={settings.instagram} onChange={e => updateSettings({ instagram: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">X (Twitter) Profile Link</label>
                        <input type="text" value={settings.twitter} onChange={e => updateSettings({ twitter: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">WhatsApp Contact Number</label>
                        <input type="text" placeholder="+৮৮ ০১..." value={settings.whatsapp || ''} onChange={e => updateSettings({ whatsapp: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. HEADER LAYOUT */}
                {settingsSubTab === 'header' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-600" /> Header Layout Configurations (হেডার সেটিংস)
                    </h3>
                    <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.headerConfig?.showLogo ?? true} 
                          onChange={e => updateSettings({
                            headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showLogo: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Show Header Logo & Branding (লোগো এবং ব্রান্ডিং প্রদর্শন করুন)
                      </label>
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.headerConfig?.showMenu ?? true} 
                          onChange={e => updateSettings({
                            headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showMenu: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Enable Header Navigation Menu (মেনু প্রদর্শন করুন)
                      </label>
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.headerConfig?.showSearch ?? true} 
                          onChange={e => updateSettings({
                            headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showSearch: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Show Search Bar Icon (অনুসন্ধান ফিল্ড প্রদর্শন করুন)
                      </label>
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.headerConfig?.showSocial ?? true} 
                          onChange={e => updateSettings({
                            headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showSocial: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Display Social Icons in Header (সোশ্যাল আইকন সমূহ প্রদর্শন করুন)
                      </label>
                    </div>
                  </div>
                )}

                {/* 4. FOOTER & COPYRIGHT */}
                {settingsSubTab === 'footer' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Footer Layout & Copyright (ফুটার কনফিগারেশন)
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Footer Tagline / Text (ফুটার সংক্ষেপ বিবরণ)</label>
                        <input type="text" value={settings.footerConfig?.footerText || settings.footerText} onChange={e => updateSettings({ footerText: e.target.value, footerConfig: { ...(settings.footerConfig || { footerText: '', showMenu: true, showSocial: true, copyright: '' }), footerText: e.target.value } })} className="w-full px-3 py-2 border rounded font-semibold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Footer Copyright (স্বত্বাধিকার লেখা)</label>
                        <input type="text" value={settings.footerConfig?.copyright || '© ২০২৬ নিজোর নিউজ'} onChange={e => updateSettings({ footerConfig: { ...(settings.footerConfig || { footerText: '', showMenu: true, showSocial: true, copyright: '' }), copyright: e.target.value } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border rounded-xl space-y-3 mt-2">
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.footerConfig?.showMenu ?? true} 
                          onChange={e => updateSettings({
                            footerConfig: { ...(settings.footerConfig || { footerText: '', showMenu: true, showSocial: true, copyright: '' }), showMenu: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Display Footer Category Menu (ফুটারে ক্যাটাগরি মেনু প্রদর্শন করুন)
                      </label>
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.footerConfig?.showSocial ?? true} 
                          onChange={e => updateSettings({
                            footerConfig: { ...(settings.footerConfig || { footerText: '', showMenu: true, showSocial: true, copyright: '' }), showSocial: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Display Footer Social Links (ফুটারে সোশ্যাল লিঙ্ক প্রদর্শন করুন)
                      </label>
                    </div>
                  </div>
                )}

                {/* 5. NEWSROOM SETTINGS */}
                {settingsSubTab === 'news' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-emerald-600" /> Newsroom Configuration (সংবাদ অপশন সেটিংস)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Default Author / Reporter Name (ডিফল্ট প্রতিবেদক)</label>
                        <input type="text" value={settings.newsConfig?.defaultAuthor || settings.defaultAuthor} onChange={e => updateSettings({ defaultAuthor: e.target.value, newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), defaultAuthor: e.target.value } })} className="w-full px-3 py-2 border rounded font-semibold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Default News Placeholder Image (ডিফল্ট খবর ইমেজ)</label>
                        <input type="text" value={settings.newsConfig?.defaultImage || settings.defaultImage} onChange={e => updateSettings({ defaultImage: e.target.value, newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), defaultImage: e.target.value } })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border rounded-xl space-y-3 mt-2">
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.newsConfig?.showRelated ?? true} 
                          onChange={e => updateSettings({
                            newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), showRelated: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Display Related Articles Automatically (সম্পর্কিত সংবাদ মডিউল প্রদর্শন করুন)
                      </label>
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.newsConfig?.showViewCounter ?? true} 
                          onChange={e => updateSettings({
                            newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), showViewCounter: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Enable Real-time View Counter (সংবাদের লাইভ ভিউ কাউন্টার প্রদর্শন করুন)
                      </label>
                      <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.newsConfig?.showReadTime ?? true} 
                          onChange={e => updateSettings({
                            newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), showReadTime: e.target.checked }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                        />
                        Display Estimated Reading Time (পড়ার আনুমানিক সময় প্রদর্শন করুন)
                      </label>
                    </div>
                  </div>
                )}

                {/* 6. EMAIL (SMTP / GMAIL) */}
                {settingsSubTab === 'email' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" /> SMTP & Gmail Configuration (ইমেইল সার্ভার)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">SMTP Host (সার্ভার এড্রেস)</label>
                        <input type="text" placeholder="smtp.gmail.com" value={settings.emailConfig?.smtpHost || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), smtpHost: e.target.value } })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">SMTP Port (পোর্ট নম্বর)</label>
                        <input type="number" placeholder="587" value={settings.emailConfig?.smtpPort || 587} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), smtpPort: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">SMTP Username / Email (সার্ভার ইউজার)</label>
                        <input type="text" placeholder="example@gmail.com" value={settings.emailConfig?.smtpUser || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), smtpUser: e.target.value } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">SMTP Password (সার্ভার পাসওয়ার্ড)</label>
                        <input type="password" placeholder="••••••••" value={settings.emailConfig?.smtpPass || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), smtpPass: e.target.value } })} className="w-full px-3 py-2 border rounded font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Sender Name (প্রেরকের নাম)</label>
                        <input type="text" placeholder="Nijor Newsroom" value={settings.emailConfig?.senderName || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), senderName: e.target.value } })} className="w-full px-3 py-2 border rounded font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Sender Email Address (প্রেরকের মেইল)</label>
                        <input type="email" placeholder="noreply@nijornews.com" value={settings.emailConfig?.senderEmail || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), senderEmail: e.target.value } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. MAINTENANCE MODE */}
                {settingsSubTab === 'maintenance' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-600" /> Maintenance Mode Controls (রক্ষণাবেক্ষণ মুড)
                    </h3>
                    <div className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 space-y-2">
                      <p className="font-bold">⚠️ সতর্কবার্তা (Warning):</p>
                      <p>মেইনটেন্যান্স মুড অন করলে সাধারণ পাঠকরা কোনো সংবাদ পড়তে পারবেন না। শুধুমাত্র লগইন থাকা স্টাফরাই সাইটে ঢুকতে পারবেন।</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                        <div>
                          <span className="block font-bold text-slate-800">Maintenance Mode Status</span>
                          <span className="text-[10px] text-slate-400">এই টগলটি সক্রিয় করলে সাইট অফলাইন হয়ে যাবে।</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.maintenanceMode} 
                          onChange={e => {
                            updateSettings({ maintenanceMode: e.target.checked });
                            alert(e.target.checked ? 'মেইনটেন্যান্স মুড সক্রিয় করা হয়েছে!' : 'মেইনটেন্যান্স মুড নিষ্ক্রিয় করা হয়েছে!');
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500 w-5 h-5 cursor-pointer" 
                        />
                      </div>

                      {settings.maintenanceMode && (
                        <div className="space-y-1 animate-fadeIn">
                          <label className="block font-bold text-slate-700">Offline Maintenance Message (অফলাইন বার্তা)</label>
                          <textarea rows={3} value={settings.maintenanceMessage || ''} onChange={e => updateSettings({ maintenanceMessage: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold text-amber-900" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t mt-4">
                  <button 
                    onClick={() => alert('কনফিগারেশন ডাটাবেজে সফলভাবে সংরক্ষণ করা হয়েছে!')}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded font-bold hover:bg-emerald-700 shadow-xs transition"
                  >
                    সেটিংস সংরক্ষণ করুন (Save Settings)
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
};
