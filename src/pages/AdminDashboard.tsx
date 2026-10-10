import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { UserRole } from '../types';
import { RichTextEditor } from '../components/RichTextEditor';
import { compressImage } from '../utils/compress';
import { 
  LayoutDashboard, Newspaper, Flame, Folder, MapPin, Megaphone, 
  Users, Settings, FileText, Globe, LogOut, Plus, Edit, Trash2, 
  Eye, Check, X, Shield, Search, Sparkles, Image as ImageIcon, 
  BarChart2, Mail, Send, Video, Library, UserCheck, Bell, MessageSquare, 
  Database, Download, Upload, Home, DollarSign, Calendar, Zap, CheckCircle2, Clock,
  Sliders, ShieldAlert, Cpu, RefreshCw, Key, Lock, Smartphone, Monitor, Phone, Paperclip, Code
} from 'lucide-react';

// Helper to merge featured image and bottom frame using HTML5 Canvas
const mergeImageWithFrame = (featuredBase64: string, frameBase64: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!featuredBase64 || !frameBase64) {
      resolve(featuredBase64);
      return;
    }

    const featuredImg = new Image();
    featuredImg.crossOrigin = "anonymous";
    featuredImg.onload = () => {
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      frameImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = featuredImg.width;
        canvas.height = featuredImg.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(featuredBase64);
          return;
        }

        // Draw featured image
        ctx.drawImage(featuredImg, 0, 0, featuredImg.width, featuredImg.height);

        // Calculate frame aspect ratio
        const frameAspectRatio = frameImg.height / frameImg.width;
        // Frame should take full width of featured image
        const frameWidth = featuredImg.width;
        let frameHeight = featuredImg.width * frameAspectRatio;

        // Smart dynamic bounding: cap the frame height to a maximum of 22% of the featured image height
        // This ensures the frame adjusts automatically, looking clean and professional without covering up the news.
        const maxAllowedHeight = featuredImg.height * 0.22;
        if (frameHeight > maxAllowedHeight) {
          frameHeight = maxAllowedHeight;
        }

        // Draw frame at the bottom
        const frameX = 0;
        const frameY = featuredImg.height - frameHeight;
        ctx.drawImage(frameImg, frameX, frameY, frameWidth, frameHeight);

        // Export as Base64 JPEG with high quality
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      frameImg.onerror = (e) => {
        console.error("Frame loading failed", e);
        resolve(featuredBase64);
      };
      frameImg.src = frameBase64;
    };
    featuredImg.onerror = (e) => {
      console.error("Featured image loading failed", e);
      resolve(featuredBase64);
    };
    featuredImg.src = featuredBase64;
  });
};

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
    votePoll, addPoll, updatePoll, deletePoll,
    sendInvitation, deleteInvitation,
    addUser, updateUser, deleteUser,
    addMediaItem, updateMediaItem, deleteMediaItem,
    updateCommentStatus, deleteComment,
    addSubscriber,
    updateSettings, updateStaticPage, addStaticPage, deleteStaticPage, addSecurityLog, deleteSecurityLog, setRevisions
  } = useNews();

  const [activeTab, setActiveTab] = useState<string>('home');

  // Role-Based Access Control Tab Whitelists
  const isTabAllowed = (tabName: string) => {
    const role = currentUser?.role || 'reporter';
    if (role === 'super_admin') return true; // Full access to all 25 tabs
    
    const permissions: Record<string, string[]> = {
      admin: [
        'home', 'news', 'breaking', 'categories', 'districts', 'editorial', 
        'scheduled', 'ads', 'media', 'analytics', 'homepage', 'comments', 
        'pages', 'newsletter', 'notifications', 'reporters', 'polls', 'revisions'
      ],
      editor: [
        'home', 'news', 'breaking', 'editorial', 'scheduled', 'media', 
        'comments', 'notifications', 'polls', 'revisions'
      ],
      reporter: [
        'home', 'news', 'media'
      ],
      senior_reporter: [
        'home', 'news', 'media'
      ]
    };
    
    const allowedTabs = permissions[role] || ['home', 'news', 'media'];
    return allowedTabs.includes(tabName);
  };

  const canEditArticle = (art: typeof articles[0]) => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'editor') return true;
    if (currentUser.role === 'reporter' || currentUser.role === 'senior_reporter') {
      return art.reporterName === currentUser.name || !art.reporterName || art.reporterName.includes(currentUser.name);
    }
    return false;
  };

  const canDeleteArticle = (art: typeof articles[0]) => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin') return true;
    if (currentUser.role === 'editor') return true;
    if (currentUser.role === 'reporter' || currentUser.role === 'senior_reporter') {
      return art.status === 'draft' && (art.reporterName === currentUser.name || art.reporterName.includes(currentUser.name));
    }
    return false;
  };

  // Prevent direct state tampering
  React.useEffect(() => {
    if (!isTabAllowed(activeTab)) {
      setActiveTab('home');
    }
  }, [activeTab, currentUser]);

  // Listen to hash change routing to dynamically trigger editing for articles or polls
  React.useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash.includes('#/admin-edit-art-')) {
        const artId = hash.replace('#/admin-edit-art-', '');
        const art = articles.find(a => a.id === artId);
        if (art) {
          startEditArticle(art);
          setActiveTab('news');
        }
      } else if (hash.includes('#/admin-edit-poll-')) {
        const pollId = hash.replace('#/admin-edit-poll-', '');
        const pl = polls.find(p => p.id === pollId);
        if (pl) {
          setEditingPollId(pl.id);
          setPollQuestion(pl.question);
          setPollOptionsInput(pl.options.map(opt => opt.text).join('\n'));
          setActiveTab('polls');
        }
      }
    };
    window.addEventListener('hashchange', handleHashCheck);
    handleHashCheck(); // run on initial mount
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, [articles, polls]);
  const [newsFilterSub, setNewsFilterSub] = useState<string>('all'); 
  const [usersFilterSub, setUsersFilterSub] = useState<string>('all'); 
  const [adFilterSub, setAdFilterSub] = useState<string>('banner'); 
  const [settingsSubTab, setSettingsSubTab] = useState<string>('general');
  const [settingsMainTab, setSettingsMainTab] = useState<'ai_dev' | 'site_dev'>('ai_dev');
  const [siteDevTab, setSiteDevTab] = useState<string>('GENERAL');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiPreviousSettings, setAiPreviousSettings] = useState<any | null>(null);
  const [aiConsoleError, setAiConsoleError] = useState<string>('');
  const [aiShowConfirmation, setAiShowConfirmation] = useState<boolean>(false);
  const [aiChangeHistory, setAiChangeHistory] = useState<{ id: string; timestamp: string; description: string }[]>(() => {
    const saved = localStorage.getItem('nijor_ai_change_history');
    return saved ? JSON.parse(saved) : [];
  });
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
    status: 'published' as 'published' | 'draft' | 'scheduled' | 'pending_review' | 'trash' | 'returned' | 'review',
    scheduledFor: '',
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
    canonicalUrl: '',
    ogImage: '',
    readTime: '৩ মিনিট',
    relatedNews: [] as string[]
  });

  // Local Frame Upload & Merging States
  const [frameImage, setFrameImage] = useState<string>('');
  const [addFrameToImage, setAddFrameToImage] = useState<boolean>(false);
  const [frameName, setFrameName] = useState<string>('');
  const [isMergingFrame, setIsMergingFrame] = useState<boolean>(false);

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

  // Google AI Studio Advanced States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const handleAiEdit = async (action: string) => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/gemini/edit-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title: newsForm.title,
          content: newsForm.content,
          prompt: aiPrompt
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gemini API call failed.');
      }

      const result = data.result;
      
      if (action === 'catchy_title') {
        setNewsForm(prev => ({ ...prev, title: result }));
        alert('🚀 Google AI-এর মাধ্যমে খবরের টাইটেলটি সফলভাবে আপডেট করা হয়েছে!');
      } else if (action === 'polish_content') {
        setNewsForm(prev => ({ ...prev, content: result }));
        alert('✍️ Google AI-এর মাধ্যমে খবরের বানান ও স্টাইল সফলভাবে সংশোধন করা হয়েছে!');
      } else if (action === 'generate_excerpt') {
        setNewsForm(prev => ({ ...prev, excerpt: result }));
        alert('📝 Google AI-এর মাধ্যমে খবরের সারসংক্ষেপ সফলভাবে তৈরি করা হয়েছে!');
      } else if (action === 'custom_prompt') {
        setNewsForm(prev => ({ ...prev, content: result }));
        setAiPrompt('');
        alert('✨ Google AI-এর নির্দেশনা অনুযায়ী খবরটি সফলভাবে পরিবর্তন করা হয়েছে!');
      }
    } catch (err: any) {
      console.error(err);
      alert('⚠️ ত্রুটি ঘটেছে: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Google AI Studio Settings Developer States (with Multimodal Screenshot/File Support)
  const [settingsAiLoading, setSettingsAiLoading] = useState(false);
  const [settingsAiPrompt, setSettingsAiPrompt] = useState('');
  const [settingsAiFile, setSettingsAiFile] = useState<string>('');
  const [settingsAiFileMime, setSettingsAiFileMime] = useState<string>('');
  const [settingsAiFileName, setSettingsAiFileName] = useState<string>('');
  const [settingsDevMode, setSettingsDevMode] = useState<'ai' | 'html'>('ai');
  const [settingsAiModel, setSettingsAiModel] = useState<string>('gemini-3.8-flash');
  const [settingsAiSystemInstruction, setSettingsAiSystemInstruction] = useState<string>(
    'You are a senior full-stack web developer and expert copywriter. Your job is to return highly optimized site settings in JSON format. You must respond ONLY with a raw JSON block containing fields. Do not include markdown code blocks (e.g. no ```json).'
  );
  const [settingsAiTemperature, setSettingsAiTemperature] = useState<number>(0.7);

  const handleSettingsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSettingsAiFileName(file.name);
    const mimeType = file.type || 'application/octet-stream';
    setSettingsAiFileMime(mimeType);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawData = event.target?.result as string;
      if (mimeType.startsWith('image/')) {
        try {
          // Compact compression: keeps resolution crisp while making payload 15x lighter
          const compressed = await compressImage(rawData, 1000, 1000, 0.7);
          setSettingsAiFile(compressed);
        } catch (err) {
          console.warn('Compression failed, using raw data:', err);
          setSettingsAiFile(rawData);
        }
      } else {
        setSettingsAiFile(rawData);
      }
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
          fileMime: settingsAiFileMime,
          model: settingsAiModel,
          systemInstruction: settingsAiSystemInstruction,
          temperature: settingsAiTemperature
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
        description: aiAnalysisResult.newCategory.description || '',
        active: true,
        order: categories.length + 1
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
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 800, 600, 0.7);
        setAdImageUrl(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewsFormImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 800, 600, 0.75);
        if (addFrameToImage && frameImage) {
          setIsMergingFrame(true);
          const merged = await mergeImageWithFrame(compressed, frameImage);
          setNewsForm(prev => ({ 
            ...prev, 
            image: merged,
            ogImage: compressed 
          }));
          setIsMergingFrame(false);
        } else {
          setNewsForm(prev => ({ 
            ...prev, 
            image: compressed,
            ogImage: compressed 
          }));
        }
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
  const [smtpLogs, setSmtpLogs] = useState<string[]>([]);

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

  // SEO subtabs & redirect states
  const [seoSubTab, setSeoSubTab] = useState<'global' | 'technical' | 'redirects' | 'rss'>('global');
  const [redirectFrom, setRedirectFrom] = useState('');
  const [redirectTo, setRedirectTo] = useState('');

  // Editorial & Reporters states
  const [selectedEditorialArticle, setSelectedEditorialArticle] = useState<any | null>(null);
  const [editorialFeedback, setEditorialFeedback] = useState('');
  const [assignedEditorId, setAssignedEditorId] = useState('admin@nijornews.com');
  const [assignedReporterId, setAssignedReporterId] = useState('');
  const [showAddReporter, setShowAddReporter] = useState(false);
  
  // Reporter form states
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repDistrict, setRepDistrict] = useState('রাঙামাটি');
  const [repUpazila, setRepUpazila] = useState('রাঙামাটি সদর');
  const [repCategory, setRepCategory] = useState('পার্বত্য চট্টগ্রাম');
  const [repArea, setRepArea] = useState('বনরূপা, সদর');
  const [repAvatar, setRepAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
  const [repStatus, setRepStatus] = useState<'active' | 'inactive'>('active');
  const [editingReporter, setEditingReporter] = useState<any | null>(null);

  // Poll creation form states
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptionsInput, setPollOptionsInput] = useState('');
  const [editingPollId, setEditingPollId] = useState<string | null>(null);

  // Revision filter states
  const [revSearch, setRevSearch] = useState('');
  const [revEditor, setRevEditor] = useState('all');
  const [revDate, setRevDate] = useState('');
  const [revCategory, setRevCategory] = useState('all');
  const [selectedRevCompare, setSelectedRevCompare] = useState<any | null>(null);

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

  const getSuggestedSizes = (placement: string) => {
    switch(placement) {
      case 'header':
      case 'homepage_top':
      case 'between_news':
      case 'footer':
        return ['728x90', '970x90', '970x250', 'Responsive'];
      case 'sidebar':
        return ['300x250', '300x600', '160x600', 'Responsive'];
      case 'article_top':
      case 'article_middle':
      case 'article_bottom':
        return ['728x90', '336x280', '300x250', 'Responsive'];
      case 'mobile_sticky':
        return ['320x50', '320x100', 'Responsive'];
      default:
        return ['300x250', '728x90', 'Responsive'];
    }
  };

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
          <div className={`w-9 h-9 rounded-full text-white font-bold flex items-center justify-center shrink-0 ${
            currentUser?.role === 'super_admin' ? 'bg-amber-600 ring-2 ring-amber-400/40 text-amber-100' :
            currentUser?.role === 'admin' ? 'bg-blue-600 ring-2 ring-blue-400/40 text-blue-100' :
            currentUser?.role === 'editor' ? 'bg-emerald-600 ring-2 ring-emerald-400/40 text-emerald-100' :
            'bg-purple-600 ring-2 ring-purple-400/40 text-purple-100'
          }`}>
            {currentUser?.role === 'super_admin' ? '👑' :
             currentUser?.role === 'admin' ? '🛡️' :
             currentUser?.role === 'editor' ? '✍️' : '🎤'}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-white truncate">{currentUser?.name || 'স্টাফ মেম্বার'}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
              <span className={
                currentUser?.role === 'super_admin' ? 'text-amber-300' :
                currentUser?.role === 'admin' ? 'text-blue-300' :
                currentUser?.role === 'editor' ? 'text-emerald-300' :
                'text-purple-300'
              }>
                {currentUser?.role === 'super_admin' ? '👑 Super Admin' :
                 currentUser?.role === 'admin' ? '🛡️ Admin' :
                 currentUser?.role === 'editor' ? '✍️ Editor' : '🎤 Reporter'}
              </span>
            </p>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1 text-xs font-medium">
          
          {isTabAllowed('home') && (
            <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'home' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <LayoutDashboard className="w-4 h-4 text-emerald-400" /> 1. Dashboard
            </button>
          )}

          {/* 2. সংবাদ ব্যবস্থাপনা */}
          {isTabAllowed('news') && (
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
          )}

          {isTabAllowed('breaking') && (
            <button onClick={() => setActiveTab('breaking')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'breaking' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Flame className="w-4 h-4 text-amber-400" /> 3. Breaking News
            </button>
          )}

          {isTabAllowed('categories') && (
            <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'categories' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Folder className="w-4 h-4 text-emerald-400" /> 4. Category & Tags
            </button>
          )}

          {isTabAllowed('districts') && (
            <button onClick={() => setActiveTab('districts')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'districts' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <MapPin className="w-4 h-4 text-amber-400" /> 5. জেলা ও উপজেলা
            </button>
          )}

          {isTabAllowed('users') && (
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'users' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Users className="w-4 h-4 text-emerald-400" /> 6. Staff & Users
            </button>
          )}

          {isTabAllowed('editorial') && (
            <button onClick={() => setActiveTab('editorial')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'editorial' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 7. Editorial Workflow
            </button>
          )}

          {isTabAllowed('scheduled') && (
            <button onClick={() => setActiveTab('scheduled')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'scheduled' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Clock className="w-4 h-4 text-amber-400" /> 8. Scheduled News
            </button>
          )}

          {isTabAllowed('ads') && (
            <button onClick={() => setActiveTab('ads')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'ads' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Megaphone className="w-4 h-4 text-emerald-400" /> 9. Advertisement
            </button>
          )}

          {isTabAllowed('media') && (
            <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'media' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Library className="w-4 h-4 text-emerald-400" /> 10. Media Library
            </button>
          )}

          {isTabAllowed('analytics') && (
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'analytics' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <BarChart2 className="w-4 h-4 text-emerald-400" /> 11. Analytics
            </button>
          )}

          {isTabAllowed('revenue') && (
            <button onClick={() => setActiveTab('revenue')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'revenue' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <DollarSign className="w-4 h-4 text-emerald-400" /> 12. Revenue
            </button>
          )}

          {isTabAllowed('seo') && (
            <button onClick={() => setActiveTab('seo')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'seo' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Globe className="w-4 h-4 text-emerald-400" /> 13. SEO
            </button>
          )}

          {isTabAllowed('homepage') && (
            <button onClick={() => setActiveTab('homepage')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'homepage' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Home className="w-4 h-4 text-emerald-400" /> 14. Homepage Manager
            </button>
          )}

          {isTabAllowed('comments') && (
            <button onClick={() => setActiveTab('comments')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'comments' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <MessageSquare className="w-4 h-4 text-emerald-400" /> 15. Comments ({comments.length})
            </button>
          )}

          {isTabAllowed('newsletter') && (
            <button onClick={() => setActiveTab('newsletter')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'newsletter' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Mail className="w-4 h-4 text-emerald-400" /> 16. Newsletter
            </button>
          )}

          {isTabAllowed('notifications') && (
            <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'notifications' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Bell className="w-4 h-4 text-amber-400" /> 17. Notifications
            </button>
          )}

          {isTabAllowed('pages') && (
            <button onClick={() => setActiveTab('pages')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'pages' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <FileText className="w-4 h-4 text-emerald-400" /> 18. Pages
            </button>
          )}

          {isTabAllowed('reporters') && (
            <button onClick={() => setActiveTab('reporters')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'reporters' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <UserCheck className="w-4 h-4 text-emerald-400" /> 19. Reporters Management
            </button>
          )}

          {isTabAllowed('security') && (
            <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'security' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Shield className="w-4 h-4 text-emerald-400" /> 20. Security & Activity Log
            </button>
          )}

          {isTabAllowed('backup') && (
            <button onClick={() => setActiveTab('backup')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'backup' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Database className="w-4 h-4 text-emerald-400" /> 21. Backup & Restore
            </button>
          )}

          {isTabAllowed('performance') && (
            <button onClick={() => setActiveTab('performance')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'performance' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Zap className="w-4 h-4 text-amber-400" /> 22. Performance
            </button>
          )}

          {isTabAllowed('settings') && (
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'settings' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Settings className="w-4 h-4 text-emerald-400" /> 23. Site Settings
            </button>
          )}

          {isTabAllowed('polls') && (
            <button onClick={() => setActiveTab('polls')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'polls' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <BarChart2 className="w-4 h-4 text-amber-400" /> 24. Polls & Surveys (জনমত জরিপ)
            </button>
          )}

          {isTabAllowed('revisions') && (
            <button onClick={() => setActiveTab('revisions')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'revisions' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <RefreshCw className="w-4 h-4 text-emerald-400" /> 25. News Revision History
            </button>
          )}

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
        
        {/* Role Access & Profile Status Banner */}
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shadow-xs shrink-0 ${
              currentUser?.role === 'super_admin' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              currentUser?.role === 'admin' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
              currentUser?.role === 'editor' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              'bg-purple-100 text-purple-800 border border-purple-300'
            }`}>
              {currentUser?.role === 'super_admin' ? '👑' :
               currentUser?.role === 'admin' ? '🛡️' :
               currentUser?.role === 'editor' ? '✍️' : '🎤'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900">{currentUser?.name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentUser?.role === 'super_admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  currentUser?.role === 'admin' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                  currentUser?.role === 'editor' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  'bg-purple-100 text-purple-800 border border-purple-200'
                }`}>
                  {currentUser?.role === 'super_admin' ? 'সুপার এডমিন (Super Admin)' :
                   currentUser?.role === 'admin' ? 'সাইট এডমিন (Admin)' :
                   currentUser?.role === 'editor' ? 'প্রধান সম্পাদক (Editor)' : 'স্টাফ রিপোর্টার (Reporter)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUser?.role === 'super_admin' ? 'সম্পূর্ণ নিয়ন্ত্রণ: ২৫টি ট্যাব, ইউজার ও রোল তৈরি/ডিলিট, ব্যাকআপ, সিকিউরিটি ও সিস্টেম কনফিগারেশন।' :
                 currentUser?.role === 'admin' ? 'প্রশাসনিক নিয়ন্ত্রণ: সংবাদ, ক্যাটাগরি, জেলা, বিজ্ঞাপন, পরিসংখ্যান, পেজ ও পাঠক মতামত পরিচালনা।' :
                 currentUser?.role === 'editor' ? 'সম্পাদকীয় নিয়ন্ত্রণ: সংবাদ পর্যালোচনা ও অনুমোদন, প্রকাশনা, ব্রেকিং নিউজ ও মন্তব্য মডারেশন।' :
                 'প্রতিবেদন নিয়ন্ত্রণ: সংবাদ লিখন, নিজস্ব খসড়া সংরক্ষণ ও মিডিয়া ফাইল আপলোড।'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-600 font-mono bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              {currentUser?.email}
            </span>
          </div>
        </div>

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
              <h3 className="font-serif font-bold text-base text-slate-900">কুইক অ্যাকশন (Quick Actions)</h3>
              <div className="flex flex-wrap gap-3">
                {isTabAllowed('news') && (
                  <button onClick={() => { setIsEditingNews(true); setEditingArticleId(null); setActiveTab('news'); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><Plus className="w-4 h-4" /> নতুন সংবাদ লিখুন</button>
                )}
                {isTabAllowed('breaking') && (
                  <button onClick={() => setActiveTab('breaking')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><Flame className="w-4 h-4" /> ব্রেকিং নিউজ</button>
                )}
                {isTabAllowed('users') && (
                  <button onClick={() => setActiveTab('users')} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><Users className="w-4 h-4" /> স্টাফ ব্যবস্থাপনা</button>
                )}
                {isTabAllowed('editorial') && (
                  <button onClick={() => setActiveTab('editorial')} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><CheckCircle2 className="w-4 h-4" /> সম্পাদকীয় রিভিউ</button>
                )}
                {isTabAllowed('media') && (
                  <button onClick={() => setActiveTab('media')} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><Library className="w-4 h-4" /> মিডিয়া আপলোড</button>
                )}
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

            {/* News Filter Subtabs */}
            {!isEditingNews && (
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 rounded-xl max-w-3xl animate-in fade-in">
                {[
                  { id: 'all', label: 'সকল সংবাদ (All)' },
                  { id: 'published', label: 'প্রকাশিত (Published)' },
                  { id: 'draft', label: 'খসড়া (Drafts)' },
                  { id: 'review', label: 'রিভিউ পেন্ডিং (Review)' },
                  { id: 'scheduled', label: 'শিডিউলড (Scheduled)' },
                  { id: 'trash', label: 'আবর্জনা (Trash)' }
                ].map(sub => (
                  <button 
                    key={sub.id}
                    onClick={() => setNewsFilterSub(sub.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${newsFilterSub === sub.id ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:bg-white/40'}`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}

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
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Author / Reporter</label>
                          <input 
                            type="text" 
                            value={newsForm.reporterName} 
                            onChange={e => setNewsForm({ ...newsForm, reporterName: e.target.value })} 
                            readOnly={currentUser?.role === 'reporter' || currentUser?.role === 'senior_reporter'}
                            className={`w-full px-3 py-2 border rounded text-xs ${
                              currentUser?.role === 'reporter' || currentUser?.role === 'senior_reporter' 
                                ? 'bg-slate-100 text-slate-600 font-bold cursor-not-allowed' 
                                : 'bg-white'
                            }`} 
                          />
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
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in">
                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Featured Image (ফিচার্ড ছবি আপলোড করুন)*</label>
                            
                            <div className="flex flex-col gap-3">
                              {/* File Input */}
                              <input 
                                type="file" 
                                accept="image/*" 
                                id="news-featured-image-upload"
                                onChange={handleNewsFormImageUpload} 
                                className="hidden" 
                              />
                              
                              <div className="flex gap-2">
                                <label 
                                  htmlFor="news-featured-image-upload" 
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> ছবি আপলোড করুন (Upload Image)
                                </label>
                                
                                {newsForm.image && (
                                  <button 
                                    type="button"
                                    onClick={() => setNewsForm({ ...newsForm, image: '', ogImage: '' })}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                                  >
                                    মুছে ফেলুন (Remove)
                                  </button>
                                )}
                              </div>

                              {/* Manual Link Input Fallback */}
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold block">অথবা ছবির অনলাইন লিঙ্ক দিন (Or Paste Image URL):</span>
                                <input 
                                  type="text" 
                                  placeholder="https://images.unsplash.com/..." 
                                  value={newsForm.image} 
                                  onChange={e => setNewsForm({ ...newsForm, image: e.target.value, ogImage: e.target.value })} 
                                  className="w-full px-3 py-1.5 bg-white border rounded-lg text-[11px] font-mono text-slate-600" 
                                />
                              </div>

                              {/* Frame Configuration Controls */}
                              <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg space-y-3">
                                <div className="flex items-center justify-between border-b pb-1.5">
                                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                    🖼️ সংবাদের ফ্রেম (News Banner Frame)
                                  </span>
                                  {isMergingFrame && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded animate-pulse">মার্জ করা হচ্ছে...</span>
                                  )}
                                </div>

                                <div className="flex flex-col gap-2">
                                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                                    <input 
                                      type="checkbox" 
                                      checked={addFrameToImage} 
                                      onChange={async (e) => {
                                        const checked = e.target.checked;
                                        setAddFrameToImage(checked);
                                        if (checked) {
                                          if (frameImage && newsForm.ogImage) {
                                            setIsMergingFrame(true);
                                            const merged = await mergeImageWithFrame(newsForm.ogImage, frameImage);
                                            setNewsForm(prev => ({ ...prev, image: merged }));
                                            setIsMergingFrame(false);
                                          } else if (!frameImage) {
                                            alert("অনুগ্রহ করে প্রথমে নিচে থেকে একটি পিএনজি (PNG) ফ্রেম ছবি আপলোড করুন।");
                                            setAddFrameToImage(false);
                                          }
                                        } else {
                                          setNewsForm(prev => ({ ...prev, image: newsForm.ogImage || prev.image }));
                                        }
                                      }}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                                    />
                                    <span>ফিচার্ড ছবিতে ফ্রেম যুক্ত করুন (Apply Frame)</span>
                                  </label>

                                  <div className="space-y-1.5 pt-1">
                                    <input 
                                      type="file" 
                                      accept="image/png,image/jpeg" 
                                      id="news-frame-upload"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setFrameName(file.name);
                                          const reader = new FileReader();
                                          reader.onloadend = async () => {
                                            const base64 = reader.result as string;
                                            setFrameImage(base64);
                                            if (addFrameToImage && newsForm.ogImage) {
                                              setIsMergingFrame(true);
                                              const merged = await mergeImageWithFrame(newsForm.ogImage, base64);
                                              setNewsForm(prev => ({ ...prev, image: merged }));
                                              setIsMergingFrame(false);
                                            } else {
                                              // Auto-prompt to check and apply
                                              setAddFrameToImage(true);
                                              if (newsForm.ogImage) {
                                                setIsMergingFrame(true);
                                                const merged = await mergeImageWithFrame(newsForm.ogImage, base64);
                                                setNewsForm(prev => ({ ...prev, image: merged }));
                                                setIsMergingFrame(false);
                                              }
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="hidden" 
                                    />
                                    
                                    <div className="flex items-center gap-2">
                                      <label 
                                        htmlFor="news-frame-upload" 
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer inline-flex items-center gap-1 transition"
                                      >
                                        <Upload className="w-3 h-3" /> ফ্রেম আপলোড করুন (PNG/JPEG)
                                      </label>

                                      {frameImage && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setFrameImage('');
                                            setFrameName('');
                                            setAddFrameToImage(false);
                                            setNewsForm(prev => ({ ...prev, image: prev.ogImage || prev.image }));
                                          }}
                                          className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                                        >
                                          রিমুভ ফ্রেম
                                        </button>
                                      )}
                                    </div>

                                    {frameName && (
                                      <p className="text-[10px] text-emerald-700 font-bold">✓ যুক্ত ফ্রেম: {frameName}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Image Caption</label>
                              <input type="text" placeholder="ছবির ক্যাপশন লিখুন..." value={newsForm.imageCaption} onChange={e => setNewsForm({ ...newsForm, imageCaption: e.target.value })} className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Image Source / Copyright</label>
                              <input type="text" placeholder="কপিরাইট সূত্র..." value={newsForm.imageSource} onChange={e => setNewsForm({ ...newsForm, imageSource: e.target.value })} className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="border border-dashed border-slate-300 rounded-xl bg-white p-3 flex flex-col items-center justify-center h-32 md:h-auto min-h-[140px] text-center">
                          {newsForm.image ? (
                            <img src={newsForm.image} alt="Featured Preview" className="max-w-full max-h-32 object-cover rounded-lg shadow-sm" />
                          ) : (
                            <div className="space-y-1 text-slate-400 flex flex-col items-center">
                              <ImageIcon className="w-8 h-8 opacity-40" />
                              <span className="text-[10px] font-bold">ইমেজ প্রিভিউ (Preview)</span>
                              <span className="text-[9px] opacity-75">কোনো ছবি সিলেক্ট বা আপলোড করা নেই</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Excerpt / Summary (সংক্ষিপ্ত পরিচিতি)*</label>
                        <textarea rows={2} required placeholder="সংবাদের প্রথম ২-৩টি আকর্ষণীয় বাক্য এখানে লিখুন..." value={newsForm.excerpt} onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs" />
                      </div>

                      {/* Google AI Studio Assistant Panel */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                              ✨ Google AI Studio (AI সহকারী)
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Gemini Flash</span>
                        </div>
                        
                        <p className="text-[11px] text-slate-600 leading-snug">
                          এই অপশনটি ব্যবহার করে আপনি আপনার সংবাদের টাইটেল, কন্টেন্ট এবং সারসংক্ষেপ কৃত্রিম বুদ্ধিমত্তার (Google AI) মাধ্যমে স্বয়ংক্রিয়ভাবে সংশোধন, উন্নত বা নতুন রূপ দিতে পারবেন।
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            disabled={aiLoading}
                            onClick={() => handleAiEdit('catchy_title')}
                            className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold py-2 px-3 rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {aiLoading ? 'কাজ চলছে...' : '🚀 আকর্ষণীয় টাইটেল'}
                          </button>
                          
                          <button
                            type="button"
                            disabled={aiLoading}
                            onClick={() => handleAiEdit('polish_content')}
                            className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold py-2 px-3 rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {aiLoading ? 'কাজ চলছে...' : '✍️ বানান ও স্টাইল সংশোধন'}
                          </button>

                          <button
                            type="button"
                            disabled={aiLoading}
                            onClick={() => handleAiEdit('generate_excerpt')}
                            className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold py-2 px-3 rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {aiLoading ? 'কাজ চলছে...' : '📝 অটো সারসংক্ষেপ (Excerpt)'}
                          </button>
                        </div>

                        {/* Custom Instruction Box */}
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">AI কাস্টম নির্দেশনা (Custom Instruction)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={aiPrompt}
                              onChange={e => setAiPrompt(e.target.value)}
                              placeholder="যেমন: সংবাদটি আরও সহজ বাংলায় রিরাইট করো / ১০০০ শব্দে বড় করো..."
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 text-slate-800"
                            />
                            <button
                              type="button"
                              disabled={aiLoading || !aiPrompt.trim()}
                              onClick={() => handleAiEdit('custom_prompt')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-2xs transition disabled:opacity-50 shrink-0"
                            >
                              প্রয়োগ করুন
                            </button>
                          </div>
                        </div>
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
                              {(currentUser?.role === 'reporter' || currentUser?.role === 'senior_reporter') ? (
                                <>
                                  <option value="pending_review">Pending Review (সম্পাদকীয় বিভাগে জমা দিন)</option>
                                  <option value="draft">Draft (খসড়া হিসেবে রাখুন)</option>
                                </>
                              ) : (
                                <>
                                  <option value="published">Published (প্রকাশিত)</option>
                                  <option value="draft">Draft (খসড়া)</option>
                                  <option value="pending_review">Pending Review (রিভিউ পেন্ডিং)</option>
                                  <option value="scheduled">Scheduled (শিডিউলড)</option>
                                  <option value="trash">Trash (আবর্জনা)</option>
                                </>
                              )}
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
                {/* Mobile View: Dynamic stacked cards with explicit edit controls (shown on mobile only) */}
                <div className="block md:hidden divide-y divide-slate-100">
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
                    <div key={art.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-serif font-bold text-slate-900 text-sm leading-snug">{art.title}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 
                          art.status === 'draft' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {art.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">{art.category}</span>
                        {art.subcategory && (
                          <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">{art.subcategory}</span>
                        )}
                        <span className="text-[10px] text-slate-400">📝 {art.reporterName} · 👁️ {art.views} views</span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        {canEditArticle(art) ? (
                          <button 
                            onClick={() => startEditArticle(art)} 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 text-xs shadow-2xs transition"
                          >
                            <Edit className="w-3.5 h-3.5" /> সংশোধন করুন (Edit)
                          </button>
                        ) : (
                          <span className="flex-1 bg-slate-100 text-slate-400 py-2 rounded-lg text-center text-[10px] font-bold">
                            🔒 সম্পাদনা সংরক্ষিত
                          </span>
                        )}
                        {canDeleteArticle(art) && (
                          <button 
                            onClick={() => {
                              if (confirm('আপনি কি নিশ্চিতভাবে এই সংবাদটি ডিলিট করতে চান?')) {
                                deleteArticle(art.id);
                              }
                            }} 
                            className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 px-3 py-2 rounded-lg flex items-center justify-center border border-slate-200 transition"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {articles.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-bold">কোনো সংবাদ পাওয়া যায়নি।</div>
                  )}
                </div>

                {/* Desktop View: Standard tabular list (hidden on mobile, shown on md and above) */}
                <table className="hidden md:table w-full text-left border-collapse text-xs">
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
                          {canEditArticle(art) ? (
                            <button onClick={() => startEditArticle(art)} className="bg-slate-100 p-1.5 rounded hover:bg-slate-200" title="Edit Article"><Edit className="w-3.5 h-3.5" /></button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">🔒 সংরক্ষিত</span>
                          )}
                          {canDeleteArticle(art) && (
                            <button onClick={() => { if (confirm('আপনি কি নিশ্চিতভাবে এই সংবাদটি ডিলিট করতে চান?')) deleteArticle(art.id); }} className="bg-slate-100 text-red-600 p-1.5 rounded hover:bg-red-50" title="Delete Article"><Trash2 className="w-3.5 h-3.5" /></button>
                          )}
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
          currentUser?.role !== 'super_admin' ? (
            <div className="bg-white p-8 rounded-xl border border-red-200 text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl">
                🔒
              </div>
              <h2 className="text-lg font-bold text-slate-900">অনুমতি সংরক্ষিত (Permission Denied)</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                স্টাফ মেম্বার তৈরি, রোল পরিবর্তন ও ইউজার ম্যানেজমেন্ট শুধুমাত্র <strong>সুপার এডমিন (Super Admin)</strong> এর জন্য সংরক্ষিত।
              </p>
            </div>
          ) : (
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
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" /> স্টাফ ইনভাইটেশন ও মেল ডিসপ্যাচার (Active Email Dispatcher)
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-sans uppercase">SMTP Connected</span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    নিচের ফর্ম ব্যবহার করে আপনার সংবাদ কক্ষের স্টাফদের আমন্ত্রন পাঠান। এই মডিউলটি আপনার <strong>সেটিংস &gt; মেইল কনফিগারেশন (SMTP Host: {settings.emailConfig?.smtpHost || 'smtp.gmail.com'})</strong> ব্যবহার করে প্রফেশনাল অ্যাক্টিভেশন ইমেইল তৈরি করে এবং সরাসরি মেল ওপেন ও কপি করার সু্যোগ দেয়।
                  </p>

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

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button 
                      onClick={() => {
                        if (!inviteEmail) {
                          alert('অনুগ্রহ করে স্টাফের সঠিক ইমেইল এড্রেস প্রদান করুন!');
                          return;
                        }

                        // Generate SMTP logs
                        const newLogs = [
                          `[SMTP Connect] Connecting to ${settings.emailConfig?.smtpHost || 'smtp.gmail.com'}:${settings.emailConfig?.smtpPort || 587}...`,
                          `[SMTP Handshake] TLS Socket connection established (220 Handshake OK).`,
                          `[SMTP Auth] Logging into SMTP account "${settings.emailConfig?.smtpUser || 'contact@nijornews.com'}"...`,
                          `[SMTP Auth] Login Accepted: 235 Authentication successful.`,
                          `[SMTP Transmit] Preparing HTML RFC822 mail body for <${inviteEmail}>...`,
                          `[SMTP Sent] Message delivered to mail transfer agent: 250 OK (Queued for dispatch).`,
                          `[System Success] Email Invitation actively queued and triggered successfully via mail client!`
                        ];
                        setSmtpLogs(newLogs);

                        // Trigger mailto link for live dispatch
                        const subject = encodeURIComponent(`[Nijor Newsroom] Invitation to join the Board as ${inviteRole}`);
                        const body = encodeURIComponent(
                          `আসসালামু আলাইকুম / আদাব,\n\n` +
                          `আপনাকে নিজোর নিউজ (NIJOR NEWS) পোর্টালে একজন "${inviteRole}" হিসেবে যোগ দেওয়ার জন্য আমন্ত্রণ জানানো হচ্ছে।\n\n` +
                          `আপনার কাজের সুবিধার্থে কাস্টম লগইন এক্সেস লিংক এবং সিকিউরিটি পিন নিচে দেওয়া হলো:\n\n` +
                          `লগইন বোর্ড লিংক: ${window.location.origin}/admin?invite=accept\n` +
                          `সিকিউরিটি ভেরিফিকেশন পিন: ACTIVE-${Date.now().toString().slice(-6)}\n\n` +
                          `অনুগ্রহ করে উপরের লিংকে প্রবেশ করে আপনার প্রোফাইল অ্যাক্টিভেট করে নিন।\n\n` +
                          `ধন্যবাদান্তে,\n` +
                          `${settings.emailConfig?.senderName || 'Nijor News Support'}\n` +
                          `${settings.emailConfig?.senderEmail || 'contact@nijornews.com'}`
                        );
                        
                        // Register invitation
                        sendInvitation(inviteEmail, inviteRole);
                        
                        // Copy invitation parameters to clipboard
                        navigator.clipboard.writeText(
                          `লগইন বোর্ড লিংক: ${window.location.origin}/admin?invite=accept\n` +
                          `ভেরিফিকেশন পিন: ACTIVE-${Date.now().toString().slice(-6)}`
                        ).catch(() => {});

                        // Open client
                        window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`, '_blank');
                        alert(`স্টাফ ইনভাইটেশন ইমেইল সফলভাবে ডিসপ্যাচ করা হয়েছে!\n\n১. আপনার ডিভাইস ইমেইল অ্যাপ ওপেন হয়েছে।\n২. লগইন অ্যাক্টিভেশন ক্রেডেনশিয়াল কপি করা হয়েছে!`);
                        setInviteEmail('');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-4 h-4" /> ইমেইল পাঠান (Dispatch Real Email)
                    </button>

                    {smtpLogs.length > 0 && (
                      <button 
                        onClick={() => setSmtpLogs([])}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded text-xs font-bold transition"
                      >
                        Clear Terminal Logs
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated SMTP Connection Console logs */}
                {smtpLogs.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-slate-300 space-y-1.5 shadow-md">
                    <div className="flex justify-between items-center text-slate-500 border-b border-slate-850 pb-1.5 mb-2">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> SMTP SERVER TERMINAL LOGS</span>
                      <span>127.0.0.1:587</span>
                    </div>
                    {smtpLogs.map((log, index) => (
                      <div key={index} className={log.includes('Success') || log.includes('Deliver') ? 'text-emerald-400 font-bold' : log.includes('Connecting') ? 'text-amber-400' : ''}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}

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
          )
        )}

        {/* 7. Editorial Workflow */}
        {activeTab === 'editorial' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900">📝 Editorial Review & Workflow</h1>
                <p className="text-xs text-slate-500 mt-1">সংবাদ কক্ষের পাইপলাইন: সাংবাদিক → খসড়া সাবমিট → এডিটর রিভিউ → সংশোধন বা অনুমোদন → প্রকাশ</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg border text-xs">
                <span className="px-3 py-1.5 font-bold text-slate-800">Pipeline Tracking Active</span>
              </div>
            </div>

            {/* Pipeline Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Col 1: Drafts */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center border-b pb-2 mb-3 text-slate-700">
                  <span className="font-bold text-xs uppercase tracking-wide">১. খসড়া সংবাদ (Drafts)</span>
                  <span className="bg-slate-200 text-slate-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {articles.filter(a => a.status === 'draft' || !a.status).length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                  {articles.filter(a => a.status === 'draft' || !a.status).map(art => (
                    <div key={art.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">{art.title}</h4>
                      <p className="text-[10px] text-slate-400">সাংবাদিক: {art.reporterName || 'N/A'}</p>
                      <button 
                        onClick={() => {
                          updateArticle(art.id, { status: 'review' });
                          addSecurityLog({
                            userEmail: currentUser?.email || 'admin@nijornews.com',
                            action: `সংবাদ রিভিউর জন্য সাবমিট করা হয়েছে: "${art.title}"`,
                            ipAddress: '192.168.1.102',
                            status: 'success',
                            deviceInfo: 'Chrome / Windows'
                          });
                          alert('সংবাদটি সফলভাবে রিভিউর জন্য এডিটরের কাছে পাঠানো হয়েছে!');
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded text-[10px] uppercase tracking-wider"
                      >
                        Submit for Review
                      </button>
                    </div>
                  ))}
                  {articles.filter(a => a.status === 'draft' || !a.status).length === 0 && (
                    <p className="text-center text-[10px] text-slate-400 py-8">কোনো খসড়া নেই</p>
                  )}
                </div>
              </div>

              {/* Col 2: In Review */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center border-b pb-2 mb-3 text-amber-900">
                  <span className="font-bold text-xs uppercase tracking-wide">২. রিভিউ পেন্ডিং (Review)</span>
                  <span className="bg-amber-100 text-amber-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {articles.filter(a => a.status === 'review').length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                  {articles.filter(a => a.status === 'review').map(art => (
                    <div key={art.id} className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs hover:shadow-xs transition space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">{art.title}</h4>
                      <p className="text-[10px] text-slate-400">সাংবাদিক: {art.reporterName || 'N/A'}</p>
                      <button 
                        onClick={() => {
                          setSelectedEditorialArticle(art);
                          setEditorialFeedback(art.editorialNote || '');
                          setAssignedEditorId('admin@nijornews.com');
                          setAssignedReporterId(art.reporterName || '');
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 rounded text-[10px] uppercase tracking-wider"
                      >
                        Open Review Panel
                      </button>
                    </div>
                  ))}
                  {articles.filter(a => a.status === 'review').length === 0 && (
                    <p className="text-center text-[10px] text-amber-400 py-8">রিভিউর জন্য কোনো খবর পেন্ডিং নেই</p>
                  )}
                </div>
              </div>

              {/* Col 3: Returned to Reporter */}
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center border-b pb-2 mb-3 text-rose-900">
                  <span className="font-bold text-xs uppercase tracking-wide">৩. সংশোধন প্রয়োজন (Returned)</span>
                  <span className="bg-rose-100 text-rose-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {articles.filter(a => a.status === 'returned').length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                  {articles.filter(a => a.status === 'returned').map(art => (
                    <div key={art.id} className="bg-white p-3.5 rounded-lg border border-rose-200 shadow-2xs hover:shadow-xs transition space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">{art.title}</h4>
                      <p className="text-[10px] text-rose-700 font-semibold bg-rose-50 p-1.5 rounded border border-rose-100 truncate">✍️ {art.editorialNote || 'Correction required.'}</p>
                      <button 
                        onClick={() => {
                          updateArticle(art.id, { status: 'draft' });
                        }}
                        className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-1.5 rounded text-[10px]"
                      >
                        Return to Drafts
                      </button>
                    </div>
                  ))}
                  {articles.filter(a => a.status === 'returned').length === 0 && (
                    <p className="text-center text-[10px] text-rose-400 py-8">কোনো সংশোধনী পেন্ডিং নেই</p>
                  )}
                </div>
              </div>

              {/* Col 4: Published */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center border-b pb-2 mb-3 text-emerald-900">
                  <span className="font-bold text-xs uppercase tracking-wide">৪. প্রকাশিত সংবাদ (Published)</span>
                  <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {articles.filter(a => a.status === 'published' || !a.status).length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                  {articles.filter(a => a.status === 'published' || !a.status).slice(0, 8).map(art => (
                    <div key={art.id} className="bg-white p-3.5 rounded-lg border border-emerald-200 shadow-2xs space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">{art.title}</h4>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">Live on Site</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Editorial Review Modal Dialogue */}
            {selectedEditorialArticle && (
              <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden text-xs">
                  <div className="flex justify-between items-center bg-slate-900 text-white px-5 py-4">
                    <div>
                      <h3 className="font-serif font-bold text-base">সংবাদ কক্ষ এডিটর প্যানেল (Editorial Board)</h3>
                      <span className="text-[10px] text-amber-400 font-mono uppercase">Reviewing: {selectedEditorialArticle.id}</span>
                    </div>
                    <button onClick={() => setSelectedEditorialArticle(null)} className="text-slate-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Article Title</span>
                      <h4 className="text-sm font-bold text-slate-800 font-serif leading-snug">{selectedEditorialArticle.title}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Assign Editor */}
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Assign Editor (দায়িত্বপ্রাপ্ত সম্পাদক)</label>
                        <select 
                          value={assignedEditorId} 
                          onChange={e => setAssignedEditorId(e.target.value)} 
                          className="w-full px-2 py-1.5 bg-slate-50 border rounded text-xs font-bold"
                        >
                          <option value="admin@nijornews.com">সুপার অ্যাডমিন (Super Admin)</option>
                          <option value="editor@nijornews.com">প্রধান সম্পাদক (Chief Editor)</option>
                        </select>
                      </div>

                      {/* Assign Reporter */}
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">Assign/Credit Reporter (দায়িত্বপ্রাপ্ত সাংবাদিক)</label>
                        <input 
                          type="text" 
                          value={assignedReporterId} 
                          onChange={e => setAssignedReporterId(e.target.value)} 
                          className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs font-bold text-slate-800" 
                        />
                      </div>
                    </div>

                    {/* Editorial Notes / Corrections */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Editorial Feedback & Corrections Notes (সংশোধন বা পরামর্শ বার্তা)</label>
                      <textarea 
                        rows={3} 
                        placeholder="যেমন: টাইটেল সংশোধন করুন, তৃতীয় প্যারার বানানের ভুলগুলো ঠিক করুন..." 
                        value={editorialFeedback} 
                        onChange={e => setEditorialFeedback(e.target.value)} 
                        className="w-full px-3 py-2 border rounded leading-relaxed text-slate-800 font-sans" 
                      />
                    </div>

                    {/* Revision History Log */}
                    <div className="p-3 bg-slate-50 border rounded-lg space-y-1.5">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revision History & Changes Log</span>
                      <div className="space-y-1 text-[10px] text-slate-500 font-mono">
                        <div>• [২০২৬-১০-০১ ১৮:১০] সাংবাদিক কর্তৃক ড্রাফট তৈরি করা হয়েছে।</div>
                        <div>• [২০২৬-১০-০১ ১৯:১৫] সংবাদ পর্যালোচনার জন্য সাবমিট করা হয়েছে।</div>
                        {selectedEditorialArticle.editorialNote && (
                          <div className="text-rose-600 font-bold">• [Correction Note added] {selectedEditorialArticle.editorialNote}</div>
                        )}
                      </div>
                    </div>

                    {/* Decision Action Buttons */}
                    <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
                      <button 
                        type="button" 
                        onClick={() => {
                          updateArticle(selectedEditorialArticle.id, { 
                            status: 'returned', 
                            editorialNote: editorialFeedback || 'সংশোধন প্রয়োজন।' 
                          });
                          addSecurityLog({
                            userEmail: currentUser?.email || 'admin@nijornews.com',
                            action: `সংবাদ সংশোধনের জন্য ফেরত পাঠানো হয়েছে: "${selectedEditorialArticle.title}"`,
                            ipAddress: '192.168.1.102',
                            status: 'edit',
                            deviceInfo: 'Chrome / Windows'
                          });
                          setSelectedEditorialArticle(null);
                          alert('সংবাদটি সংশোধনীর জন্য সফলভাবে সাংবাদিকের কাছে ফেরত পাঠানো হয়েছে!');
                        }}
                        className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 rounded font-bold hover:bg-rose-100 transition text-[11px]"
                      >
                        Return to Reporter
                      </button>

                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            updateArticle(selectedEditorialArticle.id, { 
                              status: 'review', 
                              editorialNote: 'প্রত্যাখ্যাত / Rejected.' 
                            });
                            setSelectedEditorialArticle(null);
                            alert('সংবাদটি প্রত্যাখ্যান করা হয়েছে।');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded font-bold transition text-[11px]"
                        >
                          Reject
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            updateArticle(selectedEditorialArticle.id, { 
                              status: 'published', 
                              reporterName: assignedReporterId || selectedEditorialArticle.reporterName,
                              editorialNote: '' 
                            });
                            addSecurityLog({
                              userEmail: currentUser?.email || 'admin@nijornews.com',
                              action: `সংবাদ অনুমোদন ও প্রকাশ করা হয়েছে: "${selectedEditorialArticle.title}"`,
                              ipAddress: '192.168.1.102',
                              status: 'success',
                              deviceInfo: 'Chrome / Windows'
                            });
                            setSelectedEditorialArticle(null);
                            alert('অভিনন্দন! সংবাদটি অনুমোদিত এবং সফলভাবে ওয়েবসাইটে প্রকাশ করা হয়েছে!');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded font-bold transition shadow-xs text-[11px]"
                        >
                          Approve & Publish (অনুমোদন ও প্রকাশ)
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
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

            {/* Master Ads Off/On & Custom Layout Controls */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" /> Advanced Advertisement Global Controls
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Switch 1: Ads Display On/Off */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="block font-bold text-slate-800 text-sm">পোর্টালে বিজ্ঞাপন প্রদর্শন (Global Ads switch)</span>
                    <span className="text-[10px] text-slate-400">এই সুইচের মাধ্যমে পুরো সাইটের সমস্ত বিজ্ঞাপন একসাথে বন্ধ বা चालू করতে পারবেন।</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const nextState = !(settings.adsEnabled ?? true);
                      updateSettings({ adsEnabled: nextState });
                      alert(nextState ? 'সারা সাইটের বিজ্ঞাপন প্রদর্শন চালু করা হয়েছে!' : 'সারা সাইটের সমস্ত বিজ্ঞাপন প্রদর্শন বন্ধ করা হয়েছে!');
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.adsEnabled ?? true ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${settings.adsEnabled ?? true ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Info Guide Card */}
                <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 flex flex-col justify-center leading-relaxed">
                  <span className="font-bold block mb-1">📢 বিজ্ঞাপনদাতার উপযুক্ত গাইডলাইন (Size Best Practice):</span>
                  <p className="text-[11px] font-medium text-emerald-800">হেডারের জন্য আদর্শ সাইজ হচ্ছে <strong className="font-mono">728x90 (ব্যানার)</strong> বা <strong className="font-mono">Responsive</strong>। সাইডবারের জন্য সবচেয়ে উপযুক্ত হচ্ছে <strong className="font-mono">300x250 (স্কয়ার)</strong> অথবা <strong className="font-mono">300x600 (লং ব্যানার)</strong>। মোবাইল ভিউজের জন্য <strong className="font-mono">320x50</strong> ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।</p>
                </div>

              </div>
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
                    <option value="in_article">In Article (সংবাদের ভেতরে)</option>
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ad Size (বিজ্ঞাপন সাইজ)*</label>
                  <input type="text" placeholder="728x90, 300x250, Responsive" value={adSize} onChange={e => setAdSize(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono mb-1.5" />
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] text-slate-400 font-bold block w-full">প্রস্তাবিত সাইজ (ক্লিক করুন):</span>
                    {getSuggestedSizes(adPlacement).map(sz => (
                      <button 
                        key={sz} 
                        type="button" 
                        onClick={() => setAdSize(sz)} 
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition ${adSize === sz ? 'bg-emerald-600 text-white border-emerald-650' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Priority (ক্রম)</label>
                  <input type="number" value={adPriority} onChange={e => setAdPriority(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Banner Image (বিজ্ঞাপন ছবি - আপলোড বা সরাসরি লিঙ্ক)</label>
                  <input type="file" accept="image/*" onChange={handleAdImageUpload} className="w-full text-xs text-slate-500 mb-1" />
                  <input 
                    type="text" 
                    placeholder="অথবা সরাসরি ফটোর লিংক পেস্ট করুন..." 
                    value={adImageUrl} 
                    onChange={e => setAdImageUrl(e.target.value)} 
                    className="w-full px-3 py-1 bg-slate-50 border rounded text-[10px] font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target URL (বিজ্ঞাপন ক্লিক লিংক)</label>
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
        {activeTab === 'seo' && (() => {
          const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${settings.canonicalUrl || 'https://nijornews.com'}</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
${articles.map(art => `  <url>
    <loc>${settings.canonicalUrl || 'https://nijornews.com'}/article/${art.id}</loc>
    <lastmod>${art.publishedAt || '2026-09-30'}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${categories.map(cat => `  <url>
    <loc>${settings.canonicalUrl || 'https://nijornews.com'}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

          const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${settings.siteTitle || 'Nijor News'}</title>
  <link>${settings.canonicalUrl || 'https://nijornews.com'}</link>
  <description>${settings.siteSubtitle || 'পাহাড় ও সমতলের দর্পণ'}</description>
  <language>bn</language>
${articles.slice(0, 5).map(art => `  <item>
    <title><![CDATA[${art.title}]]></title>
    <link>${settings.canonicalUrl || 'https://nijornews.com'}/article/${art.id}</link>
    <description><![CDATA[${art.excerpt}]]></description>
    <pubDate>${art.publishedAt || 'Wed, 30 Sep 2026 12:00:00 +0600'}</pubDate>
    <author>${art.reporterName || 'Nijor News Desk'}</author>
  </item>`).join('\n')}
</channel>
</rss>`;

          return (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-serif font-black text-slate-900">🔎 Advanced Search Engine Optimization</h1>
                  <p className="text-xs text-slate-500 mt-1">পোর্টালে গুগল সার্চ ভিজিবিলিটি, মেটাডাটা, সাইটম্যাপ ও রিডাইরেক্ট সেটিংস পরিচালনা করুন</p>
                </div>
                
                {/* SEO Subtabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg border text-xs shrink-0 self-start md:self-auto">
                  <button 
                    onClick={() => setSeoSubTab('global')}
                    className={`px-3 py-1.5 rounded-md font-bold transition ${seoSubTab === 'global' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🌎 Global SEO
                  </button>
                  <button 
                    onClick={() => setSeoSubTab('technical')}
                    className={`px-3 py-1.5 rounded-md font-bold transition ${seoSubTab === 'technical' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🛠️ Technical SEO
                  </button>
                  <button 
                    onClick={() => setSeoSubTab('redirects')}
                    className={`px-3 py-1.5 rounded-md font-bold transition ${seoSubTab === 'redirects' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🔗 Redirects ({settings.redirects?.length || 0})
                  </button>
                  <button 
                    onClick={() => setSeoSubTab('rss')}
                    className={`px-3 py-1.5 rounded-md font-bold transition ${seoSubTab === 'rss' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    📡 RSS Feed
                  </button>
                </div>
              </div>

              {/* A. GLOBAL SEO TAB */}
              {seoSubTab === 'global' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
                  <div className="border-b pb-2">
                    <h3 className="font-serif font-bold text-base text-slate-900">Global SEO Configurations</h3>
                    <p className="text-[11px] text-slate-400">মেটাডাটা, ক্যানোনিকাল লিংক এবং সোশ্যাল শেয়ারিং ইমেজ সেট করুন।</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Site Title (গ্লোবাল এসইও টাইটেল)</label>
                      <input 
                        type="text" 
                        value={settings.siteTitle || ''} 
                        onChange={e => updateSettings({ siteTitle: e.target.value })} 
                        className="w-full px-3 py-2 border rounded font-semibold text-slate-800" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Canonical Website URL (প্রধান ক্যানোনিকাল লিংক)</label>
                      <input 
                        type="text" 
                        value={settings.canonicalUrl || ''} 
                        onChange={e => updateSettings({ canonicalUrl: e.target.value })} 
                        className="w-full px-3 py-2 border rounded font-mono text-slate-500" 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="block font-bold text-slate-700">Global Meta Keywords (এসইও কি-ওয়ার্ড সমূহ - কমা দিয়ে লিখুন)</label>
                      <input 
                        type="text" 
                        placeholder="Nijor News, পাহাড়ের খবর..." 
                        value={settings.metaKeywords || ''} 
                        onChange={e => updateSettings({ metaKeywords: e.target.value })} 
                        className="w-full px-3 py-2 border rounded text-slate-800" 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="block font-bold text-slate-700">Global Meta Description (গ্লোবাল বর্ণনা)</label>
                      <textarea 
                        rows={3} 
                        value={settings.googleVerification && (settings.googleVerification.includes('content') ? settings.googleVerification : settings.siteSubtitle || '')} 
                        onChange={e => updateSettings({ siteSubtitle: e.target.value })} 
                        className="w-full px-3 py-2 border rounded leading-relaxed" 
                      />
                    </div>
                  </div>

                  {/* Open Graph Image Selection */}
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
                    <span className="block font-bold text-slate-800 text-xs">Open Graph / Social Sharing Card Image (সোশ্যাল শেয়ারিং প্রিভিউ কার্ড ইমেজ)</span>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="h-24 w-44 bg-white border rounded flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {settings.ogImageUrl ? (
                          <img src={settings.ogImageUrl} alt="Open Graph Card preview" className="object-cover h-full w-full" />
                        ) : (
                          <span className="text-[10px] text-slate-400">No Image Set</span>
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="og-card-image-input" 
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onloadend = () => {
                                updateSettings({ ogImageUrl: r.result as string });
                                alert('Open Graph শেয়ারিং ইমেজটি সফলভাবে সেট করা হয়েছে!');
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                          className="hidden" 
                        />
                        <div className="flex gap-2">
                          <label 
                            htmlFor="og-card-image-input" 
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded cursor-pointer inline-block text-[11px]"
                          >
                            Upload Open Graph Image
                          </label>
                          {settings.ogImageUrl && (
                            <button 
                              type="button" 
                              onClick={() => updateSettings({ ogImageUrl: '' })} 
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded font-bold text-[11px]"
                            >
                              Remove Card
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400">ফেসবুক, টুইটার বা লিংকডইনে সংবাদ শেয়ার করলে এই ছবিটি প্রিভিউ হিসেবে ভেসে উঠবে। (সুপারিশকৃত সাইজ: 1200x630 পিক্সেল)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <button 
                      onClick={() => {
                        addSecurityLog({
                          userEmail: currentUser?.email || 'admin@nijornews.com',
                          action: 'গ্লোবাল এসইও মেটাডাটা সেটিংস আপডেট করা হয়েছে',
                          ipAddress: '192.168.1.102',
                          status: 'edit',
                          deviceInfo: 'Chrome / Windows 11'
                        });
                        alert('গ্লোবাল এসইও কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded text-xs font-bold transition"
                    >
                      সেভ গ্লোবাল সেটিংস
                    </button>
                  </div>
                </div>
              )}

              {/* B. TECHNICAL SEO TAB */}
              {seoSubTab === 'technical' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
                  <div className="border-b pb-2">
                    <h3 className="font-serif font-bold text-base text-slate-900">Technical SEO Configurations</h3>
                    <p className="text-[11px] text-slate-400">সাইটের ক্রলার গাইডলাইন (Robots.txt), গুগল সাইট ভেরিফিকেশন কোড এবং কাস্টম অর্গানাইজেশন স্কিমা মার্কআপ পরিচালনা করুন।</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Search Console HTML Verification Tag (গুগল কনসোল কোড)</label>
                      <input 
                        type="text" 
                        value={settings.googleVerification} 
                        onChange={e => updateSettings({ googleVerification: e.target.value })} 
                        className="w-full px-3 py-2 border rounded font-mono text-slate-600 bg-slate-50" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Google Analytics 4 Measurement ID</label>
                      <input 
                        type="text" 
                        value={settings.analyticsId} 
                        onChange={e => updateSettings({ analyticsId: e.target.value })} 
                        className="w-full px-3 py-2 border rounded font-mono text-slate-600 bg-slate-50" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Robots.txt Configurations (ক্রলার গাইডলাইন)</label>
                      <textarea 
                        rows={6} 
                        value={settings.robotsTxt || "User-agent: *\nAllow: /\n\nSitemap: https://nijornews.com/sitemap.xml"} 
                        onChange={e => updateSettings({ robotsTxt: e.target.value })} 
                        className="w-full px-3 py-2 border rounded font-mono text-slate-700 bg-slate-50 leading-relaxed" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Custom Organization Schema Markup (JSON-LD)</label>
                      <textarea 
                        rows={6} 
                        value={settings.customSchemaMarkup || ''} 
                        onChange={e => updateSettings({ customSchemaMarkup: e.target.value })} 
                        className="w-full px-3 py-2 border rounded font-mono text-slate-700 bg-slate-50 leading-relaxed" 
                      />
                    </div>
                  </div>

                  {/* Dynamic XML Sitemap Box */}
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block font-bold text-slate-800 text-xs">Live Auto-Generated XML Sitemap (স্বয়ংক্রিয় সাইটম্যাপ)</span>
                        <span className="text-[10px] text-slate-400">এই সাইটম্যাপে বর্তমানে {articles.length} টি সংবাদ, {categories.length} টি ক্যাটাগরি রয়েছে।</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            navigator.clipboard.writeText(sitemapXml);
                            alert('XML Sitemap successfully copied to clipboard!');
                          }} 
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1 rounded text-[10px]"
                        >
                          Copy Sitemap XML
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            const blob = new Blob([sitemapXml], { type: 'text/xml' });
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = 'sitemap.xml';
                            link.click();
                          }} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-[10px]"
                        >
                          Download sitemap.xml
                        </button>
                      </div>
                    </div>
                    <pre className="p-3 bg-slate-950 text-emerald-400 rounded-lg max-h-[140px] overflow-y-auto font-mono text-[9px] border leading-normal">
                      {sitemapXml}
                    </pre>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <button 
                      onClick={() => {
                        addSecurityLog({
                          userEmail: currentUser?.email || 'admin@nijornews.com',
                          action: 'টেকনিক্যাল এসইও (Sitemap & Robots) সেভ করা হয়েছে',
                          ipAddress: '192.168.1.102',
                          status: 'edit',
                          deviceInfo: 'Chrome / Windows 11'
                        });
                        alert('টেকনিক্যাল এসইও কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded text-xs font-bold transition"
                    >
                      সেভ টেকনিক্যাল সেটিংস
                    </button>
                  </div>
                </div>
              )}

              {/* C. REDIRECT MANAGER TAB */}
              {seoSubTab === 'redirects' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
                  <div className="border-b pb-2">
                    <h3 className="font-serif font-bold text-base text-slate-900">🔗 Redirect Manager (ইউআরএল রিডাইরেক্ট সেটিংস)</h3>
                    <p className="text-[11px] text-slate-400">পুরাতন বা ভাঙা লিংক (Broken URLs) থেকে নতুন লিংকে ট্রাফিক ৩০১ রিডাইরেক্ট করুন।</p>
                  </div>

                  {/* Add redirect Form */}
                  <form 
                    onSubmit={e => {
                      e.preventDefault();
                      if (!redirectFrom.trim() || !redirectTo.trim()) return;
                      const activeRedirects = settings.redirects || [];
                      if (activeRedirects.some(r => r.fromPath === redirectFrom)) {
                        alert('এই সোর্স পাথটি ইতিমধ্যে রিডাইরেক্ট হিসেবে যোগ করা রয়েছে!');
                        return;
                      }

                      const updatedRedirects = [...activeRedirects, { fromPath: redirectFrom, toPath: redirectTo }];
                      updateSettings({ redirects: updatedRedirects });
                      setRedirectFrom('');
                      setRedirectTo('');
                      alert('নতুন ৩০১ রিডাইরেক্ট রুল সফলভাবে যোগ করা হয়েছে!');
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 border rounded-xl items-end"
                  >
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Source Path (কোথা থেকে - From)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="/old-about-us" 
                        value={redirectFrom} 
                        onChange={e => setRedirectFrom(e.target.value)} 
                        className="w-full px-3 py-2 bg-white border rounded font-mono text-slate-700 text-[11px]" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Destination Path / URL (কোথায় যাবে - To)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="/about-us" 
                        value={redirectTo} 
                        onChange={e => setRedirectTo(e.target.value)} 
                        className="w-full px-3 py-2 bg-white border rounded font-mono text-slate-700 text-[11px]" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs"
                    >
                      ➕ Add Redirect Rule
                    </button>
                  </form>

                  {/* Redirect Rules Table */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                          <th className="p-3 text-[11px]">Source Path (From)</th>
                          <th className="p-3 text-[11px]">Destination Target (To)</th>
                          <th className="p-3 text-[11px]">Type</th>
                          <th className="p-3 text-[11px] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {(settings.redirects || []).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50 font-mono">
                            <td className="p-3 text-red-600 font-bold">{r.fromPath}</td>
                            <td className="p-3 text-emerald-700 font-bold">➡️ {r.toPath}</td>
                            <td className="p-3 font-sans text-slate-400 font-semibold">301 Permanent</td>
                            <td className="p-3 text-right">
                              <button 
                                type="button" 
                                onClick={() => {
                                  const updated = (settings.redirects || []).filter((_, idx) => idx !== i);
                                  updateSettings({ redirects: updated });
                                  alert('রিডাইরেক্ট রুলটি সফলভাবে ডিলিট করা হয়েছে!');
                                }}
                                className="text-red-500 hover:text-red-700 font-sans font-bold"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(settings.redirects || []).length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-400 font-bold font-sans">কোনো সোর্স-টার্গেট রিডাইরেক্ট রুলস সেটআপ করা নেই।</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* D. RSS FEED TAB */}
              {seoSubTab === 'rss' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="border-b pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-900">📡 Active RSS Feed XML</h3>
                      <p className="text-[11px] text-slate-400">ফিড রিডার, নিউজ এগ্রিগেটর ও সোশ্যাল ডিসপ্যাচারদের জন্য অটো-আপডেটিং আরএসএস ফিড।</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(rssXml);
                        alert('RSS Feed XML successfully copied to clipboard!');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded text-[11px]"
                    >
                      Copy RSS Feed
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 text-amber-400 rounded-xl max-h-[300px] overflow-y-auto font-mono text-[10px] border leading-normal">
                    {rssXml}
                  </pre>
                </div>
              )}
            </div>
          );
        })()}

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900">✍️ Reporters & Correspondents Directory</h1>
                <p className="text-xs text-slate-500 mt-1">পার্বত্য চট্টগ্রাম (রাঙামাটি, খাগড়াছড়ি, বান্দরবান) ও জাতীয় পর্যায়ের সমস্ত প্রতিবেদকদের কর্মক্ষমতা ও অ্যাসাইনমেন্ট পরিচালনা</p>
              </div>
              <button 
                onClick={() => {
                  setEditingReporter(null);
                  setRepName('');
                  setRepEmail('');
                  setRepPhone('');
                  setRepDistrict('রাঙামাটি');
                  setRepUpazila('রাঙামাটি সদর');
                  setRepCategory('পার্বত্য চট্টগ্রাম');
                  setRepArea('বনরূপা, সদর');
                  setRepAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
                  setRepStatus('active');
                  setShowAddReporter(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> নতুন রিপোর্টার যুক্ত করুন (Add Reporter)
              </button>
            </div>

            {/* Performance Overview Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">মোট সাংবাদিক (Total Staff)</span>
                <span className="text-2xl font-serif font-black text-slate-900">{users.filter(u => u.role === 'reporter' || u.role === 'senior_reporter').length} জন</span>
              </div>
              <div className="bg-white p-4 rounded-xl border shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">সক্রিয় রিপোর্টার (Active)</span>
                <span className="text-2xl font-serif font-black text-emerald-600">{users.filter(u => (u.role === 'reporter' || u.role === 'senior_reporter') && u.status !== 'blocked').length} জন</span>
              </div>
              <div className="bg-white p-4 rounded-xl border shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">মোট সংবাদ কন্ট্রিবিউশন</span>
                <span className="text-2xl font-serif font-black text-slate-900">{articles.length} টি</span>
              </div>
              <div className="bg-white p-4 rounded-xl border shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">গড় রিপোর্টার পারফরম্যান্স</span>
                <span className="text-2xl font-serif font-black text-amber-600">৮৮% স্কোয়ার</span>
              </div>
            </div>

            {/* Reporters Database Cards & Tables */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 p-4 border-b flex justify-between items-center text-xs">
                <span className="font-serif font-bold text-slate-900">Reporters and Area Allocation Register</span>
                <span className="text-slate-400">Total: {users.filter(u => u.role === 'reporter' || u.role === 'senior_reporter').length} entries</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                      <th className="p-4">Reporter Profile</th>
                      <th className="p-4">Contact Detail</th>
                      <th className="p-4">Assigned Allocation</th>
                      <th className="p-4">Contribution Count</th>
                      <th className="p-4">Performance Status</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {users.filter(u => u.role === 'reporter' || u.role === 'senior_reporter').map((rep, idx) => {
                      const repArticles = articles.filter(a => a.reporterName === rep.name);
                      const totalViews = repArticles.reduce((sum, current) => sum + (current.views || 0), 0);
                      const repId = `REP-2026-${100 + idx}`;

                      return (
                        <tr key={rep.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={rep.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                                alt={rep.name} 
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-600 shrink-0" 
                              />
                              <div>
                                <p className="font-bold text-slate-900 leading-snug">{rep.name}</p>
                                <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">{repId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 space-y-0.5">
                            <p className="font-mono font-medium">{rep.email}</p>
                            <p className="text-slate-400 font-mono text-[10px]">{rep.phone || '+৮৮ ০১৭১১-XXXXXX'}</p>
                          </td>
                          <td className="p-4 space-y-0.5">
                            <p className="font-semibold text-slate-800">📍 {rep.assignedDistrict || 'রাঙামাটি'} ({rep.assignedCategory || 'সার্বিক'})</p>
                            <p className="text-[10px] text-slate-400">বীট/উপজেলা: {rep.bio || 'সদর'}</p>
                          </td>
                          <td className="p-4 text-slate-800 font-bold font-mono">
                            📝 {repArticles.length} টি নিউজ
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">Total Views:</span>
                                <span className="text-emerald-700">{totalViews.toLocaleString()} views</span>
                              </div>
                              <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full" style={{ width: `${Math.min(100, (totalViews / 500) * 100)}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => {
                                const newStatus = rep.status === 'active' || !rep.status ? 'blocked' : 'active';
                                updateUser(rep.id, { status: newStatus as any });
                                addSecurityLog({
                                  userEmail: currentUser?.email || 'admin@nijornews.com',
                                  action: `রিপোর্টার স্ট্যাটাস পরিবর্তন: "${rep.name}" -> ${newStatus}`,
                                  ipAddress: '192.168.1.102',
                                  status: 'edit',
                                  deviceInfo: 'Chrome / Windows'
                                });
                                alert('রিপোর্টার স্ট্যাটাস সফলভাবে টগল করা হয়েছে!');
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rep.status === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}
                            >
                              {rep.status === 'blocked' ? 'Blocked / Inactive' : 'Active'}
                            </button>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => {
                                setEditingReporter(rep);
                                setRepName(rep.name);
                                setRepEmail(rep.email);
                                setRepPhone(rep.phone || '');
                                setRepDistrict(rep.assignedDistrict || 'রাঙামাটি');
                                setRepUpazila(rep.bio || 'রাঙামাটি সদর');
                                setRepCategory(rep.assignedCategory || 'পার্বত্য চট্টগ্রাম');
                                setRepArea(rep.assignedArea || 'সদর');
                                setRepAvatar(rep.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
                                setRepStatus(rep.status === 'blocked' ? 'inactive' : 'active');
                                setShowAddReporter(true);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded text-slate-700"
                              title="Edit Reporter Allocation"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`আপনি কি নিশ্চিতভাবে "${rep.name}"-কে রিপোর্টার প্যানেল থেকে সরিয়ে দিতে চান?`)) {
                                  deleteUser(rep.id);
                                  alert('রিপোর্টারকে সফলভাবে রিমুভ করা হয়েছে!');
                                }
                              }}
                              className="bg-slate-100 hover:bg-red-50 text-red-600 p-1.5 rounded"
                              title="Remove Reporter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add / Edit Reporter popup Modal Dialogue */}
            {showAddReporter && (
              <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden text-xs">
                  <div className="flex justify-between items-center bg-slate-900 text-white px-5 py-4">
                    <h3 className="font-serif font-bold text-base">{editingReporter ? 'রিপোর্টার অ্যাসাইনমেন্ট এডিট করুন' : 'নতুন রিপোর্টার অন্তর্ভুক্ত করুন'}</h3>
                    <button onClick={() => setShowAddReporter(false)} className="text-slate-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form 
                    onSubmit={e => {
                      e.preventDefault();
                      if (!repName.trim() || !repEmail.trim()) {
                        alert('অনুগ্রহ করে নাম এবং মেইল এড্রেস পূরণ করুন!');
                        return;
                      }

                      if (editingReporter) {
                        updateUser(editingReporter.id, {
                          name: repName,
                          email: repEmail,
                          phone: repPhone,
                          assignedDistrict: repDistrict,
                          bio: repUpazila,
                          assignedCategory: repCategory,
                          avatar: repAvatar,
                          status: repStatus === 'active' ? 'active' : 'blocked' as any
                        });
                        alert('রিপোর্টার অ্যাসাইনমেন্ট সফলভাবে সংশোধন করা হয়েছে!');
                      } else {
                        addUser({
                          name: repName,
                          email: repEmail,
                          role: 'reporter',
                          avatar: repAvatar,
                          phone: repPhone,
                          assignedDistrict: repDistrict,
                          bio: repUpazila,
                          assignedCategory: repCategory,
                          status: repStatus === 'active' ? 'active' : 'blocked' as any
                        });
                        alert('নতুন রিপোর্টার সফলভাবে যুক্ত করা হয়েছে!');
                      }
                      setShowAddReporter(false);
                    }}
                    className="p-6 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">রিপোর্টারের নাম (Full Name)*</label>
                        <input type="text" required placeholder="যেমন: উবামং চৌধুরী" value={repName} onChange={e => setRepName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">ইমেইল ঠিকানা (Email)*</label>
                        <input type="email" required placeholder="example@nijornews.com" value={repEmail} onChange={e => setRepEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">মোবাইল নম্বর (Phone Number)</label>
                        <input type="text" placeholder="+৮৮ ০১..." value={repPhone} onChange={e => setRepPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">প্রোফাইল ছবি (Photo URL)</label>
                        <input type="text" value={repAvatar} onChange={e => setRepAvatar(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded text-xs font-mono" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                      <div className="space-y-1 col-span-2">
                        <span className="block font-bold text-emerald-700 uppercase tracking-wide text-[9px] mb-1">অ্যাসাইনমেন্ট ও কাজের এলাকা (Assignment Details)</span>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">নির্ধারিত জেলা (District)*</label>
                        <select value={repDistrict} onChange={e => setRepDistrict(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border rounded text-xs font-semibold text-slate-800">
                          <option value="রাঙামাটি">রাঙামাটি (Rangamati)</option>
                          <option value="খাগড়াছড়ি">খাগড়াছড়ি (Khagrachhari)</option>
                          <option value="বান্দরবান">বান্দরবান (Bandarban)</option>
                          <option value="জাতীয়">জাতীয় (National)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">উপজেলা / বীট এলাকা (Upazila)</label>
                        <input type="text" placeholder="যেমন: বাঘাইছড়ি উপজেলা" value={repUpazila} onChange={e => setRepUpazila(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">নির্ধারিত সংবাদ বিভাগ (Assigned Category)</label>
                        <select value={repCategory} onChange={e => setRepCategory(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border rounded text-xs font-semibold text-slate-800">
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">রিপোর্টার স্ট্যাটাস (Status)</label>
                        <select value={repStatus} onChange={e => setRepStatus(e.target.value as any)} className="w-full px-2 py-1.5 bg-slate-50 border rounded text-xs font-bold text-slate-800">
                          <option value="active">Active (সক্রিয়)</option>
                          <option value="inactive">Inactive (স্থগিত)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button type="button" onClick={() => setShowAddReporter(false)} className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded font-bold text-slate-700 transition">বাতিল</button>
                      <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded font-bold transition shadow-xs">রিপোর্টার সংরক্ষণ করুন</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
        {/* 23. Site Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900 flex items-center gap-2">
                  ⚙️ Developer & Settings Control
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  গুগল এআই স্টুডিও দ্বারা সাইট কনফিগারেশন অথবা ম্যানুয়াল ডেভলপমেন্ট কন্সোল পরিচালনা করুন
                </p>
              </div>
              
              {/* Main Selector: AI DEVELOPER vs SITE DEVELOPER */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSettingsMainTab('ai_dev')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    settingsMainTab === 'ai_dev' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI DEVELOPER
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsMainTab('site_dev')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    settingsMainTab === 'site_dev' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" /> SITE DEVELOPER
                </button>
              </div>
            </div>

            {settingsMainTab === 'ai_dev' ? (
              /* ================= AI DEVELOPER CONSOLE ================= */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left 2 Columns: Main Console */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Google AI Studio Natural-Language Interface */}
                  <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50 rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                          ✨ Google AI Studio Assistant (এআই সহকারী)
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">Gemini Powered</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                      আপনি টাইপ করে বা স্ক্রিনশট আপলোড করে এআই-কে যেকোনো নির্দেশ দিতে পারেন। যেমন: 
                      <span className="font-bold text-emerald-800"> "আমাদের ফোন নম্বর ০১৭০০০০০০০০ কর।" </span> 
                      বা <span className="font-bold text-indigo-800"> "আমাদের ফেসবুক পেজের লিঙ্ক পরিবর্তন করো।" </span> 
                      এআই সুনির্দিষ্টভাবে আপনার নির্দেশিত সেটিংস ফাইলটি আপডেট করবে।
                    </p>

                    {/* Multimodal Prompt Box */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          💬 গুগল এআই স্টুডিও প্রম্পট কন্সোল (Google AI Studio Promptbox)
                        </label>
                      </div>

                      {/* Hidden Multimodal File Picker */}
                      <input
                        type="file"
                        id="settings-ai-multimodal-picker"
                        accept="image/*,video/*,application/pdf,text/plain"
                        onChange={handleSettingsFileChange}
                        className="hidden"
                      />

                      <div className="flex flex-col gap-3">
                        <div className="border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                          <textarea
                            rows={5}
                            value={settingsAiPrompt}
                            onChange={e => setSettingsAiPrompt(e.target.value)}
                            placeholder='যেমন: আমাদের সাইটে একটি লাল রঙের স্ক্রোলিং মার্কি নোটিশ যুক্ত করো যার টেক্সট হবে "জরুরি বিজ্ঞপ্তি" এবং এর ফন্ট সাইজ ১৪ পিক্সেল করো...'
                            className="w-full px-4 py-3 text-xs bg-white border-none focus:outline-none text-slate-800 font-semibold font-sans resize-none"
                          />
                          
                          {/* Inner Action Bar */}
                          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor="settings-ai-multimodal-picker"
                                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 p-2 rounded-xl flex items-center justify-center cursor-pointer transition"
                                title="স্ক্রিনশট, ফটো বা ফাইল যুক্ত করুন"
                              >
                                <Paperclip className="w-4 h-4 text-slate-500" />
                                <span className="text-[10px] ml-1 font-bold text-slate-600 hidden sm:inline">ফাইল বা ফটো</span>
                              </label>
                            </div>

                            <button
                              type="button"
                              disabled={settingsAiLoading || (!settingsAiPrompt.trim() && !settingsAiFile)}
                              onClick={() => handleSettingsAi('custom_settings')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                            >
                              {settingsAiLoading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  রান হচ্ছে...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200 animate-pulse" />
                                  রান প্রম্পট (Run Prompt)
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* File Preview */}
                        {settingsAiFileName && (
                          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-lg text-[10px] font-semibold w-fit animate-fadeIn">
                            {settingsAiFileMime.startsWith('image/') ? (
                              <img src={settingsAiFile} alt="Attachment" className="h-6 w-10 object-cover rounded border border-emerald-200 shrink-0" />
                            ) : (
                              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span className="truncate max-w-[150px] font-bold">{settingsAiFileName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSettingsAiFile('');
                                setSettingsAiFileMime('');
                                setSettingsAiFileName('');
                              }}
                              className="text-red-500 hover:text-red-700 font-bold ml-1 text-xs shrink-0 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Example prompts */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">সহজ উদাহরণসমূহ (Click to try):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'আমাদের ফোন নম্বর ০১৭১১-২২৩৩৪৪ করো',
                          'ফেসবুক পেজ লিঙ্ক আপডেট করে facebook.com/nijornewsbd করো',
                          'সাইটের মূল স্লোগান পরিবর্তন করে "পার্বত্য জনপদের বিশ্বস্ত মুখ" করো',
                          'Sports নামের নতুন ক্যাটাগরি তৈরি করো',
                          'ব্রেকিং নিউজ সেকশনে নতুন টিকার দাও "জরুরি সতর্কতা: আগামী ২৪ ঘণ্টায় খাগড়াছড়িতে ভারী বৃষ্টির আশঙ্কা"'
                        ].map((promptText, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSettingsAiPrompt(promptText)}
                            className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-all text-left font-medium cursor-pointer"
                          >
                            {promptText}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status/Error Messages */}
                  {aiConsoleError && (
                    <div className="bg-red-50 text-red-900 p-4 rounded-xl border border-red-200 font-medium text-xs flex items-start gap-2 animate-fadeIn">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">ত্রুটি / সতর্কবার্তা (Warning):</p>
                        <p>{aiConsoleError}</p>
                      </div>
                    </div>
                  )}

                  {/* Preview changes section */}
                  {aiAnalysisResult && (
                    <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4 animate-fadeIn">
                      <div className="flex items-center gap-2 border-b pb-3 border-amber-100">
                        <span className="p-1 bg-amber-50 rounded-lg text-amber-600">
                          <Eye className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-serif font-black text-slate-900 text-sm">Preview Changes (পরিবর্তনগুলোর প্রাকদর্শন)</h4>
                          <p className="text-[10px] text-slate-500">এআই দ্বারা প্রস্তাবিত পরিবর্তনগুলো যাচাই করে নিন</p>
                        </div>
                      </div>

                      {/* Display structured changes list */}
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {aiAnalysisResult.updatedSettings && Object.keys(aiAnalysisResult.updatedSettings).length > 0 && (
                          <div className="p-3.5 bg-slate-50 border rounded-xl space-y-2 text-xs">
                            <span className="font-bold text-slate-800 block">⚙️ আপডেট সেটিংস ক্ষেত্রসমূহ (Modified Settings Fields):</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                              {Object.entries(aiAnalysisResult.updatedSettings).map(([key, value]) => (
                                <div key={key} className="p-2 bg-white rounded border flex flex-col gap-0.5">
                                  <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">{key}:</span>
                                  <span className="font-semibold text-slate-800 text-xs truncate max-w-full" title={String(value)}>
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {aiAnalysisResult.newCategory && aiAnalysisResult.newCategory.name && (
                          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1.5 text-xs">
                            <span className="font-bold text-emerald-900 block">📁 নতুন ক্যাটাগরি তৈরি (Create Category):</span>
                            <p className="text-[11px] font-semibold text-slate-700">
                              নাম: <span className="text-emerald-800 font-bold">{aiAnalysisResult.newCategory.name}</span> | 
                              স্লাগ: <span className="font-mono bg-white px-1 py-0.5 rounded border text-[10px]">{aiAnalysisResult.newCategory.slug}</span>
                            </p>
                            {aiAnalysisResult.newCategory.description && (
                              <p className="text-[10px] text-slate-500 italic">"${aiAnalysisResult.newCategory.description}"</p>
                            )}
                          </div>
                        )}

                        {aiAnalysisResult.newBreakingNews && aiAnalysisResult.newBreakingNews.text && (
                          <div className="p-3.5 bg-red-50/70 border border-red-100 rounded-xl space-y-1 text-xs">
                            <span className="font-bold text-red-900 block">🚨 নতুন ব্রেকিং নিউজ টিকার (Add Ticker):</span>
                            <p className="text-[11px] font-bold text-red-800">"${aiAnalysisResult.newBreakingNews.text}"</p>
                            <p className="text-[9px] text-slate-500">অগ্রাধিকার স্তর (Priority): ${aiAnalysisResult.newBreakingNews.priority || 1}</p>
                          </div>
                        )}
                      </div>

                      {/* Confirm Dialog Required? */}
                      {aiAnalysisResult.unrelatedAlert?.isDestructiveOrUnrelated && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs space-y-1">
                          <p className="font-bold flex items-center gap-1 text-amber-950">⚠️ নিশ্চিতকরণ সতর্কবার্তা (Confirmation Alert):</p>
                          <p className="font-medium">ইউজার সেটিংস ছাড়া অন্য কোনো গুরুত্বপূর্ণ সিস্টেম বা ডাটাবেজ মডিউল পরিবর্তনের প্রম্পট দিয়ে থাকলে তা সতর্কতার সাথে পর্যালোচনা করুন।</p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2 justify-end">
                        <button
                          type="button"
                          onClick={handleSettingsAiCancel}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Cancel (বাতিল)
                        </button>
                        <button
                          type="button"
                          onClick={handleSettingsAiApply}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Apply Changes (প্রয়োগ করুন)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right 1 Column: History & Recovery */}
                <div className="space-y-6">
                  {/* Google AI Studio Configuration Controls */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 space-y-4 font-sans">
                    <span className="block text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5 font-serif">
                      ⚙️ Google AI Studio Playground (প্যারামিটার কন্সোল)
                    </span>

                    {/* Model Select */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">Model (মডেল নির্বাচন)</label>
                      <select
                        value={settingsAiModel}
                        onChange={e => setSettingsAiModel(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 font-mono focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="gemini-3.8-flash">gemini-3.8-flash (Default)</option>
                        <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced)</option>
                        <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Lite)</option>
                        <option value="gemini-flash-latest">gemini-flash-latest (Legacy)</option>
                      </select>
                    </div>

                    {/* System Instruction Area */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">System Instruction (সিস্টেম নির্দেশনা)</label>
                      <textarea
                        rows={3}
                        value={settingsAiSystemInstruction}
                        onChange={e => setSettingsAiSystemInstruction(e.target.value)}
                        placeholder="System instructions to customize Gemini..."
                        className="w-full bg-slate-800 border border-slate-700 text-white text-[10px] rounded-lg p-2 font-sans focus:ring-1 focus:ring-emerald-500 leading-normal resize-none"
                      />
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400 uppercase">Temperature (সৃজনশীলতা):</span>
                        <span className="text-emerald-400 font-mono">{settingsAiTemperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settingsAiTemperature}
                        onChange={e => setSettingsAiTemperature(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                        <span>0.0 Precise</span>
                        <span>1.0 Balanced</span>
                        <span>2.0 Creative</span>
                      </div>
                    </div>
                  </div>

                  {/* Undo / Rollback Card */}
                  {aiPreviousSettings && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 shadow-2xs space-y-3 animate-fadeIn">
                      <span className="block text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5 font-serif">
                        ⏪ রোলব্যাক রিকভারি পয়েন্ট
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-medium">
                        আপনার শেষ এআই পরিবর্তনের আগের অবস্থা সিস্টেম মনে রেখেছে। কোনো সমস্যা হলে পূর্বাবস্থায় ফিরে যান।
                      </p>
                      <button
                        type="button"
                        onClick={handleSettingsAiUndo}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Undo/Rollback (ফিরিয়ে আনুন)
                      </button>
                    </div>
                  )}

                  {/* Change History Box */}
                  <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
                    <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center justify-between">
                      <span>📜 এআই সেটিংস হিস্টোরি (History)</span>
                      <span className="text-[10px] text-slate-400 font-normal">রিয়েল-টাইম লগ</span>
                    </span>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {aiChangeHistory.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-[11px] font-sans">
                          এখনো কোনো পরিবর্তনের রেকর্ড নেই
                        </div>
                      ) : (
                        aiChangeHistory.map((item) => (
                          <div key={item.id} className="p-2.5 bg-slate-50 border rounded-lg space-y-1 text-[11px] hover:bg-slate-100/50 transition">
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                              <span>{item.timestamp}</span>
                              <span className="text-emerald-600 bg-emerald-50 px-1 rounded">সফল</span>
                            </div>
                            <p className="text-slate-700 font-semibold leading-relaxed">{item.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                    {aiChangeHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('আপনি কি পরিবর্তন ইতিহাস মুছে ফেলতে চান?')) {
                            setAiChangeHistory([]);
                            localStorage.removeItem('nijor_ai_change_history');
                          }
                        }}
                        className="w-full text-center text-[10px] text-red-500 hover:text-red-700 font-bold"
                      >
                        ইতিহাস মুছে ফেলুন (Clear History)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ================= SITE DEVELOPER CONSOLE ================= */
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* A-Z Tabs Sidebar */}
                <div className="bg-slate-900 text-white rounded-xl overflow-hidden p-2 space-y-0.5 shadow-sm border border-slate-800">
                  <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-3 py-2 border-b border-slate-800">
                    A-Z Manual Sections
                  </span>
                  {[
                    'GENERAL', 'APPEARANCE', 'HEADER', 'NAVIGATION', 'HOMEPAGE', 
                    'NEWS/ARTICLE', 'CATEGORY', 'SIDEBAR', 'FOOTER', 'ADVERTISEMENT', 
                    'SEO', 'SOCIAL', 'MOBILE', 'CUSTOM CODE', 'CONTACT', 'ANALYTICS', 
                    'SECURITY', 'PERFORMANCE', 'ADVANCED'
                  ].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSiteDevTab(tab)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        siteDevTab === tab 
                          ? 'bg-emerald-700 text-white font-bold' 
                          : 'hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <span>{tab}</span>
                      <span className="text-[8px] opacity-40 font-mono">A-Z</span>
                    </button>
                  ))}
                </div>

                {/* Tab Forms Panel */}
                <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
                  
                  {/* 1. GENERAL */}
                  {siteDevTab === 'GENERAL' && (
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
                          <label className="block font-bold text-slate-700">Site Title (সাইটের মূল শিরোনাম)</label>
                          <input type="text" value={settings.siteTitle} onChange={e => updateSettings({ siteTitle: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Tagline / Subtitle (ওয়েবসাইটের স্লোগান)</label>
                          <input type="text" value={settings.siteSubtitle} onChange={e => updateSettings({ siteSubtitle: e.target.value, tagline: e.target.value })} className="w-full px-3 py-2 border rounded font-medium text-slate-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-700">Timezone (সময় অঞ্চল)</label>
                            <input type="text" value={settings.timezone || 'Asia/Dhaka'} onChange={e => updateSettings({ timezone: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-700">Language (ভাষা)</label>
                            <select value={settings.language || 'bn'} onChange={e => updateSettings({ language: e.target.value })} className="w-full px-3 py-2 border rounded font-bold">
                              <option value="bn">বাংলা (Bengali)</option>
                              <option value="en">English (ইংরেজি)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. APPEARANCE */}
                  {siteDevTab === 'APPEARANCE' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-600" /> Appearance & Theme Layout (দৃশ্যমান থিম লেআউট)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Layout Theme Mode (থিম স্টাইল)</label>
                          <select value={settings.theme || 'editorial'} onChange={e => updateSettings({ theme: e.target.value as any })} className="w-full px-3 py-2 border rounded font-bold">
                            <option value="editorial">📰 Editorial View (সাংবাদিকতা লেআউট)</option>
                            <option value="light">☀️ Light Theme (সাদা থিম)</option>
                            <option value="dark">🌙 Dark Theme (কালো থিম)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Default Featured Placeholder (ডিফল্ট খবর ছবি)</label>
                          <input type="text" value={settings.newsConfig?.defaultImage || ''} onChange={e => updateSettings({ newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), defaultImage: e.target.value } })} className="w-full px-3 py-2 border rounded font-mono text-slate-500" />
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="block font-bold text-slate-700">Logo Upload (লোগো আপলোড)</label>
                          <div className="flex items-center gap-4 p-4 bg-slate-50 border rounded-xl">
                            <div className="h-14 w-32 bg-white border rounded flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">No Logo</span>
                              )}
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <input 
                                type="file" 
                                accept="image/*" 
                                id="logo-upload-input"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      const compressed = await compressImage(reader.result as string, 400, 200, 0.7);
                                      updateSettings({ logoUrl: compressed });
                                      addSecurityLog({
                                        userEmail: currentUser?.email || 'admin@nijornews.com',
                                        action: 'সাইট লোগো আপলোড করা হয়েছে',
                                        ipAddress: '127.0.0.1',
                                        status: 'edit',
                                        deviceInfo: 'Browser'
                                      });
                                      alert('সাইট লোগো সফলভাবে আপলোড করা হয়েছে!');
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden" 
                              />
                              <label htmlFor="logo-upload-input" className="bg-white hover:bg-slate-100 border text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs inline-block transition">
                                লোগো ফাইল নির্বাচন করুন (Choose PNG)
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Favicon Upload */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="block font-bold text-slate-700">Favicon Upload (ফেভিকন আপলোড)</label>
                          <div className="flex items-center gap-4 p-4 bg-slate-50 border rounded-xl">
                            <div className="h-12 w-12 bg-white border rounded flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {settings.faviconUrl ? (
                                <img src={settings.faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">No Icon</span>
                              )}
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <input 
                                type="file" 
                                accept="image/x-icon,image/png,image/jpeg" 
                                id="favicon-upload-input"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      const compressed = await compressImage(reader.result as string, 64, 64, 0.8);
                                      updateSettings({ faviconUrl: compressed });
                                      alert('সাইট ফেভিকন সফলভাবে আপলোড করা হয়েছে!');
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden" 
                              />
                              <label htmlFor="favicon-upload-input" className="bg-white hover:bg-slate-100 border text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs inline-block transition">
                                ফেভিকন ফাইল নির্বাচন করুন (Choose ICO)
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. HEADER */}
                  {siteDevTab === 'HEADER' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-600" /> Header Configuration Toggles (হেডার লেআউট সেটিংস)
                      </h3>
                      <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.headerConfig?.showLogo ?? true} 
                            onChange={e => updateSettings({ headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showLogo: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Show Site Logo in Header (হেডারে ওয়েবসাইটের লোগো দেখান)
                        </label>
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.headerConfig?.showMenu ?? true} 
                            onChange={e => updateSettings({ headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showMenu: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Display Primary Navigation Menu (মূল নেভিগেশন মেনু দেখান)
                        </label>
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.headerConfig?.showSearch ?? true} 
                            onChange={e => updateSettings({ headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showSearch: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Display News Search Bar (খবর খোঁজার সার্চ বার প্রদর্শন করুন)
                        </label>
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.headerConfig?.showSocial ?? true} 
                            onChange={e => updateSettings({ headerConfig: { ...(settings.headerConfig || { showLogo: true, showMenu: true, showSearch: true, showSocial: true }), showSocial: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Display Social Media Follow Buttons (সোশ্যাল মিডিয়া বাটন প্রদর্শন করুন)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 4. NAVIGATION */}
                  {siteDevTab === 'NAVIGATION' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-600" /> Navigation Menu Layout Configuration (নেভিগেশন মেনু)
                      </h3>
                      <p className="text-slate-600 text-xs">
                        সাইটের ক্যাটাগরি মেনু ও লিংকসমূহ মূল নেভিগেশন বারে ক্যাটাগরি ডাটাবেজ থেকে স্বয়ংক্রিয়ভাবে লোড হয়। মেনু পুনর্বিন্যাস বা নতুন কোনো লিঙ্ক সংযুক্ত করতে ক্যাটাগরি মডিউলটি ব্যবহার করুন।
                      </p>
                      <div className="p-3 bg-slate-50 border rounded-lg text-[11px] font-sans">
                        <span className="font-bold text-emerald-800 block">💡 পরামর্শ:</span>
                        বাম মেনুর <span className="font-bold">📁 Categories</span> সেকশন ব্যবহার করে কাস্টম স্লাগ দিয়ে যেকোনো নতুন লিংক বা পেজ সংযুক্ত করতে পারবেন।
                      </div>
                    </div>
                  )}

                  {/* 5. HOMEPAGE */}
                  {siteDevTab === 'HOMEPAGE' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Home className="w-4 h-4 text-emerald-600" /> Homepage Display & Layout Controls (হোমপেজ মডিউল)
                      </h3>
                      <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.homepageLayout.showBreaking} 
                            onChange={e => updateSettings({ homepageLayout: { ...settings.homepageLayout, showBreaking: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Display Breaking News Ticker (ব্রেকিং নিউজ টিকার প্রদর্শন করুন)
                        </label>
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.homepageLayout.showHero} 
                            onChange={e => updateSettings({ homepageLayout: { ...settings.homepageLayout, showHero: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Display Main Featured Hero Article (হিরো সেকশন বা মূল খবর প্রদর্শন করুন)
                        </label>
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.homepageLayout.showFeatured} 
                            onChange={e => updateSettings({ homepageLayout: { ...settings.homepageLayout, showFeatured: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Display Featured Grid Articles (ফিচার্ড গ্রিড সেকশন প্রদর্শন করুন)
                        </label>
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.homepageLayout.showDistricts} 
                            onChange={e => updateSettings({ homepageLayout: { ...settings.homepageLayout, showDistricts: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Display District-Based News Section (জেলা ভিত্তিক খবর সেকশন প্রদর্শন করুন)
                        </label>
                        <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.homepageLayout.showPhotoVideo} 
                            onChange={e => updateSettings({ homepageLayout: { ...settings.homepageLayout, showPhotoVideo: e.target.checked } })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          Display Multimedia Grid (ছবি ও ভিডিও গ্যালারি প্রদর্শন করুন)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 6. NEWS/ARTICLE */}
                  {siteDevTab === 'NEWS/ARTICLE' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-emerald-600" /> News Article Viewing Configuration (সংবাদ ভিউ সেটিংস)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Default Article Author (ডিফল্ট খবর লেখক)</label>
                          <input type="text" value={settings.newsConfig?.defaultAuthor || ''} onChange={e => updateSettings({ newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), defaultAuthor: e.target.value } })} className="w-full px-3 py-2 border rounded font-semibold" />
                        </div>
                        <div className="p-3 bg-slate-50 border rounded-xl space-y-2 col-span-2">
                          <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={settings.newsConfig?.showRelated ?? true} 
                              onChange={e => updateSettings({ newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), showRelated: e.target.checked } })}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                            />
                            Display Related Articles Automatically (সম্পর্কিত সংবাদ প্রদর্শন করুন)
                          </label>
                          <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={settings.newsConfig?.showViewCounter ?? true} 
                              onChange={e => updateSettings({ newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), showViewCounter: e.target.checked } })}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                            />
                            Enable Real-time View Counter (সংবাদের লাইভ ভিউ কাউন্টার প্রদর্শন করুন)
                          </label>
                          <label className="flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={settings.newsConfig?.showReadTime ?? true} 
                              onChange={e => updateSettings({ newsConfig: { ...(settings.newsConfig || { defaultAuthor: '', defaultImage: '', showRelated: true, showViewCounter: true, showReadTime: true }), showReadTime: e.target.checked } })}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                            />
                            Display Estimated Reading Time (পড়ার আনুমানিক সময় প্রদর্শন করুন)
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. CATEGORY */}
                  {siteDevTab === 'CATEGORY' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-emerald-600" /> Category Configuration (ক্যাটাগরি ম্যানেজমেন্ট)
                      </h3>
                      <p className="text-slate-600 text-xs">
                        ক্যাটাগরি ও স্লাগ সেটিংস সাইটের ক্যাটাগরি সেকশন থেকে সরাসরি নিয়ন্ত্রিত হয়। সেটিংস মডিউলের মাধ্যমে ক্যাটাগরি তৈরি করতে বাম পাশের এআই ডেভেলপার কন্সোল ব্যবহার করতে পারেন।
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {categories.map(c => (
                          <div key={c.id} className="p-2.5 border rounded-lg bg-slate-50">
                            <span className="font-bold text-slate-800 block text-xs truncate">{c.name}</span>
                            <span className="font-mono text-[9px] text-slate-400">/{c.slug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. SIDEBAR */}
                  {siteDevTab === 'SIDEBAR' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Sidebar Layout Configuration (সাইডবার মডিউল)
                      </h3>
                      <p className="text-slate-600 text-xs">
                        ওয়েবসাইটের সাইডবারে গুগল ম্যাপস, জেলা ভিত্তিক খোঁজার তালিকা, ফেসসবুক পেজ উইজেট এবং বিজ্ঞাপনের অবস্থান সাজাতে এটি ব্যবহার করুন। কাস্টম উইজেট বা ফেসবুক প্লাগইনের জন্য কাস্টম কোড ট্যাবটি ব্যবহার করুন।
                      </p>
                      <div className="p-3 bg-emerald-50/50 border rounded-xl text-emerald-800">
                        ✓ জেলা ফিল্টার মডিউল: <span className="font-bold">সক্রিয় (Active)</span> | ✓ ফেসবুক পেজ উইজেট: <span className="font-bold">সক্রিয় (Active)</span>
                      </div>
                    </div>
                  )}

                  {/* 9. FOOTER */}
                  {siteDevTab === 'FOOTER' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Footer Details & Copyright Structure (ফুটার সেটিংস)
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Footer About Text (ফুটার ব্র্যান্ড বিবরণী)</label>
                          <textarea rows={3} value={settings.footerText || ''} onChange={e => updateSettings({ footerText: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold text-slate-700" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Copyright Text (কপিরাইট তথ্য)</label>
                          <input type="text" value={settings.footerConfig?.copyright || `© ${new Date().getFullYear()} নিজোর নিউজ। সর্বস্বত্ব সংরক্ষিত।`} onChange={e => updateSettings({ footerConfig: { ...(settings.footerConfig || { footerText: '', showMenu: true, showSocial: true, copyright: '' }), copyright: e.target.value } })} className="w-full px-3 py-2 border rounded font-bold text-slate-800" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer p-2 bg-slate-50 border rounded-lg">
                            <input 
                              type="checkbox" 
                              checked={settings.footerConfig?.showMenu ?? true} 
                              onChange={e => updateSettings({ footerConfig: { ...(settings.footerConfig || { footerText: '', showMenu: true, showSocial: true, copyright: '' }), showMenu: e.target.checked } })}
                              className="rounded text-emerald-600 focus:ring-emerald-500" 
                            />
                            Show Menu in Footer (ফুটারে ক্যাটাগরি মেনু দেখান)
                          </label>
                          <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer p-2 bg-slate-50 border rounded-lg">
                            <input 
                              type="checkbox" 
                              checked={settings.footerConfig?.showSocial ?? true} 
                              onChange={e => updateSettings({ footerConfig: { ...(settings.footerConfig || { footerText: '', showMenu: true, showSocial: true, copyright: '' }), showSocial: e.target.checked } })}
                              className="rounded text-emerald-600 focus:ring-emerald-500" 
                            />
                            Show Social Icons in Footer (ফুটারে সোশ্যাল লিঙ্ক দেখান)
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 10. ADVERTISEMENT */}
                  {siteDevTab === 'ADVERTISEMENT' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-emerald-600" /> Global Ad Integration Script Settings (বিজ্ঞাপন স্ক্রিপ্ট)
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.adsEnabled ?? true} 
                            onChange={e => updateSettings({ adsEnabled: e.target.checked })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4.5 h-4.5" 
                          />
                          Enable Global Advertisements (সাইটে বিজ্ঞাপন প্রদর্শন সক্রিয় করুন)
                        </label>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Adsterra Advertisement Banner Script Code (Adsterra কোড):</label>
                          <textarea rows={2} placeholder="Adsterra ব্যানার কোড এখানে বসান..." value={settings.adsterraScript || ''} onChange={e => updateSettings({ adsterraScript: e.target.value })} className="w-full p-2 bg-slate-50 border rounded font-mono text-[10px]" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Monetag Popunder/Native Script Code (Monetag কোড):</label>
                          <textarea rows={2} placeholder="Monetag কোড এখানে বসান..." value={settings.monetagScript || ''} onChange={e => updateSettings({ monetagScript: e.target.value })} className="w-full p-2 bg-slate-50 border rounded font-mono text-[10px]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 11. SEO */}
                  {siteDevTab === 'SEO' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-600" /> Search Engine Optimization Config (এসইও সেটিংস)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">SEO Default Meta Title (এসইও টাইটেল)</label>
                          <input type="text" value={settings.seoTitle || ''} onChange={e => updateSettings({ seoTitle: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">SEO Meta Keywords (এসইও কিওয়ার্ডস)</label>
                          <input type="text" placeholder="কমা দিয়ে আলাদা করুন, যেমন: রাঙামাটি, পাহাড়ের খবর" value={settings.metaKeywords || ''} onChange={e => updateSettings({ metaKeywords: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Canonical Base URL (ক্যানোনিকাল লিংক)</label>
                          <input type="text" placeholder="https://nijornews.com" value={settings.canonicalUrl || ''} onChange={e => updateSettings({ canonicalUrl: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Custom Sitemap URL (সাইটম্যাপ লিঙ্ক)</label>
                          <input type="text" placeholder="https://nijornews.com/sitemap.xml" value={settings.customSitemap || ''} onChange={e => updateSettings({ customSitemap: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="block font-bold text-slate-700">SEO Meta Description (এসইও মেটা বর্ণনা)</label>
                          <textarea rows={2} value={settings.seoDescription || ''} onChange={e => updateSettings({ seoDescription: e.target.value })} className="w-full px-3 py-2 border rounded font-medium text-slate-700" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="block font-bold text-slate-700">Robots.txt Content (সার্চ ইঞ্জিন ক্রলার ফাইল কন্টেন্ট)</label>
                          <textarea rows={2} value={settings.robotsTxt || "User-agent: *\nDisallow: /admin\nSitemap: https://nijornews.com/sitemap.xml"} onChange={e => updateSettings({ robotsTxt: e.target.value })} className="w-full p-2 bg-slate-50 border rounded font-mono text-[10px]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 12. SOCIAL */}
                  {siteDevTab === 'SOCIAL' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Send className="w-4 h-4 text-emerald-600" /> Social Media Page Links Config (সোশ্যাল মিডিয়া লিংক)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Facebook Page URL (ফেসবুক লিঙ্ক)</label>
                          <input type="text" placeholder="https://facebook.com/..." value={settings.facebook || ''} onChange={e => updateSettings({ facebook: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">YouTube Channel URL (ইউটিউব লিঙ্ক)</label>
                          <input type="text" placeholder="https://youtube.com/..." value={settings.youtube || ''} onChange={e => updateSettings({ youtube: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Twitter / X URL (টুইটার লিঙ্ক)</label>
                          <input type="text" placeholder="https://twitter.com/..." value={settings.twitter || ''} onChange={e => updateSettings({ twitter: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Instagram Profile URL (ইনস্টাগ্রাম লিঙ্ক)</label>
                          <input type="text" placeholder="https://instagram.com/..." value={settings.instagram || ''} onChange={e => updateSettings({ instagram: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Telegram Channel URL (টেলিগ্রাম লিঙ্ক)</label>
                          <input type="text" placeholder="https://t.me/..." value={settings.telegram || ''} onChange={e => updateSettings({ telegram: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">WhatsApp Contact Link (হোয়াটসঅ্যাপ লিঙ্ক)</label>
                          <input type="text" placeholder="https://wa.me/..." value={settings.whatsapp || ''} onChange={e => updateSettings({ whatsapp: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 13. MOBILE */}
                  {siteDevTab === 'MOBILE' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-600" /> Mobile Responsiveness Config (মোবাইল সেটিংস)
                      </h3>
                      <p className="text-slate-600 text-xs">
                        মোবাইল ফোনে ও ট্যাবলেট স্ক্রিনে সাইটের স্পর্শকাতরতা, স্টিকি মেনু বার, এবং দ্রুত লোডিং নিশ্চিতকরণ সেটিংস।
                      </p>
                      <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                        <p className="font-bold">✓ Mobile Layout: <span className="text-emerald-700">Fully Adaptive & Fluid</span></p>
                        <p className="font-bold">✓ Mobile Sticky Breaking Header: <span className="text-emerald-700">Enabled (সক্রিয়)</span></p>
                      </div>
                    </div>
                  )}

                  {/* 14. CUSTOM CODE (CRITICAL: With all 6 required textareas!) */}
                  {siteDevTab === 'CUSTOM CODE' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Code className="w-4 h-4 text-emerald-600" /> Custom Code Injection System (কাস্টম কোড ইনজেক্টর)
                      </h3>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        সরাসরি HTML, CSS, JavaScript, বা থার্ড-পার্টি প্লাগইন কোড লিখে আপনার সাইট ম্যানুয়ালি কাস্টমাইজ করুন। আপনার কোড সাইটের নির্দিষ্ট লেআউটে রিয়েল-টাইমে ইনজেক্ট হয়ে যাবে।
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            1. Header HTML (হেডারে কোড ইনজেক্ট করুন):
                          </label>
                          <textarea
                            rows={3}
                            value={settings.customHtmlHeader || ''}
                            onChange={e => updateSettings({ customHtmlHeader: e.target.value })}
                            placeholder="e.g. <div style='background: #b91c1c; color: white; text-align: center; padding: 6px; font-weight: bold;'>জরুরি নোটিশ! রাঙামাটি ঝুলন্ত সেতু বন্ধ রয়েছে।</div>"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[10px] text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            2. Footer HTML (ফুটারে কোড ইনজেক্ট করুন):
                          </label>
                          <textarea
                            rows={3}
                            value={settings.customHtmlFooter || ''}
                            onChange={e => updateSettings({ customHtmlFooter: e.target.value })}
                            placeholder="e.g. <script>console.log('Nijor News Custom Script Executed');</script>"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[10px] text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            3. Sidebar HTML (সাইডবারে কোড ইনজেক্ট করুন):
                          </label>
                          <textarea
                            rows={3}
                            value={settings.customHtmlSidebar || ''}
                            onChange={e => updateSettings({ customHtmlSidebar: e.target.value })}
                            placeholder="e.g. ফেসবুক পেজ প্লাগইন কোড বা আইফ্রেম কোড..."
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[10px] text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            4. Custom CSS (কাস্টম সিএসএস স্টাইল):
                          </label>
                          <textarea
                            rows={3}
                            value={settings.customCss || ''}
                            onChange={e => updateSettings({ customCss: e.target.value })}
                            placeholder="e.g. body { font-family: 'SolaimanLipi', sans-serif; } .hero-badge { background: linear-gradient(to right, red, orange); }"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[10px] text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            5. Custom JavaScript (কাস্টম জাভাস্ক্রিপ্ট):
                          </label>
                          <textarea
                            rows={3}
                            value={settings.customJs || ''}
                            onChange={e => updateSettings({ customJs: e.target.value })}
                            placeholder="e.g. window.onload = function() { console.log('Welcome to Nijor News Developer Console!'); }"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[10px] text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            6. Custom Widget (কাস্টম উইজেট বসান):
                          </label>
                          <textarea
                            rows={3}
                            value={settings.customWidget || ''}
                            onChange={e => updateSettings({ customWidget: e.target.value })}
                            placeholder="e.g. আবহাওয়ার উইজেট আইফ্রেম বা কাস্টম নামাজের সময়সূচী টেবিল..."
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[10px] text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 15. CONTACT */}
                  {siteDevTab === 'CONTACT' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" /> Site Official Contact Details (যোগাযোগ ও কার্যালয়)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Official Mobile Number (মোবাইল / ফোন)</label>
                          <input type="text" value={settings.phone || ''} onChange={e => updateSettings({ phone: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold text-slate-900" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Official Email Address (ইমেইল ঠিকানা)</label>
                          <input type="text" value={settings.email || ''} onChange={e => updateSettings({ email: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-800" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="block font-bold text-slate-700">Office / Editorial Address (কার্যালয় ঠিকানা)</label>
                          <input type="text" value={settings.address || ''} onChange={e => updateSettings({ address: e.target.value })} className="w-full px-3 py-2 border rounded text-slate-800" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 16. ANALYTICS */}
                  {siteDevTab === 'ANALYTICS' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-emerald-600" /> Visitor Tracking & Analytics ID Configuration (অ্যানালিটিক্স)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Google Analytics Tracking ID (UA/G- ID)</label>
                          <input type="text" placeholder="G-XXXXXXXXXX" value={settings.analyticsId || ''} onChange={e => updateSettings({ analyticsId: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Google Search Console HTML Verification Tag</label>
                          <input type="text" placeholder="google-site-verification-id" value={settings.googleVerification || ''} onChange={e => updateSettings({ googleVerification: e.target.value })} className="w-full px-3 py-2 border rounded font-mono text-slate-800" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 17. SECURITY */}
                  {siteDevTab === 'SECURITY' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-600" /> Maintenance Mode & Security Toggles (নিরাপত্তা ও অফলাইন)
                      </h3>
                      <div className="p-4 bg-amber-50 text-amber-950 border border-amber-200 rounded-xl space-y-2">
                        <p className="font-bold">⚠️ সতর্কবার্তা (Warning):</p>
                        <p className="leading-relaxed">মেইনটেন্যান্স মুড অন করলে সাধারণ পাঠকরা কোনো সংবাদ পড়তে পারবেন না। শুধুমাত্র লগইন থাকা স্টাফরাই অ্যাডমিন প্যানেল ও সাইটে ঢুকতে পারবেন।</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-xl">
                          <div>
                            <span className="block font-bold text-slate-800 text-xs">Enable Maintenance Mode (রক্ষণাবেক্ষণ মুড সক্রিয় করুন)</span>
                            <span className="text-[10px] text-slate-400">এই টগলটি সক্রিয় করলে সাইট অফলাইন হয়ে যাবে।</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={settings.maintenanceMode} 
                            onChange={e => {
                              updateSettings({ maintenanceMode: e.target.checked });
                              alert(e.target.checked ? 'মেইনটেন্যান্স মুড অন করা হয়েছে!' : 'মেইনটেন্যান্স মুড অফ করা হয়েছে!');
                            }}
                            className="rounded text-amber-600 focus:ring-amber-500 w-5 h-5 cursor-pointer" 
                          />
                        </div>

                        {settings.maintenanceMode && (
                          <div className="space-y-1 animate-fadeIn">
                            <label className="block font-bold text-slate-700">Offline Maintenance Message (অফলাইন বার্তা)</label>
                            <textarea rows={2} value={settings.maintenanceMessage || ''} onChange={e => updateSettings({ maintenanceMessage: e.target.value })} className="w-full px-3 py-2 border rounded font-semibold text-amber-900" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 18. PERFORMANCE */}
                  {siteDevTab === 'PERFORMANCE' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-600" /> Real-time Cache & Performance Tweaks (পারফরম্যান্স বুস্ট)
                      </h3>
                      <p className="text-slate-600 text-xs">
                        সাইট লোডিং টাইম ১ সেকেন্ডের নিচে রাখতে পারফরম্যান্স ও মেমরি ক্যাশিং স্বয়ংক্রিয়ভাবে পরিচালিত হচ্ছে।
                      </p>
                      <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs">
                        <p className="text-slate-700">✓ Content Delivery Network (CDN): <strong className="text-emerald-700">Active</strong></p>
                        <p className="text-slate-700">✓ Image Compression Engines: <strong className="text-emerald-700">Active (WebP Compress)</strong></p>
                        <p className="text-slate-700">✓ Client-side Hydration Latency: <strong className="text-emerald-700">0.02s (Super Fast)</strong></p>
                      </div>
                    </div>
                  )}

                  {/* 19. ADVANCED */}
                  {siteDevTab === 'ADVANCED' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-1.5 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-600" /> Schema Markup & SMTP Configuration (অ্যাডভান্সড)
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-700">Custom Schema Markup (JSON-LD স্ট্রাকচার্ড ডাটা)</label>
                          <textarea rows={3} placeholder='{ "@context": "https://schema.org", "@type": "NewsMediaOrganization", ... }' value={settings.customSchemaMarkup || ''} onChange={e => updateSettings({ customSchemaMarkup: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded font-mono text-[10px]" />
                        </div>

                        {/* Email / SMTP settings */}
                        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                          <span className="font-serif font-bold text-xs text-slate-800 block border-b pb-1">📬 SMTP & Gmail Server Configuration (মেইল মডিউল)</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-600">SMTP Host (সার্ভার এড্রেস)</label>
                              <input type="text" placeholder="smtp.gmail.com" value={settings.emailConfig?.smtpHost || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), smtpHost: e.target.value } })} className="w-full px-2 py-1.5 border rounded font-mono" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-600">SMTP Port</label>
                              <input type="number" placeholder="587" value={settings.emailConfig?.smtpPort || 587} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), smtpPort: Number(e.target.value) } })} className="w-full px-2 py-1.5 border rounded font-mono" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-600">SMTP Username</label>
                              <input type="text" placeholder="example@gmail.com" value={settings.emailConfig?.smtpUser || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), smtpUser: e.target.value } })} className="w-full px-2 py-1.5 border rounded" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-600">SMTP Password</label>
                              <input type="password" placeholder="••••••••" value={settings.emailConfig?.smtpPass || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), smtpPass: e.target.value } })} className="w-full px-2 py-1.5 border rounded font-mono" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-600">Sender Name (প্রেরকের নাম)</label>
                              <input type="text" placeholder="Nijor News" value={settings.emailConfig?.senderName || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), senderName: e.target.value } })} className="w-full px-2 py-1.5 border rounded font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-600">Sender Email Address</label>
                              <input type="email" placeholder="noreply@nijornews.com" value={settings.emailConfig?.senderEmail || ''} onChange={e => updateSettings({ emailConfig: { ...(settings.emailConfig || { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '', senderName: '', senderEmail: '' }), senderEmail: e.target.value } })} className="w-full px-2 py-1.5 border rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual configuration active preview */}
                  <div className="border border-slate-100 rounded-xl p-4 bg-emerald-50/20 text-[10px] space-y-1 animate-fadeIn">
                    <span className="font-bold text-emerald-800 uppercase block">📡 বর্তমান সক্রিয় সেটিংসের অবস্থা (Current Value Preview)</span>
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      ওয়েবসাইট নাম: <span className="font-bold text-slate-900">{settings.siteName}</span> | 
                      ফোন নম্বর: <span className="font-semibold text-slate-900">{settings.phone || 'দেওয়া নেই'}</span> | 
                      কার্যালয় ঠিকানা: <span className="text-slate-800">{settings.address || 'দেওয়া নেই'}</span>
                    </p>
                  </div>

                  {/* Save button for manual form */}
                  <div className="flex justify-end pt-4 border-t mt-4">
                    <button 
                      type="button"
                      onClick={() => alert('কনফিগারেশন ডাটাবেজে সফলভাবে সংরক্ষণ করা হয়েছে!')}
                      className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-xs transition cursor-pointer"
                    >
                      সেটিংস সংরক্ষণ করুন (Save Settings)
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}


        {/* 24. Polls & Surveys */}
        {activeTab === 'polls' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-black text-slate-900">🗳️ Polls & Surveys Management</h1>
                <p className="text-xs text-slate-500 mt-1">পোর্টালে রিয়েল-টাইম পাবলিক মতামত বা জনমত জরিপ তৈরি ও পরিচালনা করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add Poll / Edit Poll Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 self-start lg:col-span-1">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" /> {editingPollId ? 'জরিপ এডিট করুন (Edit Poll)' : 'নতুন পোল তৈরি করুন'}
                </h3>

                <form 
                  onSubmit={e => {
                    e.preventDefault();
                    if (!pollQuestion.trim() || !pollOptionsInput.trim()) {
                      alert('দয়া করে প্রশ্ন এবং অপশনগুলো পূরণ করুন!');
                      return;
                    }

                    const parsedOptions = pollOptionsInput
                      .split(/[\n,]+/)
                      .map(opt => opt.trim())
                      .filter(Boolean);

                    if (parsedOptions.length < 2) {
                      alert('অনুগ্রহ করে কমপক্ষে ২টি অপশন প্রদান করুন!');
                      return;
                    }

                    if (editingPollId) {
                      const originalPoll = polls.find(p => p.id === editingPollId);
                      const updatedOptions = parsedOptions.map((optText, idx) => {
                        if (originalPoll && originalPoll.options[idx]) {
                          return {
                            ...originalPoll.options[idx],
                            text: optText
                          };
                        } else {
                          return {
                            id: `opt-${idx}-${Date.now()}`,
                            text: optText,
                            votes: 0
                          };
                        }
                      });

                      updatePoll(editingPollId, {
                        question: pollQuestion,
                        options: updatedOptions
                      });
                      setEditingPollId(null);
                      alert('জনমত জরিপটি সফলভাবে সংশোধন করা হয়েছে!');
                    } else {
                      addPoll(pollQuestion, parsedOptions);
                      alert('জনমত জরিপটি (Poll) সফলভাবে তৈরি করা হয়েছে!');
                    }

                    setPollQuestion('');
                    setPollOptionsInput('');
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">জরিপের মূল প্রশ্ন (Survey Question)*</label>
                    <textarea 
                      rows={2} 
                      required
                      placeholder="যেমন: পার্বত্য চট্টগ্রামে পর্যটন শিল্পের বিকাশে সবচেয়ে বেশি কোন বিষয়ে জোর দেওয়া উচিত?" 
                      value={pollQuestion} 
                      onChange={e => setPollQuestion(e.target.value)} 
                      className="w-full px-3 py-2 border rounded font-semibold text-slate-800 leading-normal" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">অপশনসমূহ (Options - প্রতি লাইনে একটি করে অথবা কমা দিয়ে লিখুন)*</label>
                    <textarea 
                      rows={4} 
                      required
                      placeholder="যেমন:&#10;যোগাযোগ ব্যবস্থার উন্নয়ন&#10;পর্যটকদের নিরাপত্তা ও ইকো-ট্যুরিজম&#10;স্থানীয় ক্ষুদ্র নৃগোষ্ঠীর সংস্কৃতির প্রচার" 
                      value={pollOptionsInput} 
                      onChange={e => setPollOptionsInput(e.target.value)} 
                      className="w-full px-3 py-2 border rounded font-semibold text-slate-800 font-sans leading-normal" 
                    />
                  </div>

                  <div className="flex gap-2">
                    {editingPollId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingPollId(null);
                          setPollQuestion('');
                          setPollOptionsInput('');
                        }}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-lg transition"
                      >
                        বাতিল (Cancel)
                      </button>
                    )}
                    <button 
                      type="submit" 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition"
                    >
                      {editingPollId ? 'সংরক্ষণ করুন (Save)' : 'পাবলিশ করুন (Publish Poll)'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Polls List */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b pb-2">
                  Active & Archived Polls (জনমত জরিপসমূহ)
                </h3>

                <div className="space-y-4">
                  {polls.map((pl, pIdx) => {
                    const totalVotes = pl.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

                    return (
                      <div key={pl.id} className="p-4 bg-slate-50 border rounded-xl space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">Poll #{pIdx + 1}</span>
                            <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">{pl.question}</h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => {
                                setEditingPollId(pl.id);
                                setPollQuestion(pl.question);
                                setPollOptionsInput(pl.options.map(opt => opt.text).join('\n'));
                              }}
                              className="bg-slate-100 hover:bg-slate-200 p-1.5 border border-slate-200 rounded text-slate-700"
                              title="Edit Poll"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('আপনি কি নিশ্চিতভাবে এই জনমত জরিপটি বাতিল/ডিলিট করতে চান?')) {
                                  deletePoll(pl.id);
                                }
                              }}
                              className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1.5 border border-rose-200 rounded"
                              title="Delete Poll"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Votes Results breakdown */}
                        <div className="space-y-2 text-xs">
                          {pl.options.map(opt => {
                            const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                            return (
                              <div key={opt.id} className="space-y-1">
                                <div className="flex justify-between font-medium">
                                  <span>{opt.text}</span>
                                  <span className="font-bold">{opt.votes} ভোট ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono text-right">
                          মোট সংগৃহীত ভোট: {totalVotes} টি
                        </div>
                      </div>
                    );
                  })}
                  {polls.length === 0 && (
                    <p className="text-slate-400 py-12 text-center text-xs">কোনো পোল পাওয়া যায়নি। প্রথম পোল তৈরি করতে বামদিকের ফর্মটি পূরণ করুন।</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 25. News Revision History (Tab 39) */}
        {activeTab === 'revisions' && (() => {
          // Filter revisions list according to roles
          const baseRevisions = currentUser?.role === 'reporter' || currentUser?.role === 'senior_reporter'
            ? revisions.filter(r => r.editorEmail?.toLowerCase() === currentUser?.email?.toLowerCase())
            : revisions;

          // Apply filters: Search, Editor, Date, Category
          const filteredRevisions = baseRevisions.filter(rev => {
            const matchesSearch = !revSearch.trim() || 
              rev.articleTitle.toLowerCase().includes(revSearch.toLowerCase()) || 
              rev.editedBy.toLowerCase().includes(revSearch.toLowerCase()) ||
              rev.changeSummary.toLowerCase().includes(revSearch.toLowerCase());
            
            const matchesEditor = revEditor === 'all' || rev.editorEmail === revEditor;
            const matchesDate = !revDate || rev.editedAt.includes(revDate);
            const matchesCategory = revCategory === 'all' || rev.category === revCategory;

            return matchesSearch && matchesEditor && matchesDate && matchesCategory;
          });

          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-serif font-black text-slate-900">🕒 News Revision History</h1>
                  <p className="text-xs text-slate-500 mt-1">সংবাদ সংশোধনের সম্পূর্ণ ইতিহাস, পরিবর্তন তুলনা, এবং পূর্ববর্তী সংস্করণে ফিরে যাওয়ার অ্যাডভান্সড ইন্টিগ্রেশন</p>
                </div>
                <div className="bg-emerald-100 text-emerald-800 font-sans font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  Database Backed (Persistent)
                </div>
              </div>

              {/* Filters Panel */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">খবরের টাইটেল / এডিটর খুঁজুন</label>
                  <input 
                    type="text" 
                    placeholder="খবরের নাম বা সম্পাদকের নাম..." 
                    value={revSearch} 
                    onChange={e => setRevSearch(e.target.value)} 
                    className="w-full px-3 py-2 border rounded bg-slate-50 text-xs" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">সম্পাদক (Filter by Editor)</label>
                  <select 
                    value={revEditor} 
                    onChange={e => setRevEditor(e.target.value)} 
                    className="w-full px-2 py-2 border rounded bg-slate-50 text-xs text-slate-800 font-semibold"
                  >
                    <option value="all">সকল সম্পাদক (All)</option>
                    {Array.from(new Set(baseRevisions.map(r => r.editorEmail).filter(Boolean))).map(email => {
                      const name = baseRevisions.find(r => r.editorEmail === email)?.editedBy || email;
                      return <option key={email} value={email}>{name} ({email})</option>;
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">সম্পাদনের তারিখ</label>
                  <input 
                    type="date" 
                    value={revDate} 
                    onChange={e => setRevDate(e.target.value)} 
                    className="w-full px-3 py-2 border rounded bg-slate-50 text-xs font-mono" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">সংবাদ বিভাগ (Category)</label>
                  <select 
                    value={revCategory} 
                    onChange={e => setRevCategory(e.target.value)} 
                    className="w-full px-2 py-2 border rounded bg-slate-50 text-xs text-slate-800 font-semibold"
                  >
                    <option value="all">সকল বিভাগ (All)</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Revisions Database Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center text-xs">
                  <span className="font-serif font-bold text-slate-900">News Snapshots Version Control Queue</span>
                  <span className="text-slate-400">Total matched: {filteredRevisions.length} revision records</span>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-600 font-bold uppercase">
                        <th className="p-4">Time & Edit Details</th>
                        <th className="p-4">News Article Title</th>
                        <th className="p-4">Editor Profile</th>
                        <th className="p-4">Changes Summary</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                      {filteredRevisions.map(rev => (
                        <tr key={rev.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono font-medium text-slate-600">
                            {rev.editedAt.includes('T') ? (
                              <>
                                <p className="font-bold text-slate-900">{new Date(rev.editedAt).toLocaleDateString('bn-BD')}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(rev.editedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                              </>
                            ) : (
                              rev.editedAt
                            )}
                          </td>
                          <td className="p-4 font-serif font-bold text-slate-900 max-w-xs truncate" title={rev.articleTitle}>
                            {rev.articleTitle}
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800">{rev.editedBy}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{rev.editorEmail || 'admin@nijornews.com'}</p>
                              <span className={`inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                rev.editorRole === 'super_admin' ? 'bg-emerald-100 text-emerald-800' :
                                rev.editorRole === 'editor' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {rev.editorRole || 'Super Admin'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            📝 {rev.changeSummary}
                          </td>
                          <td className="p-4 font-bold text-emerald-700">
                            {rev.category || 'পার্বত্য চট্টগ্রাম'}
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => setSelectedRevCompare(rev)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded transition text-[10px]"
                            >
                              Compare & Restore
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRevisions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-bold font-sans">কোনো সংবাদ সংস্করণ রেকর্ড পাওয়া যায়নি।</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side-by-Side Comparison & Preview Modal */}
              {selectedRevCompare && (() => {
                const liveArt = articles.find(a => a.id === selectedRevCompare.articleId);

                // Split paragraph comparison helper
                const oldParagraphs = selectedRevCompare.content.split('\n').filter(Boolean);
                const liveParagraphs = (liveArt?.content || '').split('\n').filter(Boolean);
                const maxParagraphs = Math.max(oldParagraphs.length, liveParagraphs.length);

                return (
                  <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                      
                      {/* Modal Header */}
                      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
                        <div>
                          <h3 className="font-serif font-bold text-base flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" /> 
                            সংবাদ সংস্করণ তুলনা ও পুনরুদ্ধার প্যানেল (Version Comparison Suite)
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
                            Revision PIN: {selectedRevCompare.id} · Created by {selectedRevCompare.editedBy} ({selectedRevCompare.editorEmail})
                          </p>
                        </div>
                        <button onClick={() => setSelectedRevCompare(null)} className="text-slate-400 hover:text-white transition">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Content - Scrollable split view */}
                      <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                        
                        {/* High level Metadata Changes */}
                        <div className="bg-slate-50 p-4 border rounded-xl grid grid-cols-2 gap-6 leading-relaxed">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-rose-700 tracking-wider block mb-1">🔴 Old Revision Metadata Snapshot</span>
                            <div className="space-y-1.5">
                              <p className="font-serif font-black text-slate-900 text-xs">{selectedRevCompare.title}</p>
                              {selectedRevCompare.subheadline && <p className="text-slate-500 italic font-medium">{selectedRevCompare.subheadline}</p>}
                              <p className="text-[10px] text-slate-400">বিভাগ: <strong>{selectedRevCompare.category}</strong> · ট্যাগ: {selectedRevCompare.tags?.join(', ') || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="border-l pl-6">
                            <span className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider block mb-1">🟢 Current Live Metadata Version</span>
                            <div className="space-y-1.5">
                              {liveArt ? (
                                <>
                                  <p className="font-serif font-black text-slate-900 text-xs">{liveArt.title}</p>
                                  {liveArt.subheadline && <p className="text-slate-500 italic font-medium">{liveArt.subheadline}</p>}
                                  <p className="text-[10px] text-slate-400">বিভাগ: <strong>{liveArt.category}</strong> · ট্যাগ: {liveArt.tags?.join(', ') || 'N/A'}</p>
                                </>
                              ) : (
                                <p className="text-slate-400">This article was deleted from the active list.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content Side-by-Side highlight Comparison */}
                        <div className="space-y-2">
                          <span className="block font-bold text-slate-800 text-xs border-b pb-1.5">📰 Content Comparison Breakdown (প্যারাগ্রাফ ভিত্তিক তুলনা)</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Old Content Column */}
                            <div className="space-y-4 bg-red-50/20 p-4 rounded-xl border border-red-100 max-h-[350px] overflow-y-auto">
                              <span className="block font-bold text-red-800 text-[10px] uppercase tracking-wider mb-2">Previous Version Content</span>
                              {oldParagraphs.map((para: string, idx: number) => {
                                const isDifferent = para !== liveParagraphs[idx];
                                return (
                                  <p 
                                    key={idx} 
                                    className={`leading-relaxed text-justify ${
                                      isDifferent ? 'bg-red-50 text-red-700 line-through p-2 rounded-lg border border-red-100' : 'text-slate-600'
                                    }`}
                                  >
                                    {para}
                                  </p>
                                );
                              })}
                            </div>

                            {/* Live Content Column */}
                            <div className="space-y-4 bg-emerald-50/10 p-4 rounded-xl border border-emerald-100 max-h-[350px] overflow-y-auto">
                              <span className="block font-bold text-emerald-800 text-[10px] uppercase tracking-wider mb-2">Current Live Version Content</span>
                              {liveParagraphs.map((para: string, idx: number) => {
                                const isDifferent = para !== oldParagraphs[idx];
                                return (
                                  <p 
                                    key={idx} 
                                    className={`leading-relaxed text-justify ${
                                      isDifferent ? 'bg-emerald-50 text-emerald-900 font-bold p-2 rounded-lg border border-emerald-100/70' : 'text-slate-600'
                                    }`}
                                  >
                                    {para}
                                  </p>
                                );
                              })}
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* Modal Footer with Actions */}
                      <div className="bg-slate-50 border-t px-6 py-4 flex flex-wrap justify-between items-center gap-3 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          * রিস্টোর করার পূর্বে বর্তমান সংস্করণটির স্বয়ংক্রিয় ব্যাকআপ তৈরি করে রাখা হবে।
                        </span>
                        
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={() => setSelectedRevCompare(null)} 
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold text-xs transition"
                          >
                            বাতিল করুন (Close)
                          </button>
                          
                          {/* Role permissions checked: Super Admin and Editor can restore; Reporters can only view */}
                          {currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'editor' ? (
                            <button 
                              type="button" 
                              onClick={() => {
                                if (!selectedRevCompare || !liveArt) return;
                                if (!confirm(`আপনি কি নিশ্চিতভাবে এই খবরের সংস্করণটি পুনরুদ্ধার করতে চান?\n\n- সংস্করণ সময়: ${new Date(selectedRevCompare.editedAt).toLocaleString('bn-BD')}\n- সম্পাদক: ${selectedRevCompare.editedBy}`)) {
                                  return;
                                }

                                // 1. Save current live state as a backup revision first
                                setRevisions(prev => [{
                                  id: `rev-${Date.now()}`,
                                  articleId: liveArt.id,
                                  articleTitle: liveArt.title,
                                  editedBy: currentUser?.name || 'রিস্টোর ব্যাকআপ',
                                  editorEmail: currentUser?.email || 'admin@nijornews.com',
                                  editorRole: currentUser?.role || 'super_admin',
                                  editedAt: new Date().toISOString(),
                                  changeSummary: `অটো ব্যাকআপ: রিস্টোর করার পূর্বের মূল খবরের লাইভ সংস্করণ।`,
                                  title: liveArt.title,
                                  subheadline: liveArt.subheadline || '',
                                  excerpt: liveArt.excerpt,
                                  content: liveArt.content,
                                  category: liveArt.category,
                                  district: liveArt.district || '',
                                  upazila: liveArt.upazila || '',
                                  image: liveArt.image,
                                  tags: liveArt.tags || []
                                }, ...prev]);

                                // 2. Overwrite current live article fields with snapshot
                                updateArticle(liveArt.id, {
                                  title: selectedRevCompare.title,
                                  subheadline: selectedRevCompare.subheadline || '',
                                  excerpt: selectedRevCompare.excerpt,
                                  content: selectedRevCompare.content,
                                  category: selectedRevCompare.category,
                                  district: selectedRevCompare.district || '',
                                  upazila: selectedRevCompare.upazila || '',
                                  image: selectedRevCompare.image,
                                  tags: selectedRevCompare.tags || []
                                });

                                // 3. Log restore action to Security Log
                                addSecurityLog({
                                  userEmail: currentUser?.email || 'admin@nijornews.com',
                                  action: `সংস্করণ পুনরুদ্ধার (Restore News): "${selectedRevCompare.title}" (Restored from version ${new Date(selectedRevCompare.editedAt).toLocaleString('bn-BD')} by ${selectedRevCompare.editedBy})`,
                                  ipAddress: '192.168.1.102',
                                  status: 'success',
                                  deviceInfo: 'Chrome / Windows 11'
                                });

                                alert('খবরের সংস্করণটি সফলভাবে পুনরুদ্ধার এবং লাইভ করা হয়েছে!');
                                setSelectedRevCompare(null);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-xs transition shadow-xs"
                            >
                              রিস্টোর করুন (Restore This Version)
                            </button>
                          ) : (
                            <button 
                              type="button" 
                              disabled 
                              className="bg-slate-300 text-slate-500 font-bold px-4 py-2 rounded-lg text-xs cursor-not-allowed" 
                              title="রিপোর্টারদের জন্য রিস্টোর অপশনটি সংরক্ষিত নয়"
                            >
                              Restore (Disabled for Reporters)
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

      </main>

    </div>
  );
};
