import { useState } from 'react';
import { HiPlus, HiPencil, HiOutlineClock, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import {
  useAdminStaff,
  extractSchedule,
  type AdminStaff,
  type StaffFormData,
  type WeeklySchedule,
} from '../hooks/useAdminStaff';
import StaffForm from '../components/StaffForm';
import ScheduleEditor from '../components/ScheduleEditor';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Dueño/a',
  provider: 'Proveedor/a',
  receptionist: 'Recepcionista',
};

export default function StaffPage() {
  const { staff, loading, error, createStaff, updateStaff, updateSchedule, toggleActive } =
    useAdminStaff();

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaff | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<AdminStaff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingStaff(null);
    setEditingSchedule(null);
    setShowForm(true);
    setFormError(null);
  };

  const handleEdit = (staffMember: AdminStaff) => {
    setEditingStaff(staffMember);
    setEditingSchedule(null);
    setShowForm(true);
    setFormError(null);
  };

  const handleEditSchedule = (staffMember: AdminStaff) => {
    setEditingSchedule(staffMember);
    setShowForm(false);
    setFormError(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
    setEditingSchedule(null);
    setFormError(null);
  };

  const handleSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, data);
      } else {
        await createStaff(data);
      }
      setShowForm(false);
      setEditingStaff(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSchedule = async (schedule: WeeklySchedule) => {
    if (!editingSchedule) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await updateSchedule(editingSchedule.id, schedule);
      setEditingSchedule(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar horario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (staffMember: AdminStaff) => {
    try {
      await toggleActive(staffMember.id, !staffMember.is_active);
    } catch (err) {
      console.error('Error toggling staff:', err);
    }
  };

  // Count working days for a staff member
  const countWorkingDays = (staffMember: AdminStaff): number => {
    const schedule = extractSchedule(staffMember);
    return Object.values(schedule).filter((day) => day.start !== null).length;
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-serif text-3xl text-text-primary mb-6">Personal</h1>
        <p className="text-text-secondary animate-pulse">Cargando personal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="font-serif text-3xl text-text-primary mb-6">Personal</h1>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-text-primary">Personal</h1>
        {!showForm && !editingSchedule && (
          <button onClick={handleCreate} className="btn-cta text-xs flex items-center gap-2">
            <HiPlus className="w-4 h-4" />
            Nuevo personal
          </button>
        )}
      </div>

      {/* Form (slide in) */}
      {showForm && (
        <div className="mb-8 bg-primary-light border border-border rounded-lg p-6 max-w-xl">
          <h2 className="font-serif text-xl text-text-primary mb-4">
            {editingStaff ? 'Editar personal' : 'Nuevo personal'}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}
          <StaffForm
            staff={editingStaff}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Schedule editor (slide in) */}
      {editingSchedule && (
        <div className="mb-8 bg-primary-light border border-border rounded-lg p-6 max-w-xl">
          <h2 className="font-serif text-xl text-text-primary mb-4">
            Horario de {editingSchedule.first_name} {editingSchedule.last_name}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}
          <ScheduleEditor
            schedule={extractSchedule(editingSchedule)}
            onSave={handleSaveSchedule}
            onCancel={handleCancel}
            isSaving={isSubmitting}
          />
        </div>
      )}

      {/* Staff list */}
      {staff.length === 0 ? (
        <p className="text-text-muted text-center py-12">No hay personal registrado.</p>
      ) : (
        <div className="grid gap-4">
          {staff.map((staffMember) => (
            <div
              key={staffMember.id}
              className={`bg-primary-light border rounded-lg p-5 transition-opacity ${
                staffMember.is_active ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Name and status */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-sans font-medium text-text-primary text-lg">
                      {staffMember.first_name} {staffMember.last_name}
                    </h3>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                      {ROLE_LABELS[staffMember.role] || staffMember.role}
                    </span>
                    {!staffMember.is_active && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                        Inactivo
                      </span>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-2">
                    {staffMember.email && (
                      <span className="flex items-center gap-1">
                        <HiOutlineMail className="w-4 h-4" />
                        {staffMember.email}
                      </span>
                    )}
                    {staffMember.phone && (
                      <span className="flex items-center gap-1">
                        <HiOutlinePhone className="w-4 h-4" />
                        {staffMember.phone}
                      </span>
                    )}
                  </div>

                  {/* Schedule summary */}
                  <div className="flex items-center gap-1 text-sm text-text-muted">
                    <HiOutlineClock className="w-4 h-4" />
                    <span>{countWorkingDays(staffMember)} dias laborales</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Schedule button */}
                  <button
                    onClick={() => handleEditSchedule(staffMember)}
                    className="px-3 py-1.5 text-xs rounded-md border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
                  >
                    Horario
                  </button>

                  {/* Toggle active */}
                  <button
                    onClick={() => handleToggleActive(staffMember)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      staffMember.is_active
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                    }`}
                  >
                    {staffMember.is_active ? 'Desactivar' : 'Activar'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(staffMember)}
                    className="p-2 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
