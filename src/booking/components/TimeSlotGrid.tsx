import { useMemo } from 'react';
import { bookingContent } from '../../content/bookingContent';

interface TimeSlotGridProps {
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  // 9:00 to 18:00 in 30-min increments
  for (let hour = 9; hour <= 18; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
  }
  return slots;
}

export default function TimeSlotGrid({ selectedDate, selectedTimeSlot, onSelectSlot }: TimeSlotGridProps) {
  const { schedule } = bookingContent;
  const slots = useMemo(() => generateTimeSlots(), []);

  if (!selectedDate) {
    return (
      <div>
        <h3 className="text-text-primary font-serif text-lg mb-4">{schedule.timeLabel}</h3>
        <p className="text-text-muted text-sm italic">{schedule.noSlots}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-text-primary font-serif text-lg mb-4">{schedule.timeLabel}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTimeSlot === slot;

          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`py-2 px-3 rounded-md text-sm font-sans transition-all border ${
                isSelected
                  ? 'border-accent bg-accent/10 text-accent font-medium'
                  : 'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}
