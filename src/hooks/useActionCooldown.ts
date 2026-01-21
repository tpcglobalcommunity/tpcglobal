import { useState, useCallback } from 'react';

interface CooldownState {
  lastActionAt: Record<string, number>;
  isCoolingDown: (actionKey: string, cooldownMs?: number) => boolean;
  setActionTime: (actionKey: string) => void;
}

export function useActionCooldown(): CooldownState {
  const [lastActionAt, setLastActionAt] = useState<Record<string, number>>({});

  const setActionTime = useCallback((actionKey: string) => {
    setLastActionAt(prev => ({
      ...prev,
      [actionKey]: Date.now()
    }));
  }, []);

  const isCoolingDown = useCallback((actionKey: string, cooldownMs: number = 2500) => {
    const lastTime = lastActionAt[actionKey];
    if (!lastTime) return false;
    
    return Date.now() - lastTime < cooldownMs;
  }, [lastActionAt]);

  return {
    lastActionAt,
    isCoolingDown,
    setActionTime
  };
}
