import { useState, useEffect } from 'react';
import type { AdminClient, ClientFormData } from '../hooks/useAdminClients';

interface ClientFormProps {
  client: AdminClient;
  onSubmit: (data: Partial<ClientFormData>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ClientForm({
  client,
  onSubmit,
  onCancel,
  isSubmitting,
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

  useEffect(() => {
    setFormData({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || '',
    });
  }, [client]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es obligatorio';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es obligatorio';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First name & Last name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="client-first-name"
            className="block text-sm text-text-secondary font-sans mb-1"
          >
            Nombre *
          </label>
          <input
            id="client-first-name"
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
              errors.first_name ? 'border-red-500' : 'border-border'
            }`}
          />
          {errors.first_name && (
            <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="client-last-name"
            className="block text-sm text-text-secondary font-sans mb-1"
          >
            Apellido *
          </label>
          <input
            id="client-last-name"
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
              errors.last_name ? 'border-red-500' : 'border-border'
            }`}
          />
          {errors.last_name && (
            <p className="text-red-400 text-xs mt-1">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="client-email"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Correo electronico
        </label>
        <input
          id="client-email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
            errors.email ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="client-phone"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Telefono
        </label>
        <input
          id="client-phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full bg-primary-dark border border-border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="client-notes"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Notas
        </label>
        <textarea
          id="client-notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full bg-primary-dark border border-border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Alergias, preferencias, etc."
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 btn-outline text-xs"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 btn-cta text-xs disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
