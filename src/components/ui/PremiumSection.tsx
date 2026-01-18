import { ReactNode } from 'react';
import { layout, typography } from '../../lib/designTokens';

interface PremiumSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
  centered?: boolean;
  variant?: 'default' | 'compact' | 'dense' | 'tight';
  padTop?: 'none' | 'sm' | 'md' | 'lg';
  padBottom?: 'none' | 'sm' | 'md' | 'lg';
}

export const PremiumSection = ({
  children,
  title,
  subtitle,
  eyebrow,
  className = '',
  centered = false,
  variant = 'default',
  padTop,
  padBottom,
}: PremiumSectionProps) => {
  const spacingClass = variant === 'compact'
    ? layout.spacing.section.yCompact
    : variant === 'dense'
    ? layout.spacing.section.yDense
    : variant === 'tight'
    ? layout.spacing.section.yTight
    : layout.spacing.section.y;

  const padTopClass = padTop === 'none' ? 'pt-0'
    : padTop === 'sm' ? 'pt-6 md:pt-8'
    : padTop === 'md' ? 'pt-10 md:pt-12'
    : padTop === 'lg' ? 'pt-14 md:pt-16'
    : '';

  const padBottomClass = padBottom === 'none' ? 'pb-0'
    : padBottom === 'sm' ? 'pb-6 md:pb-8'
    : padBottom === 'md' ? 'pb-10 md:pb-12'
    : padBottom === 'lg' ? 'pb-14 md:pb-16'
    : '';

  const headerMargin = variant === 'tight' ? 'mb-4 md:mb-5' : 'mb-5 md:mb-6';

  return (
    <section className={`${spacingClass} ${padTopClass} ${padBottomClass} px-4 sm:px-6 ${className}`}>
      <div className={layout.spacing.container}>
        {(title || subtitle || eyebrow) && (
          <div className={`${headerMargin} ${centered ? 'text-center' : ''}`}>
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
