import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BookingState } from './types';

export interface CreateBookingResult {
  appointmentId: number;
  clientId: number;
}

interface UseCreateBookingResult {
  createBooking: (state: BookingState) => Promise<CreateBookingResult>;
  loading: boolean;
  error: string | null;
}

export function useCreateBooking(): UseCreateBookingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBooking(state: BookingState): Promise<CreateBookingResult> {
    setLoading(true);
    setError(null);

    try {
      // 1. Parse customer name into first/last
      const nameParts = state.customer.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // 2. Upsert client by email (or create new if no email)
      let clientId: number;

      if (state.customer.email) {
        // Try to find existing client by email
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('email', state.customer.email)
          .single();

        if (existingClient) {
          clientId = existingClient.id;
          // Update client info
          await supabase
            .from('clients')
            .update({
              first_name: firstName,
              last_name: lastName,
              phone: state.customer.phone || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', clientId);
        } else {
          // Create new client
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              first_name: firstName,
              last_name: lastName,
              email: state.customer.email || null,
              phone: state.customer.phone || null,
              notes: state.customer.notes || null,
            })
            .select('id')
            .single();

          if (clientError) throw new Error(`Error creating client: ${clientError.message}`);
          clientId = newClient.id;
        }
      } else {
        // No email - create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: null,
            phone: state.customer.phone || null,
            notes: state.customer.notes || null,
          })
          .select('id')
          .single();

        if (clientError) throw new Error(`Error creating client: ${clientError.message}`);
        clientId = newClient.id;
      }

      // 3. Calculate starts_at and ends_at timestamps
      // state.selectedDate is "YYYY-MM-DD", state.selectedTimeSlot is "HH:mm"
      const totalDuration = state.selectedServices.reduce((sum, s) => sum + s.duration, 0);

      // Create timezone-aware timestamp (assuming Guatemala timezone)
      const startsAt = new Date(`${state.selectedDate}T${state.selectedTimeSlot}:00`);
      const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000);

      // 4. Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: clientId,
          staff_id: state.selectedStaffId,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: 'scheduled',
          notes: state.customer.notes || null,
        })
        .select('id')
        .single();

      if (appointmentError) throw new Error(`Error creating appointment: ${appointmentError.message}`);

      // 5. Create appointment_services entries
      const appointmentServices = state.selectedServices.map((service, index) => ({
        appointment_id: appointment.id,
        service_id: Number(service.id),
        price: service.price,
        sort_order: index,
      }));

      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(appointmentServices);

      if (servicesError) throw new Error(`Error creating appointment services: ${servicesError.message}`);

      setLoading(false);
      return { appointmentId: appointment.id, clientId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating booking';
      setError(message);
      setLoading(false);
      throw err;
    }
  }

  return { createBooking, loading, error };
}
