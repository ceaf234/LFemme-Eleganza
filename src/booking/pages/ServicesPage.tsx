import { useNavigate } from 'react-router-dom';
import { useBooking } from '../BookingProvider';
import { useServices } from '../useServices';
import ServiceCard from '../components/ServiceCard';
import BookingCart from '../components/BookingCart';
import { bookingContent } from '../../content/bookingContent';
import type { BookingService } from '../types';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useBooking();
  const { services: content } = bookingContent;
  const { services, loading, error, refetch } = useServices();

  const handleToggleService = (service: BookingService) => {
    const isSelected = state.selectedServices.some((s) => s.id === service.id);
    if (isSelected) {
      dispatch({ type: 'REMOVE_SERVICE', payload: service.id });
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: service });
    }
  };

  const handleContinue = () => {
    navigate('/book/schedule');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">
          {content.heading}
        </h1>
        <p className="text-text-secondary font-sans">{content.subheading}</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-text-secondary font-sans text-sm">Cargando servicios...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-red-400 font-sans mb-4">
            No se pudieron cargar los servicios. Intenta de nuevo.
          </p>
          <button
            type="button"
            onClick={refetch}
            className="btn-outline px-6 py-2 text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Services grid + Cart sidebar */}
      {!loading && !error && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Services grid */}
          <div className="flex-1">
            {services.length === 0 ? (
              <p className="text-text-secondary text-center py-12 font-sans">
                No hay servicios disponibles en este momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={state.selectedServices.some((s) => s.id === service.id)}
                    onToggle={handleToggleService}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart sidebar */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <BookingCart onContinue={handleContinue} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
