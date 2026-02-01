import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  const checkTruncation = useCallback(() => {
    const el = descRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, []);

  useEffect(() => {
    checkTruncation();
  }, [checkTruncation, service.description]);

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

      <h3 className="font-serif text-lg text-text-primary mb-1">{service.name}</h3>

      {service.description && (
        <div className="mb-3">
          <p
            ref={descRef}
            className={`text-text-secondary text-sm font-sans ${expanded ? '' : 'line-clamp-2'}`}
          >
            {service.description}
          </p>
          {(isTruncated || expanded) && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  setExpanded((prev) => !prev);
                }
              }}
              className="text-xs font-sans text-accent hover:opacity-70 transition-opacity cursor-pointer mt-1 inline-block"
            >
              {expanded ? 'Ver menos' : 'Ver más'}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-text-secondary text-sm mb-4">
        <span className="flex items-center gap-1">
          <HiOutlineClock className="w-4 h-4" />
          {service.duration} {content.cart.minutesLabel}
        </span>
        <span className="text-accent font-medium">
          Q{service.price.toFixed(2)}
        </span>
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
