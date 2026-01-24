#!/bin/bash

# Email Deliverability Verification Script for TPC
# This script helps verify DNS records are properly configured

echo "=== TPC Email Deliverability Verification ==="
echo ""

# Configuration
DOMAIN="tpcglobal.io"
MAIL_DOMAIN="mail.tpcglobal.io"

echo "Checking DNS records for domain: $DOMAIN"
echo "Mail subdomain: $MAIL_DOMAIN"
echo ""

# Function to check DNS record
check_record() {
    local record_type=$1
    local record_name=$2
    local expected_pattern=$3
    
    echo "🔍 Checking $record_type record for $record_name"
    
    case $record_type in
        "SPF")
            dig +short TXT $record_name | grep "v=spf1" || echo "❌ SPF record not found"
            ;;
        "DMARC")
            dig +short TXT _dmarc.$record_name | grep "v=DMARC1" || echo "❌ DMARC record not found"
            ;;
        "DKIM")
            echo "⚠️  DKIM requires manual verification - check Supabase for selector"
            ;;
        "MX")
            dig +short MX $record_name || echo "❌ MX record not found"
            ;;
    esac
    echo ""
}

# Check primary domain
echo "=== Primary Domain: $DOMAIN ==="
check_record "MX" $DOMAIN
check_record "SPF" $DOMAIN
check_record "DMARC" $DOMAIN

# Check mail subdomain
echo "=== Mail Subdomain: $MAIL_DOMAIN ==="
check_record "MX" $MAIL_DOMAIN
check_record "SPF" $MAIL_DOMAIN
check_record "DMARC" $MAIL_DOMAIN

echo "=== Email Testing Commands ==="
echo "Test SPF:"
echo "dig +short TXT $DOMAIN"
echo ""
echo "Test DMARC:"
echo "dig +short TXT _dmarc.$DOMAIN"
echo ""
echo "Test DKIM (replace selector):"
echo "dig +short TXT <selector>._domainkey.$DOMAIN"
echo ""
echo "=== Online Testing Tools ==="
echo "1. Google Admin Toolbox: https://toolbox.googleapps.com/apps/checkmx/"
echo "2. MXToolbox: https://mxtoolbox.com/"
echo "3. DMARC Analyzer: https://dmarcian.com/dmarc-analyzer/"
echo "4. mail-tester.com: https://www.mail-tester.com/"
echo ""
echo "=== Next Steps ==="
echo "1. Apply DNS records from EMAIL_DELIVERABILITY_SETUP.md"
echo "2. Wait 24-48 hours for DNS propagation"
echo "3. Test email sending from Supabase"
echo "4. Verify headers in Gmail/Outlook"
echo "5. Monitor DMARC reports at dmarc@tpcglobal.io"
