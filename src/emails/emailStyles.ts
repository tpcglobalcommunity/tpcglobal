export interface EmailColors {
  background: string;
  card: string;
  gold: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export function getEmailBaseStyles(): {
  colors: EmailColors;
  container: string;
  card: string;
  button: string;
  badge: string;
  divider: string;
  text: string;
  smallText: string;
  securityBox: string;
  footer: string;
} {
  const colors: EmailColors = {
    background: '#0B0F14',
    card: '#111827',
    gold: '#F0B90B',
    text: '#E5E7EB',
    muted: '#9CA3AF',
    border: '#374151',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };

  return {
    colors,
    
    container: `
      background-color: ${colors.background};
      margin: 0;
      padding: 20px;
      font-family: Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color: ${colors.text};
    `,
    
    card: `
      background-color: ${colors.card};
      border: 1px solid ${colors.border};
      border-radius: 12px;
      padding: 24px;
      margin: 0 auto;
      max-width: 600px;
    `,
    
    button: `
      display: inline-block;
      background-color: ${colors.gold};
      color: ${colors.background};
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      padding: 12px 24px;
      border-radius: 8px;
      text-align: center;
      margin: 16px 0;
    `,
    
    badge: `
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `,
    
    divider: `
      height: 1px;
      background-color: ${colors.border};
      margin: 24px 0;
      border: none;
    `,
    
    text: `
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
    `,
    
    smallText: `
      font-size: 14px;
      color: ${colors.muted};
      line-height: 1.5;
    `,
    
    securityBox: `
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    `,
    
    footer: `
      background-color: ${colors.background};
      border-top: 1px solid ${colors.border};
      padding: 20px 0;
      text-align: center;
      font-size: 12px;
      color: ${colors.muted};
    `
  };
}

export function getBadgeStyle(color: 'success' | 'warning' | 'error' | 'gold'): string {
  const styles = getEmailBaseStyles();
  const colors = {
    success: styles.colors.success,
    warning: styles.colors.warning,
    error: styles.colors.error,
    gold: styles.colors.gold
  };
  
  return `${styles.badge} background-color: ${colors[color]}; color: ${styles.colors.background};`;
}
