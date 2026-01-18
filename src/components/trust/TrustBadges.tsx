import { CheckCircle, Shield, UserCheck, Store, UserX } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';

interface TrustBadgesProps {
  role: 'member' | 'moderator' | 'admin' | 'super_admin';
  is_verified: boolean;
  can_invite: boolean;
  vendor_status: 'approved' | 'pending' | 'rejected' | 'none';
  vendor_brand_name?: string | null;
  mode?: 'public' | 'member';
  lang: Language;
}

export const TrustBadges = ({
  role,
  is_verified,
  can_invite,
  vendor_status,
  vendor_brand_name,
  mode = 'member',
  lang,
}: TrustBadgesProps) => {
  const t = useTranslations(lang);

  const getRoleBadge = () => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
            <Shield className="w-3.5 h-3.5" />
            {t.trust.role.super_admin}
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30 whitespace-nowrap">
            <Shield className="w-3.5 h-3.5" />
            {t.trust.role.admin}
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 whitespace-nowrap">
            <Shield className="w-3.5 h-3.5" />
            {t.trust.role.moderator}
          </span>
        );
      case 'member':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {is_verified && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 whitespace-nowrap">
          <CheckCircle className="w-3.5 h-3.5" />
          {t.trust.verified}
        </span>
      )}

      {getRoleBadge()}

      {mode === 'member' && can_invite && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/70 border border-white/10 whitespace-nowrap">
          <UserCheck className="w-3.5 h-3.5" />
          {t.trust.invitesEnabled}
        </span>
      )}

      {mode === 'member' && !can_invite && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10 whitespace-nowrap">
          <UserX className="w-3.5 h-3.5" />
          {t.trust.invitesRevoked}
        </span>
      )}

      {vendor_status === 'approved' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/30 whitespace-nowrap">
          <Store className="w-3.5 h-3.5" />
          {t.trust.vendorApproved}
          {vendor_brand_name && ` • ${vendor_brand_name}`}
        </span>
      )}

      {mode === 'member' && vendor_status === 'pending' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400/70 border border-yellow-500/20 whitespace-nowrap">
          <Store className="w-3.5 h-3.5" />
          {t.trust.vendorPending}
        </span>
      )}
    </div>
  );
};
