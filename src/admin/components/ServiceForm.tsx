import { useState, useEffect } from 'react';
import type { AdminService, ServiceFormData } from '../hooks/useAdminServices';

interface ServiceFormProps {
  service?: AdminService | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ServiceForm({ service, onSubmit, onCancel, isSubmitting }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    is_active: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes,
        price: service.price,
        is_active: service.is_active,
      });
    }
  }, [service]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (formData.duration_minutes < 15) {
      newErrors.duration_minutes = 'La duracion minima es 15 minutos';
    }
    if (formData.price < 0) {
      newErrors.price = 'El precio no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handleChange = (field: keyof ServiceFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="service-name" className="block text-sm text-text-secondary font-sans mb-1">
          Nombre del servicio *
        </label>
        <input
          id="service-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
            errors.name ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="service-description" className="block text-sm text-text-secondary font-sans mb-1">
          Descripcion
        </label>
        <textarea
          id="service-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full bg-primary-dark border border-border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>

      {/* Duration & Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="service-duration" className="block text-sm text-text-secondary font-sans mb-1">
            Duracion (minutos) *
          </label>
          <input
            id="service-duration"
            type="number"
            min={15}
            step={15}
            value={formData.duration_minutes}
            onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 0)}
            className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
              errors.duration_minutes ? 'border-red-500' : 'border-border'
            }`}
          />
          {errors.duration_minutes && <p className="text-red-400 text-xs mt-1">{errors.duration_minutes}</p>}
        </div>

        <div>
          <label htmlFor="service-price" className="block text-sm text-text-secondary font-sans mb-1">
            Precio (GTQ) *
          </label>
          <input
            id="service-price"
            type="number"
            min={0}
            step={1}
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
              errors.price ? 'border-red-500' : 'border-border'
            }`}
          />
          {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          id="service-active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="w-4 h-4 rounded border-border bg-primary-dark text-accent focus:ring-accent focus:ring-offset-0"
        />
        <label htmlFor="service-active" className="text-sm text-text-secondary font-sans">
          Servicio activo (visible para clientes)
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
          {isSubmitting ? 'Guardando...' : service ? 'Guardar cambios' : 'Crear servicio'}
        </button>
      </div>
    </form>
  );
}
