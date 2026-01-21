# UI Polish Final - Smoke Test Checklist

## Test 1 — Public Referral Validation
- [ ] Input referral invalid → UI merah
- [ ] Input TPC-056A0E → UI hijau

## Test 2 — Signup Flow  
- [ ] Signup user baru pakai code
- [ ] Sebelum confirm: referrals belum bertambah
- [ ] Sesudah confirm: referrals bertambah + uses_count naik

## Test 3 — Member Experience
- [ ] Login referrer → "My Downline" bertambah 1
- [ ] Copy code functionality works
- [ ] Copy link functionality works

## Test 4 — Admin Dashboard
- [ ] Admin referrals page list tampil
- [ ] Audit log page ada event CONFIRM_REFERRAL_RECORDED
- [ ] Sticky toolbar works
- [ ] CSV export works

## Environment Setup
- [ ] .env file configured with Supabase URL
- [ ] Development server running on port 5173
- [ ] Database RLS policies applied

## Manual Testing Steps
1. Open browser to http://localhost:5173
2. Navigate to /signup
3. Test invalid referral code (should show red)
4. Test valid referral code TPC-056A0E (should show green)
5. Complete signup with valid code
6. Check email verification
7. Login as new user
8. Navigate to /member/referrals
9. Verify downline appears
10. Login as admin and check dashboard
