import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AvailableSlot } from './types';

interface UseAvailableSlotsResult {
  slots: AvailableSlot[];
  loading: boolean;
  error: string | null;
}

export function useAvailableSlots(
  staffId: number | null,
  date: string | null
): UseAvailableSlotsResult {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!staffId || !date) {
      setSlots([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchSlots() {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_available_slots', {
        p_staff_id: staffId,
        p_date: date,
      });

      if (cancelled) return;

      if (rpcError) {
        setError(rpcError.message);
        setSlots([]);
        setLoading(false);
        return;
      }

      setSlots((data as AvailableSlot[]) ?? []);
      setLoading(false);
    }

    fetchSlots();

    return () => {
      cancelled = true;
    };
  }, [staffId, date]);

  return { slots, loading, error };
}
