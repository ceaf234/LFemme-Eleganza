import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export type StaffRole = 'owner' | 'provider' | 'receptionist';

export interface AdminStaff {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  // Weekly schedule (null = day off)
  sunday_start: string | null;
  sunday_end: string | null;
  monday_start: string | null;
  monday_end: string | null;
  tuesday_start: string | null;
  tuesday_end: string | null;
  wednesday_start: string | null;
  wednesday_end: string | null;
  thursday_start: string | null;
  thursday_end: string | null;
  friday_start: string | null;
  friday_end: string | null;
  saturday_start: string | null;
  saturday_end: string | null;
}

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  is_active: boolean;
}

export interface ScheduleDay {
  start: string | null; // "HH:MM" or null for day off
  end: string | null;
}

export interface WeeklySchedule {
  sunday: ScheduleDay;
  monday: ScheduleDay;
  tuesday: ScheduleDay;
  wednesday: ScheduleDay;
  thursday: ScheduleDay;
  friday: ScheduleDay;
  saturday: ScheduleDay;
}

interface UseAdminStaffResult {
  staff: AdminStaff[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createStaff: (data: StaffFormData) => Promise<AdminStaff>;
  updateStaff: (id: number, data: Partial<StaffFormData>) => Promise<AdminStaff>;
  updateSchedule: (id: number, schedule: WeeklySchedule) => Promise<void>;
  toggleActive: (id: number, isActive: boolean) => Promise<void>;
}

export function useAdminStaff(): UseAdminStaffResult {
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('staff')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setStaff([]);
    } else {
      setStaff(data as AdminStaff[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const createStaff = async (data: StaffFormData): Promise<AdminStaff> => {
    const { data: newStaff, error: createError } = await supabase
      .from('staff')
      .insert({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role,
        is_active: data.is_active,
      })
      .select()
      .single();

    if (createError) throw new Error(createError.message);

    // Update local state
    setStaff((prev) =>
      [...prev, newStaff as AdminStaff].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    return newStaff as AdminStaff;
  };

  const updateStaff = async (
    id: number,
    data: Partial<StaffFormData>
  ): Promise<AdminStaff> => {
    const { data: updated, error: updateError } = await supabase
      .from('staff')
      .update({
        ...data,
        email: data.email || null,
        phone: data.phone || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Update local state
    setStaff((prev) =>
      prev
        .map((s) => (s.id === id ? (updated as AdminStaff) : s))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    return updated as AdminStaff;
  };

  const updateSchedule = async (
    id: number,
    schedule: WeeklySchedule
  ): Promise<void> => {
    const { error: updateError } = await supabase
      .from('staff')
      .update({
        sunday_start: schedule.sunday.start,
        sunday_end: schedule.sunday.end,
        monday_start: schedule.monday.start,
        monday_end: schedule.monday.end,
        tuesday_start: schedule.tuesday.start,
        tuesday_end: schedule.tuesday.end,
        wednesday_start: schedule.wednesday.start,
        wednesday_end: schedule.wednesday.end,
        thursday_start: schedule.thursday.start,
        thursday_end: schedule.thursday.end,
        friday_start: schedule.friday.start,
        friday_end: schedule.friday.end,
        saturday_start: schedule.saturday.start,
        saturday_end: schedule.saturday.end,
      })
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    // Refetch to get updated data
    await fetchStaff();
  };

  const toggleActive = async (id: number, isActive: boolean): Promise<void> => {
    await updateStaff(id, { is_active: isActive });
  };

  return {
    staff,
    loading,
    error,
    refetch: fetchStaff,
    createStaff,
    updateStaff,
    updateSchedule,
    toggleActive,
  };
}

// Helper to extract schedule from staff record
export function extractSchedule(staff: AdminStaff): WeeklySchedule {
  return {
    sunday: { start: staff.sunday_start, end: staff.sunday_end },
    monday: { start: staff.monday_start, end: staff.monday_end },
    tuesday: { start: staff.tuesday_start, end: staff.tuesday_end },
    wednesday: { start: staff.wednesday_start, end: staff.wednesday_end },
    thursday: { start: staff.thursday_start, end: staff.thursday_end },
    friday: { start: staff.friday_start, end: staff.friday_end },
    saturday: { start: staff.saturday_start, end: staff.saturday_end },
  };
}
