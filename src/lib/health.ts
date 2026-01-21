import { supabase } from './supabase';

export interface HealthCheckResult {
  db: string;
  time: string;
}

export const healthCheck = async (): Promise<HealthCheckResult> => {
  try {
    const { data, error } = await supabase.rpc('health_check');
    
    if (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
    
    return data as HealthCheckResult;
  } catch (err) {
    console.error('Health check error:', err);
    throw err;
  }
};

export const isServerHealthy = async (): Promise<boolean> => {
  try {
    const result = await healthCheck();
    return result.db === 'ok';
  } catch {
    return false;
  }
};

// Usage example:
// const health = await healthCheck();
// console.log('Database status:', health.db);
// console.log('Server time:', health.time);

// const isHealthy = await isServerHealthy();
// console.log('Server healthy:', isHealthy);
