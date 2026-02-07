import { useState, useEffect } from 'react';
import {
  HiOutlineX,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineClock,
} from 'react-icons/hi';
import {
  STATUS_CONFIG,
  type AdminAppointment,
  type AppointmentStatus,
} from '../hooks/useAdminAppointments';
import AppointmentHistory from './AppointmentHistory';
import { formatGTTime, formatGTDisplayDate } from '../../lib/datetime';

interface AppointmentSlidePanelProps {
  appointment: AdminAppointment | null;
  onClose: () => void;
  onStatusChange: (id: number, status: AppointmentStatus) => Promise<void>;
  onNotesChange: (id: number, notes: string) => Promise<void>;
}

export default function AppointmentSlidePanel({
  appointment,
  onClose,
  onStatusChange,
  onNotesChange,
}: AppointmentSlidePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesChanged, setNotesChanged] = useState(false);

  // Animate open on mount
  useEffect(() => {
    if (appointment) {
      requestAnimationFrame(() => setIsOpen(true));
      setNotes(appointment.notes ?? '');
      setNotesChanged(false);
    } else {
      setIsOpen(false);
    }
  }, [appointment]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // wait for slide-out animation
  };

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (!appointment) return;
    await onStatusChange(appointment.id, newStatus);
  };

  const handleSaveNotes = async () => {
    if (!appointment) return;
    setIsSavingNotes(true);
    try {
      await onNotesChange(appointment.id, notes);
      setNotesChanged(false);
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (!appointment) return null;

  const total = appointment.appointment_services.reduce((sum, s) => sum + s.price, 0);
  const statusConfig = STATUS_CONFIG[appointment.status];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-96 max-w-full bg-primary-light border-l border-border shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-text-primary">Detalles de la cita</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-text-secondary">
              <HiOutlineClock className="w-4 h-4 text-text-muted" />
              <span className="text-sm">
                {formatGTTime(appointment.starts_at)} - {formatGTTime(appointment.ends_at)}
              </span>
              <span className="text-xs text-text-muted">
                {formatGTDisplayDate(appointment.starts_at)}
              </span>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wide mb-1">
                Estado
              </label>
              <select
                value={appointment.status}
                onChange={(e) => handleStatusChange(e.target.value as AppointmentStatus)}
                className={`w-full text-sm px-3 py-2 rounded-md border border-border bg-primary-dark font-sans focus:outline-none focus:border-accent ${statusConfig.color}`}
              >
                {(Object.keys(STATUS_CONFIG) as AppointmentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Client info */}
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">
                Cliente
              </label>
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineUser className="w-4 h-4 text-text-muted" />
                <span className="font-sans text-text-primary">{appointment.client.name}</span>
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
            <div className="text-sm text-text-muted">
              Con: <span className="text-text-secondary">{appointment.staff.name}</span>
            </div>

            {/* Services */}
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">
                Servicios
              </label>
              <div className="space-y-1">
                {appointment.appointment_services.map((as) => (
                  <div key={as.id} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{as.service.name}</span>
                    <span className="text-text-muted">Q{as.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-border">
                <span className="text-sm font-medium text-text-primary">Total</span>
                <span className="text-sm font-medium text-accent">
                  Q{total.toLocaleString('es-GT')}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setNotesChanged(true);
                }}
                rows={3}
                className="w-full px-3 py-2 bg-primary-dark border border-border rounded-md text-sm text-text-primary font-sans focus:outline-none focus:border-accent resize-none"
                placeholder="Agregar notas..."
              />
              {notesChanged && (
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="mt-2 px-3 py-1.5 text-xs rounded-md border border-accent/30 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
                >
                  {isSavingNotes ? 'Guardando...' : 'Guardar notas'}
                </button>
              )}
            </div>

            {/* History */}
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">
                Historial
              </label>
              <AppointmentHistory appointmentId={appointment.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
