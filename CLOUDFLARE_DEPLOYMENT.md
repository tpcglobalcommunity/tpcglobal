# Cloudflare Pages Deployment Configuration

## Repository
- **Repo**: https://github.com/tpcglobalcommunity/tpcglobal
- **Project**: presale
- **Dashboard**: https://dash.cloudflare.com/dbe0f0939a2e26ff627e7ddfe2ee622d/pages/view/presale

## Supabase Security

### ⚠️ IMPORTANT: Anon Key Management

**DO NOT rotate anon key by default.**

The Supabase anon key is **public** and expected in client apps. It's safe **only** with correct Row Level Security (RLS) policies.

**If rotating is required:**
1. Regenerate anon key in Supabase Dashboard
2. Update Cloudflare environment variables **immediately**
3. Confirm service_role key is NOT used anywhere in src

**Security Rules:**
✅ Anon key: Public, safe with proper RLS
❌ Service_role key: NEVER expose in client code
✅ Always verify RLS policies before deployment
✅ Keep anon key rotation minimal (only if leak/abuse suspected)

### Supabase Dashboard URL
**Correct Project ID:** `mzzwhrmciijyuqtfgtgg`
**Dashboard:** https://supabase.com/dashboard/project/mzzwhrmciijyuqtfgtgg

## Cloudflare Pages Settings

### Build Configuration
Go to **Cloudflare Pages → Settings → Builds & deployments**:

- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (repository root)
- **Node version**: `18` (via .nvmrc)

### NPM Enforcement (Critical)
This project uses **NPM only**. Ensure Cloudflare doesn't use Bun:

- **Install command**: `npm ci` (preferred) or `npm install`
- **No bun.lockb**: Should not exist in repository
- **package-lock.json**: Present and committed
- **.npmrc**: Configured to force NPM behavior

### Environment Variables (Production + Preview)
Set these in **Cloudflare Pages → Settings → Environment variables**:

**⚠️ CRITICAL: BOTH Production AND Preview environments must have the same variables**

```bash
# Production Environment
VITE_SUPABASE_PROJECT_ID=mzzwhrmciijyuqtfgtgg
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16endocm1jaWlqeXVxdGZndGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjM2MTQsImV4cCI6MjA4NTIzOTYxNH0.TGndaUPj0roEIHdTnEjigM4PVCeUNVzr1zDPYoFkJ-0
VITE_SUPABASE_URL=https://mzzwhrmciijyuqtfgtgg.supabase.co
VITE_USD_IDR_RATE=17000

# Preview Environment (SAME VALUES)
VITE_SUPABASE_PROJECT_ID=mzzwhrmciijyuqtfgtgg
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16endocm1jaWlqeXVxdGZndGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjM2MTQsImV4cCI6MjA4NTIzOTYxNH0.TGndaUPj0roEIHdTnEjigM4PVCeUNVzr1zDPYoFkJ-0
VITE_SUPABASE_URL=https://mzzwhrmciijyuqtfgtgg.supabase.co
VITE_USD_IDR_RATE=17000
```

**⚠️ WARNING:** If Preview environment is missing variables, Preview builds can fail or show runtime error "supabaseUrl is required".

## Deployment Steps

### 1. Connect Repository
1. Go to Cloudflare Pages dashboard
2. Click "Create a project" or "Connect to Git"
3. Select GitHub
4. Authorize and select `tpcglobalcommunity/tpcglobal` repo

### 2. Configure Build
1. **Framework preset**: Select `Vite`
2. **Build command**: `npm run build`
3. **Build output directory**: `dist`
4. **Root directory**: `/` (leave blank for repo root)
5. **Production branch**: `main`

### 3. Add Environment Variables
1. Go to **Settings → Environment variables**
2. Add the 4 VITE_* variables listed above
3. Set scope to **Production** (and Preview if needed)

### 4. Deploy
1. Click "Save and Deploy"
2. Wait for build to complete
3. Test the deployed site

## Important Notes

- ✅ **SPA Routing**: `public/_redirects` included for React Router
- ✅ **Node Version**: `.nvmrc` specifies Node 18
- ✅ **Build Output**: Standard Vite `dist` directory
- ✅ **Base Path**: Set to `/` for root domain deployment
- ✅ **No Secrets**: `.env` never committed
- ✅ **Auto-deploy**: Configured for pushes to `main` branch

## Local Verification Commands

```bash
# Clean install and build
rm -rf node_modules
npm ci
npm run build

# Preview locally
npm run preview
# Visit http://localhost:4173
```

## Post-Deploy Verification Checklist

### ✅ Manual Verification Steps

After deployment, verify the following:

1. **Build Status**: ✅ SUCCESS (no errors)
2. **Production URL**: Open https://presale.pages.dev
3. **Route Testing**: Test both `/id` and `/en` routes
4. **Runtime Check**: Confirm no "supabaseUrl is required" error
5. **BrandLogo**: Verify header/footer logo loads instantly (2.78KB)
6. **Console Clean**: No dev-only logs in production console
7. **Functionality**: All app features work as expected

### 🚨 Common Issues

- **404 on refresh**: Check `_redirects` file in `dist/`
- **Missing env vars**: Verify all VITE_* variables set in both Production & Preview
- **Build fails**: Check Node version compatibility and NPM usage
- **Runtime errors**: Verify Supabase anon key and URL match

## Troubleshooting

- **Build fails**: Check Node version compatibility
- **404 on refresh**: Verify `_redirects` file is in `dist/`
- **Missing env vars**: Ensure all VITE_* variables are set in Cloudflare dashboard
- **Routing issues**: Confirm `base: '/'` in vite.config.ts

## Fallback Configuration

The app includes safe fallbacks:
- Default USD→IDR rate: 17000
- Graceful handling of missing environment variables
- Error boundaries for React components
