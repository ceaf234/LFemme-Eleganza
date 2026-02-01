import { useMemo } from 'react';
import { bookingContent } from '../../content/bookingContent';

interface DateSelectorProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateNext14Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  // Start from tomorrow
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
}

export default function DateSelector({ selectedDate, onSelectDate }: DateSelectorProps) {
  const { schedule } = bookingContent;
  const days = useMemo(() => generateNext14Days(), []);

  return (
    <div>
      <h3 className="text-text-primary font-serif text-lg mb-4">{schedule.dateLabel}</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const iso = formatISODate(date);
          const isSunday = date.getDay() === 0;
          const isSelected = selectedDate === iso;
          const dayName = DAY_NAMES[date.getDay()];
          const dayNumber = date.getDate();
          const monthName = MONTH_NAMES[date.getMonth()];

          return (
            <button
              key={iso}
              type="button"
              disabled={isSunday}
              onClick={() => onSelectDate(iso)}
              className={`flex flex-col items-center py-3 px-1 rounded-lg text-xs font-sans transition-all border ${
                isSelected
                  ? 'border-accent bg-accent/10 text-accent'
                  : isSunday
                    ? 'border-border/50 text-text-muted/50 cursor-not-allowed'
                    : 'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
              }`}
              title={isSunday ? schedule.sundayClosed : `${dayNumber} de ${monthName}`}
            >
              <span className="font-medium">{dayName}</span>
              <span className={`text-lg font-medium mt-1 ${isSelected ? 'text-accent' : ''}`}>
                {dayNumber}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
