import { useNavigate } from 'react-router-dom';
import { useBooking } from '../BookingProvider';
import ServiceCard from '../components/ServiceCard';
import BookingCart from '../components/BookingCart';
import { bookingContent } from '../../content/bookingContent';
import type { BookingService } from '../types';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useBooking();
  const { services: content } = bookingContent;

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

      {/* Services grid + Cart sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Services grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.items.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={state.selectedServices.some((s) => s.id === service.id)}
                onToggle={handleToggleService}
              />
            ))}
          </div>
        </div>

        {/* Cart sidebar */}
        <div className="lg:w-80 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <BookingCart onContinue={handleContinue} />
          </div>
        </div>
      </div>
    </div>
  );
}
