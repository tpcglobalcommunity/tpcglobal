import { ReactNode } from 'react';
import { layout, typography } from '../../lib/designTokens';

interface PremiumSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
  centered?: boolean;
}

export const PremiumSection = ({
  children,
  title,
  subtitle,
  eyebrow,
  className = '',
  centered = false,
}: PremiumSectionProps) => {
  return (
    <section className={`${layout.spacing.section.y} px-4 sm:px-6 ${className}`}>
      <div className={layout.spacing.container}>
        {(title || subtitle || eyebrow) && (
          <div className={`mb-6 md:mb-8 ${centered ? 'text-center' : ''}`}>
            {eyebrow && (
              <p className="text-[#F0B90B] text-sm font-semibold uppercase tracking-wider mb-3">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className={`${typography.heading.h2} text-white mb-2 md:mb-3`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`${typography.body.base} text-white/75 max-w-[70ch] leading-snug md:leading-relaxed ${centered ? 'mx-auto' : ''}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};
