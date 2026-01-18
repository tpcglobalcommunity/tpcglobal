import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PremiumButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  href?: string;
  onClick?: () => void;
  className?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const PremiumButton = ({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  target,
  rel,
  type = 'button',
  disabled = false,
}: PremiumButtonProps) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
    font-semibold text-base transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0E11]
  `;

  const primaryClasses = `
    bg-gradient-to-r from-[#F0B90B] to-[#FCD535] text-black
    hover:from-[#FCD535] hover:to-[#F0B90B] hover:shadow-[0_0_30px_rgba(240,185,11,0.3)]
    focus:ring-[#F0B90B]
  `;

  const secondaryClasses = `
    backdrop-blur-xl bg-white/5 border border-white/20 text-white
    hover:bg-white/10 hover:border-white/30
    focus:ring-white/50
  `;

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const classes = `${baseClasses} ${variant === 'primary' ? primaryClasses : secondaryClasses} ${disabledClasses} ${className}`;

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 },
  };

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        target={target}
        rel={rel}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};
