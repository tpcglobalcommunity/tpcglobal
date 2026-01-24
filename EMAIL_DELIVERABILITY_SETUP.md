# Email Deliverability Setup for TPC
# DNS Configuration for SPF, DKIM, and DMARC

## A) IDENTIFY SENDING DOMAIN

Based on TPC's setup, the sending domain should be:
- Primary: `tpcglobal.io`
- Recommended mail subdomain: `mail.tpcglobal.io`

Supabase Email Settings Configuration:
- From email: `noreply@mail.tpcglobal.io` (recommended)
- Reply-to: `support@tpcglobal.io`

## B) SPF RECORD

### For Primary Domain (tpcglobal.io)
**Type:** TXT
**Name:** @
**Value:**
```
v=spf1 include:spf.supabase.co include:_spf.google.com ~all
```

### For Mail Subdomain (mail.tpcglobal.io) - RECOMMENDED
**Type:** TXT
**Name:** @
**Value:**
```
v=spf1 include:spf.supabase.co include:_spf.google.com ~all
```

**IMPORTANT NOTES:**
- Check Supabase Dashboard → Authentication → Email Settings for exact SPF include
- If SPF record already exists, MERGE the includes (do not create multiple SPF records)
- Use `~all` (soft fail) for production safety
- Only ONE SPF record per domain

## C) DKIM RECORD

### Step 1: Enable DKIM in Supabase
1. Go to Supabase Dashboard → Authentication → Email Settings
2. Enable DKIM signing
3. Copy the DKIM selector and public key provided by Supabase

### Step 2: Add DKIM DNS Record
**Type:** TXT
**Name:** `<selector>._domainkey` (replace <selector> with actual selector from Supabase)
**Value:**
```
v=DKIM1; k=rsa; p=<public_key_from_supabase>
```

**Example (replace with actual values):**
**Type:** TXT
**Name:** `k1._domainkey`
**Value:**
```
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...<full_public_key>
```

## D) DMARC RECORD

### Initial Setup (Monitor Mode - First 7-14 days)
**Type:** TXT
**Name:** _dmarc
**Value:**
```
v=DMARC1; p=none; rua=mailto:dmarc@tpcglobal.io; ruf=mailto:dmarc@tpcglobal.io; fo=1; adkim=s; aspf=s; pct=100
```

### After Stable Performance (7-14 days later)
**Type:** TXT
**Name:** _dmarc
**Value:**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@tpcglobal.io; ruf=mailto:dmarc@tpcglobal.io; fo=1; adkim=s; aspf=s; pct=100
```

### Production Ready (After 30 days stable)
**Type:** TXT
**Name:** _dmarc
**Value:**
```
v=DMARC1; p=reject; rua=mailto:dmarc@tpcglobal.io; ruf=mailto:dmarc@tpcglobal.io; fo=1; adkim=s; aspf=s; pct=100
```

## E) OPTIONAL BUT RECOMMENDED

### 1. Dedicated Mail Subdomain Configuration
Update Supabase Email Settings:
- From email: `noreply@mail.tpcglobal.io`
- Reply-to: `support@tpcglobal.io`

### 2. Additional DNS Records for Mail Subdomain
**Type:** TXT
**Name:** @ (mail.tpcglobal.io)
**Value:**
```
v=spf1 include:spf.supabase.co include:_spf.google.com ~all
```

**Type:** TXT
**Name:** _dmarc (mail.tpcglobal.io)
**Value:**
```
v=DMARC1; p=none; rua=mailto:dmarc@tpcglobal.io; ruf=mailto:dmarc@tpcglobal.io; fo=1; adkim=s; aspf=s; pct=100
```

### 3. BIMI Setup (Future - after DMARC p=quarantine/reject)
**Type:** TXT
**Name:** _bimi
**Value:**
```
v=BIMI1; l=https://tpcglobal.io/logo.svg; a=https://tpcglobal.io/.well-known/bimi.svg
```

## F) VERIFICATION & TESTING

### 1. DNS Propagation Check
Use these tools to verify DNS records:
- Google Admin Toolbox: https://toolbox.googleapps.com/apps/checkmx/
- MXToolbox: https://mxtoolbox.com/
- DMARC Analyzer: https://dmarcian.com/dmarc-analyzer/

### 2. Email Testing
Send test emails from Supabase:
1. **Confirm Email** - Test with a new signup
2. **Reset Password** - Test password reset flow
3. **Magic Link** - Test passwordless login (if enabled)

### 3. Header Analysis in Gmail
Check email headers for:
```
Authentication-Results: gmail.com;
       spf=pass (google.com: domain of noreply@mail.tpcglobal.io designates ...);
       dkim=pass (signature was verified);
       dmarc=pass (p=NONE sp=NONE dis=NONE)
```

### 4. Deliverability Testing Tools
- mail-tester.com - Comprehensive email testing
- GlockApps - Inbox placement testing
- Litmus - Email client testing (paid)

## SUCCESS CRITERIA CHECKLIST

### DNS Records Verification:
- [ ] SPF record exists and validates
- [ ] DKIM record exists and validates
- [ ] DMARC record exists and validates
- [ ] No conflicting DNS records

### Email Header Verification:
- [ ] SPF: PASS in email headers
- [ ] DKIM: PASS in email headers
- [ ] DMARC: PASS in email headers
- [ ] "mailed-by" shows your domain
- [ ] "signed-by" shows your domain

### Deliverability Results:
- [ ] Emails arrive in Gmail inbox (not spam)
- [ ] Emails arrive in Outlook inbox (not spam)
- [ ] Emails arrive in Yahoo inbox (not spam)
- [ ] No security warnings in email clients
- [ ] Links are not marked as suspicious

## TROUBLESHOOTING

### Common Issues:
1. **Multiple SPF records** - Merge into single record
2. **DKIM key mismatch** - Verify selector and key from Supabase
3. **DMARC alignment failures** - Ensure SPF and DKIM use same domain
4. **Propagation delays** - Wait 24-48 hours for DNS changes

### Monitoring:
- Set up `dmarc@tpcglobal.io` to receive DMARC reports
- Monitor email bounce rates
- Track spam complaints
- Review deliverability metrics weekly

## FINAL DNS RECORDS SUMMARY

### For tpcglobal.io:
```
SPF (TXT @): v=spf1 include:spf.supabase.co include:_spf.google.com ~all
DKIM (TXT <selector>._domainkey): v=DKIM1; k=rsa; p=<public_key>
DMARC (TXT _dmarc): v=DMARC1; p=none; rua=mailto:dmarc@tpcglobal.io; ruf=mailto:dmarc@tpcglobal.io; fo=1; adkim=s; aspf=s; pct=100
```

### For mail.tpcglobal.io (recommended):
```
SPF (TXT @): v=spf1 include:spf.supabase.co include:_spf.google.com ~all
DKIM (TXT <selector>._domainkey): v=DKIM1; k=rsa; p=<public_key>
DMARC (TXT _dmarc): v=DMARC1; p=none; rua=mailto:dmarc@tpcglobal.io; ruf=mailto:dmarc@tpcglobal.io; fo=1; adkim=s; aspf=s; pct=100
```

## NEXT STEPS

1. **Immediate:** Apply SPF and initial DMARC (p=none) records
2. **Within 24 hours:** Enable DKIM in Supabase and add DKIM record
3. **After 48 hours:** Test email sending and verify headers
4. **Monitor for 7-14 days:** Review DMARC reports
5. **Upgrade DMARC:** Move to p=quarantine then p=reject
6. **Optional:** Set up dedicated mail subdomain for better deliverability

This configuration will significantly improve email deliverability and ensure TPC emails land in the inbox rather than spam folders.
