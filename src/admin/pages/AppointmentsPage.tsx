import { useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiPlus } from 'react-icons/hi';
import {
  useAdminAppointments,
  STATUS_CONFIG,
  type AppointmentStatus,
  type AdminAppointment,
} from '../hooks/useAdminAppointments';
import { useAdminStaff } from '../hooks/useAdminStaff';
import { useAdminServices } from '../hooks/useAdminServices';
import { useCreateAdminAppointment, type AdminAppointmentFormData } from '../hooks/useCreateAdminAppointment';
import AppointmentCard from '../components/AppointmentCard';
import AdminAppointmentForm from '../components/AdminAppointmentForm';
import ViewToggle, { type ViewType } from '../components/ViewToggle';
import TimelineView from '../components/TimelineView';
import AppointmentSlidePanel from '../components/AppointmentSlidePanel';
import { formatGTDate, addDays, getWeekStart, getDateRange } from '../../lib/datetime';

// ─── View configuration ─────────────────────────────────────

const VIEW_CONFIG: Record<ViewType, { days: number }> = {
  day: { days: 1 },
  '3day': { days: 3 },
  week: { days: 7 },
};

// ─── Helpers ─────────────────────────────────────────────────

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

function formatDisplayDateRange(startDate: string, days: number): string {
  const endDateStr = addDays(startDate, days - 1);
  const startD = new Date(startDate + 'T12:00:00-06:00');
  const endD = new Date(endDateStr + 'T12:00:00-06:00');

  const startFormatted = startD.toLocaleDateString('es-GT', {
    timeZone: 'America/Guatemala',
    day: 'numeric',
    month: 'short',
  });
  const endFormatted = endD.toLocaleDateString('es-GT', {
    timeZone: 'America/Guatemala',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${startFormatted} – ${endFormatted}`;
}

// ─── Component ───────────────────────────────────────────────

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()));
  const [viewType, setViewType] = useState<ViewType>('day');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);

  // Compute effective date range based on view
  const effectiveStartDate =
    viewType === 'week' ? getWeekStart(selectedDate) : selectedDate;

  const dateRangeEnd =
    viewType === 'day'
      ? undefined
      : addDays(effectiveStartDate, VIEW_CONFIG[viewType].days);

  const { appointments, loading, error, updateStatus, updateNotes, refetch } =
    useAdminAppointments(effectiveStartDate, dateRangeEnd);
  const { staff, loading: loadingStaff } = useAdminStaff();
  const { services, loading: loadingServices } = useAdminServices();
  const { createAppointment } = useCreateAdminAppointment();

  const filteredAppointments =
    statusFilter === 'all'
      ? appointments
      : appointments.filter((a) => a.status === statusFilter);

  const navStep = VIEW_CONFIG[viewType].days;

  const goToDate = (direction: number) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + direction * navStep);
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
    {} as Record<string, number>,
  );

  const handleCreate = () => {
    setFormError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormError(null);
  };

  const handleSubmit = async (data: AdminAppointmentFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      await createAppointment(data, services);
      setShowForm(false);
      // Navigate to the appointment's date so it appears in the list
      setSelectedDate(data.date);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear la cita');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date display text
  const dateDisplayText =
    viewType === 'day'
      ? formatDisplayDate(selectedDate)
      : formatDisplayDateRange(effectiveStartDate, VIEW_CONFIG[viewType].days);

  // Dates array for timeline views
  const timelineDates =
    viewType !== 'day'
      ? getDateRange(effectiveStartDate, VIEW_CONFIG[viewType].days)
      : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-text-primary">Citas</h1>
        <button onClick={handleCreate} className="btn-cta flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" />
          Nueva cita
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-8 bg-primary-light border border-border rounded-lg p-6 max-w-2xl">
          <h2 className="font-serif text-xl text-text-primary mb-4">Nueva cita</h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}
          {loadingStaff || loadingServices ? (
            <p className="text-text-secondary animate-pulse text-sm">Cargando datos...</p>
          ) : (
            <AdminAppointmentForm
              staffList={staff}
              servicesList={services}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      )}

      {/* Date navigation + View toggle */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => goToDate(-1)}
          className="p-2 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <h2 className="font-serif text-xl text-text-primary capitalize">
            {dateDisplayText}
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

        <div className="border-l border-border pl-4">
          <ViewToggle currentView={viewType} onViewChange={setViewType} />
        </div>
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
      ) : viewType === 'day' ? (
        /* Day view — existing card grid */
        filteredAppointments.length === 0 ? (
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
        )
      ) : (
        /* Timeline view — 3-day or week */
        <TimelineView
          dates={timelineDates}
          appointments={appointments}
          statusFilter={statusFilter}
          onAppointmentClick={setSelectedAppointment}
        />
      )}

      {/* Slide panel for timeline appointment details */}
      {selectedAppointment && (
        <AppointmentSlidePanel
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChange={async (id, status) => {
            await updateStatus(id, status);
            setSelectedAppointment((prev) =>
              prev ? { ...prev, status } : null,
            );
          }}
          onNotesChange={async (id, notes) => {
            await updateNotes(id, notes);
            setSelectedAppointment((prev) =>
              prev ? { ...prev, notes } : null,
            );
          }}
        />
      )}
    </div>
  );
}
