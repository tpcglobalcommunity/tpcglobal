# 🔒 SUPABASE INFRASTRUCTURE AS CODE LOCK - TPC GLOBAL

## 📋 LOCK STATUS & OVERVIEW

**Status:** 🔒 LOCKED FOR INFRASTRUCTURE AS CODE  
**Date:** 2026-01-23  
**Project:** TPC Global (Supabase + React + Vite)  
**Repository:** Infrastructure-as-Code Enforced

---

## 🚨 STRICT WORKFLOW RULES

### ❌ FORBIDDEN OPERATIONS
- ❌ **DO NOT** edit Supabase SQL Editor for schema/RLS/function changes
- ❌ **DO NOT** make direct database modifications without migration files
- ❌ **DO NOT** create/drop/modify functions without proper migration
- ❌ **DO NOT** alter RLS policies without migration files
- ❌ **DO NOT** change authentication settings without migration
- ❌ **DO NOT** deploy or push without proper review

### ✅ ALLOWED OPERATIONS
- ✅ **READ ONLY** operations in SQL Editor for debugging
- ✅ **CREATE migration files** in `/supabase/migrations/` folder
- ✅ **EDIT SQL files** only within `/supabase/*` directory
- ✅ **Run migrations** through proper deployment process
- ✅ **Seed data** through migration files
- ✅ **Performance monitoring** and read-only queries

---

## 📁 INFRASTRUCTURE STRUCTURE

```
supabase/
├── migrations/           📝 Database schema changes (versioned)
├── functions/           🔧 Stored procedures & RPC functions
├── policies/            🛡️ Row Level Security policies
├── seed/                🌱 Initial data & test data
└── LOCK_SUPABASE.md     🔒 This lock documentation
```

---

## 🔄 MIGRATION WORKFLOW

### 1. Creating New Migration
```bash
# Migration naming convention: YYYYMMDDHHMMSS_description.sql
# Example: 20260123120000_create_referral_validation.sql

# Create new migration file
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql
```

### 2. Migration File Template
```sql
-- Migration: Create referral validation function
-- Author: AI Assistant
-- Date: 2026-01-23
-- Dependencies: None
-- Type: Function
-- Reversible: Yes

-- UP MIGRATION
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE upper(trim(referral_code)) = upper(trim(p_code))
  );
END;
$$;

-- DOWN MIGRATION
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Revert to previous logic or stub
  RETURN false;
END;
$$;
```

### 3. Pre-Deployment Checklist
- [ ] **Code Review**: Migration reviewed by team lead
- [ ] **Backup**: Database backup created
- [ ] **Test**: Migration tested in staging environment
- [ ] **Dependencies**: All dependencies documented
- [ ] **Rollback Plan**: Down migration tested
- [ ] **Documentation**: Changes documented

### 4. Deployment Process
```bash
# Apply migrations in order
supabase db push

# Check migration status
supabase migration list

# Rollback if needed (single migration)
supabase migration revert [migration_name]
```

---

## 🤖 AI RULES & GUARDRAILS

### ✅ AI ALLOWED OPERATIONS
- ✅ **Edit SQL files** within `/supabase/*` directory only
- ✅ **Create migration files** with proper naming convention
- ✅ **Update functions** through migration files
- ✅ **Modify RLS policies** through migration files
- ✅ **Add seed data** through migration files
- ✅ **Document changes** in migration headers

### ❌ AI FORBIDDEN OPERATIONS
- ❌ **Edit frontend files** to fix database issues
- ❌ **Create new functions** with different names without instruction
- ❌ **Delete existing policies/functions** without proper migration
- ❌ **Modify authentication settings** without migration
- ❌ **Deploy or push** without explicit user request
- ❌ **Make direct SQL Editor changes** for production

### 🔒 AI SAFEGUARDS
- **All database changes must be in migration files**
- **Every migration must have UP and DOWN sections**
- **Function changes must preserve existing signatures**
- **RLS policy changes must maintain security**
- **No breaking changes without proper versioning**

---

## 📋 MIGRATION CATEGORIES

### 1. Schema Changes (`/supabase/migrations/`)
- Table creation/modification
- Column additions/changes
- Index creation/modification
- Constraint changes

### 2. Functions (`/supabase/functions/`)
- RPC functions
- Stored procedures
- Utility functions
- Security functions

### 3. Policies (`/supabase/policies/`)
- Row Level Security policies
- Permission changes
- Role-based access rules

### 4. Seed Data (`/supabase/seed/`)
- Initial data setup
- Test data creation
- Reference data
- Configuration data

---

## 🔄 ROLLBACK PROCEDURES

### 1. Single Migration Rollback
```bash
# Revert last migration
supabase migration revert

# Revert specific migration
supabase migration revert 20260123120000_create_referral_validation.sql
```

### 2. Multiple Migration Rollback
```bash
# Revert to specific point in time
supabase migration revert --to 20260123100000
```

### 3. Emergency Rollback
```sql
-- Manual rollback (only in emergency)
-- Restore from backup
ROLLBACK TO [backup_timestamp];
```

---

## 📊 CHANGE LOG FORMAT

### Migration Header Template
```sql
-- Migration: [Brief description]
-- Author: AI Assistant
-- Date: YYYY-MM-DD
-- Dependencies: [List of dependencies]
-- Type: [Function/Policy/Schema/Seed]
-- Reversible: [Yes/No]
-- Impact: [Low/Medium/High]
-- Testing: [Tested in staging/Not tested]
```

### Change Log Entry
```
2026-01-23 12:00:00 - Create referral validation function
  - File: 20260123120000_create_referral_validation.sql
  - Type: Function
  - Impact: Medium
  - Status: Applied
```

---

## 🛡️ SECURITY CONSIDERATIONS

### Function Security
- All functions must use `SECURITY DEFINER`
- Set `search_path = public` explicitly
- Validate input parameters
- Use proper error handling

### RLS Policy Security
- Policies must be non-breaking
- Maintain data privacy
- Test with different user roles
- Document policy logic

### Migration Security
- Never include sensitive data in migrations
- Use parameterized queries
- Validate all inputs
- Test thoroughly

---

## 📞 APPROVAL PROCESS

### Required Approvals
- **Schema Changes**: Database Administrator
- **Function Changes**: Backend Team Lead
- **Policy Changes**: Security Team
- **Authentication Changes**: DevOps Team

### Review Checklist
- [ ] Migration syntax validation
- [ ] Security review completed
- [ ] Performance impact assessed
- [ ] Rollback plan verified
- [ ] Documentation complete

---

## 🚨 EMERGENCY PROCEDURES

### Database Corruption
1. Stop all application access
2. Restore from latest backup
3. Review migration logs
4. Re-apply migrations in order
5. Verify data integrity

### Function Failure
1. Identify failing function
2. Check recent migrations
3. Revert last migration
4. Test function manually
5. Apply corrected migration

### Security Breach
1. Immediate lockdown
2. Audit recent changes
3. Review access logs
4. Restore secure state
5. Implement additional safeguards

---

## 🔒 LOCK VERIFICATION

### Current Lock Status
```
✅ SQL Editor: LOCKED (read-only for debugging)
✅ Migration Files: LOCKED (versioned workflow)
✅ Function Changes: LOCKED (migration required)
✅ Policy Changes: LOCKED (migration required)
✅ Schema Changes: LOCKED (migration required)
✅ AI Operations: LOCKED (defined scope)
```

### Last Verification
**Date:** 2026-01-23  
**Verified By:** System Administrator  
**Lock Hash:** [hash-value]

---

## 📝 NOTES

This lock ensures:
- **Infrastructure as Code** - All changes versioned
- **Change Control** - Proper approval process
- **Security Compliance** - Auditable changes
- **Rollback Capability** - Safe deployment
- **AI Guardrails** - Defined AI operations scope

**🔒 SUPABASE INFRASTRUCTURE IS PRODUCTION LOCKED WITH IAC ENFORCEMENT**

---

## 📚 REFERENCE

### Migration Best Practices
- Use descriptive names
- Include UP/DOWN migrations
- Document dependencies
- Test thoroughly
- Keep migrations small

### Function Best Practices
- Use SECURITY DEFINER
- Set search_path explicitly
- Validate inputs
- Handle errors gracefully
- Document purpose

### Policy Best Practices
- Keep policies simple
- Test with different roles
- Document policy logic
- Use least privilege
- Monitor policy performance
