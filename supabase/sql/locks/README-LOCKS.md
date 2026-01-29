# 🚨 PRODUCTION LOCK SAFETY NOTICE

## ⚠️ IMPORTANT: LOCALHOST/STAGING ONLY

Semua file dalam folder `/locks` ini **HANYA** untuk:
- ✅ **LOCALHOST** development
- ✅ **STAGING** environment testing
- ❌ **NOT FOR PRODUCTION** use

## 🚫 PRODUCTION GATE REQUIREMENTS

Untuk menjalankan script ini di **PRODUCTION**, wajib:

### 1. Manual Unlock Process
- [ ] Review setiap line code
- [ ] Backup database production
- [ ] Test di staging terlebih dahulu
- [ ] Dapatkan approval dari Tech Lead
- [ ] Hapus blok `PROD GATE` secara manual
- [ ] Jalankan dengan monitoring penuh

### 2. Checklist Before Production
- [ ] Schema changes validated
- [ ] Data integrity confirmed
- [ ] Rollback plan prepared
- [ ] Performance impact assessed
- [ ] Security review completed

### 3. Emergency Contact
Jika ada issues di production:
- Immediate rollback required
- Contact database administrator
- Document all changes made

## 📁 File Categories

### Guardrails
- `invoice-lock-guardrails.sql` - Schema validation guards
- `data-integrity-checks.sql` - Data validation rules

### Validation
- `invoice-prod-lock-validate.sql` - Audit validation queries
- `test-invoice-data.sql` - Test data generation

### Migration
- `migrate-prod-lock.sql` - Safe migration scripts

## 🔒 Safety Mechanisms

1. **PROD GATE blocks** - Prevent accidental production execution
2. **Validation checks** - Ensure data integrity
3. **Rollback scripts** - Quick recovery options
4. **Audit logging** - Track all changes

---

**⚠️ WARNING: Never run these scripts in production without following the unlock process above.**
