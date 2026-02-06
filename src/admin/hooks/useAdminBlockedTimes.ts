import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface AdminBlockedTime {
  id: number;
  staff_id: number;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
  staff?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface BlockedTimeFormData {
  staff_id: number;
  starts_at: string;
  ends_at: string;
  reason: string;
}

interface UseAdminBlockedTimesResult {
  blockedTimes: AdminBlockedTime[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createBlockedTime: (data: BlockedTimeFormData) => Promise<AdminBlockedTime>;
  updateBlockedTime: (id: number, data: Partial<BlockedTimeFormData>) => Promise<AdminBlockedTime>;
  deleteBlockedTime: (id: number) => Promise<void>;
}

export function useAdminBlockedTimes(staffId?: number): UseAdminBlockedTimesResult {
  const [blockedTimes, setBlockedTimes] = useState<AdminBlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockedTimes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('blocked_times')
        .select(`
          *,
          staff:staff(id, first_name, last_name)
        `)
        .order('starts_at', { ascending: true });

      if (staffId) {
        query = query.eq('staff_id', staffId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setBlockedTimes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tiempos bloqueados');
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchBlockedTimes();
  }, [fetchBlockedTimes]);

  const createBlockedTime = async (data: BlockedTimeFormData): Promise<AdminBlockedTime> => {
    const { data: newBlockedTime, error: createError } = await supabase
      .from('blocked_times')
      .insert({
        staff_id: data.staff_id,
        starts_at: data.starts_at,
        ends_at: data.ends_at,
        reason: data.reason || null,
      })
      .select(`
        *,
        staff:staff(id, first_name, last_name)
      `)
      .single();

    if (createError) {
      throw new Error(createError.message);
    }

    setBlockedTimes((prev) => [...prev, newBlockedTime].sort((a, b) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    ));

    return newBlockedTime;
  };

  const updateBlockedTime = async (
    id: number,
    data: Partial<BlockedTimeFormData>
  ): Promise<AdminBlockedTime> => {
    const { data: updatedBlockedTime, error: updateError } = await supabase
      .from('blocked_times')
      .update({
        ...data,
        reason: data.reason || null,
      })
      .eq('id', id)
      .select(`
        *,
        staff:staff(id, first_name, last_name)
      `)
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    setBlockedTimes((prev) =>
      prev
        .map((bt) => (bt.id === id ? updatedBlockedTime : bt))
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    );

    return updatedBlockedTime;
  };

  const deleteBlockedTime = async (id: number): Promise<void> => {
    const { error: deleteError } = await supabase
      .from('blocked_times')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    setBlockedTimes((prev) => prev.filter((bt) => bt.id !== id));
  };

  return {
    blockedTimes,
    loading,
    error,
    refetch: fetchBlockedTimes,
    createBlockedTime,
    updateBlockedTime,
    deleteBlockedTime,
  };
}
