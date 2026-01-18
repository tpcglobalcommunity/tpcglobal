import { ReactNode } from 'react';
import { layout } from '../../lib/designTokens';

interface PremiumShellProps {
  children: ReactNode;
}

export const PremiumShell = ({ children }: PremiumShellProps) => {
  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 bg-[#0B0E11]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F0B90B]/10 rounded-full blur-[120px] pointer-events-none"></div>
      </div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
