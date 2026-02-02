import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { StaffMember } from './types';

interface UseStaffResult {
  staff: StaffMember[];
  loading: boolean;
  error: string | null;
}

export function useStaff(): UseStaffResult {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStaff() {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('staff')
        .select('id,first_name,last_name')
        .eq('is_active', true);

      if (cancelled) return;

      if (supabaseError) {
        setError(supabaseError.message);
        setLoading(false);
        return;
      }

      setStaff((data as StaffMember[]) ?? []);
      setLoading(false);
    }

    fetchStaff();

    return () => {
      cancelled = true;
    };
  }, []);

  return { staff, loading, error };
}
