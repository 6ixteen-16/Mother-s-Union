# Mothers Union Buganda — Official Website

Built with Next.js 14 (App Router, TypeScript), Tailwind CSS, Firebase (Auth + Firestore + Storage), deployed on Vercel.

---

## Quick start

```bash
git clone <your-repo-url>
cd mu-buganda
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Environment variables

Create `.env.local` with these values from your Firebase project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```

---

## Firebase setup (once before first launch)

**1. Create project** — console.firebase.google.com → New project (Spark/free plan) → Register Web app → copy config to `.env.local`

**2. Enable services** — Authentication (Email/Password), Firestore (production mode), Storage (production mode)

**3. Deploy security rules**
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```

**4. Create super admin Auth user** — Firebase console → Authentication → Add user → `kitegyec@gmail.com` → copy the generated UID

**5. Run seed script**
```bash
# Download service account key:
# Firebase console → Project settings → Service accounts → Generate new private key
# Save as serviceAccountKey.json in the project root — DO NOT commit this file

SERVICE_ACCOUNT_KEY=./serviceAccountKey.json npx tsx scripts/seed.ts
```

Open `scripts/seed.ts` first and replace `REPLACE_WITH_REAL_UID` with the actual UID from step 4.

Seeds: super admin record, four folders (Schools, Church, Hospital, Market), About/Vision/Mission placeholders.

**6. EmailJS (contact form)** — emailjs.com → add Email Service → create Template with `{{from_name}}` `{{from_email}}` `{{message}}` → copy IDs to `.env.local`

---

## Admin access

| Role | URL | Access |
|---|---|---|
| Super admin | `/admin/login` | Full — folders, content, staff, settings |
| Regular admin (×2) | `/admin/login` | Photos + blog posts only |

Regular admin accounts are created by the super admin from `/admin/super/staff`.

---

## Deployment

1. Push to GitHub
2. Vercel → New Project → Import repo
3. Add all `.env.local` values to Vercel Environment Variables
4. Deploy — auto-deploys on every push to `main`

---

## Colour swap

All colours live in one place: `src/app/globals.css` → `:root` block at the top. Change values there only — every component reads from CSS variables, nothing is hardcoded.

---

## Placeholder content to patch

| Item | File |
|---|---|
| Tagline | `src/components/Hero.tsx` |
| Phone number | `src/app/contact/page.tsx` |
| Email address | `src/app/contact/page.tsx` |
| Map embed | `src/app/contact/page.tsx` |
| Social links | `src/components/Footer.tsx` → `SOCIAL_SLOTS` |
| Privacy policy date | `src/app/privacy/page.tsx` |
| About/Vision/Mission text | Admin panel → Edit Content (after launch) |

---

## Domain (post-launch)

1. Register domain (NITA-U for `.ug`, any registrar for `.org`)
2. Vercel dashboard → Project → Settings → Domains → Add
3. Follow DNS instructions — SSL is automatic

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                Homepage
│   ├── blog/                   Blog list + post
│   ├── gallery/[folderId]/     Gallery
│   ├── contact/
│   ├── privacy/
│   └── admin/
│       ├── login/
│       ├── super/              Super admin (dashboard, community, content, staff, settings)
│       └── staff/              Regular admin (dashboard, photos, blog)
├── components/
│   ├── admin/                  Admin-only components
│   ├── NavBar.tsx
│   ├── Footer.tsx
│   ├── Lightbox.tsx
│   ├── PhotoGrid.tsx
│   ├── UploadZone.tsx
│   ├── Toast.tsx
│   ├── ConfirmDialog.tsx
│   ├── EmptyState.tsx
│   └── RoleGuard.tsx
├── context/AuthContext.tsx
├── hooks/
└── lib/
    ├── firebase.ts
    └── types.ts
```

---

## Legal checklist before launch

- [ ] Replace `[DATA PRIVACY CONTACT EMAIL]` in `/privacy`
- [ ] Set the privacy policy date
- [ ] Brief admin on photo consent policy — images of identifiable individuals need consent before publishing
- [ ] Confirm entity registration number before registering `.ug` domain
- [ ] Delete `serviceAccountKey.json` after seeding — never commit it
