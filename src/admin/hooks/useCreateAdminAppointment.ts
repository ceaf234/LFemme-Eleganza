import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { buildGuatemalaISO, buildGuatemalaEndISO } from '../../lib/datetime';
import type { AdminService } from './useAdminServices';

export interface AdminAppointmentFormData {
  clientMode: 'existing' | 'new';
  selectedClientId: number | null;
  newClient: {
    name: string;
    phone: string;
    email: string;
  };
  staff_id: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  service_ids: number[];
  notes: string;
}

interface UseCreateAdminAppointmentResult {
  createAppointment: (
    data: AdminAppointmentFormData,
    services: AdminService[]
  ) => Promise<number>;
  loading: boolean;
  error: string | null;
}

export function useCreateAdminAppointment(): UseCreateAdminAppointmentResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createAppointment(
    data: AdminAppointmentFormData,
    services: AdminService[]
  ): Promise<number> {
    setLoading(true);
    setError(null);

    try {
      // 1. Resolve client ID
      let clientId: number;

      if (data.clientMode === 'existing') {
        if (!data.selectedClientId) throw new Error('No se selecciono un cliente.');
        clientId = data.selectedClientId;
      } else {
        // Upsert by phone (same logic as useCreateBooking)
        const normalizedPhone = data.newClient.phone.replace(/\D/g, '');

        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', normalizedPhone)
          .single();

        if (existingClient) {
          clientId = existingClient.id;

          // Update client info
          const updatePayload: Record<string, unknown> = {
            name: data.newClient.name,
            updated_at: new Date().toISOString(),
          };
          if (data.newClient.email?.trim()) {
            updatePayload.email = data.newClient.email.trim();
          }

          await supabase.from('clients').update(updatePayload).eq('id', clientId);
        } else {
          // Create new client
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              name: data.newClient.name,
              email: data.newClient.email?.trim() || null,
              phone: normalizedPhone,
            })
            .select('id')
            .single();

          if (clientError) throw new Error(`Error al crear cliente: ${clientError.message}`);
          clientId = newClient.id;
        }
      }

      // 2. Calculate times
      const selectedServices = services.filter((s) => data.service_ids.includes(s.id));
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
      const startsAtISO = buildGuatemalaISO(data.date, data.time);
      const endsAtISO = buildGuatemalaEndISO(data.date, data.time, totalDuration);

      // 3. Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: clientId,
          staff_id: data.staff_id,
          starts_at: startsAtISO,
          ends_at: endsAtISO,
          status: 'scheduled',
          notes: data.notes || null,
        })
        .select('id')
        .single();

      if (appointmentError) throw new Error(`Error al crear cita: ${appointmentError.message}`);

      // 4. Create appointment_services entries
      const appointmentServices = selectedServices.map((service, index) => ({
        appointment_id: appointment.id,
        service_id: service.id,
        price: service.price,
        sort_order: index,
      }));

      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(appointmentServices);

      if (servicesError) throw new Error(`Error al crear servicios: ${servicesError.message}`);

      setLoading(false);
      return appointment.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la cita';
      setError(message);
      setLoading(false);
      throw err;
    }
  }

  return { createAppointment, loading, error };
}
