import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface AdminService {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

interface UseAdminServicesResult {
  services: AdminService[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createService: (data: ServiceFormData) => Promise<AdminService>;
  updateService: (id: number, data: Partial<ServiceFormData>) => Promise<AdminService>;
  toggleActive: (id: number, isActive: boolean) => Promise<void>;
}

export function useAdminServices(): UseAdminServicesResult {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setServices([]);
    } else {
      setServices(data as AdminService[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = async (data: ServiceFormData): Promise<AdminService> => {
    const { data: newService, error: createError } = await supabase
      .from('services')
      .insert({
        name: data.name,
        description: data.description || null,
        duration_minutes: data.duration_minutes,
        price: data.price,
        is_active: data.is_active,
      })
      .select()
      .single();

    if (createError) throw new Error(createError.message);

    // Update local state
    setServices((prev) => [...prev, newService as AdminService].sort((a, b) => a.name.localeCompare(b.name)));

    return newService as AdminService;
  };

  const updateService = async (id: number, data: Partial<ServiceFormData>): Promise<AdminService> => {
    const { data: updated, error: updateError } = await supabase
      .from('services')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Update local state
    setServices((prev) =>
      prev
        .map((s) => (s.id === id ? (updated as AdminService) : s))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    return updated as AdminService;
  };

  const toggleActive = async (id: number, isActive: boolean): Promise<void> => {
    await updateService(id, { is_active: isActive });
  };

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    createService,
    updateService,
    toggleActive,
  };
}
