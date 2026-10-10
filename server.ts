import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Resilient API Call Utility: Handles transient 503 (High Demand) and 429 (Rate Limits) with exponential backoff & model rotation!
async function generateContentWithRetry(params: any, maxRetries = 4, delayMs = 1500): Promise<any> {
  const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Alternate or fallback to stable older model releases if the latest version is experiencing high load
    const modelToUse = models[(attempt - 1) % models.length];
    const attemptParams = { ...params, model: modelToUse };

    try {
      console.log(`[Gemini API Call] Requesting ${modelToUse} (Attempt ${attempt} of ${maxRetries})...`);
      const response = await ai.models.generateContent(attemptParams);
      if (response) return response;
    } catch (err: any) {
      const errMsg = err.message || '';
      const errStatus = err.status || 0;
      
      const isTransient = errMsg.includes('503') || 
                          errMsg.includes('temporary') || 
                          errMsg.includes('demand') ||
                          errMsg.includes('rate') || 
                          errMsg.includes('UNAVAILABLE') ||
                          errStatus === 503 || 
                          errStatus === 429;
                          
      if (isTransient && attempt < maxRetries) {
        console.warn(`[Gemini API Warning - Attempt ${attempt} failed with 503/429. Switching model and retrying in ${delayMs}ms...]`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
        continue;
      }
      throw err; // Re-throw if it's a fatal non-transient error or the last attempt failed
    }
  }
  throw new Error('Gemini API call failed: Maximum retries and fallback models exceeded.');
}

async function getArticleData(id: string) {
  const projectId = 'refined-vista-kcbh2';
  const apiKey = 'AIzaSyDv8YizE4IrTzMIzWacbnh4_axojnjAeqo';
  const dbId = 'ai-studio-nijornews-1efdbe8e-44bf-4d08-8903-51b8518e074d';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/articles/${id}?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json: any = await res.json();
    const fields = json.fields || {};
    return {
      title: fields.title?.stringValue || 'NIJOR NEWS',
      excerpt: fields.excerpt?.stringValue || 'পার্বত্য চট্টগ্রাম এবং বাংলাদেশের নির্ভরযোগ্য স্বাধীন ডিজিটাল সংবাদ মাধ্যম।',
      image: fields.image?.stringValue || '',
    };
  } catch (err) {
    console.error('Error fetching article for SEO:', err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const port = 3000;

  // Middleware to support large JSON base64 / text bodies
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Dynamic Google AI Studio News Editor Endpoint (Resilient)
  app.post('/api/gemini/edit-news', async (req, res) => {
    const { action, title, content, prompt: customPrompt } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Google AI Studio API Key is not configured. Please add GEMINI_API_KEY to Secrets.' });
    }

    let systemInstruction = "";
    let promptText = "";

    if (action === 'catchy_title') {
      systemInstruction = "You are a professional Bengali journalist and copywriter. Your job is to rewrite the news title to make it extremely engaging, professional, and click-worthy in Bengali. Do not translate to English. Respond ONLY with the new rewritten title string. No quotes, no preamble, no markdown formatting.";
      promptText = `Rewrite this Bengali news title to make it highly engaging and click-worthy:\n\nTitle: ${title}\nContent summary: ${content.substring(0, 1000)}`;
    } else if (action === 'polish_content') {
      systemInstruction = "You are an expert Bengali editor. Your job is to proofread, correct spelling, grammar, punctuation, and improve the flow and professional tone of the Bengali news article. Preserve all HTML tags, images, videos, alignments, and styling classes exactly as they are. Do not add metadata or notes. Respond ONLY with the fully polished news HTML/content with no quotes and no markdown formatting.";
      promptText = `Proofread, correct Bengali spelling, and polish the style of this news content while preserving all existing HTML tags/elements intact:\n\n${content}`;
    } else if (action === 'generate_excerpt') {
      systemInstruction = "You are a professional Bengali editor. Your job is to write a highly concise, engaging 1-to-2 sentence summary/excerpt (in Bengali) of the provided news article. Do not include any HTML tags. Do not write more than 40 words. Respond ONLY with the summary text, with no quotes or formatting.";
      promptText = `Create a short 1-to-2 sentence Bengali summary/excerpt for this news article:\n\n${content.substring(0, 2000)}`;
    } else if (action === 'custom_prompt') {
      systemInstruction = `You are a professional Bengali news assistant. Your job is to modify or rewrite the Bengali news content based on the user's specific instruction. Preserve HTML tags where appropriate, and respond in Bengali. Respond ONLY with the modified output text or content, with no introductory explanation, no quotes, and no markdown formatting. User instruction: "${customPrompt}"`;
      promptText = `Modify the news content according to this instruction: "${customPrompt}"\n\nTitle: ${title}\nContent:\n${content}`;
    } else {
      return res.status(400).json({ error: 'Invalid action specified.' });
    }

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const resultText = response.text || '';
      res.json({ result: resultText.trim() });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({ error: err.message || 'Error communicating with Google AI Studio.' });
    }
  });

  // Dynamic Google AI Studio Settings Developer Endpoint (Multimodal: supports text + screenshots/files!) (Resilient)
  app.post('/api/gemini/develop-settings', async (req, res) => {
    const { 
      action, 
      currentSettings, 
      prompt: customPrompt, 
      fileData, 
      fileMime,
      model,
      systemInstruction: customSystemInstruction,
      temperature 
    } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Google AI Studio API Key is not configured. Please add GEMINI_API_KEY to Secrets.' });
    }

    let defaultSystemInstruction = "You are a senior full-stack web developer and expert copywriter. Your job is to return highly optimized site settings in JSON format. You must respond ONLY with a raw JSON block containing fields. Do not include markdown code blocks (e.g. no ```json).";
    let systemInstruction = customSystemInstruction || defaultSystemInstruction;
    let promptText = "";

    const responseSchema = {
      type: "OBJECT",
      properties: {
        updatedSettings: {
          type: "OBJECT",
          description: "An object containing modified or updated settings fields (e.g. siteName, siteTitle, phone, email, address, facebook, customHtmlHeader, customHtmlFooter, customHtmlSidebar, customCss, customJs, customWidget, etc.). Do NOT include unmodified fields.",
          properties: {
            siteName: { type: "STRING" },
            siteTitle: { type: "STRING" },
            siteSubtitle: { type: "STRING" },
            tagline: { type: "STRING" },
            phone: { type: "STRING" },
            email: { type: "STRING" },
            address: { type: "STRING" },
            facebook: { type: "STRING" },
            youtube: { type: "STRING" },
            twitter: { type: "STRING" },
            instagram: { type: "STRING" },
            telegram: { type: "STRING" },
            whatsapp: { type: "STRING" },
            seoTitle: { type: "STRING" },
            seoDescription: { type: "STRING" },
            metaKeywords: { type: "STRING" },
            footerText: { type: "STRING" },
            aboutUs: { type: "STRING" },
            customHtmlHeader: { type: "STRING" },
            customHtmlFooter: { type: "STRING" },
            customHtmlSidebar: { type: "STRING" },
            customCss: { type: "STRING" },
            customJs: { type: "STRING" },
            customWidget: { type: "STRING" }
          }
        },
        newCategory: {
          type: "OBJECT",
          description: "Details for a new category if the user explicitly requested to create or add a category.",
          properties: {
            name: { type: "STRING" },
            slug: { type: "STRING" },
            description: { type: "STRING" }
          }
        },
        newBreakingNews: {
          type: "OBJECT",
          description: "Details for a new breaking news ticker if explicitly requested.",
          properties: {
            text: { type: "STRING" },
            active: { type: "BOOLEAN" },
            priority: { type: "INTEGER" }
          }
        },
        unrelatedAlert: {
          type: "OBJECT",
          description: "Populate if the request tries to modify core code files, do something completely destructive or unrelated to settings.",
          properties: {
            isDestructiveOrUnrelated: { type: "BOOLEAN" },
            warningMessage: { type: "STRING" }
          }
        }
      }
    };

    if (action === 'optimize_seo') {
      promptText = `Based on the website name "${currentSettings?.siteName || 'নিজোর নিউজ'}", generate an extremely engaging, high-performance Bengali slogan, SEO title, SEO description, and a general description. Return the proposed values strictly inside 'updatedSettings'.`;
    } else if (action === 'generate_about') {
      promptText = `Write a premium, beautiful, and professional 'About Us' (আমাদের সম্পর্কে) profile in Bengali for "${currentSettings?.siteName || 'নিজোর নিউজ'}", emphasizing independence, objective reporting, and coverage of the Chittagong Hill Tracts (পার্বত্য চট্টগ্রাম). Return this profile inside the 'updatedSettings.aboutUs' field.`;
    } else if (action === 'custom_settings') {
      promptText = `Analyze the user's natural language developer command.
1. If the user asks to modify a setting (such as phone, facebook, email, customHtmlHeader, customCss, customJs, siteName, siteTitle, etc.), populate ONLY those updated fields inside 'updatedSettings'. Do NOT touch any other fields.
2. If the user asks to create a new category (e.g. "Create a category named Sports"), populate 'newCategory' with a name, slug (lowercase English, no spaces), and description.
3. If the user asks to modify/add breaking-news (e.g. "Add a breaking news ticker about flooding"), populate 'newBreakingNews' with text, active (true), and priority.
4. If the user asks to modify unrelated files, rewrite backend code, or delete core components, populate 'unrelatedAlert' with isDestructiveOrUnrelated=true and a clear warning message in Bengali.

User Developer Command: "${customPrompt}"
Current Settings: ${JSON.stringify(currentSettings)}`;
    }

    try {
      const parts: any[] = [{ text: promptText }];
      
      // Support multimodal inputs!
      if (fileMime && fileData) {
        let cleanBase64 = fileData;
        if (cleanBase64.includes(',')) {
          cleanBase64 = cleanBase64.split(',')[1];
        }
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: fileMime
          }
        });
      }

      const response = await generateContentWithRetry({
        model: model || "gemini-3.8-flash",
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema as any,
          temperature: temperature !== undefined ? Number(temperature) : 0.7,
        }
      });

      let resultText = response.text || '{}';
      resultText = resultText.trim();

      // Resilient cleanup of markdown block formatting if present
      if (resultText.startsWith('```')) {
        resultText = resultText.replace(/^```(json)?\s*/, '');
        resultText = resultText.replace(/\s*```$/, '');
        resultText = resultText.trim();
      }

      try {
        const parsed = JSON.parse(resultText);
        res.json(parsed);
      } catch (parseErr) {
        console.error('Failed to parse clean JSON from Gemini. Attempting regex extract:', resultText);
        const firstBrace = resultText.indexOf('{');
        const lastBrace = resultText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          const extracted = resultText.substring(firstBrace, lastBrace + 1);
          res.json(JSON.parse(extracted));
        } else {
          throw parseErr;
        }
      }
    } catch (err: any) {
      console.error('Gemini Settings Developer Error:', err);
      res.status(500).json({ error: err.message || 'Error communicating with Google AI Studio.' });
    }
  });

  // Real-time image proxy route to serve Base64 database images as binary files for Social Crawlers
  app.get(['/api/image/:id', '/api/image/:id.jpg'], async (req, res) => {
    try {
      const rawId = req.params.id || '';
      const id = rawId.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const article = await getArticleData(id);
      const defaultFallback = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fm=jpg&q=80&w=1200&h=630&fit=crop';
      
      if (!article || !article.image) {
        return res.redirect(defaultFallback);
      }

      const imageStr = article.image;

      // Parse and extract from Data URI format if present (uploaded images)
      if (imageStr.startsWith('data:')) {
        let contentType = 'image/jpeg';
        const mimeMatch = imageStr.match(/^data:([^;]+);base64,/);
        if (mimeMatch) {
          contentType = mimeMatch[1];
        }
        const base64Data = imageStr.split(',')[1] || '';
        const imgBuffer = Buffer.from(base64Data, 'base64');
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(imgBuffer);
      }

      // External URL (Unsplash or CDN)
      if (imageStr.startsWith('http')) {
        let cleanUrl = imageStr;
        if (cleanUrl.includes('images.unsplash.com')) {
          cleanUrl = cleanUrl.replace(/auto=format/g, 'fm=jpg');
          if (!cleanUrl.includes('fm=')) {
            cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'fm=jpg&w=1200&h=630&fit=crop';
          }
        }
        return res.redirect(cleanUrl);
      }

      return res.redirect(defaultFallback);
    } catch (err) {
      console.error('Error rendering image proxy:', err);
      return res.redirect('https://images.unsplash.com/photo-1506744038136-46273834b3fb?fm=jpg&q=80&w=1200&h=630&fit=crop');
    }
  });

  // SEO Proxy for Article sharing links (Supports both /n/:id and /article/:id for shortening)
  const handleSeoProxy = async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const article = await getArticleData(id);
    
    const htmlPath = process.env.NODE_ENV === 'production'
      ? path.join(__dirname, 'dist', 'index.html')
      : path.join(__dirname, 'index.html');
      
    try {
      if (!fs.existsSync(htmlPath)) {
        return res.redirect(`/#/article/${id}`);
      }
      
      let html = fs.readFileSync(htmlPath, 'utf8');
      
      if (article) {
        // Precise cleaning of default headers in index.html to avoid overlaps
        html = html.replace(/<title>.*?<\/title>/gi, '');
        html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '');
        html = html.replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '');
        html = html.replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '');

        // Resolve absolute image URL: prefer direct article image if available
        const host = req.get('host') || 'nijornews.netlify.app';
        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
        let absoluteImageUrl = `${protocol}://${host}/api/image/${id}.jpg`;
        if (article.image && article.image.startsWith('http') && !article.image.startsWith('data:')) {
          let clean = article.image;
          if (clean.includes('images.unsplash.com')) {
            clean = clean.replace(/auto=format/g, 'fm=jpg');
            if (!clean.includes('fm=')) {
              clean += (clean.includes('?') ? '&' : '?') + 'fm=jpg&w=1200&h=630&fit=crop';
            }
          }
          absoluteImageUrl = clean;
        }

        const canonicalUrl = `https://nijornews.netlify.app/n/${id}`;

        const ogMetaTags = `
          <title>${article.title} - NIJOR NEWS</title>
          <meta name="description" content="${article.excerpt}" />
          <meta property="og:site_name" content="নিজোর নিউজ | NIJOR NEWS" />
          <meta property="og:title" content="${article.title}" />
          <meta property="og:description" content="${article.excerpt}" />
          <meta property="og:image" content="${absoluteImageUrl}" />
          <meta property="og:image:secure_url" content="${absoluteImageUrl}" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:type" content="article" />
          <meta property="og:locale" content="bn_BD" />
          <link rel="image_src" href="${absoluteImageUrl}" />
          <link rel="canonical" href="${canonicalUrl}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@nijornews" />
          <meta name="twitter:title" content="${article.title}" />
          <meta name="twitter:description" content="${article.excerpt}" />
          <meta name="twitter:image" content="${absoluteImageUrl}" />
          <script>
            // Instant redirect for human readers to the client app hash route
            try {
              window.location.replace("/#/article/${id}");
            } catch (e) {
              window.location.href = "/#/article/${id}";
            }
          </script>
        `;
        
        // Insert at the VERY start of <head> so crawlers parse them first
        html = html.replace('<head>', `<head>${ogMetaTags}`);
      } else {
        html = html.replace('<head>', `
          <head>
            <script>
              window.location.href = "/";
            </script>
        `);
      }
      res.send(html);
    } catch (err) {
      console.error('Error rendering SEO template:', err);
      res.redirect(`/#/article/${id}`);
    }
  };

  app.get('/n/:id', handleSeoProxy);
  app.get('/article/:id', handleSeoProxy);

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Setup Vite development server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    
    app.use(vite.middlewares);
    
    // Serve index.html fallback for SPA router
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[NIJOR NEWS Server] running securely on port ${port}`);
  });
}

startServer();
