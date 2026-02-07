import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCreditCard,
  HiOutlineLockClosed,
  HiOutlineLibrary,
  HiOutlinePhotograph,
  HiOutlineX,
} from 'react-icons/hi';
import { useBooking } from '../BookingProvider';
import { useCreateBooking } from '../useCreateBooking';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import BookingSummary from '../components/BookingSummary';
import SuccessScreen from '../components/SuccessScreen';
import { bookingContent } from '../../content/bookingContent';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { state, dispatch, totalPrice, canProceedToPayment } = useBooking();
  const { createBooking, loading, error } = useCreateBooking();
  const { settings } = useSiteSettings();
  const { payment } = bookingContent;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      setFileError(payment.voucherTooLarge);
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError(payment.voucherInvalidType);
      return;
    }

    dispatch({ type: 'SET_VOUCHER_FILE', payload: file });
  };

  const removeFile = () => {
    dispatch({ type: 'SET_VOUCHER_FILE', payload: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleConfirm = async () => {
    setSubmitError(null);
    try {
      const result = await createBooking(state);
      dispatch({ type: 'CONFIRM', payload: result.appointmentId });
    } catch {
      setSubmitError(error || 'Error al confirmar la cita. Por favor intenta de nuevo.');
    }
  };

  if (state.isConfirmed) {
    return <SuccessScreen appointmentId={state.confirmedAppointmentId!} />;
  }

  const bank = settings?.bank;
  const hasBankInfo = bank && bank.bank_name;

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
          {/* ─── 1. Amount Selection ───────────────────────── */}
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

          {/* ─── 2. Selected amount display ────────────────── */}
          {state.paymentMethod && (
            <div className="bg-primary-light border border-border rounded-lg p-4 text-center">
              <span className="text-text-secondary text-sm block">{payment.selectedLabel}</span>
              <span className="text-accent font-medium text-2xl mt-1 block">
                Q{displayAmount}
              </span>
            </div>
          )}

          {/* ─── 3. Payment Type Selection ─────────────────── */}
          {state.paymentMethod && (
            <div>
              <p className="text-text-secondary text-sm mb-3">{payment.paymentTypeLabel}</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Credit Card */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_PAYMENT_TYPE', payload: 'card' })}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    state.paymentType === 'card'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <HiOutlineCreditCard className="w-6 h-6 mx-auto mb-2 text-text-primary" />
                  <h4 className="font-sans font-medium text-text-primary text-sm">
                    {payment.cardLabel}
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">{payment.cardDescription}</p>
                </button>

                {/* Bank Transfer */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_PAYMENT_TYPE', payload: 'transfer' })}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    state.paymentType === 'transfer'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <HiOutlineLibrary className="w-6 h-6 mx-auto mb-2 text-text-primary" />
                  <h4 className="font-sans font-medium text-text-primary text-sm">
                    {payment.transferLabel}
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">{payment.transferDescription}</p>
                </button>
              </div>
            </div>
          )}

          {/* ─── 4a. Card — Recurrente Coming Soon ─────────── */}
          {state.paymentType === 'card' && (
            <div className="bg-primary-light border border-border rounded-lg p-6 text-center opacity-50">
              <HiOutlineCreditCard className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted text-sm font-medium mb-1">
                {payment.cardComingSoon}
              </p>
              <p className="text-text-muted text-xs">
                {payment.cardComingSoonDescription}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-text-muted">
                <HiOutlineLockClosed className="w-3.5 h-3.5" />
                <span className="text-xs">Powered by Recurrente</span>
              </div>
            </div>
          )}

          {/* ─── 4b. Transfer — Bank Info + Voucher Upload ── */}
          {state.paymentType === 'transfer' && (
            <div className="space-y-4">
              {/* Bank account info */}
              <div className="bg-primary-light border border-border rounded-lg p-5">
                <h3 className="font-sans font-medium text-text-primary text-sm mb-4">
                  {payment.bankInfoTitle}
                </h3>

                {hasBankInfo ? (
                  <div className="space-y-2.5">
                    <InfoRow label="Banco" value={bank.bank_name} />
                    <InfoRow label="Tipo de cuenta" value={bank.account_type} />
                    <InfoRow label="Numero de cuenta" value={bank.account_number} />
                    <InfoRow label="Titular" value={bank.account_holder} />
                    {bank.notes && <InfoRow label="Notas" value={bank.notes} />}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">
                    {payment.bankInfoNotConfigured}
                  </p>
                )}
              </div>

              {/* Voucher upload */}
              <div className="bg-primary-light border border-border rounded-lg p-5">
                <h3 className="font-sans font-medium text-text-primary text-sm mb-1">
                  {payment.voucherLabel}
                </h3>
                <p className="text-text-muted text-xs mb-4">{payment.voucherDescription}</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {state.voucherFile ? (
                  <div className="flex items-center gap-3 bg-primary-dark border border-border rounded-md p-3">
                    <HiOutlinePhotograph className="w-8 h-8 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm truncate">
                        {state.voucherFile.name}
                      </p>
                      <p className="text-text-muted text-xs">
                        {formatFileSize(state.voucherFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer"
                  >
                    <HiOutlinePhotograph className="w-8 h-8 text-text-muted" />
                    <span className="text-text-secondary text-sm">
                      {payment.voucherSelectButton}
                    </span>
                    <span className="text-text-muted text-xs">{payment.voucherMaxSize}</span>
                  </button>
                )}

                {fileError && (
                  <p className="text-red-400 text-xs mt-2">{fileError}</p>
                )}
              </div>
            </div>
          )}

          {/* ─── 5. Confirm Button ─────────────────────────── */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !state.paymentMethod}
            className="btn-cta w-full text-xs disabled:opacity-60"
          >
            {loading ? 'Confirmando...' : payment.confirmWithoutPayment}
          </button>

          {/* ─── 6. Back Button ────────────────────────────── */}
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

// ─── Small helper for bank info rows ──────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-text-muted text-xs uppercase tracking-wide w-32 flex-shrink-0">
        {label}
      </span>
      <span className="text-text-primary text-sm">{value}</span>
    </div>
  );
}
