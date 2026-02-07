import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../BookingProvider';
import { useCreateBooking } from '../useCreateBooking';
import BookingSummary from '../components/BookingSummary';
import BookingForm from '../components/BookingForm';
import SuccessScreen from '../components/SuccessScreen';
import { bookingContent } from '../../content/bookingContent';

export default function ConfirmPage() {
  const navigate = useNavigate();
  const { state, dispatch, canProceedToConfirm } = useBooking();
  const { createBooking, loading, error } = useCreateBooking();
  const { confirm } = bookingContent;
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step guard: redirect if date/time not selected
  useEffect(() => {
    if (!state.isConfirmed && !canProceedToConfirm) {
      navigate('/book/schedule', { replace: true });
    }
  }, [canProceedToConfirm, state.isConfirmed, navigate]);

  // Reset booking state when leaving the confirm page after a successful booking
  useEffect(() => {
    return () => {
      if (state.isConfirmed) {
        dispatch({ type: 'RESET' });
      }
    };
  }, [state.isConfirmed, dispatch]);

  const handleConfirm = async () => {
    setSubmitError(null);
    try {
      const result = await createBooking(state);
      dispatch({ type: 'CONFIRM', payload: result.appointmentId });
    } catch (err) {
      setSubmitError(error || 'Error al confirmar la cita. Por favor intenta de nuevo.');
    }
  };

  if (state.isConfirmed) {
    return <SuccessScreen appointmentId={state.confirmedAppointmentId!} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary">
          {confirm.heading}
        </h1>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-red-400 text-sm text-center">{submitError}</p>
        </div>
      )}

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
          <BookingForm onSubmit={handleConfirm} isSubmitting={loading} />

          {/* Back button below form */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/book/schedule')}
              disabled={loading}
              className="btn-outline text-xs w-full disabled:opacity-40"
            >
              {confirm.backLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
