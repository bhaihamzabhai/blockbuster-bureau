# Blockbuster Bureau — Hollywood Movie & Entertainment News Platform

> **The Bureau Never Closes**

A modern entertainment news platform built with Next.js 14, Firebase, and Tailwind CSS. Designed for Hollywood movie fans with daily entertainment news, YouTube integration, and a custom admin dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Framer Motion |
| Backend/DB | Firebase Firestore |
| Auth | Firebase Auth (Email + Google) |
| Storage | Firebase Storage |
| Hosting | Vercel |
| CMS | Custom Admin Dashboard |
| SEO | Next.js Metadata API + Sitemap |
| Security | Firebase Security Rules + DOMPurify |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Vercel account (for deployment)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/blockbuster-bureau.git
cd blockbuster-bureau
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in your Firebase configuration values in `.env.local`.

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database**
4. Enable **Authentication** (Email/Password and Google providers)
5. Enable **Storage**
6. Copy your Firebase config to `.env.local`

### Setting Up Admin Access

1. Create a user in Firebase Authentication
2. Download your Firebase Admin SDK service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
3. Set the environment variable:
   - Linux/Mac: `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"`
   - Windows: `set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json`
4. Run the admin claim script:

```bash
node scripts/setAdminClaim.js YOUR_USER_UID
```

5. Sign out and sign back in for the claim to take effect

## Publishing a Blog Post

1. Navigate to `/login` and sign in with your admin account
2. Go to `/dashboard`
3. Click "New Post" to create a new blog post
4. Use the rich text editor to write your content
5. Add a cover image, category, and tags
6. Click "Publish Now" to make it live

### Editor Features

- **Rich Text Editing**: Bold, italic, underline, strikethrough, highlight, subscript, superscript
- **Headings**: H1-H4 with Bebas Neue font
- **Font Family**: Inter (default), Bebas Neue, Georgia, Courier New, Arial
- **Font Size**: Small, Normal, Large, X-Large
- **Text Alignment**: Left, Center, Right, Justify
- **Lists**: Bullet and ordered lists
- **Tables**: Insert and manage tables
- **Media**: Images (upload or URL), YouTube videos, external embeds
- **Code Blocks**: Syntax-highlighted code blocks
- **Links**: Insert with nofollow option

## Adding AdSense

1. Get your AdSense publisher ID from [Google AdSense](https://www.google.com/adsense)
2. Add it to `.env.local`:
   ```
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
   ```
3. Ad placements are already configured:
   - Home page (leaderboard)
   - Blog listing (in-article, rectangle)
   - Post pages (in-article, leaderboard)

## Connecting YouTube

1. Add your YouTube channel URL to `.env.local`:
   ```
   NEXT_PUBLIC_YOUTUBE_CHANNEL_URL=https://youtube.com/c/YOURCHANNEL
   ```
2. Update `lib/youtubeVideos.ts` with your channel’s video IDs
3. The YouTube subscribe banner will appear automatically

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy

### Deploy Firebase Rules

```bash
firebase deploy --only firestore:rules,storage
```

Or use the shortcut:

```bash
npm run deploy:rules
```

## Project Structure

```
blockbuster-bureau/
├── app/
│   ├── (public)/          # Public-facing pages
│   │   ├── page.tsx        # Home
│   │   ├── blog/           # Blog listing & posts
│   │   └── about/          # About page
│   ├── (admin)/           # Admin dashboard
│   │   ├── login/           # Login page
│   │   └── dashboard/      # CMS dashboard
│   ├── api/               # API routes
│   ├── feed.xml/           # RSS feed
│   ├── sitemap.ts         # Dynamic sitemap
│   ├── robots.ts          # Robots.txt
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Header, Footer, Nav
│   ├── home/              # Home page sections
│   ├── blog/              # Blog components
│   ├── admin/             # Admin dashboard components
│   ├── ads/               # AdSense components
│   └── youtube/           # YouTube integration
├── lib/
│   ├── firebase.ts        # Firebase config
│   ├── firestore.ts       # Database helpers
│   ├── auth.ts            # Auth helpers
│   ├── sanitize.ts        # DOMPurify wrapper
│   ├── youtubeVideos.ts   # Channel video config
│   └── tiptap/            # Custom Tiptap extensions
├── hooks/
│   ├── useAuth.ts         # Auth hook
│   └── usePosts.ts        # Posts hook
├── scripts/
│   └── setAdminClaim.js   # Admin access script
├── types/
│   └── index.ts           # TypeScript interfaces
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
├── vercel.json                # Vercel deployment config
└── middleware.ts              # Route protection & security headers
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin private key | For admin script |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Admin client email | For admin script |
| `NEXT_PUBLIC_YOUTUBE_CHANNEL_URL` | YouTube channel URL | No |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense client ID | No |
| `NEXT_PUBLIC_SITE_URL` | Site URL for SEO | Recommended |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run deploy:rules` | Deploy Firebase rules |
| `npm run new:admin <uid>` | Grant admin access to user |

## Post-Deployment Checklist

- [ ] Run `node scripts/setAdminClaim.js YOUR_UID` to make yourself admin
- [ ] Deploy Firestore rules: `npm run deploy:rules`
- [ ] Test login at `/login` → dashboard
- [ ] Create your first post
- [ ] Add AdSense script to layout
- [ ] Submit sitemap to Google Search Console
- [ ] Add your site to YouTube channel’s "About" links
- [ ] Test RSS feed at `/feed.xml`
- [ ] Test sitemap at `/sitemap.xml`

## Security Features

- Content Security Policy (CSP) headers
- XSS protection headers
- Rate limiting on API routes
- Firebase Security Rules for data protection
- DOMPurify for HTML sanitization
- Protected admin routes
- Input validation on all forms

## License

MIT

---

**Blockbuster Bureau** — The Bureau Never Closes