import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../BookingProvider';
import DateSelector from '../components/DateSelector';
import TimeSlotGrid from '../components/TimeSlotGrid';
import { bookingContent } from '../../content/bookingContent';

export default function SchedulePage() {
  const navigate = useNavigate();
  const { state, dispatch, canProceedToSchedule, canProceedToConfirm } = useBooking();
  const { schedule } = bookingContent;

  // Step guard: redirect if no services selected
  useEffect(() => {
    if (!canProceedToSchedule) {
      navigate('/book', { replace: true });
    }
  }, [canProceedToSchedule, navigate]);

  const handleSelectDate = (date: string) => {
    dispatch({ type: 'SET_DATE', payload: date });
  };

  const handleSelectSlot = (slot: string) => {
    dispatch({ type: 'SET_TIME_SLOT', payload: slot });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary">
          {schedule.heading}
        </h1>
      </div>

      {/* Date selector */}
      <div className="mb-10">
        <DateSelector
          selectedDate={state.selectedDate}
          onSelectDate={handleSelectDate}
        />
      </div>

      {/* Time slot grid */}
      <div className="mb-12">
        <TimeSlotGrid
          selectedDate={state.selectedDate}
          selectedTimeSlot={state.selectedTimeSlot}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/book')}
          className="btn-outline text-xs"
        >
          {schedule.backLabel}
        </button>
        <button
          type="button"
          onClick={() => navigate('/book/confirm')}
          disabled={!canProceedToConfirm}
          className="btn-cta text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {schedule.continueLabel}
        </button>
      </div>
    </div>
  );
}
