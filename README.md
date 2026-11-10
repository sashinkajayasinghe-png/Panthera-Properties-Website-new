# Panthera Properties

Luxury real estate website for Panthera Properties, Colombo, Sri Lanka.

Next.js 15 (App Router, TypeScript) · Tailwind CSS 4 · Motion · GSAP · Lenis · PostgreSQL + Prisma · Leaflet/OpenStreetMap · optional Cloudinary, SMTP and Claude.

## What's included

- **Cinematic homepage**: parallax hero (optional video, with a static fallback on mobile and for reduced motion), a scroll-revealed brand story, expanding collection panels, a free-scrolling featured gallery with a quick property finder, a neighbourhood showcase, a "Why Panthera" storytelling section and a unified private-consultation form.
- **Property search** (`/properties`): filters for type, location, price, bedrooms, bathrooms, floor area, land extent and sale status, plus sorting. All filters live in shareable URL query parameters.
- **Property pages** (`/properties/[slug]`): gallery with lightbox, facts, features, amenities, a map, an enquiry or viewing form, WhatsApp with a pre-filled message, similar properties, optional video and virtual tour, and JSON-LD structured data.
- **Collections** (`/collections/[slug]`) and **neighbourhoods** (`/neighborhoods/[slug]`, covering Colombo 01–15 and the suburbs).
- About, private consultation (consultation, viewing and selling in one form) and privacy/cookie pages.
- **Lead capture**: enquiries, viewings, seller leads, consultations and assistant briefs. Inputs are validated with zod. Spam protection uses a honeypot, a minimum time to fill in the form and per-IP rate limits. Every lead is stored in PostgreSQL, and an email notification is sent when SMTP is configured.
- **Admin** (`/admin`): signed, HTTP-only session cookie with bcrypt passwords. Manage properties (create, edit, delete, upload and reorder images, set status, featured and published), track leads (New, Contacted, Viewing Scheduled, Negotiating, Closed), review viewing requests, and edit homepage content and the logo.
- **Property assistant**: turns natural language into search filters, with Claude (when `ANTHROPIC_API_KEY` is set) or a built-in rule-based parser. Results always come from the database.
- **SEO**: per-page metadata, `sitemap.xml` (sample listings excluded), `robots.txt`, a generated Open Graph image, and `RealEstateAgent` and `RealEstateListing` JSON-LD.

## Running locally

```bash
cp .env.example .env          # then set AUTH_SECRET
npm install
npm run db:local              # optional: starts a local PostgreSQL on :5433 if you don't have one (keep it running)
npm run db:setup              # creates tables + seeds neighbourhoods and sample listings
npm run admin:create -- you@example.com "a-strong-password" "Your Name"
npm run dev                   # http://localhost:3000  ·  admin at /admin
```

## Deploying to Vercel with a Namecheap domain

This is a full-stack Next.js app (pages, API routes, admin, database), which Vercel runs natively. No conversion is needed.

### 1. Put the code on GitHub

Easiest without the command line: install **GitHub Desktop**, choose *File → Add local repository*, pick this folder, create the repository, then *Publish repository* (keep it **private**). `.env` and `node_modules` are excluded automatically by `.gitignore` — never commit `.env`.

### 2. Create the Vercel project

1. At vercel.com, sign in with GitHub → **Add New → Project** → import the repository. Vercel detects Next.js; keep the default build settings.
2. Before the first deploy, add these **Environment Variables** (Settings → Environment Variables):

| Variable | Value |
|---|---|
| `AUTH_SECRET` | A long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (your final address, no trailing slash) |

3. **Database:** in the project, open **Storage → Create Database → Neon (Postgres)** and connect it to the project. This adds `DATABASE_URL` (pooled, used by the website) and `DATABASE_URL_UNPOOLED` (direct) automatically.
4. Deploy. The first deploy may show errors until the database is set up (next step).

### 3. Set up the database (once, from your computer)

Copy the **unpooled** connection string from Vercel (Storage → your database → `.env` tab → `DATABASE_URL_UNPOOLED`), then in this project folder run (PowerShell):

```powershell
$env:DATABASE_URL = 'paste-the-unpooled-connection-string'
npx prisma db push
npx tsx prisma/seed.ts
npm run admin:create -- panthera.properties@outlook.com 'your-password' 'Panthera Properties'
```

This creates the tables, the 21 neighbourhoods (with your images), the sample listings and your admin login on the live database. Use `$env:SEED_SAMPLES = 'false'` before the seed command to skip sample listings. Use single quotes around the password so characters like `$` are kept exactly. Then **Redeploy** in Vercel.

> If the live site logs mention prepared statements, add `&pgbouncer=true` to the end of `DATABASE_URL` in Vercel and redeploy.

### 4. Connect the Namecheap domain

1. Vercel → Project → **Settings → Domains** → add `yourdomain.com` and `www.yourdomain.com`.
2. Namecheap → **Domain List → Manage → Advanced DNS**. Make sure Nameservers is *Namecheap BasicDNS*, delete the default parking records (the `CNAME www → parkingpage.namecheap.com` and any `URL Redirect` on `@`), then add exactly the records Vercel shows. Typically:

| Type | Host | Value |
|---|---|---|
| A Record | `@` | `76.76.21.21` |
| CNAME Record | `www` | `cname.vercel-dns.com.` |

3. Wait for Vercel to show the domains as **Valid** (minutes to a few hours). HTTPS is issued automatically.
4. If `NEXT_PUBLIC_SITE_URL` changed, update it and redeploy.

## Optional integrations

| Feature | Variables | Without it |
|---|---|---|
| Cloud image storage (recommended in production) | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Uploads are stored in PostgreSQL and served from `/api/media/:id` |
| Email notifications | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL` | Leads are saved in the admin only. The lead shows "Not sent" |
| AI assistant | `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL` (default `claude-opus-5-5`) | The rule-based parser is used |

Uploaded photos are only rotated, resized, compressed and stripped of metadata (including GPS). Large photos are resized in the browser first so each upload stays under Vercel's 4.5 MB request limit. No generative or retouching edits are made.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run admin:create -- email "password" "Name"` | Create or reset an admin login |
| `npm run admin:remove -- email` | Remove an admin login (never the last one) |
| `npm run neighborhoods:sync-images` | Point neighbourhoods at `public/neighborhoods/<slug>.webp` |
| `npm run db:seed` | Re-create neighbourhoods and sample listings |
