import { STATUS_CONFIG, type AdminAppointment } from '../hooks/useAdminAppointments';
import { formatGTTime } from '../../lib/datetime';

interface TimelineBlockProps {
  appointment: AdminAppointment;
  topPercent: number;
  heightPercent: number;
  isFiltered: boolean;
  isCompact: boolean;
  onClick: () => void;
  leftOffset?: number;
}

// Map status to inline border color (can't use Tailwind dynamic classes for border-left)
const STATUS_BORDER_COLORS: Record<string, string> = {
  scheduled: '#60a5fa',   // blue-400
  confirmed: '#4ade80',   // green-400
  in_progress: '#facc15', // yellow-400
  completed: '#d4a828',   // accent
  cancelled: '#f87171',   // red-400
  no_show: '#9ca3af',     // gray-400
};

// Map status to inline bg colors (using rgba for opacity)
const STATUS_BG_COLORS: Record<string, string> = {
  scheduled: 'rgba(59,130,246,0.2)',
  confirmed: 'rgba(34,197,94,0.2)',
  in_progress: 'rgba(234,179,8,0.2)',
  completed: 'rgba(212,168,40,0.2)',
  cancelled: 'rgba(239,68,68,0.2)',
  no_show: 'rgba(107,114,128,0.2)',
};

const MIN_HEIGHT_PX = 22;

export default function TimelineBlock({
  appointment,
  topPercent,
  heightPercent,
  isFiltered,
  isCompact,
  onClick,
  leftOffset = 0,
}: TimelineBlockProps) {
  const statusConfig = STATUS_CONFIG[appointment.status];
  const time = formatGTTime(appointment.starts_at);
  const firstService = appointment.appointment_services[0]?.service?.name;

  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={0}
      className={`absolute rounded-md overflow-hidden text-left cursor-pointer transition-all
        hover:ring-1 hover:ring-accent/50 hover:z-10
        ${isFiltered ? 'opacity-20 pointer-events-none' : ''}`}
      style={{
        top: `${topPercent}%`,
        height: `max(${MIN_HEIGHT_PX}px, ${heightPercent}%)`,
        left: `${4 + leftOffset}px`,
        right: '4px',
        backgroundColor: STATUS_BG_COLORS[appointment.status] ?? 'rgba(107,114,128,0.2)',
        borderLeft: `3px solid ${STATUS_BORDER_COLORS[appointment.status] ?? '#9ca3af'}`,
      }}
    >
      <div className="px-1.5 py-0.5 h-full overflow-hidden">
        <div className={`font-sans leading-tight ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
          <span className={`font-medium ${statusConfig?.color ?? 'text-text-primary'}`}>
            {time}
          </span>
          <span className="text-text-primary ml-1 truncate">
            {appointment.client.name}
          </span>
        </div>
        {!isCompact && firstService && (
          <div className="text-[10px] text-text-muted truncate mt-0.5">
            {firstService}
          </div>
        )}
      </div>
    </button>
  );
}
