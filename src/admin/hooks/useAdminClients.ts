import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface AdminClient {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string;
}

interface UseAdminClientsResult {
  clients: AdminClient[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  searchClients: (query: string) => void;
  updateClient: (id: number, data: Partial<ClientFormData>) => Promise<AdminClient>;
}

export function useAdminClients(): UseAdminClientsResult {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('clients')
      .select('*')
      .order('first_name', { ascending: true });

    // Apply search filter
    if (searchQuery.trim()) {
      const search = `%${searchQuery.trim()}%`;
      query = query.or(
        `first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search},phone.ilike.${search}`
      );
    }

    const { data, error: fetchError } = await query.limit(100);

    if (fetchError) {
      setError(fetchError.message);
      setClients([]);
    } else {
      setClients(data as AdminClient[]);
    }

    setLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const searchClients = (query: string) => {
    setSearchQuery(query);
  };

  const updateClient = async (
    id: number,
    data: Partial<ClientFormData>
  ): Promise<AdminClient> => {
    const { data: updated, error: updateError } = await supabase
      .from('clients')
      .update({
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Update local state
    setClients((prev) =>
      prev
        .map((c) => (c.id === id ? (updated as AdminClient) : c))
        .sort((a, b) => a.first_name.localeCompare(b.first_name))
    );

    return updated as AdminClient;
  };

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    searchClients,
    updateClient,
  };
}
