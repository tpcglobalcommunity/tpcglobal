# BOOTSTRAP TRIGGER TESTING - TPC SIGNUP BLOCKER RESOLUTION

## 🎯 TUJUAN
Mengidentifikasi dan memperbaiki script bootstrap super-admin yang mungkin menyebabkan signup user biasa gagal dengan error 500.

---

## 🔍 LANGKAH DIAGNOSIS

### **Step 1: Audit Trigger Bootstrap**
**Jalankan di Supabase SQL Editor:**
```sql
-- Copy-paste AUDIT-BOOTSTRAP-TRIGGERS.sql
```

**Yang dicari:**
- ✅ Trigger dengan nama mengandung 'bootstrap', 'admin', atau 'super'
- ✅ Function yang terkait script bootstrap
- ✅ Trigger yang mungkin melakukan insert ke profiles dengan constraint NOT NULL

### **Step 2: Non-aktifkan Trigger Berbahaya**
**Jalankan di Supabase SQL Editor:**
```sql
-- Copy-paste DISABLE-BOOTSTRAP-TRIGGERS.sql
```

**Yang dilakukan:**
- ✅ Disable semua trigger yang berbahaya
- ✅ Enable fail-open trigger yang aman
- ✅ Verifikasi status trigger

---

## 🧪 TESTING SCENARIOS

### **Scenario A: Sebelum Fix**
**Expected Behavior:**
- ❌ Signup user biasa gagal dengan 500 error
- ❌ Console menunjukkan "AuthApiError: Database error saving new user"
- ❌ UI menunjukkan "Failed to create account. Please try again."

### **Scenario B: Setelah Fix**
**Expected Behavior:**
- ✅ Signup user biasa berhasil tanpa 500 error
- ✅ Console menunjukkan `[SIGNUP_API] Success`
- ✅ UI menunjukkan "Check your email"
- ✅ User berhasil dibuat di auth.users

---

## 📊 TESTING INSTRUCTIONS

### **Test Data:**
```
Email: test@example.com
Password: Test123456!
Full Name: Test User
Username: testuser
Referral: TPC-BOOT01
```

### **Step 1: Pre-Fix Test**
1. **Buka browser** → Developer Tools → Console
2. **Coba signup** dengan data di atas
3. **Screenshot error** → Simpan sebagai bukti
4. **Catat error detail** → Status, code, message

### **Step 2: Execute Audit SQL**
1. **Jalankan AUDIT-BOOTSTRAP-TRIGGERS.sql**
2. **Screenshot hasil query** → Trigger yang ditemukan
3. **Catat nama trigger** → Untuk dokumentasi

### **Step 3: Execute Disable SQL**
1. **Jalankan DISABLE-BOOTSTRAP-TRIGGERS.sql**
2. **Screenshot hasil** → Trigger yang dinon-aktifkan
3. **Verifikasi notice** → "Bootstrap/Admin triggers disabled"

### **Step 4: Post-Fix Test**
1. **Buka browser** → Developer Tools → Console
2. **Coba signup** dengan data yang sama
3. **Screenshot success** → UI "Check your email"
4. **Screenshot console** → `[SIGNUP_API] Success`

---

## 🔍 TROUBLESHOOTING

### **Jika Masih Gagal Setelah Fix:**

#### **Kemungkinan 1: Masih Ada Trigger Lain**
```sql
-- Cek semua trigger yang aktif
SELECT tgname, pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal
  AND t.tgenabled = true;
```

#### **Kemungkinan 2: Constraint Profiles Masih Ketat**
```sql
-- Cek constraint yang masih NOT NULL
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
  AND is_nullable = 'NO'
  AND column_name NOT IN ('id', 'email', 'created_at', 'updated_at');
```

#### **Kemungkinan 3: Function Bootstrap Masih Aktif**
```sql
-- Cek function yang masih aktif
SELECT proname, prosrc
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    LOWER(prosrc) LIKE '%bootstrap%'
    OR LOWER(prosrc) LIKE '%admin%'
    OR LOWER(prosrc) LIKE '%super%'
  );
```

---

## 📋 DOCUMENTATION

### **Yang Perlu Dicatat:**
1. **Nama trigger bootstrap** yang ditemukan
2. **Function yang terkait** dan source code-nya
3. **Constraint yang dilanggar** (jika ada)
4. **Error message spesifik** yang muncul
5. **Langkah yang diambil** untuk fix

### **Yang Perlu Diperbaiki:**
1. **Non-aktifkan trigger** yang menyebabkan 500
2. **Modifikasi function** agar tidak mengganggu signup biasa
3. **Tambah parameter** untuk mengontrol eksekusi script
4. **Test kembali** untuk memastikan fix berhasil

---

## 🚀 DEPLOYMENT CHECKLIST

### **✅ Sebelum Deploy:**
- [ ] Audit trigger selesai dijalankan
- [ ] Trigger berbahaya sudah dinon-aktifkan
- [ ] Signup user biasa berhasil tanpa 500
- [ ] Console menunjukkan success
- [ ] UI menunjukkan "Check your email"

### **✅ Setelah Fix:**
- [ ] Commit perubahan SQL
- [ ] Update dokumentasi bootstrap
- [ ] Deploy ke production
- [ ] Monitor signup performance
- [ ] Test dengan user real

---

## 🎯 SUCCESS CRITERIA

### **✅ Fix Berhasil Jika:**
- Tidak ada 500 error saat signup user biasa
- User berhasil dibuat di auth.users
- UI menunjukkan success state
- Console menunjukkan `[SIGNUP_API] Success`
- Trigger bootstrap tidak mengganggu signup biasa

### **❌ Fix Gagal Jika:**
- Masih ada 500 error setelah fix
- Trigger bootstrap masih aktif
- Signup user biasa masih gagal
- Masih ada constraint violation

---

**Eksekusi langkah di atas secara berurutan untuk mengidentifikasi dan memperbaiki root cause! 🎯**
