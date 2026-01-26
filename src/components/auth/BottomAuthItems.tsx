import { useEffect, useState } from 'react';
import { LayoutDashboard, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useI18n, getLangPath } from '@/i18n';
import { Link } from '../Router';

function useSession() {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setIsAuthed(!!data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!alive) return;
        setIsAuthed(!!session);
        setLoading(false);
      })();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, isAuthed };
}

export function BottomAuthItems() {
  const { language, t } = useI18n();
  const { loading, isAuthed } = useSession();

  if (loading) return null;

  const memberHref = isAuthed
    ? getLangPath(language, '/member/dashboard')
    : getLangPath(language, '/signin');

  return (
    <div className="flex items-center gap-2">
      <Link
        to={memberHref}
        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-center gap-2"
      >
        <LayoutDashboard className="w-4 h-4 text-[#F0B90B]" />
        <span className="text-sm font-semibold text-white">
          {isAuthed ? (t('member.dashboard.title') || 'Dashboard') : (t('auth.signin.signIn') || 'Sign In')}
        </span>
      </Link>

      {!isAuthed && (
        <Link
          to={getLangPath(language, '/signup')}
          className="rounded-2xl border border-[#F0B90B]/25 bg-[#F0B90B]/10 px-3 py-2 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-[#F0B90B]" />
          <span className="text-sm font-semibold text-white">
            {t('auth.signup.createAccount') || 'Sign Up'}
          </span>
        </Link>
      )}
    </div>
  );
}
