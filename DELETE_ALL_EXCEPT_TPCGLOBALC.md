# 🗑️ DELETE ALL PROJECTS EXCEPT tpcglobalc
## 🚨 HAPUS SEMUA: tpcglobal, tpcglobalz, tpc

---

## 🎯 TARGET FINAL STATE
**HANYA SATU PROJECT YANG BOLEH TINGGAL:**
- ✅ **tpcglobalc** - PRODUCTION UTAMA

**SEMUA PROJECT LAIN HARUS DIHAPUS:**
- ❌ **tpcglobal** - DELETE
- ❌ **tpcglobalz** - DELETE  
- ❌ **tpc** - DELETE

---

## 🔧 STEP-BY-STEP COMPLETE DELETION

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
📍 Klik project: tpcglobal
📍 Settings → General
🔻 Scroll ke bawah → "Delete project"
🔻 Confirm deletion
🗑️ Project akan terhapus permanen
```

### **4️⃣ HAPUS tpc**
```
📍 Klik project: tpc
📍 Settings → General
🔻 Scroll ke bawah → "Delete project"
🔻 Confirm deletion
🗑️ Project akan terhapus permanen
```

### **5️⃣ VERIFIKASI HANYA tpcglobalc YANG TERSISA**
```
🔍 Pastikan hanya tpcglobalc yang ada
🔍 Pastikan hanya tpcglobalc yang punya custom domain
🔍 Pastikan hanya tpcglobalc yang auto-deploy
🔍 Pastikan tidak ada project "tpc" lainnya
```

---

## 🔐 PASTIKAN tpcglobalc SIAP

### **ENVIRONMENT VARIABLES (PRODUCTION):**
```
📍 tpcglobalc → Settings → Environment variables → Production
🔧 SET (HANYA INI):
VITE_SUPABASE_URL = https://watoxiwtdnkpxdirkvvf.supabase.co
VITE_SUPABASE_ANON_KEY = (anon key dari Supabase watox...)

🗑️ HAPUS semua env lama yang menunjuk ke Supabase lain
🗑️ HAPUS env yang outdated
```

### **CUSTOM DOMAIN:**
```
📍 tpcglobalc → Custom domains
🎯 tpcglobal.io → tpcglobalc
🎯 www.tpcglobal.io → tpcglobalc
🎯 Semua subdomain → tpcglobalc
🗑️ PASTIKAN tidak ada custom domain di project lain (sudah dihapus)
```

### **GITHUB INTEGRATION:**
```
📍 tpcglobalc → Settings → GitHub
🎯 Connected to: ekodaeng/tpcglobal
🎯 Branch: main
🎯 Auto-deploy: ON
```

---

## 🚀 DEPLOYMENT SEQUENCE SETELAH CLEANUP

### **1️⃣ VERIFIKASI FINAL STATE:**
```
✅ tpcglobalz: DELETED
✅ tpcglobal: DELETED
✅ tpc: DELETED
✅ Hanya tpcglobalc yang tersisa
✅ Hanya tpcglobalc yang punya custom domain
✅ Hanya tpcglobalc yang auto-deploy
```

### **2️⃣ RUN SQL MIGRATION:**
```
🔗 Buka: https://watoxiwtdnkpxdirkvvf.supabase.co
📍 SQL Editor
📋 Copy-paste: supabase/sql/FINAL_APP_SETTINGS_MIGRATION.sql
▶️ Run/Execute
✅ Lihat NOTICE messages
```

### **3️⃣ TRIGGER DEPLOY:**
```
📍 tpcglobalc → Deployments → Retry deployment
🌐 Atau: git commit --allow-empty -m "clean deploy tpcglobalc"
```

### **4️⃣ VERIFICATION:**
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

### **✅ CLOUDFLARE PAGES PROJECT LIST:**
```
📋 Sebelum Deletion:
   - tpcglobalc ✅ (KEEP)
   - tpcglobalz ❌ (DELETE)
   - tpcglobal ❌ (DELETE)
   - tpc ❌ (DELETE)

📋 Setelah Deletion:
   - tpcglobalc ✅ (ACTIVE, PRODUCTION)
   - tpcglobalz ❌ (DELETED)
   - tpcglobal ❌ (DELETED)
   - tpc ❌ (DELETED)
```

### **✅ DOMAIN CONFIGURATION:**
```
📋 Hanya tpcglobalc yang punya custom domain:
   - tpcglobal.io → tpcglobalc ✅
   - www.tpcglobal.io → tpcglobalc ✅
   - Subdomain lain → tpcglobalc ✅
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

## 🚨 WARNING: PASTIKAN TIDAK ADA PROJECT TERSISA

### **❌ YANG HARUS DIHINDARI:**
```
❌ Ada project "tpc" lain yang tersisa
❌ Ada project "tpcglobal" yang tersisa
❌ Ada project "tpcglobalz" yang tersisa
❌ Custom domain di project yang sudah dihapus
❌ Auto-deploy di project yang sudah dihapus
❌ Environment variables di project yang sudah dihapus
```

### **✅ YANG HARUS DIPASTIKAN:**
```
✅ Hanya tpcglobalc yang ada di Workers & Pages
✅ Hanya tpcglobalc yang punya custom domain
✅ Hanya tpcglobalc yang auto-deploy
✅ Hanya tpcglobalc yang punya env vars
✅ Tidak ada project "tpc" lainnya
```

---

## 📋 FINAL CHECKLIST

### **🗑️ COMPLETE DELETION:**
- [ ] tpcglobalz: DELETED
- [ ] tpcglobal: DELETED
- [ ] tpc: DELETED
- [ ] Hanya tpcglobalc yang tersisa
- [ ] Tidak ada project "tpc" lainnya

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

## 🎯 KEUNTUNGAN COMPLETE CLEANUP

### **✅ ZERO CONFUSION:**
- Hanya satu project yang deploy
- Hanya satu set env vars
- Hanya satu domain configuration
- Tidak ada kebingungan sama sekali

### **✅ PREDICTABLE DEPLOYMENT:**
- Setiap push ke main = deploy ke tpcglobalc
- Tidak ada deployment ke project salah
- Tidak ada env vars yang tidak sinkron
- Debugging super mudah

### **✅ MAINTENANCE SIMPLE:**
- Hanya satu project yang perlu dimonitor
- Hanya satu env vars yang perlu dicek
- Hanya satu deployment log yang perlu dilihat

---

## 🚨 IMMEDIATE EXECUTION REQUIRED

### **🔥 LAKUKAN SEKARANG:**
1. **Buka Cloudflare Dashboard**
2. **Hapus tpcglobalz**
3. **Hapus tpcglobal**
4. **Hapus tpc**
5. **Pastikan hanya tpcglobalc tersisa**
6. **Set env vars di tpcglobalc**
7. **Run SQL migration**
8. **Trigger deploy**
9. **Verify deployment success**

---

## 🤖 WINDSURF CODING AGENT NOTES

**Complete cleanup akan menghilangkan SEMUA deployment confusion:**
- ✅ Tidak ada project lain yang deploy
- ✅ Tidak ada env vars lain yang membingungkan
- ✅ Tidak ada domain lain yang salah arah
- ✅ Hanya satu sumber kebenaran (tpcglobalc)

**Setelah cleanup, deployment akan 100% predictable dan tidak ada lagi error!** 🚀
