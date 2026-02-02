import { useMemo } from 'react';
import { bookingContent } from '../../content/bookingContent';
import { useAvailableSlots } from '../useAvailableSlots';
import type { AvailableSlot } from '../types';

interface TimeSlotGridProps {
  selectedDate: string | null;
  selectedStaffId: number | null;
  selectedTimeSlot: string | null;
  totalDuration: number;
  onSelectSlot: (slot: string) => void;
}

/** Format "HH:MM:SS" or "HH:MM" to "HH:MM" */
function formatSlotTime(time: string): string {
  return time.slice(0, 5);
}

export default function TimeSlotGrid({
  selectedDate,
  selectedStaffId,
  selectedTimeSlot,
  totalDuration,
  onSelectSlot,
}: TimeSlotGridProps) {
  const { schedule } = bookingContent;
  const { slots, loading, error } = useAvailableSlots(selectedStaffId, selectedDate);

  const slotsNeeded = Math.ceil(totalDuration / 30);

  // Build a lookup and ordered list for consecutive-slot logic
  const { slotKeys, slotMap, selectedBlock } = useMemo(() => {
    const keys = slots.map((s) => formatSlotTime(s.slot_start));
    const map = new Map<string, AvailableSlot>();
    for (const s of slots) {
      map.set(formatSlotTime(s.slot_start), s);
    }

    // Compute the selected block from the selectedTimeSlot
    let block: string[] = [];
    if (selectedTimeSlot) {
      const startIdx = keys.indexOf(selectedTimeSlot);
      if (startIdx !== -1) {
        block = keys.slice(startIdx, startIdx + slotsNeeded);
      }
    }

    return { slotKeys: keys, slotMap: map, selectedBlock: new Set(block) };
  }, [slots, selectedTimeSlot, slotsNeeded]);

  // Determine if a slot index can be a valid starting point
  function canStartAt(index: number): boolean {
    if (index + slotsNeeded > slotKeys.length) return false;
    for (let i = index; i < index + slotsNeeded; i++) {
      const slot = slotMap.get(slotKeys[i]);
      if (!slot || !slot.is_available) return false;
    }
    return true;
  }

  // No staff or date selected
  if (!selectedDate || !selectedStaffId) {
    return (
      <div>
        <h3 className="text-text-primary font-serif text-lg mb-4">{schedule.timeLabel}</h3>
        <p className="text-text-muted text-sm italic">{schedule.noSlots}</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div>
        <h3 className="text-text-primary font-serif text-lg mb-4">{schedule.timeLabel}</h3>
        <p className="text-text-secondary text-sm animate-pulse">{schedule.loadingSlots}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <h3 className="text-text-primary font-serif text-lg mb-4">{schedule.timeLabel}</h3>
        <p className="text-red-400 text-sm">{schedule.errorLoadingSlots}</p>
      </div>
    );
  }

  // Empty slots (staff doesn't work that day)
  if (slots.length === 0) {
    return (
      <div>
        <h3 className="text-text-primary font-serif text-lg mb-4">{schedule.timeLabel}</h3>
        <p className="text-text-muted text-sm text-center py-6">{schedule.noSlotsForDay}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-text-primary font-serif text-lg mb-4">{schedule.timeLabel}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slotKeys.map((key, index) => {
          const slot = slotMap.get(key)!;
          const isInSelectedBlock = selectedBlock.has(key);
          const isClickable = slot.is_available && canStartAt(index);

          return (
            <button
              key={key}
              type="button"
              disabled={!isClickable}
              onClick={() => onSelectSlot(key)}
              className={`py-2 px-3 rounded-md text-sm font-sans transition-all border ${
                isInSelectedBlock
                  ? 'bg-[#C9A84C] border-[#C9A84C] text-primary font-medium'
                  : isClickable
                    ? 'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                    : 'border-border/50 text-text-muted opacity-40 cursor-not-allowed'
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
