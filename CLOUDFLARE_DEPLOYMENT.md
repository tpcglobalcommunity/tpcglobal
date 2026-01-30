# Cloudflare Pages Deployment Configuration

## Build Settings
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: 18+ (compatible with current package.json)
- **Root directory**: `/` (repository root)

## Environment Variables (Required)
Set these in Cloudflare Pages dashboard:

```bash
VITE_SUPABASE_PROJECT_ID=mzzwhrmciijyuqtfgtgg
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16endocm1jaWlqeXVxdGZndGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjM2MTQsImV4cCI6MjA4NTIzOTYxNH0.TGndaUPj0roEIHdTnEjigM4PVCeUNVzr1zDPYoFkJ-0
VITE_SUPABASE_URL=https://mzzwhrmciijyuqtfgtgg.supabase.co
VITE_USD_IDR_RATE=17000
```

## SPA Routing
- ✅ `_redirects` file included in `public/_redirects`
- ✅ Automatically copied to `dist/_redirects` during build
- ✅ Routes all requests to `index.html` for React Router

## Build Verification
```bash
npm ci
npm run build  # ✅ Passes locally
npm run preview  # ✅ Serves correctly
```

## Notes
- No secrets committed to repository
- TypeScript compilation clean
- ESLint not blocking builds
- Vite base path: `/` (root domain deployment)
- Framework: Vite + React + TypeScript
- Package manager: npm (package-lock.json present)
