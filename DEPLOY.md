# 🚀 DEPLOY INSTRUCTIONS - TPC GLOBAL

## 📋 DEPLOY UTAMA (RECOMMENDED)

### Git Push Auto-Deploy
```bash
git add .
git commit -m "your commit message"
git push origin main
```

**Result:** Cloudflare Pages auto-build & auto-deploy ke `tpcglobalc`

---

## ⚠️ MANUAL DEPLOY (DARURAT SAJA)

### Hanya jika auto-deploy gagal:
```bash
npm run deploy:tpcglobalc
```

**Atau manual step-by-step:**
```bash
npm run build
npx wrangler pages deploy dist --project-name tpcglobalc
```

---

## ❌ DILARANG KERAS

- ❌ **JANGAN** create new Cloudflare Pages project
- ❌ **JANGAN** deploy tanpa `--project-name tpcglobalc`
- ❌ **JANGAN** ubah domain alias (`tpcglobal.io`, `www.tpcglobal.io`)
- ❌ **JANGAN** ubah branch default (tetap `main`)
- ❌ **JANGAN** login GitHub dengan akun selain `ekodaeng`

---

## 🎯 TARGET PROJECT

- **Project Name:** `tpcglobalc` (HANYA INI!)
- **Domain:** `https://tpcglobal.io`
- **Branch:** `main`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 🔐 DEPLOY SAFETY

### Pre-Deploy Check
```bash
npm run deploy:tpcglobalc  # Otomatis cek project name
```

### Force Check Manual
```bash
npm run predeploy:tpcglobalc
```

---

## 🌐 URL PRODUCTION

- **Production:** `https://tpcglobal.io`
- **Preview:** `https://tpcglobal.io` (auto-update dari git push)

---

## 📞 TROUBLESHOOTING

### Error: "Create a new project"
- Pilih: **"Use an existing project"**
- Pilih: **`tpcglobalc`**

### Error: "Select GitHub account"
- Pilih: **`ekodaeng`**
- Repository: **`ekodaeng/tpcglobal`**

### Error: "Project not found"
- Pastikan login dengan akun yang benar
- Pastikan nama project: `tpcglobalc`

---

## 🎉 DEPLOY SUCCESS

✅ **Deploy selesai** → Cek `https://tpcglobal.io`  
✅ **Build sukses** → No error di console  
✅ **Signup normal** → No React hooks error  
✅ **Maintenance flag** → Konsisten dan akurat  

---

*Last updated: 2026-01-23*  
*Project: TPC Global*  
*Deploy target: tpcglobalc*
