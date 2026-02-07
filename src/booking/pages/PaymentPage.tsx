import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCreditCard, HiOutlineLockClosed } from 'react-icons/hi';
import { useBooking } from '../BookingProvider';
import { useCreateBooking } from '../useCreateBooking';
import BookingSummary from '../components/BookingSummary';
import SuccessScreen from '../components/SuccessScreen';
import { bookingContent } from '../../content/bookingContent';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { state, dispatch, totalPrice, canProceedToPayment } = useBooking();
  const { createBooking, loading, error } = useCreateBooking();
  const { payment } = bookingContent;
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step guard: redirect if customer info not completed
  useEffect(() => {
    if (!state.isConfirmed && !canProceedToPayment) {
      navigate('/book/confirm', { replace: true });
    }
  }, [canProceedToPayment, state.isConfirmed, navigate]);

  // Reset booking state when leaving after successful confirmation
  useEffect(() => {
    return () => {
      if (state.isConfirmed) {
        dispatch({ type: 'RESET' });
      }
    };
  }, [state.isConfirmed, dispatch]);

  const depositAmount = Math.ceil(totalPrice / 2);
  const displayAmount = state.paymentMethod === 'deposit' ? depositAmount : totalPrice;

  const handleConfirmWithoutPayment = async () => {
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
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary">
          {payment.heading}
        </h1>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-red-400 text-sm text-center">{submitError}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sticky Summary sidebar */}
        <div className="lg:w-2/5">
          <div className="lg:sticky lg:top-24">
            <BookingSummary />
          </div>
        </div>

        {/* Payment options + confirm */}
        <div className="flex-1 space-y-6">
          {/* Payment option cards */}
          <div className="space-y-3">
            {/* Full payment option */}
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: 'full' })}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                state.paymentMethod === 'full'
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-sans font-medium text-text-primary">
                    {payment.optionFullLabel}
                  </h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {payment.optionFullDescription}
                  </p>
                </div>
                <span className="text-accent font-medium text-lg ml-4">Q{totalPrice}</span>
              </div>
            </button>

            {/* Deposit option */}
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: 'deposit' })}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                state.paymentMethod === 'deposit'
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-sans font-medium text-text-primary">
                    {payment.optionDepositLabel}
                  </h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {payment.optionDepositDescription}
                  </p>
                </div>
                <span className="text-accent font-medium text-lg ml-4">Q{depositAmount}</span>
              </div>
            </button>
          </div>

          {/* Selected amount display */}
          {state.paymentMethod && (
            <div className="bg-primary-light border border-border rounded-lg p-4 text-center">
              <span className="text-text-secondary text-sm block">{payment.selectedLabel}</span>
              <span className="text-accent font-medium text-2xl mt-1 block">
                Q{displayAmount}
              </span>
            </div>
          )}

          {/* Stripe placeholder */}
          <div className="bg-primary-light border border-border rounded-lg p-6 text-center opacity-50">
            <HiOutlineCreditCard className="w-8 h-8 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted text-sm font-medium mb-1">
              {payment.stripeComingSoon}
            </p>
            <p className="text-text-muted text-xs">
              {payment.stripeComingSoonDescription}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-text-muted">
              <HiOutlineLockClosed className="w-3.5 h-3.5" />
              <span className="text-xs">Powered by Stripe</span>
            </div>
          </div>

          {/* Confirm without payment button */}
          <button
            type="button"
            onClick={handleConfirmWithoutPayment}
            disabled={loading || !state.paymentMethod}
            className="btn-cta w-full text-xs disabled:opacity-60"
          >
            {loading ? 'Confirmando...' : payment.confirmWithoutPayment}
          </button>

          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate('/book/confirm')}
            disabled={loading}
            className="btn-outline text-xs w-full disabled:opacity-40"
          >
            {payment.backLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
