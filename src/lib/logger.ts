// Simple logger for development vs production
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`🔍 ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.info(`ℹ️ ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDev || isProd) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (isDev || isProd) {
      console.error(`❌ ${message}`, ...args);
    }
  }
};
