import { useState, useEffect } from 'react';
import type { AdminBlockedTime, BlockedTimeFormData } from '../hooks/useAdminBlockedTimes';
import type { AdminStaff } from '../hooks/useAdminStaff';

interface BlockedTimeFormProps {
  blockedTime?: AdminBlockedTime | null;
  staffList: AdminStaff[];
  onSubmit: (data: BlockedTimeFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function BlockedTimeForm({
  blockedTime,
  staffList,
  onSubmit,
  onCancel,
  isSubmitting,
}: BlockedTimeFormProps) {
  const [formData, setFormData] = useState<BlockedTimeFormData>({
    staff_id: 0,
    starts_at: '',
    ends_at: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BlockedTimeFormData, string>>>({});

  useEffect(() => {
    if (blockedTime) {
      // Parse ISO dates to local datetime-local format
      const startsAt = new Date(blockedTime.starts_at);
      const endsAt = new Date(blockedTime.ends_at);

      setFormData({
        staff_id: blockedTime.staff_id,
        starts_at: formatDateTimeLocal(startsAt),
        ends_at: formatDateTimeLocal(endsAt),
        reason: blockedTime.reason || '',
      });
    } else if (staffList.length > 0) {
      // Default to first staff member for new entries
      setFormData((prev) => ({
        ...prev,
        staff_id: staffList[0].id,
      }));
    }
  }, [blockedTime, staffList]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BlockedTimeFormData, string>> = {};

    if (!formData.staff_id) {
      newErrors.staff_id = 'Selecciona un miembro del personal';
    }
    if (!formData.starts_at) {
      newErrors.starts_at = 'La fecha de inicio es obligatoria';
    }
    if (!formData.ends_at) {
      newErrors.ends_at = 'La fecha de fin es obligatoria';
    }
    if (formData.starts_at && formData.ends_at) {
      const start = new Date(formData.starts_at);
      const end = new Date(formData.ends_at);
      if (end <= start) {
        newErrors.ends_at = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert local datetime to ISO
    const startsAtISO = new Date(formData.starts_at).toISOString();
    const endsAtISO = new Date(formData.ends_at).toISOString();

    await onSubmit({
      ...formData,
      starts_at: startsAtISO,
      ends_at: endsAtISO,
    });
  };

  const handleChange = (field: keyof BlockedTimeFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const activeStaff = staffList.filter((s) => s.is_active);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Staff selection */}
      <div>
        <label
          htmlFor="blocked-staff"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Personal *
        </label>
        <select
          id="blocked-staff"
          value={formData.staff_id}
          onChange={(e) => handleChange('staff_id', Number(e.target.value))}
          className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
            errors.staff_id ? 'border-red-500' : 'border-border'
          }`}
        >
          <option value={0} disabled>
            Seleccionar...
          </option>
          {activeStaff.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.first_name} {staff.last_name}
            </option>
          ))}
        </select>
        {errors.staff_id && (
          <p className="text-red-400 text-xs mt-1">{errors.staff_id}</p>
        )}
      </div>

      {/* Start datetime */}
      <div>
        <label
          htmlFor="blocked-starts"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Fecha y hora de inicio *
        </label>
        <input
          id="blocked-starts"
          type="datetime-local"
          value={formData.starts_at}
          onChange={(e) => handleChange('starts_at', e.target.value)}
          className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
            errors.starts_at ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.starts_at && (
          <p className="text-red-400 text-xs mt-1">{errors.starts_at}</p>
        )}
      </div>

      {/* End datetime */}
      <div>
        <label
          htmlFor="blocked-ends"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Fecha y hora de fin *
        </label>
        <input
          id="blocked-ends"
          type="datetime-local"
          value={formData.ends_at}
          onChange={(e) => handleChange('ends_at', e.target.value)}
          className={`w-full bg-primary-dark border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors ${
            errors.ends_at ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.ends_at && (
          <p className="text-red-400 text-xs mt-1">{errors.ends_at}</p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label
          htmlFor="blocked-reason"
          className="block text-sm text-text-secondary font-sans mb-1"
        >
          Motivo
        </label>
        <textarea
          id="blocked-reason"
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          rows={2}
          className="w-full bg-primary-dark border border-border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Vacaciones, cita medica, etc."
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
            : blockedTime
            ? 'Guardar cambios'
            : 'Crear bloqueo'}
        </button>
      </div>
    </form>
  );
}
