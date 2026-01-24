# Email Deliverability Verification Script for TPC (PowerShell)
# This script helps verify DNS records are properly configured

Write-Host "=== TPC Email Deliverability Verification ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$Domain = "tpcglobal.io"
$MailDomain = "mail.tpcglobal.io"

Write-Host "Checking DNS records for domain: $Domain" -ForegroundColor Yellow
Write-Host "Mail subdomain: $MailDomain" -ForegroundColor Yellow
Write-Host ""

# Function to check DNS record
function Check-Record {
    param(
        [string]$RecordType,
        [string]$RecordName
    )
    
    Write-Host "🔍 Checking $RecordType record for $RecordName" -ForegroundColor Green
    
    try {
        switch ($RecordType) {
            "SPF" {
                $result = Resolve-DnsName -Name $RecordName -Type TXT -ErrorAction SilentlyContinue
                $spfRecord = $result | Where-Object { $_.Strings -match "v=spf1" }
                if ($spfRecord) {
                    Write-Host "✅ SPF record found: $($spfRecord.Strings)" -ForegroundColor Green
                } else {
                    Write-Host "❌ SPF record not found" -ForegroundColor Red
                }
            }
            "DMARC" {
                $result = Resolve-DnsName -Name "_dmarc.$RecordName" -Type TXT -ErrorAction SilentlyContinue
                $dmarcRecord = $result | Where-Object { $_.Strings -match "v=DMARC1" }
                if ($dmarcRecord) {
                    Write-Host "✅ DMARC record found: $($dmarcRecord.Strings)" -ForegroundColor Green
                } else {
                    Write-Host "❌ DMARC record not found" -ForegroundColor Red
                }
            }
            "MX" {
                $result = Resolve-DnsName -Name $RecordName -Type MX -ErrorAction SilentlyContinue
                if ($result) {
                    Write-Host "✅ MX records found:" -ForegroundColor Green
                    $result | ForEach-Object { Write-Host "  $($_.NameExchange) - Priority: $($_.Preference)" -ForegroundColor Gray }
                } else {
                    Write-Host "❌ MX record not found" -ForegroundColor Red
                }
            }
            "DKIM" {
                Write-Host "⚠️  DKIM requires manual verification - check Supabase for selector" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "❌ Error checking $RecordType record: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Check primary domain
Write-Host "=== Primary Domain: $Domain ===" -ForegroundColor Cyan
Check-Record -RecordType "MX" -RecordName $Domain
Check-Record -RecordType "SPF" -RecordName $Domain
Check-Record -RecordType "DMARC" -RecordName $Domain

# Check mail subdomain
Write-Host "=== Mail Subdomain: $MailDomain ===" -ForegroundColor Cyan
Check-Record -RecordType "MX" -RecordName $MailDomain
Check-Record -RecordType "SPF" -RecordName $MailDomain
Check-Record -RecordType "DMARC" -RecordName $MailDomain

Write-Host "=== Manual DNS Testing Commands ===" -ForegroundColor Cyan
Write-Host "Test SPF:" -ForegroundColor Yellow
Write-Host "nslookup -type=TXT $Domain" -ForegroundColor Gray
Write-Host ""
Write-Host "Test DMARC:" -ForegroundColor Yellow
Write-Host "nslookup -type=TXT _dmarc.$Domain" -ForegroundColor Gray
Write-Host ""
Write-Host "Test DKIM (replace selector):" -ForegroundColor Yellow
Write-Host "nslookup -type=TXT selector._domainkey.$Domain" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Online Testing Tools ===" -ForegroundColor Cyan
Write-Host "1. Google Admin Toolbox: https://toolbox.googleapps.com/apps/checkmx/" -ForegroundColor White
Write-Host "2. MXToolbox: https://mxtoolbox.com/" -ForegroundColor White
Write-Host "3. DMARC Analyzer: https://dmarcian.com/dmarc-analyzer/" -ForegroundColor White
Write-Host "4. mail-tester.com: https://www.mail-tester.com/" -ForegroundColor White
Write-Host ""

Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Apply DNS records from EMAIL_DELIVERABILITY_SETUP.md" -ForegroundColor White
Write-Host "2. Wait 24-48 hours for DNS propagation" -ForegroundColor White
Write-Host "3. Test email sending from Supabase" -ForegroundColor White
Write-Host "4. Verify headers in Gmail/Outlook" -ForegroundColor White
Write-Host "5. Monitor DMARC reports at dmarc@tpcglobal.io" -ForegroundColor White
Write-Host ""

Write-Host "=== Success Criteria ===" -ForegroundColor Green
Write-Host "✅ SPF record exists and validates" -ForegroundColor White
Write-Host "✅ DKIM record exists and validates" -ForegroundColor White
Write-Host "✅ DMARC record exists and validates" -ForegroundColor White
Write-Host "✅ Emails arrive in inbox (not spam)" -ForegroundColor White
Write-Host "✅ Gmail shows 'mailed-by' and 'signed-by' with your domain" -ForegroundColor White
