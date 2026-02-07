import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../BookingProvider';
import BookingSummary from '../components/BookingSummary';
import BookingForm from '../components/BookingForm';
import { bookingContent } from '../../content/bookingContent';

export default function ConfirmPage() {
  const navigate = useNavigate();
  const { dispatch, canProceedToConfirm } = useBooking();
  const { confirm } = bookingContent;

  // Step guard: redirect if date/time not selected
  useEffect(() => {
    if (!canProceedToConfirm) {
      navigate('/book/schedule', { replace: true });
    }
  }, [canProceedToConfirm, navigate]);

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_CUSTOMER_INFO' });
    navigate('/book/payment');
  };

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
          <BookingForm onSubmit={handleContinue} isSubmitting={false} />

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
