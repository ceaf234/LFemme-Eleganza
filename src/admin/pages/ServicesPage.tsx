import { useState } from 'react';
import { HiPlus, HiPencil, HiOutlineClock } from 'react-icons/hi';
import { useAdminServices, type AdminService, type ServiceFormData } from '../hooks/useAdminServices';
import ServiceForm from '../components/ServiceForm';

export default function ServicesPage() {
  const { services, loading, error, createService, updateService, toggleActive } = useAdminServices();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingService(null);
    setShowForm(true);
    setFormError(null);
  };

  const handleEdit = (service: AdminService) => {
    setEditingService(service);
    setShowForm(true);
    setFormError(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    setFormError(null);
  };

  const handleSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingService) {
        await updateService(editingService.id, data);
      } else {
        await createService(data);
      }
      setShowForm(false);
      setEditingService(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (service: AdminService) => {
    try {
      await toggleActive(service.id, !service.is_active);
    } catch (err) {
      console.error('Error toggling service:', err);
    }
  };

  const formatPrice = (price: number) => {
    return `Q${price.toLocaleString('es-GT')}`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-serif text-3xl text-text-primary mb-6">Servicios</h1>
        <p className="text-text-secondary animate-pulse">Cargando servicios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="font-serif text-3xl text-text-primary mb-6">Servicios</h1>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-text-primary">Servicios</h1>
        {!showForm && (
          <button onClick={handleCreate} className="btn-cta text-xs flex items-center gap-2">
            <HiPlus className="w-4 h-4" />
            Nuevo servicio
          </button>
        )}
      </div>

      {/* Form (slide in) */}
      {showForm && (
        <div className="mb-8 bg-primary-light border border-border rounded-lg p-6 max-w-xl">
          <h2 className="font-serif text-xl text-text-primary mb-4">
            {editingService ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}
          <ServiceForm
            service={editingService}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <p className="text-text-muted text-center py-12">No hay servicios registrados.</p>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-primary-light border rounded-lg p-5 flex items-center justify-between transition-opacity ${
                service.is_active ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-sans font-medium text-text-primary">{service.name}</h3>
                  {!service.is_active && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                      Inactivo
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-sm text-text-muted mb-2 line-clamp-1">{service.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <HiOutlineClock className="w-4 h-4" />
                    {service.duration_minutes} min
                  </span>
                  <span className="font-medium text-accent">{formatPrice(service.price)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {/* Toggle active */}
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    service.is_active
                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                      : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {service.is_active ? 'Desactivar' : 'Activar'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
                >
                  <HiPencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
