import { useState, FormEvent } from 'react';
import { Shield, Lock, LogOut, AlertCircle, CheckCircle, Mail, User as UserIcon, Award } from 'lucide-react';
import { Language } from '../../i18n';
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import MemberGuard from '../../components/guards/MemberGuard';

interface SecurityPageProps {
  lang: Language;
}

const SecurityPage = ({ lang }: SecurityPageProps) => {
  const { t } = useLanguage();
  const translations = t;
  const { updatePassword, signOutAllDevices, user, profile } = useAuth();

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [signOutSuccess, setSignOutSuccess] = useState(false);

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError(translations.auth.errors.generic);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(translations.auth.reset.errorMismatch);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(translations.auth.errors.generic);
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await updatePassword(passwordData.newPassword);

      if (error) {
        throw error;
      }

      setPasswordSuccess(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      setPasswordError(translations.auth.errors.generic);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOutAll = async () => {
    if (!confirm(translations.member.security.signOutAll + '?')) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOutAllDevices();
      setSignOutSuccess(true);
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <MemberGuard>
      <PremiumShell>
        <PremiumSection>
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {translations.member.security.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {translations.member.security.subtitle}
              </p>
            </div>

            <div className="space-y-6">
              <PremiumCard>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <UserIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {translations.member.security.sessionTitle}
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {translations.member.security.sessionEmail}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {translations.member.security.sessionRole}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {profile?.role || 'member'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {translations.member.security.sessionVerified}
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {profile?.is_verified ? '✓' : '-'}
                    </span>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Lock className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {translations.member.security.changePassword}
                    </h2>
                  </div>
                </div>

                {passwordSuccess && (
                  <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      {translations.member.security.updated}
                    </p>
                  </div>
                )}

                {passwordError && (
                  <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{passwordError}</p>
                  </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.member.security.newPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                      minLength={6}
                      disabled={isUpdatingPassword}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.member.security.confirmPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                      minLength={6}
                      disabled={isUpdatingPassword}
                    />
                  </div>

                  <PremiumButton type="submit" disabled={isUpdatingPassword}>
                    <Lock className="w-4 h-4" />
                    {isUpdatingPassword ? translations.member.security.updating : translations.member.security.updatePassword}
                  </PremiumButton>
                </form>
              </PremiumCard>

              <PremiumCard>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <LogOut className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {translations.member.security.signOutAll}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sign out from all devices and end all active sessions
                    </p>
                  </div>
                </div>

                {signOutSuccess && (
                  <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      {translations.member.security.signedOutAll}
                    </p>
                  </div>
                )}

                <PremiumButton
                  onClick={handleSignOutAll}
                  disabled={isSigningOut}
                  variant="secondary"
                  className="!bg-red-100 !text-red-700 hover:!bg-red-200 dark:!bg-red-900/20 dark:!text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  {isSigningOut ? translations.member.security.signingOut : translations.member.security.signOutAll}
                </PremiumButton>
              </PremiumCard>
            </div>
          </div>
        </PremiumSection>
      </PremiumShell>
    </MemberGuard>
  );
};

export default SecurityPage;
