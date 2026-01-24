# FINAL DNS RECORDS FOR TPC EMAIL DELIVERABILITY

## IMMEDIATE ACTION REQUIRED

### 1. SPF Records
**For tpcglobal.io:**
```
Type: TXT
Name: @
Value: v=spf1 include:spf.supabase.co include:_spf.google.com ~all
```

**For mail.tpcglobal.io (recommended):**
```
Type: TXT
Name: @
Value: v=spf1 include:spf.supabase.co include:_spf.google.com ~all
```

### 2. DMARC Records (Start with p=none)
**For tpcglobal.io:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@tpcglobal.io; ruf=mailto:dmarc@tpcglobal.io; fo=1; adkim=s; aspf=s; pct=100
```

**For mail.tpcglobal.io:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@tpcglobal.io; ruf=mailto:dmarc@tpcglobal.io; fo=1; adkim=s; aspf=s; pct=100
```

### 3. DKIM Records (After enabling in Supabase)
1. Go to Supabase Dashboard → Authentication → Email Settings
2. Enable DKIM signing
3. Copy the selector and public key
4. Add DNS record:
```
Type: TXT
Name: [selector]._domainkey
Value: v=DKIM1; k=rsa; p=[public_key_from_supabase]
```

## SUPABASE CONFIGURATION

### Email Settings
- From email: `noreply@mail.tpcglobal.io` (recommended)
- Reply-to: `support@tpcglobal.io`
- Enable DKIM: Yes
- Enable custom SMTP: No (use Supabase default)

## VERIFICATION STEPS

### 1. DNS Propagation (24-48 hours)
After adding DNS records, wait 24-48 hours for full propagation.

### 2. Test Email Sending
1. Create test signup → Check confirmation email
2. Test password reset → Check reset email
3. Verify headers in Gmail/Outlook

### 3. Header Verification
In Gmail, check for:
```
Authentication-Results: gmail.com;
       spf=pass;
       dkim=pass;
       dmarc=pass
```

### 4. Online Testing
- Google Admin Toolbox: https://toolbox.googleapps.com/apps/checkmx/
- mail-tester.com: https://www.mail-tester.com/
- MXToolbox: https://mxtoolbox.com/

## SUCCESS CRITERIA

✅ DNS Records:
- SPF record exists and validates
- DKIM record exists and validates  
- DMARC record exists and validates

✅ Email Headers:
- SPF: PASS
- DKIM: PASS
- DMARC: PASS
- "mailed-by" shows your domain
- "signed-by" shows your domain

✅ Deliverability:
- Emails arrive in Gmail inbox (not spam)
- Emails arrive in Outlook inbox (not spam)
- No security warnings in email clients

## TIMELINE

**Day 1:** Apply SPF and DMARC records
**Day 2:** Enable DKIM in Supabase + add DKIM record
**Day 3:** Test email sending and verify headers
**Days 4-14:** Monitor with p=none DMARC
**Day 15:** Upgrade DMARC to p=quarantine
**Day 30:** Upgrade DMARC to p=reject

## MONITORING

Set up email forwarding:
- `dmarc@tpcglobal.io` → Your monitoring email
- Review DMARC reports weekly
- Monitor bounce rates and spam complaints

This configuration will ensure TPC emails achieve maximum deliverability and inbox placement across all major email providers.
