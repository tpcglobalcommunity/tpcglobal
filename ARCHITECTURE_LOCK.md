# 🔒 TPC ARCHITECTURE LOCK (FINAL)

Dokumen ini adalah **KUNCI FINAL** arsitektur project TPC.  
SEMUA developer & AI WAJIB mengikuti aturan di bawah ini.  
Pelanggaran = BUG / BUILD FAIL / DEPLOY FAIL.

---

## 1️⃣ ROOT & ALIAS (LOCKED)

- Root source code: `src/` 
- Alias WAJIB: `@/` 
- Semua import ke root `src/*` **WAJIB pakai alias `@/`**

### ✅ BENAR
```ts
import { useI18n } from "@/i18n";
import { Link } from "@/components/Router";
import { supabase } from "@/lib/supabase";
```

### ❌ SALAH (DILARANG KERAS)
```ts
import { useI18n } from "../i18n";
import { Link } from "../components/Router";
import { supabase } from "../../lib/supabase";
```

---

## 2️⃣ ESLINT GUARD (LOCKED)

ESLint memiliki `no-restricted-imports` rule yang AKTIF:
- Akan ERROR jika ada import relatif ke `src/*`
- Error message: "Use @/ alias for src imports (no relative imports to src/*)."

---

## 3️⃣ AUDIT SCRIPT (LOCKED)

Script `scripts/audit-imports.cjs` AKTIF:
- Scan semua `.ts` dan `.tsx` di `src/pages` dan `src/components`
- Build akan FAIL jika ada import relatif ke `src/*`
- Output: `❌ Found X forbidden relative imports. Use @/ alias.`

---

## 4️⃣ AUTO-FIXER (LOCKED)

Command `npm run fix:imports` AKTIF:
- Otomatis ubah `from "../../*"` menjadi `from "@/*"`
- Target folders: `i18n`, `components`, `lib`, `data`, `contexts`, `utils`
- Aman: hanya ubah string import, tidak ubah logic

---

## 5️⃣ CI/CD GUARD (LOCKED)

### GitHub Actions
- File: `.github/workflows/ci.yml` dan `.github/workflows/deploy-cloudflare.yml`
- Steps WAJIB: `npm ci → npm run lint → npm run audit:imports → npm run build`
- Build akan FAIL jika `audit:imports` FAIL

### Cloudflare Pages
- Build command: `npm run lint && npm run audit:imports && npm run build`
- Deploy akan FAIL jika `audit:imports` FAIL

---

## 6️⃣ TESTING & VERIFICATION (LOCKED)

Sebelum commit/push, WAJIB jalankan:
```bash
npm run lint          # ESLint check
npm run audit:imports # Import audit check  
npm run build         # Build check
```

Semua harus PASS dengan exit code 0.

---

## 7️⃣ EXCEPTIONS (LOCKED)

TIDAK ADA EXCEPTION untuk import relatif ke `src/*`.
- Tidak boleh `../i18n`, `../../components`, dll
- Tidak boleh import relatif untuk "hanya 1 file"
- Tidak boleh import relatif untuk "temporary fix"

---

## 8️⃣ CONSEQUENCES (LOCKED)

Jika melanggar aturan import:
- ❌ ESLint error di local development
- ❌ Audit script FAIL
- ❌ CI/CD FAIL
- ❌ Deploy FAIL
- ❌ Build environment variables blocked
- ❌ Production deployment blocked

---

## 9️⃣ MAINTENANCE (LOCKED)

Jika menambah file baru:
1. Gunakan `npm run fix:imports` untuk auto-fix
2. Verify dengan `npm run audit:imports`
3. Commit hanya jika semua checks PASS

---

## 🔟 FINAL LOCK

🔒 **ARCHITECTURE LOCKED** 🔒
- Tidak boleh menonaktifkan ESLint rule
- Tidak boleh menghapus audit script
- Tidak boleh mengubah CI/CD steps
- Tidak boleh menghapus auto-fixer
- Tidak boleh menambah exception

**SEMUA ATURAN DI ATAS ADALAH FINAL DAN TIDAK DAPAT DIUBAH.**

---

*Created: 2026-01-25*  
*Status: LOCKED FOREVER*  
*Enforcement: ESLint + Audit Script + CI/CD + Auto-Fixer*
