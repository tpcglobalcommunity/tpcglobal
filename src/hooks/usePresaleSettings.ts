import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface PresaleSettings {
  active_stage: string;
  stage1_price_usd: number;
  stage2_price_usd: number;
  usd_idr_rate: number;
  treasury_address: string;
}

export interface PresaleSettingsHook {
  settings: PresaleSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePresaleSettings(): PresaleSettingsHook {
  const [settings, setSettings] = useState<PresaleSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_presale_settings_public');

      if (rpcError) {
        logger.error('Failed to fetch presale settings', { error: rpcError });
        setError('Settings unavailable');
        return;
      }

      if (data && data.length > 0) {
        const settingsData = data[0] as PresaleSettings;
        setSettings(settingsData);
      }
    } catch (err) {
      logger.error('Unexpected error fetching presale settings', err);
      setError('Settings unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings
  };
}
