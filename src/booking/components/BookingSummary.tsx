import { HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi';
import { useBooking } from '../BookingProvider';
import { bookingContent } from '../../content/bookingContent';

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
}

export default function BookingSummary() {
  const { state, totalPrice, totalDuration } = useBooking();
  const { confirm } = bookingContent;

  return (
    <div className="bg-primary-light border border-border rounded-lg p-6">
      <h2 className="font-serif text-xl text-text-primary mb-6">{confirm.summaryTitle}</h2>

      {/* Services */}
      <div className="mb-5">
        <h3 className="text-text-secondary text-xs font-sans tracking-wider uppercase mb-3">
          {confirm.servicesLabel}
        </h3>
        <ul className="space-y-2">
          {state.selectedServices.map((service) => (
            <li key={service.id} className="flex justify-between text-sm">
              <span className="text-text-primary">{service.name}</span>
              <span className="text-accent">Q{service.price}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Date & Time */}
      {state.selectedDate && state.selectedTimeSlot && (
        <div className="mb-5 border-t border-border pt-4">
          <h3 className="text-text-secondary text-xs font-sans tracking-wider uppercase mb-3">
            {confirm.dateTimeLabel}
          </h3>
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <HiOutlineCalendar className="w-4 h-4 text-accent" />
            <span>{formatDate(state.selectedDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-primary mt-1">
            <HiOutlineClock className="w-4 h-4 text-accent" />
            <span>{state.selectedTimeSlot} hrs</span>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-border pt-4 flex justify-between items-center">
        <span className="text-text-secondary text-sm">{confirm.totalLabel}</span>
        <div>
          <span className="text-accent font-medium text-lg">Q{totalPrice}</span>
          <span className="text-text-muted text-xs ml-2">({totalDuration} min)</span>
        </div>
      </div>
    </div>
  );
}
