import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { BookingService } from './types';

interface SupabaseServiceRow {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

interface UseServicesResult {
  services: BookingService[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<BookingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (supabaseError) {
      setError(supabaseError.message);
      setServices([]);
    } else {
      const mapped: BookingService[] = (data as SupabaseServiceRow[]).map((row) => ({
        id: String(row.id),
        name: row.name,
        description: row.description,
        duration: row.duration_minutes,
        price: row.price,
        category: '',
      }));
      setServices(mapped);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices };
}
