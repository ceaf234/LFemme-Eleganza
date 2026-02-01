import { HiOutlineX, HiOutlineClock } from 'react-icons/hi';
import { useBooking } from '../BookingProvider';
import { bookingContent } from '../../content/bookingContent';

interface BookingCartProps {
  onContinue: () => void;
}

export default function BookingCart({ onContinue }: BookingCartProps) {
  const { state, dispatch, totalPrice, totalDuration, canProceedToSchedule } = useBooking();
  const { cart } = bookingContent.services;

  return (
    <div className="bg-primary-light border border-border rounded-lg p-6">
      <h2 className="font-serif text-xl text-text-primary mb-4">{cart.title}</h2>

      {state.selectedServices.length === 0 ? (
        <p className="text-text-muted text-sm italic">{cart.empty}</p>
      ) : (
        <>
          <ul className="space-y-3 mb-6">
            {state.selectedServices.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="text-text-primary">{service.name}</span>
                  <span className="text-text-muted ml-2 flex items-center gap-1 inline-flex">
                    <HiOutlineClock className="w-3 h-3" />
                    {service.duration} {cart.minutesLabel}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-accent font-medium">Q{service.price}</span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'REMOVE_SERVICE', payload: service.id })}
                    className="text-text-muted hover:text-accent transition-colors"
                    aria-label={`Quitar ${service.name}`}
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{cart.totalDuration}</span>
              <span className="text-text-primary">{totalDuration} {cart.minutesLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{cart.totalPrice}</span>
              <span className="text-accent font-medium text-lg">Q{totalPrice}</span>
            </div>
          </div>
        </>
      )}

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        disabled={!canProceedToSchedule}
        className="btn-cta w-full mt-6 text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {cart.continueLabel}
      </button>
    </div>
  );
}
