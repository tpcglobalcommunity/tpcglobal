# 🎯 FOCUS DEPLOYMENT: tpcglobalc SAJA
## 🗑️ HAPUS PROJECT LAIN - FOCUS KE tpcglobalc

---

## 🚨 KRITIS: HANYA tpcglobalc YANG BOLEH DEPLOY

**Project lain harus dihapus/nonaktif untuk menghindari kebingungan deployment!**

---

## 📋 DAFTAR PROJECT CLOUDFLARE PAGES

### 🎯 **TARGET (HANYA INI):**
- ✅ **tpcglobalc** - PRODUCTION UTAMA
- ✅ Domain: tpcglobal.io
- ✅ Repo: ekodaeng/tpcglobal
- ✅ Branch: main

### 🗑️ **YANG HARUS DIHAPUS:**
- ❌ **tpcglobalz** - HAPUS/Nonaktif
- ❌ **tpcglobal** - HAPUS/Nonaktif

---

## 🔧 STEP-BY-STEP: HAPUS PROJECT LAIN

### **1️⃣ BUKA CLOUDFLARE DASHBOARD**
```
🔗 https://dash.cloudflare.com/
📍 Workers & Pages
🔍 Lihat semua project dengan keyword "tpc"
```

### **2️⃣ HAPUS tpcglobalz**
```
📍 Klik project: tpcglobalz
📍 Settings → General
🔻 Scroll ke bawah → "Delete project"
🔻 Confirm deletion
🗑️ Project akan terhapus permanen
```

### **3️⃣ HAPUS tpcglobal**
```
📍 Klik project: tpcglobalz
📍 Settings → General
🔻 Scroll ke bawah → "Delete project"
🔻 Confirm deletion
🗑️ Project akan terhapus permanen
```

### **4️⃣ VERIFIKASI HANYA tpcglobalc YANG TERSISA**
```
🔍 Pastikan hanya tpcglobalc yang ada
🔍 Pastikan hanya tpcglobalc yang punya custom domain
🔍 Pastikan hanya tpcglobalc yang auto-deploy
```

---

## 🔐 SET tpcglobalc SEBAGAI PRODUCTION UTAMA

### **1️⃣ KONFIGURASI tpcglobalc**
```
📍 Klik project: tpcglobalc
📍 Settings → General
🎯 Project name: tpcglobalc
🎯 Production branch: main
🎯 Build command: npm ci && npm run build
🎯 Build output directory: dist
```

### **2️⃣ ENVIRONMENT VARIABLES (PRODUCTION)**
```
📍 Settings → Environment variables → Production
🔧 SET (HANYA INI):
VITE_SUPABASE_URL = https://watoxiwtdnkpxdirkvvf.supabase.co
VITE_SUPABASE_ANON_KEY = (anon key dari Supabase watox...)

🗑️ HAPUS env lama yang menunjuk ke Supabase lain
🗑️ HAPUS env yang outdated
```

### **3️⃣ CUSTOM DOMAIN**
```
📍 Custom domains
🎯 tpcglobal.io → tpcglobalc
🎯 www.tpcglobal.io → tpcglobalc
🎯 Subdomain lain → tpcglobalc
🗑️ HAPUS custom domain dari project lain (jika masih ada)
```

---

## 🚀 DEPLOYMENT SEQUENCE SETELAH FOCUS

### **1️⃣ PASTIKAN HANYA tpcglobalc**
```
✅ tpcglobalz: DELETED
✅ tpcglobal: DELETED
✅ Hanya tpcglobalc yang tersisa
✅ Hanya tpcglobalc yang punya custom domain
```

### **2️⃣ RUN SQL MIGRATION**
```
🔗 Buka: https://watoxiwtdnkpxdirkvvf.supabase.co
📍 SQL Editor
📋 Copy-paste: supabase/sql/FINAL_APP_SETTINGS_MIGRATION.sql
▶️ Run/Execute
```

### **3️⃣ TRIGGER DEPLOY**
```
📍 tpcglobalc → Deployments → Retry deployment
🌐 Atau: git commit --allow-empty -m "trigger deploy tpcglobalc"
```

### **4️⃣ VERIFICATION**
```
🌐 Buka: https://tpcglobal.io/en/home
🔍 Hard refresh: Ctrl + Shift + R
📍 DevTools → Console
🔍 Lihat: [SUPABASE_URL] https://watoxiwtdnkpxdirkvvf.supabase.co

📍 DevTools → Network
🔍 Filter: "app_settings"
🎯 Expected: 200 OK (bukan 404)
```

---

## 🎯 EXPECTED FINAL STATE

### **✅ CLOUDFLARE PAGES:**
```
📋 Project List:
   - tpcglobalc ✅ (ACTIVE, PRODUCTION)
   - tpcglobalz ❌ (DELETED)
   - tpcglobal ❌ (DELETED)

📋 Domain Configuration:
   - tpcglobal.io → tpcglobalc ✅
   - www.tpcglobal.io → tpcglobalc ✅
   - Subdomain lain → tpcglobalc ✅
```

### **✅ DEPLOYMENT CONFIGURATION:**
```
📋 tpcglobalc:
   - Repository: ekodaeng/tpcglobal ✅
   - Branch: main ✅
   - Build command: npm ci && npm run build ✅
   - Output directory: dist ✅
   - Auto-deploy: ON ✅
   - Environment variables: Correct ✅
```

### **✅ VERIFICATION RESULTS:**
```
🌐 Network Requests:
   - POST /rest/v1/rpc/get_app_settings → 200 OK ✅
   - Response: {"maintenance_mode": false, "site_name": "TPC Global"} ✅
   - No 404 errors ✅

🔍 Console Logs:
   - [SUPABASE_URL] https://watoxiwtdnkpxdirkvvf.supabase.co ✅
   - No profiles.status errors ✅
   - No TypeScript errors ✅
```

---

## 🚨 WARNING: JANGAN DEPLOY KE PROJECT LAIN

### **❌ YANG HARUS DIHINDARI:**
```
❌ Deploy ke tpcglobalz (sudah dihapus)
❌ Deploy ke tpcglobal (sudah dihapus)
❌ Environment variables di project lain
❌ Custom domain di project lain
❌ Auto-deploy di project lain
```

### **✅ YANG HARUS DILAKUKAN:**
```
✅ Hanya deploy ke tpcglobalc
✅ Hanya set env di tpcglobalc
✅ Hanya custom domain di tpcglobalc
✅ Hanya auto-deploy di tpcglobalc
```

---

## 📋 FINAL CHECKLIST

### **🗑️ PROJECT DELETION:**
- [ ] tpcglobalz: DELETED
- [ ] tpcglobal: DELETED
- [ ] Hanya tpcglobalc yang tersisa

### **🔧 tpcglobalc CONFIGURATION:**
- [ ] Repository: ekodaeng/tpcglobal
- [ ] Branch: main
- [ ] Build command: npm ci && npm run build
- [ ] Output directory: dist
- [ ] Auto-deploy: ON

### **🔐 ENVIRONMENT VARIABLES:**
- [ ] VITE_SUPABASE_URL = watoxiwtdnkpxdirkvvf.supabase.co
- [ ] VITE_SUPABASE_ANON_KEY = anon key benar
- [ ] Tidak ada env lama yang salah

### **🌐 VERIFICATION:**
- [ ] tpcglobal.io → tpcglobalc
- [ ] Network requests → 200 OK
- [ ] Console shows correct URL
- [ ] No 404 errors

---

## 🎯 KEUNTUNGAN FOCUS KE tpcglobalc

### **✅ SINGLE SOURCE OF TRUTH:**
- Hanya satu project yang deploy
- Hanya satu set env vars
- Hanya satu domain configuration
- Tidak ada kebingungan lagi

### **✅ DEPLOYMENT PREDICTABLE:**
- Setiap push ke main = deploy ke tpcglobalc
- Tidak ada deployment ke project salah
- Tidak ada env vars yang tidak sinkron
- Debugging jauh lebih mudah

### **✅ MAINTENANCE MUDAH:**
- Hanya satu project yang perlu dimonitor
- Hanya satu env vars yang perlu dicek
- Hanya satu deployment log yang perlu dilihat

---

## 🚀 FINAL ACTION

### **🔥 EXECUTE SEKARANG:**
1. **Buka Cloudflare Dashboard**
2. **Hapus tpcglobalz dan tpcglobal**
3. **Pastikan hanya tpcglobalc yang tersisa**
4. **Set env vars di tpcglobalc**
5. **Run SQL migration**
6. **Trigger deploy**
7. **Verify deployment success**

---

## 🤖 WINDSURF CODING AGENT NOTES

**Fokus ke tpcglobalc akan menghilangkan semua deployment confusion:**
- ✅ Tidak ada deployment ke project salah
- ✅ Tidak ada env vars yang tidak sinkron
- ✅ Tidak ada domain yang salah arah
- ✅ Debugging jauh lebih mudah

**Setelah fokus, setiap push ke main akan selalu deploy ke tpcglobalc!** 🚀
