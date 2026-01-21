# TPC Admin Runbook

## 🚀 Quick Start

### Login Admin
1. Go to `/:lang/admin/login` (e.g., `/en/admin/login`)
2. Use admin credentials to login
3. You'll be redirected to admin dashboard

### Admin Menu Access
After login, you can access:
- **Dashboard** - Overview stats and activity
- **Members** - User management and verification
- **Verification Queue** - Approve/reject verification requests
- **Settings** - Maintenance mode, banner, registration
- **Audit Log** - Track all admin actions

---

## 📋 Standard Operating Procedures (SOP)

### 🔐 User Management

#### Approve Verification Request
1. Go to **Verification Queue** (`/admin/verification`)
2. Review user's wallet address and notes
3. Click **Approve** button
4. System automatically:
   - Marks verification as APPROVED
   - Updates user profile to VERIFIED
   - Logs action in audit trail

#### Reject Verification Request
1. Go to **Verification Queue** (`/admin/verification`)
2. Click **Reject** button next to request
3. Enter rejection reason (optional)
4. Click **Confirm Reject**
5. System automatically:
   - Marks verification as REJECTED
   - Updates user profile to REJECTED
   - Logs action with reason

#### Ban User
1. Go to **Members** (`/admin/members`)
2. Find user via search or browse
3. Click **Ban** button
4. System automatically:
   - Changes status to BANNED
   - Logs action in audit trail

#### Activate User
1. Go to **Members** (`/admin/members`)
2. Find banned user
3. Click **Activate** button
4. System automatically:
   - Changes status to ACTIVE
   - Logs action in audit trail

#### Update User Role
1. Go to **Member Detail** (`/admin/member?id=USER_ID`)
2. Change role dropdown (member/moderator/admin)
3. Click **Save** button
4. System automatically:
   - Updates user role
   - Logs action in audit trail

---

### ⚙️ System Management

#### Enable Maintenance Mode
1. Go to **Settings** (`/admin/settings`)
2. Toggle **Maintenance Mode** to ON
3. Enter custom maintenance message (optional)
4. Click **Save Settings**
5. System automatically:
   - Blocks all non-admin routes
   - Shows maintenance page to users
   - Allows admin access to panel

#### Disable Maintenance Mode
1. Go to **Settings** (`/admin/settings`)
2. Toggle **Maintenance Mode** to OFF
3. Click **Save Settings**
4. System automatically:
   - Restores normal access to all routes
   - Removes maintenance page

#### Enable Global Banner
1. Go to **Settings** (`/admin/settings`)
2. Toggle **Show Global Banner** to ON
3. Enter banner message
4. Click **Save Settings**
5. System automatically:
   - Shows banner at top of all pages
   - Users can dismiss banner locally

#### Disable Registration
1. Go to **Settings** (`/admin/settings`)
2. Toggle **Allow New Registrations** to OFF
3. Click **Save Settings**
4. System automatically:
   - Blocks new user signups
   - Shows registration closed message

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### "Not authorized" Error
**Cause**: Admin role not properly set or `is_admin()` function missing
**Solution**:
1. Check if `is_admin()` function exists in database
2. Verify user role is set to 'admin' in profiles table
3. Run SQL: `select role from profiles where id = YOUR_USER_ID;`

#### "RPC not found" Error
**Cause**: RPC functions not created or not properly deployed
**Solution**:
1. Run all SQL files in `supabase/sql/` folder in order:
   - `01_app_settings.sql`
   - `02_admin_audit_log.sql`
   - `03_admin_rpcs.sql`
   - `04_rls_final.sql`
   - `05_indexes.sql`
2. Check Supabase Functions tab for deployed functions

#### Direct Table Access Errors
**Cause**: Frontend trying to update tables directly instead of using RPC
**Solution**:
1. Ensure all admin actions use RPC functions:
   - `admin_update_member()`
   - `admin_approve_verification()`
   - `admin_reject_verification()`
   - `admin_upsert_app_setting()`
2. Check frontend is calling `supabase.rpc()` not `supabase.from().update()`

#### Performance Issues
**Cause**: Missing database indexes
**Solution**:
1. Run `05_indexes.sql` to create performance indexes
2. Monitor slow queries in Supabase dashboard
3. Consider adding composite indexes for complex queries

#### Audit Log Not Recording
**Cause**: `log_admin_action()` function not working or not being called
**Solution**:
1. Verify `log_admin_action()` function exists
2. Check RLS policies allow audit log insertion
3. Test with a simple admin action and check audit log table

#### Maintenance Mode Not Working
**Cause**: App settings cache not refreshing or maintenance check failing
**Solution**:
1. Check `fetchAppSettings(true)` is called after settings update
2. Verify maintenance mode check in App.tsx routing logic
3. Clear browser cache and test again

---

## 🔐 Security Guidelines

### Access Control
- ✅ **Admin-only actions** must use RPC functions with `is_admin()` checks
- ✅ **No direct table access** from frontend - always use RPC
- ✅ **Audit logging** for all admin actions
- ✅ **RLS policies** enforce proper access control

### Data Protection
- ✅ **Anonymous users** can only read public settings (maintenance, banner)
- ✅ **Regular users** cannot access admin functions or tables
- ✅ **Moderators** have limited access compared to admins
- ✅ **All changes** are logged with actor, action, target, and timestamp

### Best Practices
- ✅ **Use RPC functions** for all admin operations
- ✅ **Validate inputs** before processing
- ✅ **Log all actions** for accountability
- ✅ **Handle errors gracefully** with user-friendly messages
- ✅ **Refresh data** after successful operations

---

## 📞 Support

### Getting Help
1. **Check Audit Log** - Review recent admin actions for troubleshooting
2. **Console Errors** - Check browser console for detailed error messages
3. **Network Tab** - Monitor API calls and responses in browser dev tools
4. **Supabase Dashboard** - Check database logs and function performance

### Emergency Procedures
1. **Maintenance Mode** - Enable immediately if security issue detected
2. **User Ban** - Immediately ban problematic users
3. **Audit Review** - Check recent admin actions for unauthorized access
4. **Contact Support** - Reach out through official channels if needed

---

## 🔄 Deployment & Recovery

### Fresh Setup
If moving to new environment or restoring from backup:

1. **Run SQL files in order**:
   ```bash
   # Run in Supabase SQL Editor
   01_app_settings.sql
   02_admin_audit_log.sql  
   03_admin_rpcs.sql
   04_rls_final.sql
   05_indexes.sql
   ```

2. **Verify Functions**:
   - Check all RPC functions appear in Supabase Functions tab
   - Test each function with simple calls

3. **Check RLS Policies**:
   - Verify all tables have RLS enabled
   - Test access control with different user roles

4. **Test Admin Access**:
   - Create test admin user
   - Login and test all admin functions
   - Verify audit log records actions

### Backup & Restore
1. **Export Audit Log** regularly for record keeping
2. **Backup Settings** before major changes
3. **Document Changes** in version control
4. **Test Recovery** procedures before emergency

---

## 📋 Quick Reference

### Important Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - Main dashboard
- `/admin/members` - User management
- `/admin/verification` - Verification queue
- `/admin/settings` - System settings
- `/admin/audit` - Audit log

### Key RPC Functions
- `get_app_settings()` - Get application settings
- `admin_update_member()` - Update user profile
- `admin_approve_verification()` - Approve verification
- `admin_reject_verification()` - Reject verification
- `admin_upsert_app_setting()` - Update app settings
- `log_admin_action()` - Log admin actions

### Security Functions
- `is_admin(user_id)` - Check if user is admin
- `is_moderator_or_admin(user_id)` - Check moderator/admin access

---

*Last Updated: v1.0.0-admin*
