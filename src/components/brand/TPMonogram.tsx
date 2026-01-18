interface TPMonogramProps {
  size?: number;
  className?: string;
  variant?: 'solid' | 'dark';
}

const TPMonogram = ({ size = 32, className = '', variant = 'solid' }: TPMonogramProps) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:rotate-[0.5deg] ${className}`}
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 0 8px rgba(240, 185, 11, 0.3)) drop-shadow(0 0 2px rgba(240, 185, 11, 0.2))',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
      >
        <defs>
          <linearGradient id="tp-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAE18B" />
            <stop offset="40%" stopColor="#F8D568" />
            <stop offset="100%" stopColor="#F0B90B" />
          </linearGradient>

          <linearGradient id="tp-dark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>

          <linearGradient id="tp-text-gold" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFF4D6" />
            <stop offset="50%" stopColor="#F8D568" />
            <stop offset="100%" stopColor="#F0B90B" />
          </linearGradient>

          <filter id="tp-inner-glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="blur" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="12"
          fill={isDark ? 'url(#tp-dark-gradient)' : 'url(#tp-gold-gradient)'}
        />

        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="9"
          fill={isDark ? 'url(#tp-gold-gradient)' : 'url(#tp-dark-gradient)'}
        />

        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="9"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
          fill="none"
        />

        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="42"
          fontWeight="800"
          letterSpacing="-0.085em"
          fill={isDark ? 'url(#tp-dark-gradient)' : 'url(#tp-text-gold)'}
          style={{
            textTransform: 'uppercase',
            paintOrder: 'stroke fill'
          }}
        >
          TP
        </text>

        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="9"
          fill="url(#tp-gold-gradient)"
          opacity="0.08"
          style={{ mixBlendMode: 'overlay' }}
        />

        <rect
          x="8"
          y="8"
          width="84"
          height="42"
          rx="9"
          fill="rgba(255, 255, 255, 0.06)"
          style={{ mixBlendMode: 'overlay' }}
        />

        <path
          d="M 12 12 L 88 12"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="0.5"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default TPMonogram;
