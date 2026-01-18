export const colors = {
  gold: {
    primary: '#F0B90B',
    dark: '#C29409',
    light: '#FCD535',
  },
  background: {
    primary: '#0B0E11',
    secondary: '#13171D',
    card: 'rgba(255, 255, 255, 0.05)',
    cardHover: 'rgba(255, 255, 255, 0.08)',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(240, 185, 11, 0.3)',
    active: 'rgba(240, 185, 11, 0.5)',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.75)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
  },
} as const;

export const radii = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  card: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
  cardHover: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  glow: '0 0 60px rgba(240, 185, 11, 0.15)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const layout = {
  containerWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  sectionPadding: {
    mobile: {
      sm: '2rem',
      md: '3rem',
      lg: '4rem',
    },
    desktop: {
      sm: '3rem',
      md: '4rem',
      lg: '6rem',
    },
  },
  spacing: {
    section: {
      y: 'py-8 md:py-12',
      yLarge: 'py-12 md:py-16',
    },
    container: 'max-w-6xl mx-auto px-4 sm:px-6',
    containerWide: 'max-w-7xl mx-auto px-4 sm:px-6',
  },
  safeArea: {
    bottom: 'pb-32 md:pb-36',
    bottomWithFooter: 'pb-8 mb-8',
  },
} as const;

export const typography = {
  heading: {
    h1: 'text-4xl md:text-6xl font-bold tracking-tight',
    h2: 'text-2xl md:text-3xl font-semibold',
    h3: 'text-xl md:text-2xl font-semibold',
    h4: 'text-lg md:text-xl font-semibold',
  },
  body: {
    base: 'text-base leading-relaxed',
    sm: 'text-sm leading-relaxed',
    lg: 'text-lg leading-relaxed',
  },
} as const;
