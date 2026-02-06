import { useState } from 'react';
import {
  HiOutlineClock,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineAnnotation,
  HiOutlineClipboardList,
} from 'react-icons/hi';
import {
  type AdminAppointment,
  type AppointmentStatus,
  STATUS_CONFIG,
} from '../hooks/useAdminAppointments';
import AppointmentHistory from './AppointmentHistory';

interface AppointmentCardProps {
  appointment: AdminAppointment;
  onStatusChange: (id: number, status: AppointmentStatus) => Promise<void>;
  onNotesChange: (id: number, notes: string) => Promise<void>;
}

const STATUS_OPTIONS: AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
];

export default function AppointmentCard({
  appointment,
  onStatusChange,
  onNotesChange,
}: AppointmentCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const statusConfig = STATUS_CONFIG[appointment.status];

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  };

  const totalPrice = appointment.appointment_services.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (newStatus === appointment.status) return;
    setIsChangingStatus(true);
    try {
      await onStatusChange(appointment.id, newStatus);
    } catch (err) {
      console.error('Error changing status:', err);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onNotesChange(appointment.id, notes);
      setShowNotes(false);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="bg-primary-light border border-border rounded-lg p-4">
      {/* Header: Time and Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HiOutlineClock className="w-5 h-5 text-accent" />
          <span className="font-sans font-medium text-text-primary">
            {formatTime(appointment.starts_at)} - {formatTime(appointment.ends_at)}
          </span>
        </div>

        {/* Status dropdown */}
        <select
          value={appointment.status}
          onChange={(e) => handleStatusChange(e.target.value as AppointmentStatus)}
          disabled={isChangingStatus}
          className={`text-xs px-2 py-1 rounded border-0 font-sans font-medium ${statusConfig.bgColor} ${statusConfig.color} focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50`}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>
      </div>

      {/* Client info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineUser className="w-4 h-4 text-text-muted" />
          <span className="font-sans text-text-primary">
            {appointment.client.first_name} {appointment.client.last_name}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          {appointment.client.phone && (
            <span className="flex items-center gap-1">
              <HiOutlinePhone className="w-3.5 h-3.5" />
              {appointment.client.phone}
            </span>
          )}
          {appointment.client.email && (
            <span className="flex items-center gap-1">
              <HiOutlineMail className="w-3.5 h-3.5" />
              {appointment.client.email}
            </span>
          )}
        </div>
      </div>

      {/* Staff */}
      <div className="text-sm text-text-muted mb-3">
        Con: {appointment.staff.first_name} {appointment.staff.last_name}
      </div>

      {/* Services */}
      <div className="mb-3">
        <div className="text-xs text-text-muted uppercase tracking-wide mb-1">Servicios</div>
        <div className="space-y-1">
          {appointment.appointment_services.map((as) => (
            <div key={as.id} className="flex justify-between text-sm">
              <span className="text-text-secondary">{as.service.name}</span>
              <span className="text-text-muted">Q{Number(as.price).toLocaleString('es-GT')}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t border-border">
          <span className="text-text-primary">Total</span>
          <span className="text-accent">Q{totalPrice.toLocaleString('es-GT')}</span>
        </div>
      </div>

      {/* Notes and History toggles */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setShowNotes(!showNotes);
            if (!showNotes) setShowHistory(false);
          }}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <HiOutlineAnnotation className="w-4 h-4" />
          {appointment.notes ? 'Ver/editar notas' : 'Agregar notas'}
        </button>

        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) setShowNotes(false);
          }}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <HiOutlineClipboardList className="w-4 h-4" />
          Historial
        </button>
      </div>

      {/* Notes section */}
      {showNotes && (
        <div className="mt-2 space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-primary-dark border border-border rounded-md px-3 py-2 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="Notas sobre la cita..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowNotes(false)}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="text-xs text-accent hover:text-accent-light disabled:opacity-50"
            >
              {isSavingNotes ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* History section */}
      {showHistory && (
        <div className="mt-2 border-t border-border pt-2">
          <AppointmentHistory appointmentId={appointment.id} />
        </div>
      )}
    </div>
  );
}
