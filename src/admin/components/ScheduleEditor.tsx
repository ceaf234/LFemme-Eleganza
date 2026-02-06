import { useState, useEffect } from 'react';
import type { WeeklySchedule, ScheduleDay } from '../hooks/useAdminStaff';

interface ScheduleEditorProps {
  schedule: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

type DayKey = keyof WeeklySchedule;

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miercoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

// Generate time options in 30-minute increments
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    options.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour < 22) {
      options.push(`${String(hour).padStart(2, '0')}:30`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

export default function ScheduleEditor({
  schedule,
  onSave,
  onCancel,
  isSaving,
}: ScheduleEditorProps) {
  const [localSchedule, setLocalSchedule] = useState<WeeklySchedule>(schedule);

  useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  const handleDayToggle = (day: DayKey, isWorking: boolean) => {
    setLocalSchedule((prev) => ({
      ...prev,
      [day]: isWorking
        ? { start: '09:00', end: '18:00' } // Default hours
        : { start: null, end: null },
    }));
  };

  const handleTimeChange = (
    day: DayKey,
    field: 'start' | 'end',
    value: string
  ) => {
    setLocalSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(localSchedule);
  };

  const isWorking = (day: ScheduleDay): boolean => {
    return day.start !== null && day.end !== null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const daySchedule = localSchedule[key];
          const working = isWorking(daySchedule);

          return (
            <div
              key={key}
              className={`flex items-center gap-4 p-3 rounded-md border transition-colors ${
                working
                  ? 'border-border bg-primary-dark/50'
                  : 'border-border/50 bg-transparent'
              }`}
            >
              {/* Day toggle */}
              <div className="flex items-center gap-2 w-28">
                <input
                  type="checkbox"
                  id={`day-${key}`}
                  checked={working}
                  onChange={(e) => handleDayToggle(key, e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-primary-dark text-accent focus:ring-accent focus:ring-offset-0"
                />
                <label
                  htmlFor={`day-${key}`}
                  className={`text-sm font-sans ${
                    working ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {label}
                </label>
              </div>

              {/* Time selectors */}
              {working ? (
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={daySchedule.start || '09:00'}
                    onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                    className="bg-primary-dark border border-border rounded-md px-3 py-1.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <span className="text-text-muted text-sm">a</span>
                  <select
                    value={daySchedule.end || '18:00'}
                    onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                    className="bg-primary-dark border border-border rounded-md px-3 py-1.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-text-muted text-sm italic">Dia libre</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 btn-outline text-xs"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 btn-cta text-xs disabled:opacity-60"
        >
          {isSaving ? 'Guardando...' : 'Guardar horario'}
        </button>
      </div>
    </form>
  );
}
