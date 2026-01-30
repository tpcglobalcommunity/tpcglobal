# Cloudflare Pages Deployment Configuration

## Repository
- **Repo**: https://github.com/tpcglobalcommunity/tpcglobal
- **Project**: presale
- **Dashboard**: https://dash.cloudflare.com/dbe0f0939a2e26ff627e7ddfe2ee622d/pages/view/presale

## Cloudflare Pages Settings

### Build Configuration
Go to **Cloudflare Pages → Settings → Builds & deployments**:

- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (repository root)
- **Node version**: `18` (via .nvmrc)

### Environment Variables (Production)
Set these in **Cloudflare Pages → Settings → Environment variables**:

```bash
VITE_SUPABASE_PROJECT_ID=mzzwhrmciijyuqtfgtgg
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16endocm1jaWlqeXVxdGZndGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjM2MTQsImV4cCI6MjA4NTIzOTYxNH0.TGndaUPj0roEIHdTnEjigM4PVCeUNVzr1zDPYoFkJ-0
VITE_SUPABASE_URL=https://mzzwhrmciijyuqtfgtgg.supabase.co
VITE_USD_IDR_RATE=17000
```

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
