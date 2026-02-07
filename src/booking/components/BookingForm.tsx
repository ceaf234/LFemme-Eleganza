import { useState } from 'react';
import { useBooking } from '../BookingProvider';
import { bookingContent } from '../../content/bookingContent';

interface BookingFormProps {
  onSubmit: () => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

function formatPhoneDisplay(raw: string): string {
  const digits = normalizePhone(raw);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
}

export default function BookingForm({ onSubmit, isSubmitting = false }: BookingFormProps) {
  const { state, dispatch } = useBooking();
  const { confirm } = bookingContent;
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: { [field]: value } });
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneChange = (rawValue: string) => {
    // Strip to digits only, max 8
    const digits = normalizePhone(rawValue).slice(0, 8);
    dispatch({ type: 'UPDATE_CUSTOMER', payload: { phone: digits } });
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!state.customer.name.trim()) {
      newErrors.name = confirm.requiredMessage;
    }

    const phoneDigits = normalizePhone(state.customer.phone);
    if (!phoneDigits) {
      newErrors.phone = confirm.requiredMessage;
    } else if (phoneDigits.length !== 8) {
      newErrors.phone = 'El telefono debe tener 8 digitos.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-serif text-xl text-text-primary mb-4">{confirm.formTitle}</h2>

      {/* Name */}
      <div>
        <label htmlFor="customer-name" className="block text-sm text-text-secondary font-sans mb-1">
          {confirm.fields.name.label} *
        </label>
        <input
          id="customer-name"
          type="text"
          value={state.customer.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={confirm.fields.name.placeholder}
          className={`w-full bg-primary-dark border rounded-md px-4 py-3 text-sm text-text-primary font-sans placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors ${
            errors.name ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="customer-phone" className="block text-sm text-text-secondary font-sans mb-1">
          {confirm.fields.phone.label} *
        </label>
        <input
          id="customer-phone"
          type="tel"
          value={formatPhoneDisplay(state.customer.phone)}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={confirm.fields.phone.placeholder}
          maxLength={9}
          className={`w-full bg-primary-dark border rounded-md px-4 py-3 text-sm text-text-primary font-sans placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors ${
            errors.phone ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="customer-email" className="block text-sm text-text-secondary font-sans mb-1">
          {confirm.fields.email.label}
        </label>
        <input
          id="customer-email"
          type="email"
          value={state.customer.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder={confirm.fields.email.placeholder}
          className="w-full bg-primary-dark border border-border rounded-md px-4 py-3 text-sm text-text-primary font-sans placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="customer-notes" className="block text-sm text-text-secondary font-sans mb-1">
          {confirm.fields.notes.label}
        </label>
        <textarea
          id="customer-notes"
          value={state.customer.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder={confirm.fields.notes.placeholder}
          rows={3}
          className="w-full bg-primary-dark border border-border rounded-md px-4 py-3 text-sm text-text-primary font-sans placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-cta w-full text-xs disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Confirmando...' : confirm.submitLabel}
      </button>
    </form>
  );
}
