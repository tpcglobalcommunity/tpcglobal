# 🚨 DEPLOYMENT LOCK GUIDE - TPC GLOBAL
## 🔒 KUNCI PRODUKSI KE tpcglobalc SAJA

---

## 📋 KONTEKS & TARGET
- **Project Produksi:** `tpcglobalc` (HANYA INI!)
- **Domain Produksi:** `tpcglobal.io` (dan semua subdomain)
- **Repo GitHub:** `ekodaeng/tpcglobal`
- **Supabase Benar:** `https://watoxiwtdnkpxdirkvvf.supabase.co`
- **Branch Produksi:** `main`

---

## 🔧 STEP 1: AUDIT CLOUDFLARE PAGES

### 1.1 Buka Cloudflare Dashboard
```
🔗 https://dash.cloudflare.com/
📍 Workers & Pages
```

### 1.2 Identifikasi Semua Project
```
📋 Cari project dengan keyword "tpc"
🎯 Target: tpcglobalz, tpcglobal, tpcglobalc
```

### 1.3 Check Custom Domain Assignment
```
🔍 Untuk setiap project:
   - Klik project → Custom domains
   - Catat domain yang terhubung
   
🎯 Expected:
   - tpcglobalc: tpcglobal.io, www.tpcglobal.io, dll
   - tpcglobalz: (seharusnya tidak ada custom domain)
   - tpcglobal: (seharusnya tidak ada custom domain)
```

### 1.4 Remove Custom Domain dari Project Lain
```
⚠️ UNTUK tpcglobalz & tpcglobal:
   - Klik project → Custom domains
   - Remove semua custom domain
   - Confirm removal
```

### 1.5 Nonaktifkan/Hapus Project Lain
```
🛡️ Opsi 1 (AMAN): Nonaktifkan Auto-deploy
   - Klik project → Settings
   - Builds and deployments
   - Turn OFF "Deploy on every push"
   
🛡️ Opsi 2 (EKSTREM): Hapus project
   - Klik project → Settings
   - Delete project
   - Confirm deletion
```

---

## 🔧 STEP 2: KUNCI GITHUB INTEGRATION

### 2.1 Pastikan Hanya tpcglobalc Terhubung
```
📍 Buka project tpcglobalc
📍 Settings → GitHub
🎯 Verify:
   - Connected to: ekodaeng/tpcglobal
   - Branch: main
   - Auto-deploy: ON
```

### 2.2 Build Configuration
```
📍 Settings → Builds and deployments
🎯 Verify:
   - Build command: `npm ci && npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (default)
```

### 2.3 Production Branch
```
📍 Settings → Builds and deployments → Production branch
🎯 Set: `main`
```

---

## 🔧 STEP 3: ENVIRONMENT VARIABLES LOCK

### 3.1 Set Production Env (tpcglobalc)
```
📍 Settings → Environment variables → Production
🔧 Add/Update:
   - VITE_SUPABASE_URL = https://watoxiwtdnkpxdirkvvf.supabase.co
   - VITE_SUPABASE_ANON_KEY = (ambil dari Supabase watox...)
   
🔧 Remove env lama yang menunjuk ke Supabase lain:
   - Hapus env yang mengandung URL supabase lain
   - Hapus env yang outdated
```

### 3.2 Preview Environment (Opsional)
```
📍 Settings → Environment variables → Preview
🔧 Samakan dengan Production ATAU matikan:
   - Opsi 1: Samakan semua env
   - Opsi 2: Matikan preview deployments
```

---

## 🔧 STEP 4: TRIGGER DEPLOY BERSIH

### 4.1 Clear Cache & Redeploy
```
📍 Deployments → Retry deployment
🎯 Atau:
   - Push commit kecil: `git commit --allow-empty -m "trigger redeploy"`
   - Git push
```

### 4.2 Verify Deployment
```
🌐 Buka: https://tpcglobal.io
🔍 DevTools → Network:
   - Cari request ke Supabase
   - Verify URL: watoxiwtdnkpxdirkvvf.supabase.co
   
🔍 DevTools → Console:
   - Tidak ada error Supabase
   - Tidak ada 404 RPC
```

### 4.3 Clear Browser Cache
```
🧹 Hard reload: Ctrl+F5
🧹 Atau Incognito mode
🧹 Atau Clear storage:
   - DevTools → Application → Storage
   - Clear site data
```

---

## 🔧 STEP 5: SUPABASE VERIFICATION

### 5.1 Run SQL Final (jika belum)
```
🗄️ Buka: https://watoxiwtdnkpxdirkvvf.supabase.co
📍 SQL Editor
📋 Copy-paste: supabase/sql/AG3_FINAL_SQL.sql
▶️ Run
✅ Verify NOTICE messages
```

### 5.2 Test RPC Function
```
🌐 Buka: https://tpcglobal.io
🔍 Console:
   supabase.rpc("get_app_settings").then(console.log)
   
🎯 Expected: Object response, bukan 404
```

---

## ✅ FINAL VERIFICATION CHECKLIST

### 🌐 Domain Configuration
- [ ] tpcglobal.io → tpcglobalc
- [ ] www.tpcglobal.io → tpcglobalc
- [ ] Subdomain lain → tpcglobalc
- [ ] tpcglobalz tidak punya custom domain
- [ ] tpcglobal tidak punya custom domain

### 🚀 Deployment Configuration
- [ ] Hanya tpcglobalc yang auto-deploy
- [ ] tpcglobalc connected ke ekodaeng/tpcglobal
- [ ] Branch production: main
- [ ] Build command: `npm ci && npm run build`
- [ ] Output directory: `dist`

### 🔐 Environment Variables
- [ ] VITE_SUPABASE_URL = watoxiwtdnkpxdirkvvf.supabase.co
- [ ] VITE_SUPABASE_ANON_KEY = anon key benar
- [ ] Tidak ada env Supabase lama
- [ ] Preview env sama atau dimatikan

### 🌐 Network Verification
- [ ] Request Supabase → watoxiwtdnkpxdirkvvf.supabase.co
- [ ] Tidak ada request ke Supabase lain
- [ ] get_app_settings RPC → 200 OK
- [ ] Tidak ada 404 errors
- [ ] Bundle JS terbaru (check hash)

### 🗄️ Supabase Objects
- [ ] app_settings table EXISTS
- [ ] is_public column EXISTS
- [ ] get_app_settings function EXISTS
- [ ] RLS policy EXISTS
- [ ] RPC test SUCCESS

---

## 🚨 OUTPUT WAJIB DI AKHIR

### Konfirmasi Deployment Lock
```
✅ "Produksi sudah dikunci ke tpcglobalc"
```

### Project yang Dihapus/Nonaktif
```
🗑️ tpcglobalz: (dihapus/nonaktif)
🗑️ tpcglobal: (dihapus/nonaktif)
```

### Verification Results
```
🌐 Domain tpcglobal.io → tpcglobalc ✅
🌐 Network Supabase → watoxiwtdnkpxdirkvvf.supabase.co ✅
🌐 RPC get_app_settings → 200 OK ✅
```

---

## 🎯 KEUNTUNGAN SETELAH LOCK

### ✅ Single Source of Truth
- Hanya satu project yang deploy
- Hanya satu set env vars
- Hanya satu domain configuration

### ✅ Tidak Ada Lagi Kebingungan
- Tidak ada deployment ke project salah
- Tidak ada env vars yang salah
- Tidak ada domain yang salah arah

### ✅ Debugging Mudah
- Error selalu dari project yang sama
- Network request selalu ke Supabase yang sama
- Cache issue lebih mudah diidentifikasi

---

## 🤖 WINDSURF CODING AGENT NOTES

**Deployment lock ini akan menghindari:**
- Deploy ke project yang salah
- Env vars yang tidak sinkron
- Domain yang salah arah
- Debugging yang membingungkan

**Setelah lock, setiap push ke main akan selalu deploy ke tpcglobalc dengan env yang benar!** 🚀
