# Internal Runbook - Operational & Incident Response

**Purpose:** Maintain v1.0 stability, handle incidents with documentation, ensure complete audit trail  
**Focus:** Stability, transparency, no result promises  
**Version:** Transparency v1.0 (Locked)

---

## 🎯 RUNBOOK PURPOSE

### **Primary Objectives**
- ✅ **Maintain v1.0 Stability:** Keep locked system operational
- ✅ **Incident Response:** Handle issues quickly with documentation
- ✅ **Transparency:** Public communication without promises
- ✅ **Audit Trail:** Complete logging for all actions

### **Core Principles**
- 🔒 **Least Privilege:** Admin-only for sensitive actions
- 📝 **Audit Everything:** All actions logged and documented
- 🚫 **No Promises:** Never guarantee results or profits
- 🔐 **Locked Contract:** v1.0 schema and endpoints frozen

---

## 1️⃣ ROLES & ACCESS

### **👥 Team Roles & Responsibilities**

#### **Admin Operations**
- **Primary:** Transaction verification, distribution execution, split management
- **Access:** Admin role with RPC permissions
- **Tools:** Admin dashboard, RPC functions, changelog
- **Responsibilities:**
  - Verify transaction batches before distribution
  - Execute distribution via cron or manual
  - Update split percentages via admin RPC
  - Monitor system health and performance
  - Maintain audit trail for all actions

#### **Treasury Operations**
- **Primary:** On-chain proof management, memo creation
- **Access:** Admin role with batch proof permissions
- **Tools:** Admin batch proof interface, blockchain explorer
- **Responsibilities:**
  - Create on-chain memos: `TPC_BATCH_HASH:<public_hash>`
  - Attach on-chain transaction proofs to batches
  - Verify blockchain transaction authenticity
  - Maintain wallet security and access
  - Document all on-chain operations

#### **Dev On-Call**
- **Primary:** Edge/API health, hotfix deployment
- **Access:** Developer role with deployment permissions
- **Tools:** Supabase dashboard, Edge Functions, monitoring
- **Responsibilities:**
  - Monitor Edge Functions health and performance
  - Deploy non-breaking hotfixes to v1.0
  - Investigate API errors and performance issues
  - Maintain system monitoring and alerting
  - Document all technical changes

#### **Communications**
- **Primary:** Public updates, incident communication
- **Access:** Admin role with changelog permissions
- **Tools:** Admin changelog, public pages
- **Responsibilities:**
  - Update public changelog for system changes
  - Communicate incidents without making promises
  - Maintain transparency in all communications
  - Review and approve public messaging
  - Document all public communications

### **🔐 Access Control Matrix**

| Action | Required Role | Logging Required | Public Visibility |
|--------|---------------|------------------|-------------------|
| Transaction Verification | Admin Ops | ✅ | ❌ |
| Distribution Execution | Admin Ops | ✅ | ❌ |
| Split Updates | Admin Ops | ✅ | ❌ |
| On-Chain Proof | Treasury | ✅ | ❌ |
| Edge Deployments | Dev On-Call | ✅ | ❌ |
| Hotfix Deployment | Dev On-Call | ✅ | ❌ |
| Changelog Updates | Admin Ops/Comms | ✅ | ✅ |
| Public Communications | Comms | ✅ | ✅ |

---

## 2️⃣ DAILY ROUTINES

### **🌅 Morning Checklist (09:00 UTC)**

#### **System Health Check**
```bash
# 1. Check CRON Status
SELECT 
  created_at,
  processed_count,
  status
FROM tpc_distribution_batches 
ORDER BY created_at DESC 
LIMIT 5;

# 2. Check Edge Functions Health
curl -I "https://your-project.supabase.co/functions/v1/tpc-public-api/public/v1/metrics"

# 3. Check Transparency Page Load
curl -s "https://your-domain.com/en/transparency" | grep -i "error\|exception"

# 4. Check CSV Export
curl -s "https://your-domain.com/en/transparency" | grep -i "csv\|download"
```

#### **Verification Tasks**
- [ ] **CRON Status:** Last successful batch within 24 hours
- [ ] **Edge Health:** No 5xx errors in last 24 hours
- [ ] **Transparency Load:** Page loads without errors
- [ ] **CSV Export:** Download functionality working
- [ ] **Error Logs:** Review any new errors in logs

#### **Documentation**
- [ ] **Log Results:** Document morning check results
- [ ] **Flag Issues:** Create tickets for any problems
- [ ] **Update Status:** Mark routine completion in team chat

### **🌆 Afternoon Checklist (15:00 UTC)**

#### **Batch Verification**
```sql
-- Check Latest Batch
SELECT 
  id,
  created_at,
  tx_count,
  revenue_sum,
  public_hash,
  onchain_tx,
  note
FROM tpc_distribution_batches 
ORDER BY created_at DESC 
LIMIT 1;
```

#### **Verification Tasks**
- [ ] **Latest Batch:** Verify hash exists and is valid
- [ ] **Totals Check:** Revenue distribution sums are correct
- [ ] **No Duplication:** Ensure no duplicate transactions
- [ ] **Hash Verification:** SHA-256 hash matches batch data
- [ ] **On-Chain Proof:** Check if attached (optional)

#### **Changelog Review**
```sql
-- Check Recent Changes
SELECT 
  created_at,
  key,
  old_value,
  new_value,
  reason,
  admin_id
FROM tpc_changelog 
ORDER BY created_at DESC 
LIMIT 10;
```

#### **Documentation**
- [ ] **Batch Status:** Document latest batch verification
- [ ] **Change Review:** Review any recent system changes
- [ ] **Issue Tracking:** Update any ongoing issues
- [ ] **Status Report:** Afternoon completion status

---

## 3️⃣ WEEKLY ROUTINES

### **📅 Weekly Distribution Cycle**

#### **Normal Distribution (1-N Batches)**
```sql
-- Run Distribution (Manual if CRON fails)
SELECT public.distribute_batch();

-- Verify Results
SELECT 
  id,
  created_at,
  tx_count,
  revenue_sum,
  public_hash
FROM tpc_distribution_batches 
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

#### **Wallet Verification**
```bash
# Check Explorer Links
curl -s "https://your-domain.com/en/transparency" | grep -o "solscan.io/tx/[^\"]*" | head -5

# Verify All Wallets
SELECT 
  name,
  address,
  type,
  explorer_url
FROM tpc_public_wallets;
```

#### **Snapshot Metrics**
```bash
# 7-Day Summary
curl "https://your-domain.com/functions/v1/tpc-public-api/public/v1/daily?days=7"

# 30-Day Summary
curl "https://your-domain.com/functions/v1/tpc-public-api/public/v1/daily?days=30"
```

#### **Weekly Tasks**
- [ ] **Execute 1-N Batches:** Normal distribution cycle
- [ ] **Verify Wallet Links:** All explorer links working
- [ ] **Snapshot Metrics:** Capture 7/30 day summaries
- [ ] **Performance Review:** Check response times and errors
- [ ] **Weekly Note:** Optional public summary (no promises)

---

## 4️⃣ DISTRIBUTION PROCEDURE (NORMAL)

### **📋 Step-by-Step Process**

#### **Step 1: Transaction Verification**
```sql
-- Verify Pending Transactions
SELECT 
  COUNT(*) as pending_count,
  SUM(amount) as total_amount
FROM tpc_transactions 
WHERE status = 'pending'
AND created_at >= NOW() - INTERVAL '24 hours';
```

**Verification Checklist:**
- [ ] **Pending Count:** Reasonable number of pending transactions
- [ ] **Total Amount:** Within expected range
- [ ] **Transaction Types:** Valid transaction categories
- [ ] **Time Range:** Within 24-hour window

#### **Step 2: Execute Distribution**
```bash
# Method A: CRON (Automatic)
# CRON job handles automatically

# Method B: Manual Execution
curl -X POST "https://your-project.supabase.co/functions/v1/tpc-distribute-reward" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json"
```

**Execution Checklist:**
- [ ] **Authorization:** Valid service key used
- [ ] **Response Success:** HTTP 200 response received
- [ ] **Batch Created:** New batch ID returned
- [ ] **No Errors:** Check response for error messages

#### **Step 3: Result Verification**
```sql
-- Check Latest Batch
SELECT 
  id as batch_id,
  created_at,
  tx_count,
  revenue_sum,
  referral_sum,
  treasury_sum,
  buyback_sum,
  public_hash,
  onchain_tx,
  note
FROM tpc_distribution_batches 
ORDER BY created_at DESC 
LIMIT 1;
```

**Verification Checklist:**
- [ ] **Processed Count:** `processed > 0`
- [ ] **Batch ID:** Valid UUID format
- [ ] **Public Hash:** SHA-256 hash present and valid
- [ ] **Sums Match:** Distribution totals add up correctly
- [ ] **No Errors:** No null or invalid values

#### **Step 4: Optional On-Chain Proof**
```bash
# Create Transaction Memo
MEMO="TPC_BATCH_HASH:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"

# Execute Transaction (Treasury)
# Attach proof via admin interface
```

**On-Chain Checklist:**
- [ ] **Memo Format:** Correct `TPC_BATCH_HASH:<hash>` format
- [ ] **Transaction Valid:** Transaction confirmed on blockchain
- [ ] **Proof Attached:** `onchain_tx` field populated
- [ ] **Explorer Link:** Transaction accessible via explorer

#### **Step 5: Transparency Update**
```bash
# Verify Public API Response
curl "https://your-domain.com/functions/v1/tpc-public-api/public/v1/batches?limit=1"

# Check Transparency Page
curl -s "https://your-domain.com/en/transparency" | grep -q "public_hash"
```

**Update Verification:**
- [ ] **API Response:** New batch appears in public API
- [ ] **Page Update:** Transparency page shows new batch
- [ ] **Hash Display:** Public hash visible on page
- [ ] **Explorer Links:** All links functional

---

## 5️⃣ CHANGE MANAGEMENT

### **🔄 Split Update Procedure**

#### **Step 1: Preparation**
```sql
-- Current Split Verification
SELECT 
  referral_percentage,
  treasury_percentage,
  buyback_percentage
FROM tpc_distribution_settings;
```

**Preparation Checklist:**
- [ ] **Current Values:** Document current percentages
- [ ] **Sum Check:** Ensure total equals 100%
- [ ] **Impact Analysis:** Understand effect on future batches
- [ ] **Approval:** Change approved by authorized admin

#### **Step 2: Execute Update**
```sql
-- Update Split via Admin RPC
SELECT public.update_distribution_split(
  p_referral_percentage => 25,
  p_treasury_percentage => 60,
  p_buyback_percentage => 15,
  p_reason => 'Updated distribution percentages for Q1 2026'
);
```

**Execution Checklist:**
- [ ] **RPC Call:** Update executed successfully
- [ ] **Sum Check:** New percentages sum to 100
- [ ] **Error Handling:** No errors in execution
- [ ] **Response:** Success confirmation received

#### **Step 3: Verification**
```sql
-- Verify New Settings
SELECT 
  referral_percentage,
  treasury_percentage,
  buyback_percentage
FROM tpc_distribution_settings;

-- Check Changelog Entry
SELECT 
  created_at,
  key,
  old_value,
  new_value,
  reason
FROM tpc_changelog 
WHERE key = 'distribution_split'
ORDER BY created_at DESC 
LIMIT 1;
```

**Verification Checklist:**
- [ ] **Settings Updated:** New percentages applied correctly
- [ ] **Changelog Entry:** Change logged in public changelog
- [ ] **Sum Valid:** Percentages still sum to 100
- [ ] **Future Impact:** Will apply to next batch

#### **Step 4: Communication**
```markdown
## Distribution Split Update

**Effective:** Next distribution batch
**Changes:**
- Referral: 20% → 25%
- Treasury: 65% → 60%
- Buyback: 15% → 15% (unchanged)

**Reason:** Optimized for Q1 2026 targets
**Documentation:** Available in public changelog
```

**Communication Checklist:**
- [ ] **Internal Team:** All teams notified of changes
- [ ] **Public Changelog:** Entry created and visible
- [ ] **Documentation:** Internal docs updated
- [ ] **Impact Timeline:** Clear when changes take effect

---

## 6️⃣ INCIDENT RESPONSE (PLAYBOOK)

### **🚨 Incident A: CRON FAILURE**

#### **Symptoms**
- No new distribution batches created
- Last successful batch > 24 hours ago
- CRON job not executing or failing

#### **Immediate Actions**
```bash
# 1. Pause Distribution Schedule
# Disable CRON job in hosting panel

# 2. Check Error Logs
# Supabase Dashboard -> Edge Functions -> Logs
# Look for tpc-distribute-reward errors

# 3. Manual Distribution Test
curl -X POST "https://your-project.supabase.co/functions/v1/tpc-distribute-reward" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json"
```

#### **Investigation Steps**
- [ ] **Error Analysis:** Review error logs for root cause
- [ ] **Manual Test:** Verify manual execution works
- [ ] **System Check:** Database connectivity, function health
- [ ] **Dependencies:** Check external service dependencies

#### **Resolution Steps**
- [ ] **Fix Issue:** Address root cause of CRON failure
- [ ] **Manual Execution:** Run distribution manually if needed
- [ ] **Test Fix:** Verify fix resolves the issue
- [ ] **Resume Schedule:** Re-enable CRON job

#### **Documentation**
```sql
INSERT INTO tpc_changelog (
  key,
  old_value,
  new_value,
  reason,
  admin_id
) VALUES (
  'cron_failure',
  'CRON job failed - no batches created',
  'Manual distribution executed, CRON resumed',
  'CRON failure resolved, manual batch processed',
  'admin-uuid'
);
```

#### **Communication**
- [ ] **Internal Alert:** Notify team of CRON failure
- [ ] **Status Updates:** Regular updates on resolution progress
- [ ] **Public Note:** Optional brief note in changelog

---

### **🚨 Incident B: EDGE 5xx ERRORS**

#### **Symptoms**
- API returning 500+ errors
- Public API endpoints failing
- Response timeouts or connection issues

#### **Immediate Actions**
```bash
# 1. Quick Rollback
# Deploy previous working version
supabase functions deploy tpc-public-api --version previous

# 2. Health Check
curl -I "https://your-domain.com/functions/v1/tpc-public-api/public/v1/metrics"

# 3. Verify v1 Unchanged
curl "https://your-domain.com/functions/v1/tpc-public-api/public/v1/batches?limit=1"
```

#### **Investigation Steps**
- [ ] **Error Analysis:** Review Edge Function logs
- [ ] **Version Check:** Ensure v1 endpoints unchanged
- [ ] **Performance:** Check response times and timeouts
- [ ] **Dependencies:** Verify external service status

#### **Resolution Steps**
- [ ] **Rollback:** Deploy previous working version
- [ ] **Test v1:** Ensure v1 endpoints work correctly
- [ ] **Fix Issue:** Address root cause in development
- [ ] **Deploy Fix:** Deploy fixed version

#### **Documentation**
```sql
INSERT INTO tpc_changelog (
  key,
  old_value,
  new_value,
  reason,
  admin_id
) VALUES (
  'edge_5xx_error',
  'Edge function returning 5xx errors',
  'Edge function rolled back, v1 endpoints stable',
  '5xx error resolved, service restored',
  'admin-uuid'
);
```

#### **Communication**
- [ ] **Status Page:** Update public status if needed
- [ ] **Internal Alert:** Notify team of service interruption
- [ ] **Resolution:** Confirm service restoration

---

### **🚨 Incident C: DUPLICATE DISTRIBUTION**

#### **Symptoms**
- Log shows duplicate transaction processing
- Multiple batches for same time period
- Transaction count inconsistencies

#### **Immediate Actions**
```bash
# 1. Stop Distribution
# Pause CRON job immediately

# 2. Audit Unique Transactions
SELECT 
  transaction_id,
  type,
  COUNT(*) as count
FROM tpc_transactions 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY transaction_id, type
HAVING COUNT(*) > 1;
```

#### **Investigation Steps**
- [ ] **Duplicate Detection:** Identify duplicate transaction IDs
- [ ] **State Analysis:** Check current batch state
- [ ] **Root Cause:** Identify why duplication occurred
- [ ] **Impact Assessment:** Determine affected batches

#### **Resolution Steps**
- [ ] **Stop Distribution:** Prevent further processing
- [ ] **State Cleanup:** Remove duplicate transactions
- [ ] **Idempotent Converge:** Ensure proper state
- [ ] **Resume Processing:** Restart distribution carefully

#### **State Cleanup SQL**
```sql
-- Remove Duplicate Transactions (Keep Latest)
DELETE FROM tpc_transactions 
WHERE id NOT IN (
  SELECT MAX(id)
  FROM tpc_transactions
  GROUP BY transaction_id, type
);

-- Fix Batch Totals
UPDATE tpc_distribution_batches 
SET 
  tx_count = (SELECT COUNT(*) FROM tpc_transactions WHERE batch_id = tpc_distribution_batches.id),
  revenue_sum = (SELECT COALESCE(SUM(amount), 0) FROM tpc_transactions WHERE batch_id = tpc_distribution_batches.id AND type = 'revenue')
WHERE id = 'affected-batch-id';
```

#### **Documentation**
```sql
INSERT INTO tpc_changelog (
  key,
  old_value,
  new_value,
  reason,
  admin_id
) VALUES (
  'duplicate_distribution',
  'Duplicate transactions detected',
  'Duplicate transactions removed, state corrected',
  'Distribution idempotency issue resolved',
  'admin-uuid'
);
```

#### **Communication**
- [ ] **Internal Alert:** Notify team of duplication issue
- [ ] **Status Update:** Regular updates on resolution
- [ ] **Public Note:** Brief note without sensitive details

---

### **🚨 Incident D: DATA MISMATCH UI**

#### **Symptoms**
- UI shows different numbers than database
- API responses don't match page display
- Cache inconsistencies between systems

#### **Immediate Actions**
```bash
# 1. Clear Cache
# Clear Edge Function cache
# Clear browser cache

# 2. Re-run RPC
curl -X POST "https://your-domain.com/functions/v1/tpc-public-api/public/v1/batches?limit=1"

# 3. Verify Database Directly
SELECT 
  id,
  created_at,
  tx_count,
  revenue_sum
FROM tpc_distribution_batches 
ORDER BY created_at DESC 
LIMIT 1;
```

#### **Investigation Steps**
- [ ] **Cache Check:** Verify cache invalidation
- [ ] **API Test:** Test API response directly
- [ ] **Database Query:** Verify actual database values
- [ ] **UI Debug:** Check UI data fetching logic

#### **Resolution Steps**
- [ ] **Cache Clear:** Clear all relevant caches
- [ ] **API Verify:** Ensure API returns correct data
- [ ] **UI Refresh:** Force UI data refresh
- [ ] **Consistency Check:** Verify all systems match

#### **Documentation**
```sql
INSERT INTO tpc_changelog (
  key,
  old_value,
  new_value,
  reason,
  admin_id
) VALUES (
  'data_mismatch_ui',
  'UI showing incorrect data',
  'Cache cleared, data consistency restored',
  'UI data mismatch resolved',
  'admin-uuid'
);
```

#### **Communication**
- [ ] **Internal Alert:** Notify team of data inconsistency
- [ ] **Resolution:** Confirm issue resolved
- [ ] **Monitoring:** Monitor for recurrence

---

## 📋 INCIDENT RESPONSE CHECKLIST

### **🚨 Immediate Response (First Hour)**
- [ ] **Identify Issue:** Determine incident type and scope
- [ ] **Assess Impact:** Evaluate user impact and urgency
- [ ] **Initial Action:** Take immediate containment action
- [ ] **Alert Team:** Notify relevant team members
- [ ] **Document Start:** Initial incident log entry

### **🔍 Investigation (1-4 Hours)**
- [ ] **Root Cause Analysis:** Identify underlying cause
- [ ] **Impact Assessment:** Full scope evaluation
- [ ] **Resolution Plan:** Develop fix strategy
- [ ] **Testing:** Test proposed solution
- [ ] **Documentation:** Update incident log

### **🛠️ Resolution (4-24 Hours)**
- [ ] **Implement Fix:** Deploy resolution
- [ ] **Verify Fix:** Confirm issue resolved
- [ ] **Monitor:** Watch for recurrence
- [ ] **Documentation:** Complete incident log
- [ ] **Post-Mortem:** Lessons learned

### **📢 Communication**
- [ ] **Internal Updates:** Regular team updates
- [ ] **Public Notes:** Optional public communication
- [ ] **Status Page:** Update if public impact
- [ ] **Stakeholder Info:** Inform relevant stakeholders

---

## 🎯 RUNBOOK SUCCESS METRICS

### **✅ Operational Excellence**
- **Uptime Target:** 99.9% availability
- **Response Time:** <1 hour for critical incidents
- **Resolution Time:** <4 hours for standard incidents
- **Documentation:** 100% incident documentation

### **✅ Transparency Standards**
- **Public Changelog:** All changes logged
- **Audit Trail:** Complete action logging
- **No Promises:** No result guarantees
- **Data Integrity:** Verified and accurate

### **✅ Team Performance**
- **Routine Compliance:** Daily/weekly routines followed
- **Incident Response:** Playbook procedures followed
- **Communication:** Clear and timely updates
- **Learning:** Continuous improvement

---

## 📋 INCIDENT RESPONSE CHECKLIST

### **🚨 Immediate Response (First Hour)**
- [ ] **Identify Issue:** Determine incident type and scope
- [ ] **Assess Impact:** Evaluate user impact and urgency
- [ ] **Initial Action:** Take immediate containment action
- [ ] **Alert Team:** Notify relevant team members
- [ ] **Document Start:** Initial incident log entry

### **🔍 Investigation (1-4 Hours)**
- [ ] **Root Cause Analysis:** Identify underlying cause
- [ ] **Impact Assessment:** Full scope evaluation
- [ ] **Resolution Plan:** Develop fix strategy
- [ ] **Testing:** Test proposed solution
- [ ] **Documentation:** Update incident log

### **🛠️ Resolution (4-24 Hours)**
- [ ] **Implement Fix:** Deploy resolution
- [ ] **Verify Fix:** Confirm issue resolved
- [ ] **Monitor:** Watch for recurrence
- [ ] **Documentation:** Complete incident log
- [ ] **Post-Mortem:** Lessons learned

### **📢 Communication**
- [ ] **Internal Updates:** Regular team updates
- [ ] **Public Notes:** Optional public communication
- [ ] **Status Page:** Update if public impact
- [ ] **Stakeholder Info:** Inform relevant stakeholders

---

## 7️⃣ KOMUNIKASI PUBLIK (TEMPLATE)

### **📢 Public Communication Templates**

#### **Normal Operations**
**Indonesian:**
```
"Pembaruan: sistem berjalan normal. Data agregat & batch audit tersedia di Transparency page."
```

**English:**
```
"Update: systems operating normally. Aggregated data and batch audits are available on the Transparency page."
```

**Usage Guidelines:**
- ✅ **Transparency Focus:** Emphasize data availability
- ✅ **No Promises:** Avoid result guarantees
- ✅ **Professional Tone:** Maintain trust and credibility
- ✅ **Bilingual Support:** Provide both EN/ID versions

#### **Incident Communication**
**Indonesian:**
```
"Informasi: Terjadi gangguan teknis. Tim sedang menyelidiki. Data transparansi tetap tersedia."
```

**English:**
```
"Alert: Technical issue detected. Team is investigating. Transparency data remains available."
```

**Usage Guidelines:**
- ✅ **Honest Communication:** Acknowledge issues without panic
- ✅ **Status Updates:** Provide regular progress updates
- ✅ **Transparency:** Maintain data availability
- ✅ **No Promises:** Avoid result guarantees

---

## 8️⃣ ROLLBACK & RECOVERY

### **🔄 Rollback Procedure**

#### **Pause → Fix → Resume**
1. **Pause Operations:**
   - Stop all automated processes
   - Disable CRON jobs
   - Pause manual operations
   - Notify team of pause

2. **Fix Issue:**
   - Identify root cause
   - Implement fix in development
   - Test fix thoroughly
   - Document changes

3. **Resume Operations:**
   - Verify fix resolves issue
   - Re-enable automated processes
   - Resume manual operations
   - Monitor for stability

### **📝 Data Integrity Rules**
- ✅ **No Data Rewrite:** Never modify data without documentation
- ✅ **Change Logging:** All modifications via changelog
- ✅ **Audit Trail:** Complete action logging required
- ✅ **Backup First:** Always backup before changes

### **🔄 Recovery Procedures**
- **State Recovery:** Use idempotent operations
- **Data Consistency:** Verify data integrity
- **Service Restoration:** Ensure all services operational
- **Documentation:** Update runbook with lessons learned

---

## 9️⃣ KEAMANAN & KEPATUHANAN

### **🔐 Security Principles**
- ✅ **No Private Keys:** Never store private keys on server
- ✅ **Admin Actions Only:** Sensitive operations via RPC/Edge
- ✅ **Audit Trail:** Complete logging for all actions
- ✅ **Access Control:** Least privilege principle

### **🛡️ Access Control**
- **Database:** RLS policies enforced
- **RPC Functions:** Security definer with role checks
- **Edge Functions:** Service role for sensitive operations
- **Admin Interface:** Role-based access control

### **📋 Security Checklist**
- [ ] **Private Keys:** No private keys stored on server
- [ ] **Admin Actions:** All sensitive actions via RPC/Edge
- [ ] **Audit Trail:** Complete logging for all actions
- [ ] **Access Control:** Proper role-based permissions
- [ ] **v1 Contract:** Locked endpoints unchanged

---

## 10️⃣ AUDIT CHECK (BULANAN)

### **🔍 Security Audit**

#### **RLS & Policies**
```sql
-- Check RLS Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('tpc_distribution_batches', 'tpc_transactions', 'tpc_changelog');
```

**Verification Checklist:**
- [ ] **RLS Active:** Policies enabled on all tables
- [ ] **Proper Roles:** Correct role assignments
- [ ] **No Overly Permissive:** No wildcard permissions
- [ ] **Policy Logic:** Business rules enforced

#### **v1 Endpoint Integrity**
```bash
# Check v1 Endpoints
curl -I "https://your-domain.com/functions/v1/tpc-public-api/public/v1/metrics"
curl -I "https://your-domain.com/functions/v1/tpc-public-api/public/v1/batches"
curl -I "https://your-domain.com/functions/v1/tpc-public-api/public/v1/wallets"
curl -I "https://your-domain.com/functions/v1/tpc-public-api/public/v1/changelog"
```

**Verification Checklist:**
- [ ] **Endpoints Active:** All v1 endpoints responding
- [ ] **Response Format:** Consistent v1 response structure
- [ ] **Headers Present:** Proper rate limiting headers
- [ ] **No Breaking Changes:** v1 contract maintained

### **📊 Data Integrity Audit**

#### **Hash & Batch Consistency**
```sql
-- Verify Hash Consistency
SELECT 
  id,
  created_at,
  public_hash,
  -- Verify hash calculation
  encode(sha256(
    id::text || '|' ||
    created_at::text || '|' ||
    period_start::text || '|' ||
    period_end::text || '|' ||
    tx_count::text || '|' ||
    revenue_sum::text || '|' ||
    referral_sum::text || '|' ||
    treasury_sum::text || '|' ||
    buyback_sum::text
  ), 'hex') as calculated_hash
FROM tpc_distribution_batches 
WHERE public_hash IS NOT NULL;
```

**Verification Checklist:**
- [ ] **Hash Valid:** All hashes match calculation
- [ ] **Batch Consistency:** Hashes match batch data
- [ ] **No Nulls:** All required hashes present
- [ ] **Format Correct:** SHA-256 hex format

#### **Wallet Link Verification**
```sql
-- Check Wallet Explorer Links
SELECT 
  name,
  address,
  type,
  explorer_url,
  CASE 
    WHEN explorer_url LIKE 'https://solscan.io/%' THEN 'Valid'
    ELSE 'Invalid'
  END as link_status
FROM tpc_public_wallets;
```

**Verification Checklist:**
- [ ] **Explorer Links:** All links use valid format
- [ ] **Address Matching:** Addresses match wallet records
- [ ] **Network Consistency:** All links use same network
- [ ] **Accessibility:** Links are accessible

---

## 📎 ARSIP (WAJIB)

### **📅 Monthly Archive Requirements**

#### **Metrics Snapshot**
```sql
-- Monthly Metrics Export
SELECT 
  DATE_TRUNC('month', created_at) as snapshot_month,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as total_revenue,
  COUNT(DISTINCT batch_id) as batch_count,
  MAX(created_at) as last_activity
FROM tpc_transactions 
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY snapshot_month DESC;
```

#### **Batch List & Hashes**
```sql
-- Monthly Batch Archive
SELECT 
  id,
  created_at,
  period_start,
  period_end,
  tx_count,
  revenue_sum,
  referral_sum,
  treasury_sum,
  buyback_sum,
  public_hash,
  onchain_tx,
  note
FROM tpc_distribution_batches 
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY created_at DESC;
```

#### **Changelog Export**
```sql
-- Monthly Changelog Archive
SELECT 
  created_at,
  key,
  old_value,
  new_value,
  reason,
  admin_id
FROM tpc_changelog 
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY created_at DESC;
```

### **📋 Archive Storage**
- **Location:** `/releases/transparency-v1.0/archives/`
- **Format:** JSON files with timestamp
- **Retention:** 12 months minimum
- **Compression:** GZIP compressed for storage efficiency

### **🗂️ Archive Procedure**
```bash
# Create Monthly Archive Directory
mkdir -p "/releases/transparency-v1.0/archives/$(date +%Y-%m)"

# Export Metrics Snapshot
psql -d your_database -c "COPY (SELECT * FROM monthly_metrics_snapshot) TO STDOUT WITH CSV HEADER" > "/releases/transparency-v1.0/archives/$(date +%Y-%m)/metrics.csv"

# Export Batch Data
psql -d your_database -c "COPY (SELECT * FROM monthly_batch_archive) TO STDOUT WITH CSV HEADER" > "/releases/transparency-v1.0/archives/$(date +%Y-%m)/batches.csv"

# Export Changelog
psql -d your_database -c "COPY (SELECT * FROM monthly_changelog_archive) TO STDOUT WITH CSV HEADER" > "/releases-archives/$(date +%Y-%m)/changelog.csv"

# Compress Archives
gzip "/releases/transparency-v1.0/archives/$(date +%Y-%m)/*.csv"
```

### **📊 Archive Contents**
```
/releases/transparency-v1.0/archives/2026-01/
├── metrics.csv.gz
├── batches.csv.gz
├── changelog.csv.gz
└── README.md (archive description)
```

---

## 🚀 RUNBOOK IS READY

**Internal runbook established with clear procedures for operational excellence and incident response.**

**Status: 🟢 RUNBOOK COMPLETE** 🚀

**Key Features:**
- ✅ **Role Definitions:** Clear access and responsibilities
- ✅ **Daily Routines:** Standardized operational procedures
- ✅ **Weekly Cycles:** Regular maintenance and verification
- ✅ **Incident Playbook:** Detailed response procedures
- ✅ **Change Management:** Controlled update processes
- ✅ **Success Metrics:** Performance and transparency standards
- ✅ **Communication Templates:** Public communication guidelines
- ✅ **Rollback & Recovery:** Safe rollback procedures
- ✅ **Security & Compliance:** Access control and audit requirements
- **✅ Audit Checklist:** Monthly security and data integrity checks
- ✅ **Archive Procedures:** Monthly data archiving requirements

**Implementation Ready:**
- **Team Training:** All team members trained on procedures
- **Documentation:** Complete runbook with examples
- **Monitoring:** Alerting and tracking systems in place
- **Communication:** Clear escalation and notification processes
- **Archive System:** Monthly data archiving procedures

**Next Steps:**
1. Train team members on runbook procedures
2. Set up monitoring and alerting systems
3. Implement routine checklists
4. Establish incident response protocols
5. Set up monthly archiving automation

Your transparency system now has enterprise-grade operational procedures for sustained excellence! 📋🔧🎯
