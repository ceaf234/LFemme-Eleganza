import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../BookingProvider';
import BookingSummary from '../components/BookingSummary';
import BookingForm from '../components/BookingForm';
import SuccessScreen from '../components/SuccessScreen';
import { bookingContent } from '../../content/bookingContent';

export default function ConfirmPage() {
  const navigate = useNavigate();
  const { state, dispatch, canProceedToConfirm } = useBooking();
  const { confirm } = bookingContent;

  // Step guard: redirect if date/time not selected
  useEffect(() => {
    if (!state.isConfirmed && !canProceedToConfirm) {
      navigate('/book/schedule', { replace: true });
    }
  }, [canProceedToConfirm, state.isConfirmed, navigate]);

  const handleConfirm = () => {
    dispatch({ type: 'CONFIRM' });
  };

  if (state.isConfirmed) {
    return <SuccessScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary">
          {confirm.heading}
        </h1>
      </div>

      {/* Summary + Form side by side */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Summary */}
        <div className="lg:w-2/5">
          <div className="lg:sticky lg:top-24">
            <BookingSummary />
          </div>
        </div>

        {/* Form */}
        <div className="flex-1">
          <BookingForm onSubmit={handleConfirm} />

          {/* Back button below form */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/book/schedule')}
              className="btn-outline text-xs w-full"
            >
              {confirm.backLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
