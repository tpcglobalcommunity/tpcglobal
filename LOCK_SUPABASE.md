# 🔒 SUPABASE CONFIGURATION LOCK - TPC GLOBAL

## 📋 PRODUCTION LOCK STATUS

**Status:** 🔒 LOCKED FOR PRODUCTION  
**Date:** 2026-01-23  
**Project:** TPC Global (Supabase + React + Vite)

---

## 🚨 STRICT LOCK RULES

### ❌ FORBIDDEN OPERATIONS
- ❌ **DO NOT** modify function signatures
- ❌ **DO NOT** change table schemas
- ❌ **DO NOT** alter RLS policies
- ❌ **DO NOT** drop/rename functions
- ❌ **DO NOT** modify authentication settings
- ❌ **DO NOT** change database URL or keys
- ❌ **DO NOT** deploy without code review

### ✅ ALLOWED OPERATIONS
- ✅ **READ ONLY** operations for debugging
- ✅ **Data seeding** in development environment
- ✅ **Performance monitoring**
- ✅ **Backup operations**
- ✅ **Security audits**

---

## 🔧 LOCKED CONFIGURATIONS

### 1. Authentication
```sql
-- Email Provider: ENABLED
-- Disable new user signups: OFF
-- Site URL: https://tpcglobal.io
-- Redirect URLs: https://tpcglobal.io/*
```

### 2. RPC Functions
```sql
-- Function: validate_referral_code_public(p_code text)
-- Schema: public
-- Security: SECURITY DEFINER
-- Permissions: GRANT EXECUTE TO anon, authenticated
-- Logic: EXISTS check on public.profiles (case-insensitive)
```

### 3. Tables (READ ONLY)
```sql
-- public.profiles (user data + referral codes)
-- public.app_settings (system configuration)
-- RLS: ENABLED with proper policies
```

### 4. Environment Variables
```bash
VITE_SUPABASE_URL=🔒LOCKED
VITE_SUPABASE_ANON_KEY=🔒LOCKED
```

---

## 📁 DIRECTORY STRUCTURE

```
/supabase/
├── /migrations/        🔒 LOCKED - Do not modify
├── /seed/             🔒 LOCKED - Do not modify  
├── /policies/         🔒 LOCKED - Do not modify
├── /functions/        🔒 LOCKED - Do not modify
└── LOCK_SUPABASE.md    ✅ This file
```

---

## 🔄 DEPLOYMENT PROCESS

### Pre-Deployment Checklist
- [ ] Code review completed
- [ ] All tests passing
- [ ] Backup created
- [ ] Staging environment verified
- [ ] Rollback plan ready

### Deployment Commands
```bash
# ONLY run these with proper authorization
npm run build
npm run deploy:staging
npm run deploy:production
```

---

## 🚨 EMERGENCY PROCEDURES

### If Authentication Fails
1. Check Supabase Dashboard status
2. Verify environment variables
3. Review recent changes
4. Contact database administrator

### If RPC Functions Fail
1. Check function permissions
2. Verify SECURITY DEFINER setting
3. Review error logs
4. Use backup function if available

### Data Recovery
```sql
-- ONLY with proper authorization
-- Restore from backup
ROLLBACK TO [backup_timestamp];
```

---

## 📞 CONTACT & APPROVAL

### Required Approvals for Changes
- **Database Changes:** Database Administrator
- **Authentication Changes:** Security Team
- **RPC Function Changes:** Backend Team Lead
- **Environment Variables:** DevOps Team

### Emergency Contacts
- **Database Admin:** [contact-info]
- **Security Team:** [contact-info]
- **DevOps:** [contact-info]

---

## 🔐 SECURITY NOTES

### Access Control
- **Production Database:** Restricted access
- **RPC Functions:** Public access with validation
- **User Data:** RLS protected
- **Admin Functions:** Role-based access

### Monitoring
- **Authentication Logs:** Monitored 24/7
- **RPC Function Calls:** Rate limited
- **Failed Attempts:** Alert system active
- **Data Access:** Audit trail maintained

---

## 📅 CHANGE LOG

### 2026-01-23 - PRODUCTION LOCK
- ✅ Referral validation function locked
- ✅ Authentication settings locked
- ✅ RLS policies locked
- ✅ Environment variables locked
- ✅ Directory structure locked

---

## ⚠️ VIOLATION CONSEQUENCES

### Unauthorized Changes
- **Immediate rollback** required
- **Security review** mandatory
- **Access suspension** possible
- **Performance impact** monitoring

### Data Corruption
- **Full backup restoration** required
- **Incident report** mandatory
- **Root cause analysis** required
- **Preventive measures** implementation

---

## 🔒 LOCK VERIFICATION

### Current Lock Status
```
✅ Authentication: LOCKED
✅ RPC Functions: LOCKED  
✅ Database Schema: LOCKED
✅ RLS Policies: LOCKED
✅ Environment Variables: LOCKED
✅ Directory Structure: LOCKED
```

### Last Verification
**Date:** 2026-01-23  
**Verified By:** System Administrator  
**Lock Hash:** [hash-value]

---

## 📝 NOTES

This lock ensures production stability and security. Any changes require proper approval process and must follow established protocols.

**🔒 THIS CONFIGURATION IS PRODUCTION READY AND LOCKED**
