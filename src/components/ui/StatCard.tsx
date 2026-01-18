import { ReactNode } from 'react';
import { PremiumCard } from './PremiumCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export const StatCard = ({ label, value, icon, className = '' }: StatCardProps) => {
  return (
    <PremiumCard className={className} hover={false}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#C29409] flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/60 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white truncate">{value}</p>
        </div>
      </div>
    </PremiumCard>
  );
};

interface ProgressCardProps {
  label: string;
  current: number;
  total: number;
  className?: string;
}

export const ProgressCard = ({ label, current, total, className = '' }: ProgressCardProps) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <PremiumCard className={className} hover={false}>
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <p className="text-sm text-white/60">{label}</p>
          <p className="text-lg font-semibold text-white">
            {current.toLocaleString()} / {total.toLocaleString()}
          </p>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#F0B90B] to-[#FCD535] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-white/50 text-right">{percentage.toFixed(1)}%</p>
      </div>
    </PremiumCard>
  );
};
