import { HiCheck, HiOutlineClock } from 'react-icons/hi';
import type { BookingService } from '../types';
import { bookingContent } from '../../content/bookingContent';

interface ServiceCardProps {
  service: BookingService;
  isSelected: boolean;
  onToggle: (service: BookingService) => void;
}

export default function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  const { services: content } = bookingContent;

  return (
    <button
      type="button"
      onClick={() => onToggle(service)}
      className={`card text-left group w-full transition-all ${
        isSelected
          ? 'ring-2 ring-accent border-accent/50'
          : ''
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent text-primary flex items-center justify-center">
          <HiCheck className="w-4 h-4" />
        </div>
      )}

      <h3 className="font-serif text-lg text-text-primary mb-2">{service.name}</h3>

      <div className="flex items-center gap-4 text-text-secondary text-sm mb-4">
        <span className="flex items-center gap-1">
          <HiOutlineClock className="w-4 h-4" />
          {service.duration} {content.cart.minutesLabel}
        </span>
        <span className="text-accent font-medium">Q{service.price}</span>
      </div>

      <span
        className={`text-xs font-sans font-medium tracking-wider uppercase ${
          isSelected ? 'text-accent' : 'text-text-muted'
        }`}
      >
        {isSelected ? content.removeLabel : content.addLabel}
      </span>
    </button>
  );
}
