import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface AppointmentHistoryEntry {
  id: number;
  appointment_id: number;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: number | null;
  staff?: {
    id: number;
    name: string;
  } | null;
}

interface UseAppointmentHistoryResult {
  history: AppointmentHistoryEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAppointmentHistory(appointmentId: number): UseAppointmentHistoryResult {
  const [history, setHistory] = useState<AppointmentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!appointmentId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('appointment_history')
        .select(`
          *,
          staff:staff(id, name)
        `)
        .eq('appointment_id', appointmentId)
        .order('changed_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
}

// Hook for fetching all recent history entries across all appointments
export function useRecentAppointmentHistory(limit: number = 50) {
  const [history, setHistory] = useState<(AppointmentHistoryEntry & {
    appointment?: {
      id: number;
      starts_at: string;
      client: { name: string } | null;
    };
  })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('appointment_history')
        .select(`
          *,
          staff:staff(id, name),
          appointment:appointments(
            id,
            starts_at,
            client:clients(name)
          )
        `)
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
}

// Status labels for display
export const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistio',
};
