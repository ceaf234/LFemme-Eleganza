import { Link } from 'react-router-dom';
import { HiCheck } from 'react-icons/hi';
import { bookingContent } from '../../content/bookingContent';

interface SuccessScreenProps {
  appointmentId: number;
}

export default function SuccessScreen({ appointmentId }: SuccessScreenProps) {
  const { success } = bookingContent;

  // Format appointment ID as confirmation code (e.g., "LF-00123")
  const confirmationCode = `LF-${String(appointmentId).padStart(5, '0')}`;

  return (
    <div className="text-center py-12 px-4 animate-fade-in">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mx-auto mb-8">
        <HiCheck className="w-10 h-10 text-accent" />
      </div>

      <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-4">
        {success.heading}
      </h1>

      <p className="text-text-secondary font-sans text-lg mb-8 max-w-md mx-auto">
        {success.message}
      </p>

      {/* Confirmation code */}
      <div className="bg-primary-light border border-border rounded-lg inline-block px-8 py-4 mb-10">
        <span className="text-text-muted text-xs font-sans tracking-wider uppercase block mb-1">
          {success.codeLabel}
        </span>
        <span className="text-accent font-mono text-2xl font-bold tracking-widest">
          {confirmationCode}
        </span>
      </div>

      <div>
        <Link to="/" className="btn-outline text-xs">
          {success.backLabel}
        </Link>
      </div>
    </div>
  );
}
