import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { buildGuatemalaISO, buildGuatemalaEndISO } from '../lib/datetime';
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
      // 1. Upsert client by phone (primary identifier)
      let clientId: number;
      const normalizedPhone = state.customer.phone.replace(/\D/g, '');

      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', normalizedPhone)
        .single();

      if (existingClient) {
        clientId = existingClient.id;

        // Update client info — only overwrite email if a new one is provided
        const updatePayload: Record<string, unknown> = {
          name: state.customer.name.trim(),
          updated_at: new Date().toISOString(),
        };
        if (state.customer.email?.trim()) {
          updatePayload.email = state.customer.email.trim();
        }

        await supabase
          .from('clients')
          .update(updatePayload)
          .eq('id', clientId);
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: state.customer.name.trim(),
            email: state.customer.email?.trim() || null,
            phone: normalizedPhone,
            notes: state.customer.notes || null,
          })
          .select('id')
          .single();

        if (clientError) throw new Error(`Error creating client: ${clientError.message}`);
        clientId = newClient.id;
      }

      // 3. Calculate starts_at and ends_at with Guatemala timezone offset
      const totalDuration = state.selectedServices.reduce((sum, s) => sum + s.duration, 0);
      const startsAtISO = buildGuatemalaISO(state.selectedDate!, state.selectedTimeSlot!);
      const endsAtISO = buildGuatemalaEndISO(state.selectedDate!, state.selectedTimeSlot!, totalDuration);

      // 4. Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: clientId,
          staff_id: state.selectedStaffId,
          starts_at: startsAtISO,
          ends_at: endsAtISO,
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

      // 6. Upload voucher (non-fatal — appointment already exists)
      if (state.voucherFile && state.paymentType === 'transfer') {
        try {
          const ext = state.voucherFile.name.split('.').pop() || 'jpg';
          const storagePath = `appointment_${appointment.id}/voucher.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('vouchers')
            .upload(storagePath, state.voucherFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.warn('Voucher upload failed:', uploadError.message);
          } else {
            // Link voucher path to appointment
            const { error: updateError } = await supabase
              .from('appointments')
              .update({ voucher_path: storagePath })
              .eq('id', appointment.id);

            if (updateError) {
              console.warn('Failed to link voucher to appointment:', updateError.message);
            }
          }
        } catch (voucherErr) {
          console.warn('Voucher upload error:', voucherErr);
        }
      }

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
