import { useState, useEffect } from 'react';
import type { AdminStaff, StaffFormData, StaffRole } from '../hooks/useAdminStaff';

interface StaffFormProps {
  staff?: AdminStaff | null;
  onSubmit: (data: StaffFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: 'owner', label: 'Dueño/a' },
  { value: 'provider', label: 'Proveedor/a' },
  { value: 'receptionist', label: 'Recepcionista' },
];

export default function StaffForm({
  staff,
  onSubmit,
  onCancel,
  isSubmitting,
}: StaffFormProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'provider',
    is_active: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role,
        is_active: staff.is_active,
      });
    }
  }, [staff]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
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

  const handleChange = (
    field: keyof StaffFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="staff-name"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Nombre completo *
        </label>
        <input
          id="staff-name"
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
          htmlFor="staff-email"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Correo electronico
        </label>
        <input
          id="staff-email"
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
          htmlFor="staff-phone"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Telefono
        </label>
        <input
          id="staff-phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full bg-primary-dark border border-border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Role */}
      <div>
        <label
          htmlFor="staff-role"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Rol *
        </label>
        <select
          id="staff-role"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value as StaffRole)}
          className="w-full bg-primary-dark border border-border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          id="staff-active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="w-4 h-4 rounded border-border bg-primary-dark text-accent focus:ring-accent focus:ring-offset-0"
        />
        <label
          htmlFor="staff-active"
          className="text-sm text-text-secondary font-sans"
        >
          Personal activo (visible para citas)
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
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
          {isSubmitting ? 'Guardando...' : staff ? 'Guardar cambios' : 'Crear personal'}
        </button>
      </div>
    </form>
  );
}
