import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { gtDayBoundaries } from '../../lib/datetime';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface AppointmentService {
  id: number;
  service_id: number;
  price: number;
  service: {
    name: string;
    duration_minutes: number;
  };
}

export interface AdminAppointment {
  id: number;
  client_id: number;
  staff_id: number;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
  staff: {
    id: number;
    first_name: string;
    last_name: string;
  };
  appointment_services: AppointmentService[];
}

interface UseAdminAppointmentsResult {
  appointments: AdminAppointment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateStatus: (id: number, status: AppointmentStatus) => Promise<void>;
  updateNotes: (id: number, notes: string) => Promise<void>;
}

export function useAdminAppointments(dateFilter?: string): UseAdminAppointmentsResult {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, first_name, last_name, email, phone),
        staff:staff(id, first_name, last_name),
        appointment_services(
          id,
          service_id,
          price,
          service:services(name, duration_minutes)
        )
      `)
      .order('starts_at', { ascending: true });

    // Filter by date if provided (Guatemala timezone boundaries)
    if (dateFilter) {
      const { start, end } = gtDayBoundaries(dateFilter);
      query = query.gte('starts_at', start).lt('starts_at', end);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setAppointments([]);
    } else {
      setAppointments(data as AdminAppointment[]);
    }

    setLoading(false);
  }, [dateFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: number, status: AppointmentStatus): Promise<void> => {
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    // Update local state
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const updateNotes = async (id: number, notes: string): Promise<void> => {
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    // Update local state
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notes } : a))
    );
  };

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    updateStatus,
    updateNotes,
  };
}

// Status labels and colors
export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: 'Programada', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  confirmed: { label: 'Confirmada', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  in_progress: { label: 'En progreso', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  completed: { label: 'Completada', color: 'text-accent', bgColor: 'bg-accent/20' },
  cancelled: { label: 'Cancelada', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  no_show: { label: 'No asistio', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
};
