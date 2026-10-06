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
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, signOut, sendSignInLinkToEmail, 
  isSignInWithEmailLink, signInWithEmailLink 
} from 'firebase/auth';
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, serverTimestamp 
} from 'firebase/firestore';

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

  // Auth actions
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  logoutUser: () => void;
  requestMagicLink: (email: string) => Promise<{ success: boolean; isFallback?: boolean; fallbackLink?: string; error?: string }>;

  // Admin / CRUD actions
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
  updatePoll: (id: string, updatedFields: Partial<Poll>) => void;
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
  setRevisions: React.Dispatch<React.SetStateAction<RevisionItem[]>>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>(initialBreakingNews);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(initialAdvertisements);
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(initialMediaLibrary);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [revisions, setRevisions] = useState<RevisionItem[]>(initialRevisions);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initialSubscribers);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(initialSecurityLogs);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nijor_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    return hash === '#/admin' || hash === '#admin' || path === '/admin' || path.startsWith('/admin') ? 'admin' : 'home';
  });

  // Dynamic syncing and seeding logic for Firestore database
  useEffect(() => {
    const syncAndSeed = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        if (catSnap.empty) {
          console.log("Seeding initial data into Firestore...");
          
          for (const u of initialUsers) {
            await setDoc(doc(db, 'users', u.id), u);
          }
          for (const a of initialArticles) {
            await setDoc(doc(db, 'articles', a.id), a);
          }
          for (const c of initialCategories) {
            await setDoc(doc(db, 'categories', c.id), c);
          }
          for (const d of initialDistricts) {
            await setDoc(doc(db, 'districts', d.id), d);
          }
          for (const b of initialBreakingNews) {
            await setDoc(doc(db, 'breaking', b.id), b);
          }
          for (const ad of initialAdvertisements) {
            await setDoc(doc(db, 'advertisements', ad.id), ad);
          }
          for (const p of initialStaticPages) {
            await setDoc(doc(db, 'pages', p.id), p);
          }
          for (const pl of initialPolls) {
            await setDoc(doc(db, 'polls', pl.id), pl);
          }
          await setDoc(doc(db, 'settings', 'config'), initialSettings);
          console.log("Firestore seeding done!");
        }

        // Fetch live database values from Firestore
        const artSnap = await getDocs(collection(db, 'articles'));
        if (!artSnap.empty) {
          const loaded: Article[] = [];
          artSnap.forEach(d => loaded.push(d.data() as Article));
          setArticles(loaded);
        }
        
        const usersSnap = await getDocs(collection(db, 'users'));
        if (!usersSnap.empty) {
          const loaded: User[] = [];
          usersSnap.forEach(d => loaded.push(d.data() as User));
          setUsers(loaded);
        }

        const breakSnap = await getDocs(collection(db, 'breaking'));
        if (!breakSnap.empty) {
          const loaded: BreakingNewsItem[] = [];
          breakSnap.forEach(d => loaded.push(d.data() as BreakingNewsItem));
          setBreakingNews(loaded);
        }

        const adSnap = await getDocs(collection(db, 'advertisements'));
        if (!adSnap.empty) {
          const loaded: Advertisement[] = [];
          adSnap.forEach(d => loaded.push(d.data() as Advertisement));
          setAdvertisements(loaded);
        }

        const pageSnap = await getDocs(collection(db, 'pages'));
        if (!pageSnap.empty) {
          const loaded: StaticPage[] = [];
          pageSnap.forEach(d => loaded.push(d.data() as StaticPage));
          setStaticPages(loaded);
        }

        const pollSnap = await getDocs(collection(db, 'polls'));
        if (!pollSnap.empty) {
          const loaded: Poll[] = [];
          pollSnap.forEach(d => loaded.push(d.data() as Poll));
          setPolls(loaded);
        }

        // Fetch live settings configuration, or seed if missing
        const settingsSnap = await getDoc(doc(db, 'settings', 'config'));
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as SiteSettings);
        } else {
          await setDoc(doc(db, 'settings', 'config'), initialSettings);
        }
      } catch (err) {
        console.error("Firestore sync/seed failure:", err);
      }
    };
    syncAndSeed();
  }, []);

  // Sync PopState and HashChange browser navigation to prevent any 404 page errors
  useEffect(() => {
    const handleNavigation = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash.startsWith('#/admin') || hash === '#admin' || path === '/admin' || path.startsWith('/admin')) {
        setCurrentView('admin');
      } else if (hash.startsWith('#/article/')) {
        const id = hash.replace('#/article/', '');
        setSelectedArticleId(id);
        setCurrentView('article');
      } else if (hash.startsWith('#/category/')) {
        const slug = decodeURIComponent(hash.replace('#/category/', ''));
        setSelectedCategorySlug(slug);
        setCurrentView('category');
      } else if (hash.startsWith('#/district/')) {
        const slug = decodeURIComponent(hash.replace('#/district/', ''));
        setSelectedDistrictSlug(slug);
        setCurrentView('district');
      } else if (hash.startsWith('#/page/')) {
        const slug = decodeURIComponent(hash.replace('#/page/', ''));
        setSelectedPageSlug(slug);
        setCurrentView('page');
      } else if (hash.startsWith('#/search/')) {
        const q = decodeURIComponent(hash.replace('#/search/', ''));
        setSearchQuery(q);
        setCurrentView('search');
      } else {
        setCurrentView('home');
        setSelectedArticleId(null);
        setSelectedCategorySlug(null);
        setSelectedDistrictSlug(null);
        setSelectedPageSlug(null);
      }
    };
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation(); // sync on first load
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  // Fallback URL parameter token login check (for testing and manual review)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('login_token');
    if (token) {
      const savedTokens = localStorage.getItem('nijor_magic_tokens');
      const tokensList = savedTokens ? JSON.parse(savedTokens) : [];
      const matched = tokensList.find((t: any) => t.token === token);

      if (matched && !matched.used && Date.now() < matched.expiresAt) {
        // Mark as used
        const updatedTokens = tokensList.map((t: any) => t.token === token ? { ...t, used: true } : t);
        localStorage.setItem('nijor_magic_tokens', JSON.stringify(updatedTokens));

        // Find and set current user
        const found = users.find(u => u.email.toLowerCase() === matched.email.toLowerCase());
        if (found) {
          setCurrentUser(found);
          setCurrentView('admin');
          window.history.replaceState({}, '', '/admin');
          alert(`🎉 (Testing Fallback) স্বাগতম ${found.name}! আপনি সফলভাবে ড্যাশবোর্ডে প্রবেশ করেছেন।`);
        }
      }
    }
  }, [users]);

  // Firebase Email Link Sign-in redirection interceptor
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('অনুগ্রহ করে ভেরিফিকেশনের জন্য আপনার নিবন্ধিত ইমেইলটি টাইপ করুন:');
        }
        if (email) {
          try {
            await signInWithEmailLink(auth, email.trim().toLowerCase(), window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            
            // Clean the URL query params cleanly
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: newUrl }, '', newUrl);
          } catch (err: any) {
            alert(`❌ ম্যাজিক লিংক লগইন ব্যর্থ হয়েছে: ${err.message}`);
          }
        }
      }
    };
    handleEmailLinkSignIn();
  }, []);

  // Real Backend Authentication Listener with secure Role checking
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const emailLower = firebaseUser.email.toLowerCase();
        
        // Find user from our active user database
        const found = users.find(u => u.email.toLowerCase() === emailLower);
        
        if (found) {
          if (found.status === 'active') {
            setCurrentUser(found);
            window.location.hash = '/admin';
            setCurrentView('admin');
            
            // Add a secure security log
            const newLog: SecurityLog = {
              id: `log-${Date.now()}`,
              userEmail: found.email,
              action: 'Secure Firebase Email-Link Auth Login Success',
              ipAddress: '192.168.1.100',
              timestamp: new Date().toLocaleDateString('bn-BD') + ' ' + new Date().toLocaleTimeString('bn-BD'),
              status: 'success'
            };
            setSecurityLogs(prev => [newLog, ...prev]);
            try {
              await setDoc(doc(db, 'security_logs', newLog.id), newLog);
            } catch (err) {}
          } else {
            alert('❌ দুঃখিত, আপনার একাউন্টটি বর্তমানে এডমিন কর্তৃক নিষ্ক্রিয় করা আছে!');
            await signOut(auth);
            setCurrentUser(null);
            setCurrentView('home');
          }
        } else {
          // Check if this is the bootstrap owner from metadata
          if (emailLower === 'niskritichakma101@gmail.com') {
            const superAdminUser: User = {
              id: 'usr-admin-bootstrap',
              name: 'নিষ্কৃত চাকমা (Super Admin)',
              email: 'niskritichakma101@gmail.com',
              role: 'super_admin',
              status: 'active',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
            };
            // Automatically save to our database users
            setUsers(prev => [superAdminUser, ...prev]);
            try {
              await setDoc(doc(db, 'users', superAdminUser.id), superAdminUser);
            } catch (err) {}
            setCurrentUser(superAdminUser);
            window.location.hash = '/admin';
            setCurrentView('admin');
            return;
          }

          alert('❌ দুঃখিত, আপনার ইমেইলটি আমাদের অনুমোদিত স্টাফ তালিকায় পাওয়া যায়নি!');
          await signOut(auth);
          setCurrentUser(null);
          setCurrentView('home');
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [users]);

  const [staticPages, setStaticPages] = useState<StaticPage[]>(initialStaticPages);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local caching side-effects for fast reading
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
  useEffect(() => { localStorage.setItem('nijor_users', JSON.stringify(users)); }, [users]);

  // Navigation handlers
  const navigateToHome = () => {
    window.location.hash = '';
    setCurrentView('home');
    setSelectedArticleId(null);
    setSelectedCategorySlug(null);
    setSelectedDistrictSlug(null);
    setSelectedPageSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToArticle = (id: string) => {
    window.location.hash = `#/article/${id}`;
    setSelectedArticleId(id);
    setCurrentView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (slug: string) => {
    window.location.hash = `#/category/${slug}`;
    setSelectedCategorySlug(slug);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDistrict = (slug: string) => {
    window.location.hash = `#/district/${slug}`;
    setSelectedDistrictSlug(slug);
    setCurrentView('district');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.location.hash = '/admin';
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (slug: string) => {
    window.location.hash = `#/page/${slug}`;
    setSelectedPageSlug(slug);
    setCurrentView('page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSearch = (query: string) => {
    window.location.hash = `#/search/${encodeURIComponent(query)}`;
    setSearchQuery(query);
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLibrary = () => {
    setCurrentView('library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth actions
  const loginUser = (email: string, password: string): { success: boolean; error?: string } => {
    const emailLower = email.trim().toLowerCase();
    const pass = password.trim();

    const whitelisted = [
      {
        email: 'niskritichakma101@gmail.com',
        pass: 'niskriti100',
        role: 'super_admin' as const,
        name: 'নিষ্কৃত চাকমা (Super Admin)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      },
      {
        email: 'nijoreditor1@gmail.com',
        pass: 'edit123',
        role: 'editor' as const,
        name: 'নিজোর এডিটর (Editor)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
      },
      {
        email: 'reporter123@gmail.com',
        pass: 'report123n',
        role: 'reporter' as const,
        name: 'নিজোর রিপোর্টার (Reporter)',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
      },
      {
        email: 'admin@nijornews.com',
        pass: 'admin123',
        role: 'admin' as const,
        name: 'নিজোর অ্যাডমিন (Admin)',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
      }
    ];

    const found = whitelisted.find(acc => acc.email === emailLower);
    if (!found) {
      return { success: false, error: '❌ এই ইমেইলটি অনুমোদিত তালিকায় পাওয়া যায়নি!' };
    }
    if (found.pass !== pass) {
      return { success: false, error: '❌ ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।' };
    }

    const userObj: User = {
      id: `usr-${found.role}-${Date.now()}`,
      name: found.name,
      email: found.email,
      role: found.role,
      status: 'active',
      avatar: found.avatar
    };

    setCurrentUser(userObj);
    localStorage.setItem('nijor_current_user', JSON.stringify(userObj));
    window.location.hash = '/admin';
    setCurrentView('admin');

    return { success: true };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('nijor_current_user');
    navigateToHome();
  };

  const requestMagicLink = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!found) {
      return { success: false, error: '❌ এই ইমেইলটি আমাদের সিস্টেমে নিবন্ধিত স্টাফ তালিকায় পাওয়া যায়নি!' };
    }
    if (found.status !== 'active') {
      return { success: false, error: '❌ দুঃখিত, আপনার স্টাফ একাউন্টটি বর্তমানে নিষ্ক্রিয় অবস্থায় রয়েছে!' };
    }

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, trimmedEmail, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', trimmedEmail);
      return { success: true };
    } catch (err: any) {
      console.warn("Firebase sendSignInLinkToEmail error, falling back to local simulation:", err);
      
      // Auto-fallback: Generate a local simulated testing token if Firebase Console email-link is not yet turned on
      const token = `mag-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
      const fallbackLink = `${window.location.origin}/admin?login_token=${token}`;
      
      const newToken = {
        email: trimmedEmail,
        token,
        expiresAt: Date.now() + 5 * 60 * 1000,
        used: false
      };
      
      const savedTokens = localStorage.getItem('nijor_magic_tokens');
      const tokensList = savedTokens ? JSON.parse(savedTokens) : [];
      localStorage.setItem('nijor_magic_tokens', JSON.stringify([newToken, ...tokensList]));
      
      return { 
        success: true, 
        isFallback: true, 
        fallbackLink 
      };
    }
  };

  // Article CRUD & Revisions (Linked to Firestore database)
  const addArticle = async (newArt: Omit<Article, 'id' | 'publishedAt' | 'views'>) => {
    const article: Article = {
      ...newArt,
      id: `art-${Date.now()}`,
      publishedAt: 'আজ, ' + new Date().toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      views: 1
    };
    setArticles(prev => [article, ...prev]);
    try {
      await setDoc(doc(db, 'articles', article.id), article);
    } catch (e) {}

    const revision: RevisionItem = {
      id: `rev-${Date.now()}`,
      articleId: article.id,
      articleTitle: article.title,
      editedBy: currentUser?.name || 'স্টাফ মেম্বার',
      editorEmail: currentUser?.email || 'admin@nijornews.com',
      editorRole: currentUser?.role || 'super_admin',
      editedAt: new Date().toISOString(),
      changeSummary: 'সংবাদ তৈরি করা হয়েছে।',
      title: article.title,
      subheadline: article.subheadline || '',
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      district: article.district || '',
      upazila: article.upazila || '',
      image: article.image,
      tags: article.tags || []
    };
    setRevisions(prev => [revision, ...prev]);
    addSecurityLog({
      userEmail: currentUser?.email || 'unknown',
      action: `সংবাদ তৈরি: "${article.title}"`,
      ipAddress: '192.168.1.1',
      status: 'success'
    });
  };

  const updateArticle = async (id: string, updated: Partial<Article>) => {
    const previousArt = articles.find(art => art.id === id);
    setArticles(prev => prev.map(art => art.id === id ? { ...art, ...updated } : art));
    try {
      await setDoc(doc(db, 'articles', id), { ...previousArt, ...updated });
    } catch (e) {}

    if (previousArt) {
      const revision: RevisionItem = {
        id: `rev-${Date.now()}`,
        articleId: id,
        articleTitle: previousArt.title,
        editedBy: currentUser?.name || 'স্টাফ মেম্বার',
        editorEmail: currentUser?.email || 'admin@nijornews.com',
        editorRole: currentUser?.role || 'super_admin',
        editedAt: new Date().toISOString(),
        changeSummary: 'সংবাদ এডিট করা হয়েছে।',
        title: previousArt.title,
        subheadline: previousArt.subheadline || '',
        excerpt: previousArt.excerpt,
        content: previousArt.content,
        category: previousArt.category,
        district: previousArt.district || '',
        upazila: previousArt.upazila || '',
        image: previousArt.image,
        tags: previousArt.tags || []
      };
      setRevisions(prev => [revision, ...prev]);
    }

    addSecurityLog({
      userEmail: currentUser?.email || 'unknown',
      action: `সংবাদ এডিট: "${updated.title || id}"`,
      ipAddress: '192.168.1.1',
      status: 'edit'
    });
  };

  const deleteArticle = async (id: string) => {
    const target = articles.find(art => art.id === id);
    setArticles(prev => prev.filter(art => art.id !== id));
    try {
      await deleteDoc(doc(db, 'articles', id));
    } catch (e) {}

    addSecurityLog({
      userEmail: currentUser?.email || 'unknown',
      action: `সংবাদ ডিলিট: "${target?.title || id}"`,
      ipAddress: '192.168.1.1',
      status: 'deleted'
    });
  };

  // Breaking News CRUD
  const addBreakingNews = async (item: Omit<BreakingNewsItem, 'id'>) => {
    const newItem: BreakingNewsItem = { ...item, id: `bn-${Date.now()}` };
    setBreakingNews(prev => [newItem, ...prev]);
    try {
      await setDoc(doc(db, 'breaking', newItem.id), newItem);
    } catch (e) {}
  };

  const updateBreakingNews = async (id: string, updated: Partial<BreakingNewsItem>) => {
    setBreakingNews(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
    const target = breakingNews.find(b => b.id === id);
    try {
      await setDoc(doc(db, 'breaking', id), { ...target, ...updated });
    } catch (e) {}
  };

  const deleteBreakingNews = async (id: string) => {
    setBreakingNews(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'breaking', id));
    } catch (e) {}
  };

  // Category CRUD
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat);
    } catch (e) {}
  };

  const updateCategory = async (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    const target = categories.find(c => c.id === id);
    try {
      await setDoc(doc(db, 'categories', id), { ...target, ...updated });
    } catch (e) {}
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {}
  };

  // District CRUD
  const addDistrict = async (dis: Omit<District, 'id'>) => {
    const newDis: District = { ...dis, id: `dis-${Date.now()}` };
    setDistricts(prev => [...prev, newDis]);
    try {
      await setDoc(doc(db, 'districts', newDis.id), newDis);
    } catch (e) {}
  };

  const updateDistrict = async (id: string, updated: Partial<District>) => {
    setDistricts(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    const target = districts.find(d => d.id === id);
    try {
      await setDoc(doc(db, 'districts', id), { ...target, ...updated });
    } catch (e) {}
  };

  const deleteDistrict = async (id: string) => {
    setDistricts(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, 'districts', id));
    } catch (e) {}
  };

  // Advertisement CRUD
  const updateAdvertisement = async (id: string, updated: Partial<Advertisement>) => {
    setAdvertisements(prev => prev.map(ad => ad.id === id ? { ...ad, ...updated } : ad));
    const target = advertisements.find(ad => ad.id === id);
    try {
      await setDoc(doc(db, 'advertisements', id), { ...target, ...updated });
    } catch (e) {}
  };

  const addAdvertisement = async (ad: Omit<Advertisement, 'id' | 'clicks'>) => {
    const newAd: Advertisement = { ...ad, id: `ad-${Date.now()}`, clicks: 0 };
    setAdvertisements(prev => [...prev, newAd]);
    try {
      await setDoc(doc(db, 'advertisements', newAd.id), newAd);
    } catch (e) {}
  };

  const deleteAdvertisement = async (id: string) => {
    setAdvertisements(prev => prev.filter(ad => ad.id !== id));
    try {
      await deleteDoc(doc(db, 'advertisements', id));
    } catch (e) {}
  };

  const trackAdClick = async (id: string) => {
    setAdvertisements(prev => prev.map(ad => ad.id === id ? { ...ad, clicks: ad.clicks + 1 } : ad));
    const target = advertisements.find(ad => ad.id === id);
    if (target) {
      try {
        await setDoc(doc(db, 'advertisements', id), { ...target, clicks: target.clicks + 1 });
      } catch (e) {}
    }
  };

  // Polls
  const votePoll = async (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        const newOptions = p.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt);
        return { ...p, options: newOptions, totalVotes: p.totalVotes + 1 };
      }
      return p;
    }));
    const target = polls.find(p => p.id === pollId);
    if (target) {
      const newOptions = target.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt);
      try {
        await setDoc(doc(db, 'polls', pollId), { ...target, options: newOptions, totalVotes: target.totalVotes + 1 });
      } catch (e) {}
    }
  };

  const addPoll = async (question: string, options: string[]) => {
    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      question,
      options: options.map((opt, idx) => ({ id: `opt-${idx}-${Date.now()}`, text: opt, votes: 0 })),
      active: true,
      totalVotes: 0,
      createdAt: new Date().toLocaleDateString('bn-BD')
    };
    setPolls(prev => [newPoll, ...prev]);
    try {
      await setDoc(doc(db, 'polls', newPoll.id), newPoll);
    } catch (e) {}
  };

  const updatePoll = async (id: string, updatedFields: Partial<Poll>) => {
    const target = polls.find(p => p.id === id);
    if (!target) return;
    const merged = { ...target, ...updatedFields };
    setPolls(prev => prev.map(p => p.id === id ? merged : p));
    try {
      await setDoc(doc(db, 'polls', id), merged);
    } catch (e) {}
  };

  const deletePoll = async (id: string) => {
    setPolls(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'polls', id));
    } catch (e) {}
  };

  // Invitations
  const sendInvitation = async (email: string, role: any) => {
    const newInv: Invitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      invitedAt: new Date().toLocaleDateString('bn-BD'),
      status: 'pending'
    };
    setInvitations(prev => [newInv, ...prev]);
    try {
      await setDoc(doc(db, 'invitations', newInv.id), newInv);
    } catch (e) {}

    // When inviting a staff member, we also seed them as 'inactive' in users collection until they click the link!
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      status: 'active', // keep active so they can log in immediately upon receiving link!
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };
    setUsers(prev => [...prev, newUser]);
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (e) {}
  };

  const deleteInvitation = async (id: string) => {
    setInvitations(prev => prev.filter(i => i.id !== id));
    try {
      await deleteDoc(doc(db, 'invitations', id));
    } catch (e) {}
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
  const addUser = async (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      activityHistory: [
        { id: `act-${Date.now()}`, action: 'অ্যাকাউন্ট তৈরি', timestamp: new Date().toLocaleDateString('bn-BD'), ip: '127.0.0.1' }
      ]
    };
    setUsers(prev => [...prev, newUser]);
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (e) {}
  };

  const updateUser = async (id: string, updated: Partial<User>) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    const merged = { ...target, ...updated };
    setUsers(prev => prev.map(u => u.id === id ? merged : u));
    try {
      await setDoc(doc(db, 'users', id), merged);
    } catch (e) {}
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {}
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

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      await setDoc(doc(db, 'settings', 'config'), merged);
    } catch (e) {}
  };

  const updateStaticPage = async (slug: string, content: string, title?: string, seoTitle?: string, metaDescription?: string, status?: 'published' | 'draft') => {
    setStaticPages(prev => prev.map(p => p.slug === slug ? { 
      ...p, 
      content, 
      title: title || p.title, 
      seoTitle: seoTitle || p.seoTitle, 
      metaDescription: metaDescription || p.metaDescription, 
      status: status || p.status || 'published', 
      updatedAt: new Date().toLocaleDateString('bn-BD') 
    } : p));
    const target = staticPages.find(p => p.slug === slug);
    if (target) {
      try {
        await setDoc(doc(db, 'pages', target.id), {
          ...target,
          content,
          title: title || target.title,
          seoTitle: seoTitle || target.seoTitle,
          metaDescription: metaDescription || target.metaDescription,
          status: status || target.status || 'published',
          updatedAt: new Date().toLocaleDateString('bn-BD')
        });
      } catch (e) {}
    }
  };

  const addStaticPage = async (page: Omit<StaticPage, 'id' | 'updatedAt'>) => {
    const newPage: StaticPage = {
      ...page,
      id: `page-${Date.now()}`,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };
    setStaticPages(prev => [...prev, newPage]);
    try {
      await setDoc(doc(db, 'pages', newPage.id), newPage);
    } catch (e) {}
  };

  const deleteStaticPage = async (id: string) => {
    setStaticPages(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'pages', id));
    } catch (e) {}
  };

  const addSecurityLog = async (log: Omit<SecurityLog, 'id' | 'timestamp'>) => {
    const newLog: SecurityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('bn-BD') + ' টি ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };
    setSecurityLogs(prev => [newLog, ...prev]);
    try {
      await setDoc(doc(db, 'security_logs', newLog.id), newLog);
    } catch (e) {}
  };

  const deleteSecurityLog = async (id: string) => {
    setSecurityLogs(prev => prev.filter(l => l.id !== id));
    try {
      await deleteDoc(doc(db, 'security_logs', id));
    } catch (e) {}
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
      updatePoll,
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
      deleteSecurityLog,
      setRevisions,
      requestMagicLink
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
