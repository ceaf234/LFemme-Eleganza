import { useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiOutlineClock, HiOutlineUser } from 'react-icons/hi';
import {
  useAdminBlockedTimes,
  type AdminBlockedTime,
  type BlockedTimeFormData,
} from '../hooks/useAdminBlockedTimes';
import { useAdminStaff } from '../hooks/useAdminStaff';
import BlockedTimeForm from '../components/BlockedTimeForm';
import { formatGTDateTime } from '../../lib/datetime';

export default function BlockedTimesPage() {
  const { blockedTimes, loading, error, createBlockedTime, updateBlockedTime, deleteBlockedTime } =
    useAdminBlockedTimes();
  const { staff, loading: loadingStaff } = useAdminStaff();

  const [showForm, setShowForm] = useState(false);
  const [editingBlockedTime, setEditingBlockedTime] = useState<AdminBlockedTime | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleCreate = () => {
    setEditingBlockedTime(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleEdit = (blockedTime: AdminBlockedTime) => {
    setEditingBlockedTime(blockedTime);
    setFormError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBlockedTime(null);
    setFormError(null);
  };

  const handleSubmit = async (data: BlockedTimeFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingBlockedTime) {
        await updateBlockedTime(editingBlockedTime.id, data);
      } else {
        await createBlockedTime(data);
      }
      setShowForm(false);
      setEditingBlockedTime(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBlockedTime(id);
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const formatDuration = (starts: string, ends: string) => {
    const start = new Date(starts);
    const end = new Date(ends);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
    return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  };

  const isUpcoming = (starts: string) => {
    return new Date(starts) > new Date();
  };

  const isActive = (starts: string, ends: string) => {
    const now = new Date();
    return new Date(starts) <= now && now <= new Date(ends);
  };

  // Group blocked times: Active, Upcoming, Past
  const groupedBlockedTimes = {
    active: blockedTimes.filter((bt) => isActive(bt.starts_at, bt.ends_at)),
    upcoming: blockedTimes.filter((bt) => isUpcoming(bt.starts_at)),
    past: blockedTimes.filter((bt) => !isUpcoming(bt.starts_at) && !isActive(bt.starts_at, bt.ends_at)),
  };

  if (loading || loadingStaff) {
    return (
      <div className="p-8">
        <p className="text-text-secondary animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-text-primary">Tiempos Bloqueados</h1>
        <button onClick={handleCreate} className="btn-cta flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" />
          Nuevo bloqueo
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 bg-primary-light border border-border rounded-lg p-6 max-w-xl">
          <h2 className="font-serif text-xl text-text-primary mb-4">
            {editingBlockedTime ? 'Editar bloqueo' : 'Nuevo bloqueo de tiempo'}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}
          <BlockedTimeForm
            blockedTime={editingBlockedTime}
            staffList={staff}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Empty state */}
      {blockedTimes.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineClock className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No hay tiempos bloqueados registrados.</p>
          <p className="text-text-muted text-sm mt-1">
            Agrega vacaciones, dias libres o citas personales del personal.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active blocked times */}
          {groupedBlockedTimes.active.length > 0 && (
            <section>
              <h2 className="text-sm font-sans font-medium text-accent uppercase tracking-wide mb-4">
                Activos ahora
              </h2>
              <div className="space-y-3">
                {groupedBlockedTimes.active.map((bt) => (
                  <BlockedTimeCard
                    key={bt.id}
                    blockedTime={bt}
                    formatDuration={formatDuration}
                    onEdit={handleEdit}
                    onDelete={() => setDeleteConfirm(bt.id)}
                    deleteConfirm={deleteConfirm === bt.id}
                    onConfirmDelete={() => handleDelete(bt.id)}
                    onCancelDelete={() => setDeleteConfirm(null)}
                    status="active"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming blocked times */}
          {groupedBlockedTimes.upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4">
                Proximos
              </h2>
              <div className="space-y-3">
                {groupedBlockedTimes.upcoming.map((bt) => (
                  <BlockedTimeCard
                    key={bt.id}
                    blockedTime={bt}
                    formatDuration={formatDuration}
                    onEdit={handleEdit}
                    onDelete={() => setDeleteConfirm(bt.id)}
                    deleteConfirm={deleteConfirm === bt.id}
                    onConfirmDelete={() => handleDelete(bt.id)}
                    onCancelDelete={() => setDeleteConfirm(null)}
                    status="upcoming"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past blocked times */}
          {groupedBlockedTimes.past.length > 0 && (
            <section>
              <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4">
                Pasados
              </h2>
              <div className="space-y-3">
                {groupedBlockedTimes.past.map((bt) => (
                  <BlockedTimeCard
                    key={bt.id}
                    blockedTime={bt}
                    formatDuration={formatDuration}
                    onEdit={handleEdit}
                    onDelete={() => setDeleteConfirm(bt.id)}
                    deleteConfirm={deleteConfirm === bt.id}
                    onConfirmDelete={() => handleDelete(bt.id)}
                    onCancelDelete={() => setDeleteConfirm(null)}
                    status="past"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component for individual blocked time cards
interface BlockedTimeCardProps {
  blockedTime: AdminBlockedTime;
  formatDuration: (starts: string, ends: string) => string;
  onEdit: (bt: AdminBlockedTime) => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  status: 'active' | 'upcoming' | 'past';
}

function BlockedTimeCard({
  blockedTime,
  formatDuration,
  onEdit,
  onDelete,
  deleteConfirm,
  onConfirmDelete,
  onCancelDelete,
  status,
}: BlockedTimeCardProps) {
  const statusColors = {
    active: 'border-l-4 border-l-accent bg-accent/5',
    upcoming: 'border-l-4 border-l-blue-500 bg-blue-500/5',
    past: 'opacity-60',
  };

  return (
    <div
      className={`bg-primary-light border border-border rounded-lg p-4 ${statusColors[status]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Staff name */}
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineUser className="w-4 h-4 text-text-muted" />
            <span className="font-sans text-text-primary font-medium">
              {blockedTime.staff?.first_name} {blockedTime.staff?.last_name}
            </span>
            <span className="text-xs text-text-muted bg-primary-dark px-2 py-0.5 rounded">
              {formatDuration(blockedTime.starts_at, blockedTime.ends_at)}
            </span>
          </div>

          {/* Time range */}
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <HiOutlineClock className="w-4 h-4 text-text-muted" />
            <span>{formatGTDateTime(blockedTime.starts_at)}</span>
            <span className="text-text-muted">→</span>
            <span>{formatGTDateTime(blockedTime.ends_at)}</span>
          </div>

          {/* Reason */}
          {blockedTime.reason && (
            <p className="mt-2 text-sm text-text-muted italic">{blockedTime.reason}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {deleteConfirm ? (
            <>
              <button
                onClick={onCancelDelete}
                className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmDelete}
                className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
              >
                Confirmar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(blockedTime)}
                className="p-2 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
              >
                <HiPencil className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-md border border-border text-text-secondary hover:text-red-400 hover:border-red-400/50 transition-colors"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
