import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { AvailableSlot } from './types';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

interface UseAvailableSlotsResult {
  slots: AvailableSlot[];
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
}

export function useAvailableSlots(
  staffId: number | null,
  date: string | null
): UseAvailableSlotsResult {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const fetchSlots = useCallback(
    async (isPolling = false) => {
      if (!staffId || !date) return;

      if (!isPolling) {
        setLoading(true);
        setError(null);
      } else {
        setIsRefreshing(true);
      }

      const { data, error: rpcError } = await supabase.rpc('get_available_slots', {
        p_staff_id: staffId,
        p_date: date,
      });

      if (rpcError) {
        // On poll errors, silently fail — don't overwrite existing slots
        if (!isPolling) {
          setError(rpcError.message);
          setSlots([]);
        }
      } else {
        setSlots((data as AvailableSlot[]) ?? []);
      }

      if (!isPolling) setLoading(false);
      else setIsRefreshing(false);
    },
    [staffId, date]
  );

  // Initial fetch when staffId/date change
  useEffect(() => {
    if (!staffId || !date) {
      setSlots([]);
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      await fetchSlots(false);
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchSlots]);

  // Polling interval — silent background refresh every 30s
  useEffect(() => {
    if (!staffId || !date) return;

    intervalRef.current = window.setInterval(() => {
      fetchSlots(true);
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchSlots]);

  return { slots, loading, error, isRefreshing };
}
