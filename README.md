# NIJOR NEWS | নিজোর নিউজ
### Premium Bangla News Portal focused primarily on the Chittagong Hill Tracts (পার্বত্য চট্টগ্রাম) and Bangladesh.

---

## 🚀 Overview
**NIJOR NEWS (নিজোর নিউজ)** is a professional, production-grade digital newspaper and news portal designed specifically for the Chittagong Hill Tracts (Rangamati, Khagrachhari, Bandarban) and nationwide news coverage in Bangladesh.

---

## 🌟 Key Features
- **Professional Editorial UI/UX**: Clean typography using Hind Siliguri and Noto Serif Bengali with a responsive layout.
- **Hill Tracts Special Focus**: Dedicated portals and news categories for **রাঙামাটি**, **খাগড়াছড়ি**, and **বান্দরবান**.
- **Breaking News Ticker**: Real-time ticker banner managed from the admin dashboard.
- **Rich Text Editor**: Fully functional news editor with bold, italic, headings, blockquotes, bullet/numbered lists, image insertion with captions, hyperlinks, and YouTube video embeds.
- **Admin Dashboard**: Complete news management (Publish, Draft, Schedule, Featured, Lead), Breaking News CRUD, Category management, District portal management, Advertisement slot control, and User/Role management.
- **Advertisement System**: Centralized ad slot management for Header, Footer, Sidebar, In-article, Popunder, Social Bar, and Mobile ads (Adsterra & Monetag compatible).
- **Facebook Open Graph Optimization**: Dynamic Open Graph metadata generation (`og:title`, `og:description`, `og:image`, `og:url`) for perfect Facebook link previews.
- **Social Sharing**: One-click sharing to Facebook, Messenger, WhatsApp, X (Twitter), Telegram, Copy Link, and Print.
- **Powerful Search**: Instant search by keyword, district, category, or tag.
- **Netlify Ready**: Pre-configured with `netlify.toml` for seamless SPA deployment.

---

## 🛠️ Project Structure
```text
├── netlify.toml          # Netlify deployment configuration
├── package.json          # Dependencies & build scripts
├── src/
│   ├── App.tsx           # Main application root & routing
│   ├── index.css         # Tailwind & custom ticker animations
│   ├── main.tsx          # React entry point
│   ├── types.ts          # TypeScript interfaces
│   ├── context/          # State management (NewsContext)
│   ├── data/             # Initial mock data & sample articles
│   ├── components/       # Reusable UI components (Header, Navbar, Footer, NewsCard, RichTextEditor, etc.)
│   └── pages/            # Homepage, Article Detail, Category, District, Search, Admin Dashboard, Static Pages
```

---

## 📦 Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nijor-news
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## ☁️ Connecting Supabase / Firebase Backend (Optional for Production)
The app currently features a fully functional simulated backend with `localStorage` persistence. To connect Supabase or Firebase for multi-user cloud persistence:

1. Create a Supabase or Firebase project.
2. Set up tables for `articles`, `categories`, `districts`, `advertisements`, `breaking_news`, `users`, and `site_settings`.
3. Add your environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL="your-supabase-url"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```
4. Replace localStorage calls in `src/context/NewsContext.tsx` with your Supabase client queries.

---

## 🚀 Deploying to Netlify

1. Connect your GitHub repository to **Netlify**.
2. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Click **Deploy Site**. Netlify will automatically use `netlify.toml` for SPA routing redirects.

---

## 🔑 Admin Login Credentials
- **Email**: `admin@nijornews.com`
- **Role**: Super Admin
