import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface AdminClient {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  birthday: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
  birthday: string;
}

interface UseAdminClientsResult {
  clients: AdminClient[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  searchClients: (query: string) => void;
  createClient: (data: ClientFormData) => Promise<AdminClient>;
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
      .order('name', { ascending: true });

    // Apply search filter
    if (searchQuery.trim()) {
      const search = `%${searchQuery.trim()}%`;
      query = query.or(
        `name.ilike.${search},email.ilike.${search},phone.ilike.${search}`
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

  const createClient = async (data: ClientFormData): Promise<AdminClient> => {
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        notes: data.notes || null,
        birthday: data.birthday || null,
      })
      .select()
      .single();

    if (createError) throw new Error(createError.message);

    // Update local state
    setClients((prev) =>
      [...prev, newClient as AdminClient].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    return newClient as AdminClient;
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
        birthday: data.birthday || null,
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
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    return updated as AdminClient;
  };

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    searchClients,
    createClient,
    updateClient,
  };
}
