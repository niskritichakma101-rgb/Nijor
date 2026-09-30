import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Article, BreakingNewsItem, Category, District, Advertisement, SiteSettings, 
  User, StaticPage, Poll, Invitation, MediaItem, CommentItem, RevisionItem, 
  NewsletterSubscriber, SecurityLog 
} from '../types';
import { 
  initialArticles, initialBreakingNews, initialCategories, initialDistricts, 
  initialAdvertisements, initialSettings, initialUsers, initialStaticPages, 
  initialPolls, initialInvitations, initialMediaLibrary, initialComments, 
  initialRevisions, initialSubscribers, initialSecurityLogs 
} from '../data/mockData';

interface NewsContextType {
  articles: Article[];
  breakingNews: BreakingNewsItem[];
  categories: Category[];
  districts: District[];
  advertisements: Advertisement[];
  settings: SiteSettings;
  users: User[];
  staticPages: StaticPage[];
  polls: Poll[];
  invitations: Invitation[];
  mediaLibrary: MediaItem[];
  comments: CommentItem[];
  revisions: RevisionItem[];
  subscribers: NewsletterSubscriber[];
  securityLogs: SecurityLog[];
  
  currentUser: User | null;
  currentView: string;
  selectedArticleId: string | null;
  selectedCategorySlug: string | null;
  selectedDistrictSlug: string | null;
  selectedPageSlug: string | null;
  searchQuery: string;
  
  // Navigation actions
  navigateToHome: () => void;
  navigateToArticle: (id: string) => void;
  navigateToCategory: (slug: string) => void;
  navigateToDistrict: (slug: string) => void;
  navigateToAdmin: () => void;
  navigateToPage: (slug: string) => void;
  navigateToSearch: (query: string) => void;
  navigateToLibrary: () => void;

  // Admin / CRUD actions
  loginUser: (email: string) => boolean;
  logoutUser: () => void;
  
  addArticle: (article: Omit<Article, 'id' | 'publishedAt' | 'views'>) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;

  addBreakingNews: (item: Omit<BreakingNewsItem, 'id'>) => void;
  updateBreakingNews: (id: string, item: Partial<BreakingNewsItem>) => void;
  deleteBreakingNews: (id: string) => void;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addDistrict: (dis: Omit<District, 'id'>) => void;
  updateDistrict: (id: string, dis: Partial<District>) => void;
  deleteDistrict: (id: string) => void;

  updateAdvertisement: (id: string, ad: Partial<Advertisement>) => void;
  addAdvertisement: (ad: Omit<Advertisement, 'id'>) => void;
  deleteAdvertisement: (id: string) => void;
  trackAdClick: (id: string) => void;

  votePoll: (pollId: string, optionId: string) => void;
  addPoll: (question: string, options: string[]) => void;
  deletePoll: (id: string) => void;

  sendInvitation: (email: string, role: any) => void;
  deleteInvitation: (id: string) => void;

  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => void;
  updateMediaItem: (id: string, item: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;

  updateCommentStatus: (id: string, status: 'approved' | 'pending' | 'spam') => void;
  deleteComment: (id: string) => void;
  addComment: (comment: Omit<CommentItem, 'id' | 'createdAt' | 'status'>) => void;

  addSubscriber: (email: string) => boolean;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  updateStaticPage: (slug: string, content: string, title?: string, seoTitle?: string, metaDescription?: string, status?: 'published' | 'draft') => void;
  addStaticPage: (page: Omit<StaticPage, 'id' | 'updatedAt'>) => void;
  deleteStaticPage: (id: string) => void;
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp'>) => void;
  deleteSecurityLog: (id: string) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('nijor_articles');
    return saved ? JSON.parse(saved) : initialArticles;
  });

  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>(() => {
    const saved = localStorage.getItem('nijor_breaking');
    return saved ? JSON.parse(saved) : initialBreakingNews;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('nijor_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [districts, setDistricts] = useState<District[]>(() => {
    const saved = localStorage.getItem('nijor_districts');
    return saved ? JSON.parse(saved) : initialDistricts;
  });

  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem('nijor_ads');
    return saved ? JSON.parse(saved) : initialAdvertisements;
  });

  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem('nijor_polls');
    return saved ? JSON.parse(saved) : initialPolls;
  });

  const [invitations, setInvitations] = useState<Invitation[]>(() => {
    const saved = localStorage.getItem('nijor_invitations');
    return saved ? JSON.parse(saved) : initialInvitations;
  });

  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('nijor_media');
    return saved ? JSON.parse(saved) : initialMediaLibrary;
  });

  const [comments, setComments] = useState<CommentItem[]>(() => {
    const saved = localStorage.getItem('nijor_comments');
    return saved ? JSON.parse(saved) : initialComments;
  });

  const [revisions, setRevisions] = useState<RevisionItem[]>(() => {
    const saved = localStorage.getItem('nijor_revisions');
    return saved ? JSON.parse(saved) : initialRevisions;
  });

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => {
    const saved = localStorage.getItem('nijor_subscribers');
    return saved ? JSON.parse(saved) : initialSubscribers;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem('nijor_security_logs');
    return saved ? JSON.parse(saved) : initialSecurityLogs;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('nijor_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nijor_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  useEffect(() => { localStorage.setItem('nijor_users', JSON.stringify(users)); }, [users]);

  const [staticPages, setStaticPages] = useState<StaticPage[]>(() => {
    const saved = localStorage.getItem('nijor_pages');
    return saved ? JSON.parse(saved) : initialStaticPages;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nijor_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Save to localStorage when state changes
  useEffect(() => { localStorage.setItem('nijor_articles', JSON.stringify(articles)); }, [articles]);
  useEffect(() => { localStorage.setItem('nijor_breaking', JSON.stringify(breakingNews)); }, [breakingNews]);
  useEffect(() => { localStorage.setItem('nijor_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('nijor_districts', JSON.stringify(districts)); }, [districts]);
  useEffect(() => { localStorage.setItem('nijor_ads', JSON.stringify(advertisements)); }, [advertisements]);
  useEffect(() => { localStorage.setItem('nijor_polls', JSON.stringify(polls)); }, [polls]);
  useEffect(() => { localStorage.setItem('nijor_invitations', JSON.stringify(invitations)); }, [invitations]);
  useEffect(() => { localStorage.setItem('nijor_media', JSON.stringify(mediaLibrary)); }, [mediaLibrary]);
  useEffect(() => { localStorage.setItem('nijor_comments', JSON.stringify(comments)); }, [comments]);
  useEffect(() => { localStorage.setItem('nijor_revisions', JSON.stringify(revisions)); }, [revisions]);
  useEffect(() => { localStorage.setItem('nijor_subscribers', JSON.stringify(subscribers)); }, [subscribers]);
  useEffect(() => { localStorage.setItem('nijor_security_logs', JSON.stringify(securityLogs)); }, [securityLogs]);
  useEffect(() => { localStorage.setItem('nijor_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('nijor_pages', JSON.stringify(staticPages)); }, [staticPages]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nijor_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nijor_current_user');
    }
  }, [currentUser]);

  // Navigation handlers
  const navigateToHome = () => {
    setCurrentView('home');
    setSelectedArticleId(null);
    setSelectedCategorySlug(null);
    setSelectedDistrictSlug(null);
    setSelectedPageSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToArticle = (id: string) => {
    setArticles(prev => prev.map(art => art.id === id ? { ...art, views: art.views + 1 } : art));
    setSelectedArticleId(id);
    setCurrentView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDistrict = (slug: string) => {
    setSelectedDistrictSlug(slug);
    setCurrentView('district');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (slug: string) => {
    setSelectedPageSlug(slug);
    setCurrentView('page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLibrary = () => {
    setCurrentView('library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth actions
  const loginUser = (email: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setSecurityLogs(prev => [{
        id: `log-${Date.now()}`,
        userEmail: email,
        action: 'Login Success',
        ipAddress: '192.168.1.10',
        timestamp: new Date().toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        status: 'success'
      }, ...prev]);
      return true;
    }
    if (email === 'admin@nijornews.com' || email.includes('admin')) {
      setCurrentUser(users[0]);
      return true;
    }
    setSecurityLogs(prev => [{
      id: `log-${Date.now()}`,
      userEmail: email,
      action: 'Failed Login Attempt',
      ipAddress: '192.168.1.15',
      timestamp: new Date().toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'failed'
    }, ...prev]);
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    navigateToHome();
  };

  // Article CRUD & Revisions
  const addArticle = (newArt: Omit<Article, 'id' | 'publishedAt' | 'views'>) => {
    const article: Article = {
      ...newArt,
      id: `art-${Date.now()}`,
      publishedAt: 'আজ, ' + new Date().toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      views: 1
    };
    setArticles(prev => [article, ...prev]);
    setRevisions(prev => [{
      id: `rev-${Date.now()}`,
      articleId: article.id,
      articleTitle: article.title,
      editedBy: currentUser?.name || 'অ্যাডমিন',
      editedAt: new Date().toLocaleDateString('bn-BD'),
      changeSummary: 'নতুন সংবাদ প্রকাশ করা হয়েছে।'
    }, ...prev]);
    addSecurityLog({
      userEmail: currentUser?.email || 'admin@nijornews.com',
      action: `সংবাদ তৈরি: "${article.title}"`,
      ipAddress: '192.168.1.102',
      status: 'success',
      deviceInfo: 'Chrome / Windows 11'
    });
  };

  const updateArticle = (id: string, updated: Partial<Article>) => {
    setArticles(prev => prev.map(art => {
      if (art.id === id) {
        const updatedArt = { ...art, ...updated, updatedAt: new Date().toLocaleDateString('bn-BD') };
        return updatedArt;
      }
      return art;
    }));
    setRevisions(prev => [{
      id: `rev-${Date.now()}`,
      articleId: id,
      articleTitle: updated.title || 'সংবাদ সংস্করণ',
      editedBy: currentUser?.name || 'অ্যাডমিন',
      editedAt: new Date().toLocaleDateString('bn-BD'),
      changeSummary: 'সংবাদ সম্পাদনা করা হয়েছে।'
    }, ...prev]);
    addSecurityLog({
      userEmail: currentUser?.email || 'admin@nijornews.com',
      action: `সংবাদ সম্পাদনা (News Edit): "${updated.title || 'সংশোধিত সংবাদ'}"`,
      ipAddress: '192.168.1.102',
      status: 'edit',
      deviceInfo: 'Chrome / Windows 11'
    });
  };

  const deleteArticle = (id: string) => {
    const target = articles.find(art => art.id === id);
    setArticles(prev => prev.filter(art => art.id !== id));
    addSecurityLog({
      userEmail: currentUser?.email || 'admin@nijornews.com',
      action: `সংবাদ ডিলিট (Delete News): "${target?.title || id}"`,
      ipAddress: '192.168.1.102',
      status: 'deleted',
      deviceInfo: 'Chrome / Windows 11'
    });
  };

  // Breaking News CRUD
  const addBreakingNews = (item: Omit<BreakingNewsItem, 'id'>) => {
    const newItem: BreakingNewsItem = { ...item, id: `bn-${Date.now()}` };
    setBreakingNews(prev => [newItem, ...prev]);
  };

  const updateBreakingNews = (id: string, updated: Partial<BreakingNewsItem>) => {
    setBreakingNews(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
  };

  const deleteBreakingNews = (id: string) => {
    setBreakingNews(prev => prev.filter(b => b.id !== id));
  };

  // Category CRUD
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // District CRUD
  const addDistrict = (dis: Omit<District, 'id'>) => {
    const newDis: District = { ...dis, id: `dis-${Date.now()}` };
    setDistricts(prev => [...prev, newDis]);
  };

  const updateDistrict = (id: string, updated: Partial<District>) => {
    setDistricts(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
  };

  const deleteDistrict = (id: string) => {
    setDistricts(prev => prev.filter(d => d.id !== id));
  };

  // Advertisement CRUD
  const updateAdvertisement = (id: string, updated: Partial<Advertisement>) => {
    setAdvertisements(prev => prev.map(ad => ad.id === id ? { ...ad, ...updated } : ad));
  };

  const addAdvertisement = (ad: Omit<Advertisement, 'id' | 'clicks'>) => {
    const newAd: Advertisement = { ...ad, id: `ad-${Date.now()}`, clicks: 0 };
    setAdvertisements(prev => [...prev, newAd]);
  };

  const deleteAdvertisement = (id: string) => {
    setAdvertisements(prev => prev.filter(ad => ad.id !== id));
  };

  const trackAdClick = (id: string) => {
    setAdvertisements(prev => prev.map(ad => ad.id === id ? { ...ad, clicks: ad.clicks + 1 } : ad));
  };

  // Polls
  const votePoll = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        const newOptions = p.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt);
        return { ...p, options: newOptions, totalVotes: p.totalVotes + 1 };
      }
      return p;
    }));
  };

  const addPoll = (question: string, options: string[]) => {
    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      question,
      options: options.map((opt, idx) => ({ id: `opt-${idx}-${Date.now()}`, text: opt, votes: 0 })),
      active: true,
      totalVotes: 0,
      createdAt: new Date().toLocaleDateString('bn-BD')
    };
    setPolls(prev => [newPoll, ...prev]);
  };

  const deletePoll = (id: string) => {
    setPolls(prev => prev.filter(p => p.id !== id));
  };

  // Invitations
  const sendInvitation = (email: string, role: any) => {
    const newInv: Invitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      invitedAt: new Date().toLocaleDateString('bn-BD'),
      status: 'pending'
    };
    setInvitations(prev => [newInv, ...prev]);
  };

  const deleteInvitation = (id: string) => {
    setInvitations(prev => prev.filter(i => i.id !== id));
  };

  // Media Library
  const addMediaItem = (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      uploadedAt: new Date().toLocaleDateString('bn-BD')
    };
    setMediaLibrary(prev => [newItem, ...prev]);
  };

  const updateMediaItem = (id: string, updated: Partial<MediaItem>) => {
    setMediaLibrary(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
  };

  const deleteMediaItem = (id: string) => {
    setMediaLibrary(prev => prev.filter(m => m.id !== id));
  };

  // User / Staff Management
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      activityHistory: [
        { id: `act-${Date.now()}`, action: 'অ্যাকাউন্ট তৈরি', timestamp: new Date().toLocaleDateString('bn-BD'), ip: '127.0.0.1' }
      ]
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Comments
  const updateCommentStatus = (id: string, status: 'approved' | 'pending' | 'spam') => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const addComment = (comment: Omit<CommentItem, 'id' | 'createdAt' | 'status'>) => {
    const newCom: CommentItem = {
      ...comment,
      id: `com-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };
    setComments(prev => [newCom, ...prev]);
  };

  // Subscribers
  const addSubscriber = (email: string) => {
    if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) return false;
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email,
      subscribedAt: new Date().toLocaleDateString('bn-BD'),
      active: true
    };
    setSubscribers(prev => [newSub, ...prev]);
    return true;
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateStaticPage = (slug: string, content: string, title?: string, seoTitle?: string, metaDescription?: string, status?: 'published' | 'draft') => {
    setStaticPages(prev => prev.map(p => p.slug === slug ? { 
      ...p, 
      content, 
      title: title || p.title, 
      seoTitle: seoTitle || p.seoTitle, 
      metaDescription: metaDescription || p.metaDescription, 
      status: status || p.status || 'published', 
      updatedAt: new Date().toLocaleDateString('bn-BD') 
    } : p));
  };

  const addStaticPage = (page: Omit<StaticPage, 'id' | 'updatedAt'>) => {
    const newPage: StaticPage = {
      ...page,
      id: `page-${Date.now()}`,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };
    setStaticPages(prev => [...prev, newPage]);
  };

  const deleteStaticPage = (id: string) => {
    setStaticPages(prev => prev.filter(p => p.id !== id));
  };

  const addSecurityLog = (log: Omit<SecurityLog, 'id' | 'timestamp'>) => {
    const newLog: SecurityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('bn-BD') + ' টি ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };
    setSecurityLogs(prev => [newLog, ...prev]);
  };

  const deleteSecurityLog = (id: string) => {
    setSecurityLogs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <NewsContext.Provider value={{
      articles,
      breakingNews,
      categories,
      districts,
      advertisements,
      settings,
      users,
      staticPages,
      polls,
      invitations,
      mediaLibrary,
      comments,
      revisions,
      subscribers,
      securityLogs,
      currentUser,
      currentView,
      selectedArticleId,
      selectedCategorySlug,
      selectedDistrictSlug,
      selectedPageSlug,
      searchQuery,
      navigateToHome,
      navigateToArticle,
      navigateToCategory,
      navigateToDistrict,
      navigateToAdmin,
      navigateToPage,
      navigateToSearch,
      navigateToLibrary,
      loginUser,
      logoutUser,
      addArticle,
      updateArticle,
      deleteArticle,
      addBreakingNews,
      updateBreakingNews,
      deleteBreakingNews,
      addCategory,
      updateCategory,
      deleteCategory,
      addDistrict,
      updateDistrict,
      deleteDistrict,
      updateAdvertisement,
      addAdvertisement,
      deleteAdvertisement,
      trackAdClick,
      votePoll,
      addPoll,
      deletePoll,
      sendInvitation,
      deleteInvitation,
      addUser,
      updateUser,
      deleteUser,
      addMediaItem,
      updateMediaItem,
      deleteMediaItem,
      updateCommentStatus,
      deleteComment,
      addComment,
      addSubscriber,
      updateSettings,
      updateStaticPage,
      addStaticPage,
      deleteStaticPage,
      addSecurityLog,
      deleteSecurityLog
    }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
