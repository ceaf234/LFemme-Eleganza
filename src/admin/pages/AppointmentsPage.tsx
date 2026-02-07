import { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import {
  useAdminAppointments,
  STATUS_CONFIG,
  type AppointmentStatus,
} from '../hooks/useAdminAppointments';
import AppointmentCard from '../components/AppointmentCard';
import { formatGTDate } from '../../lib/datetime';

function formatDate(date: Date): string {
  return formatGTDate(date);
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00-06:00');
  return date.toLocaleDateString('es-GT', {
    timeZone: 'America/Guatemala',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()));
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const { appointments, loading, error, updateStatus, updateNotes } =
    useAdminAppointments(selectedDate);

  const filteredAppointments =
    statusFilter === 'all'
      ? appointments
      : appointments.filter((a) => a.status === statusFilter);

  const goToDate = (offset: number) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + offset);
    setSelectedDate(formatDate(current));
  };

  const goToToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  const isToday = selectedDate === formatDate(new Date());

  // Count by status
  const statusCounts = appointments.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-text-primary">Citas</h1>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => goToDate(-1)}
          className="p-2 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <h2 className="font-serif text-xl text-text-primary capitalize">
            {formatDisplayDate(selectedDate)}
          </h2>
        </div>

        <button
          onClick={() => goToDate(1)}
          className="p-2 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>

        {!isToday && (
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs rounded-md border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
          >
            Hoy
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            statusFilter === 'all'
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-text-secondary hover:border-accent/50'
          }`}
        >
          Todas ({appointments.length})
        </button>
        {(Object.keys(STATUS_CONFIG) as AppointmentStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          const count = statusCounts[status] || 0;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                statusFilter === status
                  ? `border-current ${config.bgColor} ${config.color}`
                  : 'border-border text-text-secondary hover:border-accent/50'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-text-secondary animate-pulse">Cargando citas...</p>
      ) : error ? (
        <p className="text-red-400">Error: {error}</p>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">
            {statusFilter === 'all'
              ? 'No hay citas para este dia.'
              : `No hay citas con estado "${STATUS_CONFIG[statusFilter].label}" para este dia.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onStatusChange={updateStatus}
              onNotesChange={updateNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
