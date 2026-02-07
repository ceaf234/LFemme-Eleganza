import { useState, useEffect } from 'react';
import type { AdminClient, ClientFormData } from '../hooks/useAdminClients';

interface ClientFormProps {
  client?: AdminClient | null;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode?: 'edit' | 'create';
}

export default function ClientForm({
  client,
  onSubmit,
  onCancel,
  isSubmitting,
  mode = 'edit',
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    birthday: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        notes: client.notes || '',
        birthday: client.birthday || '',
      });
    }
  }, [client]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }
    if (formData.birthday && !/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(formData.birthday)) {
      newErrors.birthday = 'Formato invalido (MM/DD)';
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
      {/* Name */}
      <div>
        <label
          htmlFor="client-name"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Nombre completo *
        </label>
        <input
          id="client-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
            errors.name ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.name && (
          <p className="text-red-400 text-xs mt-1">{errors.name}</p>
        )}
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

      {/* Birthday */}
      <div>
        <label
          htmlFor="client-birthday"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Cumpleanos
        </label>
        <input
          id="client-birthday"
          type="text"
          value={formData.birthday}
          onChange={(e) => handleChange('birthday', e.target.value)}
          placeholder="MM/DD"
          maxLength={5}
          className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
            errors.birthday ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.birthday && (
          <p className="text-red-400 text-xs mt-1">{errors.birthday}</p>
        )}
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
          {isSubmitting
            ? 'Guardando...'
            : mode === 'create'
            ? 'Crear cliente'
            : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
