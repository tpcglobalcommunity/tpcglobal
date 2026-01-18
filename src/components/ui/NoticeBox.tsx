import { ReactNode } from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface NoticeBoxProps {
  children: ReactNode;
  variant?: 'warning' | 'info';
  className?: string;
}

export const NoticeBox = ({ children, variant = 'warning', className = '' }: NoticeBoxProps) => {
  const variantStyles = {
    warning: {
      container: 'bg-[#F0B90B]/10 border-[#F0B90B]/30',
      icon: 'text-[#F0B90B]',
      text: 'text-white/75',
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500/30',
      icon: 'text-blue-400',
      text: 'text-white/75',
    },
  };

  const styles = variantStyles[variant];
  const Icon = variant === 'warning' ? AlertCircle : Info;

  return (
    <div
      className={`
        backdrop-blur-xl border rounded-xl p-4
        ${styles.container} ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
        <div className={`text-sm leading-relaxed ${styles.text}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
