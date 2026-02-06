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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!state.customer.name.trim()) {
      newErrors.name = confirm.requiredMessage;
    }
    if (!state.customer.phone.trim()) {
      newErrors.phone = confirm.requiredMessage;
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
          value={state.customer.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder={confirm.fields.phone.placeholder}
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
