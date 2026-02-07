import { useMemo } from 'react';
import type { AdminAppointment, AppointmentStatus } from '../hooks/useAdminAppointments';
import TimelineBlock from './TimelineBlock';
import {
  getGTHourDecimal,
  getGTDateStr,
  formatShortDayHeader,
  formatGTDate,
} from '../../lib/datetime';

interface TimelineViewProps {
  dates: string[];
  appointments: AdminAppointment[];
  statusFilter: AppointmentStatus | 'all';
  onAppointmentClick: (appointment: AdminAppointment) => void;
}

const HOUR_HEIGHT_3DAY = 60;
const HOUR_HEIGHT_WEEK = 48;

function formatHourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'a.\u00A0m.' : 'p.\u00A0m.';
  return `${h} ${ampm}`;
}

interface PositionedAppointment {
  appointment: AdminAppointment;
  topPercent: number;
  heightPercent: number;
  overlapIndex: number;
}

function computeTimeRange(appointments: AdminAppointment[]): {
  startHour: number;
  endHour: number;
} {
  if (appointments.length === 0) return { startHour: 8, endHour: 18 };

  let earliest = 24;
  let latest = 0;

  for (const appt of appointments) {
    const startH = getGTHourDecimal(appt.starts_at);
    const endH = getGTHourDecimal(appt.ends_at);
    if (startH < earliest) earliest = startH;
    if (endH > latest) latest = endH;
  }

  return {
    startHour: Math.max(0, Math.floor(earliest) - 2),
    endHour: Math.min(24, Math.ceil(latest) + 2),
  };
}

function groupAppointmentsByDate(
  appointments: AdminAppointment[],
  dates: string[],
): Map<string, AdminAppointment[]> {
  const map = new Map<string, AdminAppointment[]>();
  for (const d of dates) {
    map.set(d, []);
  }
  for (const appt of appointments) {
    const dateStr = getGTDateStr(appt.starts_at);
    const arr = map.get(dateStr);
    if (arr) arr.push(appt);
  }
  return map;
}

function positionAppointments(
  appts: AdminAppointment[],
  startHour: number,
  totalHours: number,
): PositionedAppointment[] {
  const sorted = [...appts].sort(
    (a, b) => getGTHourDecimal(a.starts_at) - getGTHourDecimal(b.starts_at),
  );

  const positioned: PositionedAppointment[] = [];

  for (const appt of sorted) {
    const apptStart = getGTHourDecimal(appt.starts_at);
    const apptEnd = getGTHourDecimal(appt.ends_at);
    const duration = Math.max(apptEnd - apptStart, 0.25); // min 15 min

    const topPercent = ((apptStart - startHour) / totalHours) * 100;
    const heightPercent = (duration / totalHours) * 100;

    // Simple overlap detection: count how many previous positioned items overlap with this one
    let overlapIndex = 0;
    for (const prev of positioned) {
      const prevStart = getGTHourDecimal(prev.appointment.starts_at);
      const prevEnd = getGTHourDecimal(prev.appointment.ends_at);
      if (apptStart < prevEnd && apptEnd > prevStart) {
        overlapIndex++;
      }
    }

    positioned.push({ appointment: appt, topPercent, heightPercent, overlapIndex });
  }

  return positioned;
}

export default function TimelineView({
  dates,
  appointments,
  statusFilter,
  onAppointmentClick,
}: TimelineViewProps) {
  const isCompact = dates.length > 3;
  const hourHeight = isCompact ? HOUR_HEIGHT_WEEK : HOUR_HEIGHT_3DAY;
  const todayStr = formatGTDate(new Date());

  const { startHour, endHour } = useMemo(
    () => computeTimeRange(appointments),
    [appointments],
  );

  const totalHours = endHour - startHour;
  const totalHeight = totalHours * hourHeight;

  const hourLabels = useMemo(() => {
    const labels: number[] = [];
    for (let h = startHour; h < endHour; h++) {
      labels.push(h);
    }
    return labels;
  }, [startHour, endHour]);

  const appointmentsByDate = useMemo(
    () => groupAppointmentsByDate(appointments, dates),
    [appointments, dates],
  );

  const colCount = dates.length;

  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-primary-light">
      {/* Header row */}
      <div
        className="grid border-b border-border sticky top-0 z-20 bg-primary-light"
        style={{ gridTemplateColumns: `60px repeat(${colCount}, minmax(100px, 1fr))` }}
      >
        {/* Empty corner */}
        <div className="border-r border-border p-2" />
        {/* Day headers */}
        {dates.map((dateStr) => (
          <div
            key={dateStr}
            className={`border-r border-border last:border-r-0 p-2 text-center text-xs font-sans font-medium uppercase tracking-wide
              ${dateStr === todayStr ? 'text-accent bg-accent/5' : 'text-text-muted'}`}
          >
            {formatShortDayHeader(dateStr)}
          </div>
        ))}
      </div>

      {/* Timeline body */}
      <div
        className="grid relative"
        style={{
          gridTemplateColumns: `60px repeat(${colCount}, minmax(100px, 1fr))`,
          height: `${totalHeight}px`,
        }}
      >
        {/* Time axis */}
        <div className="border-r border-border relative">
          {hourLabels.map((hour) => (
            <div
              key={hour}
              className="absolute w-full text-right pr-2 text-[10px] text-text-muted font-sans"
              style={{
                top: `${((hour - startHour) / totalHours) * 100}%`,
                transform: 'translateY(-50%)',
              }}
            >
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {dates.map((dateStr) => {
          const dayAppts = appointmentsByDate.get(dateStr) ?? [];
          const positioned = positionAppointments(dayAppts, startHour, totalHours);

          return (
            <div
              key={dateStr}
              className={`border-r border-border last:border-r-0 relative
                ${dateStr === todayStr ? 'bg-accent/5' : ''}`}
            >
              {/* Horizontal gridlines */}
              {hourLabels.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-border/30"
                  style={{ top: `${((hour - startHour) / totalHours) * 100}%` }}
                />
              ))}

              {/* Appointment blocks */}
              {positioned.map((pos) => (
                <TimelineBlock
                  key={pos.appointment.id}
                  appointment={pos.appointment}
                  topPercent={pos.topPercent}
                  heightPercent={pos.heightPercent}
                  isFiltered={
                    statusFilter !== 'all' && pos.appointment.status !== statusFilter
                  }
                  isCompact={isCompact}
                  onClick={() => onAppointmentClick(pos.appointment)}
                  leftOffset={pos.overlapIndex * 8}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
