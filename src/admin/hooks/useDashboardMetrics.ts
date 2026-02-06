import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface DailyMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalRevenue: number;
  averageServicesPerAppointment: number;
}

export interface StaffMetrics {
  staffId: number;
  staffName: string;
  appointmentsCount: number;
  completedCount: number;
  revenue: number;
}

export interface ServiceMetrics {
  serviceId: number;
  serviceName: string;
  bookingsCount: number;
  revenue: number;
}

export interface TodayAppointment {
  id: number;
  starts_at: string;
  ends_at: string;
  status: string;
  client: {
    first_name: string;
    last_name: string;
  };
  staff: {
    first_name: string;
    last_name: string;
  };
}

// Raw types from Supabase (relations come as objects, not arrays, with proper FK)
interface RawTodayAppointment {
  id: number;
  starts_at: string;
  ends_at: string;
  status: string;
  client: { first_name: string; last_name: string } | null;
  staff: { first_name: string; last_name: string } | null;
}

interface RawStaffAppointment {
  staff_id: number;
  status: string;
  staff: { id: number; first_name: string; last_name: string } | null;
  appointment_services: { price: number }[];
}

interface RawAppointmentService {
  service_id: number;
  price: number;
  service: { id: number; name: string } | null;
  appointment: { starts_at: string; status: string } | null;
}

interface UseDashboardMetricsResult {
  todayMetrics: DailyMetrics | null;
  weeklyMetrics: DailyMetrics | null;
  monthlyMetrics: DailyMetrics | null;
  staffMetrics: StaffMetrics[];
  topServices: ServiceMetrics[];
  todayAppointments: TodayAppointment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function getDateRange(period: 'today' | 'week' | 'month'): { start: string; end: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'today') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      start: today.toISOString(),
      end: tomorrow.toISOString(),
    };
  }

  if (period === 'week') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return {
      start: startOfWeek.toISOString(),
      end: endOfWeek.toISOString(),
    };
  }

  // month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    start: startOfMonth.toISOString(),
    end: endOfMonth.toISOString(),
  };
}

export function useDashboardMetrics(): UseDashboardMetricsResult {
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics | null>(null);
  const [weeklyMetrics, setWeeklyMetrics] = useState<DailyMetrics | null>(null);
  const [monthlyMetrics, setMonthlyMetrics] = useState<DailyMetrics | null>(null);
  const [staffMetrics, setStaffMetrics] = useState<StaffMetrics[]>([]);
  const [topServices, setTopServices] = useState<ServiceMetrics[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const todayRange = getDateRange('today');
      const weekRange = getDateRange('week');
      const monthRange = getDateRange('month');

      // Fetch today's appointments with details
      const { data: todayAppts, error: todayError } = await supabase
        .from('appointments')
        .select(`
          id,
          starts_at,
          ends_at,
          status,
          client:clients(first_name, last_name),
          staff:staff(first_name, last_name)
        `)
        .gte('starts_at', todayRange.start)
        .lt('starts_at', todayRange.end)
        .order('starts_at', { ascending: true });

      if (todayError) throw todayError;

      // Transform raw data to expected format
      const transformedAppts: TodayAppointment[] = ((todayAppts as unknown as RawTodayAppointment[]) || [])
        .filter((a) => a.client && a.staff)
        .map((a) => ({
          id: a.id,
          starts_at: a.starts_at,
          ends_at: a.ends_at,
          status: a.status,
          client: a.client!,
          staff: a.staff!,
        }));

      setTodayAppointments(transformedAppts);

      // Calculate today's metrics
      const todayStats = await calculateMetrics(todayRange.start, todayRange.end);
      setTodayMetrics(todayStats);

      // Calculate weekly metrics
      const weeklyStats = await calculateMetrics(weekRange.start, weekRange.end);
      setWeeklyMetrics(weeklyStats);

      // Calculate monthly metrics
      const monthlyStats = await calculateMetrics(monthRange.start, monthRange.end);
      setMonthlyMetrics(monthlyStats);

      // Fetch staff metrics for this month
      await fetchStaffMetrics(monthRange.start, monthRange.end);

      // Fetch top services for this month
      await fetchTopServices(monthRange.start, monthRange.end);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar metricas');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateMetrics = async (start: string, end: string): Promise<DailyMetrics> => {
    // Fetch appointments in date range
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        appointment_services(price)
      `)
      .gte('starts_at', start)
      .lt('starts_at', end);

    if (apptError) throw apptError;

    const appts = appointments || [];
    const completed = appts.filter((a) => a.status === 'completed');
    const cancelled = appts.filter((a) => a.status === 'cancelled');
    const noShow = appts.filter((a) => a.status === 'no_show');

    // Calculate revenue from completed appointments only
    let totalRevenue = 0;
    let totalServices = 0;

    for (const appt of completed) {
      const services = appt.appointment_services || [];
      totalServices += services.length;
      for (const service of services) {
        totalRevenue += Number(service.price) || 0;
      }
    }

    return {
      totalAppointments: appts.length,
      completedAppointments: completed.length,
      cancelledAppointments: cancelled.length,
      noShowAppointments: noShow.length,
      totalRevenue,
      averageServicesPerAppointment:
        completed.length > 0 ? totalServices / completed.length : 0,
    };
  };

  const fetchStaffMetrics = async (start: string, end: string) => {
    const { data, error: staffError } = await supabase
      .from('appointments')
      .select(`
        staff_id,
        status,
        staff:staff(id, first_name, last_name),
        appointment_services(price)
      `)
      .gte('starts_at', start)
      .lt('starts_at', end);

    if (staffError) throw staffError;

    const staffMap = new Map<number, StaffMetrics>();

    for (const appt of (data as unknown as RawStaffAppointment[]) || []) {
      const staffId = appt.staff_id;
      const staffData = appt.staff;

      if (!staffData) continue;

      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staffId,
          staffName: `${staffData.first_name} ${staffData.last_name}`,
          appointmentsCount: 0,
          completedCount: 0,
          revenue: 0,
        });
      }

      const metrics = staffMap.get(staffId)!;
      metrics.appointmentsCount++;

      if (appt.status === 'completed') {
        metrics.completedCount++;
        for (const service of appt.appointment_services || []) {
          metrics.revenue += Number(service.price) || 0;
        }
      }
    }

    setStaffMetrics(
      Array.from(staffMap.values()).sort((a, b) => b.revenue - a.revenue)
    );
  };

  const fetchTopServices = async (start: string, end: string) => {
    const { data, error: servicesError } = await supabase
      .from('appointment_services')
      .select(`
        service_id,
        price,
        service:services(id, name),
        appointment:appointments(starts_at, status)
      `)
      .not('appointment', 'is', null);

    if (servicesError) throw servicesError;

    // Filter by date range and completed status
    const filtered = ((data as unknown as RawAppointmentService[]) || []).filter((item) => {
      const appt = item.appointment;
      if (!appt) return false;
      const startsAt = new Date(appt.starts_at);
      return (
        startsAt >= new Date(start) &&
        startsAt < new Date(end) &&
        appt.status === 'completed'
      );
    });

    const serviceMap = new Map<number, ServiceMetrics>();

    for (const item of filtered) {
      const service = item.service;
      if (!service) continue;

      const serviceId = service.id;

      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          serviceId,
          serviceName: service.name,
          bookingsCount: 0,
          revenue: 0,
        });
      }

      const metrics = serviceMap.get(serviceId)!;
      metrics.bookingsCount++;
      metrics.revenue += Number(item.price) || 0;
    }

    setTopServices(
      Array.from(serviceMap.values())
        .sort((a, b) => b.bookingsCount - a.bookingsCount)
        .slice(0, 5)
    );
  };

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    todayMetrics,
    weeklyMetrics,
    monthlyMetrics,
    staffMetrics,
    topServices,
    todayAppointments,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
