import { HiOutlineClock, HiArrowRight } from 'react-icons/hi';
import { useAppointmentHistory, STATUS_LABELS } from '../hooks/useAppointmentHistory';
import { formatGTShortDateTime } from '../../lib/datetime';

interface AppointmentHistoryProps {
  appointmentId: number;
}

export default function AppointmentHistory({ appointmentId }: AppointmentHistoryProps) {
  const { history, loading, error } = useAppointmentHistory(appointmentId);

  if (loading) {
    return (
      <div className="text-xs text-text-muted animate-pulse py-2">
        Cargando historial...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-400 py-2">
        Error: {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-xs text-text-muted py-2 italic">
        Sin historial de cambios
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-2 text-xs text-text-secondary"
        >
          <HiOutlineClock className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-1 flex-wrap">
              {entry.previous_status ? (
                <>
                  <span className="text-text-muted">
                    {STATUS_LABELS[entry.previous_status] || entry.previous_status}
                  </span>
                  <HiArrowRight className="w-3 h-3 text-text-muted" />
                  <span className="text-text-primary font-medium">
                    {STATUS_LABELS[entry.new_status] || entry.new_status}
                  </span>
                </>
              ) : (
                <span className="text-text-primary font-medium">
                  Creada como {STATUS_LABELS[entry.new_status] || entry.new_status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-text-muted mt-0.5">
              <span>{formatGTShortDateTime(entry.changed_at)}</span>
              {entry.staff && (
                <span>
                  por {entry.staff.name}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
