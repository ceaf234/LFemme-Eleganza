import { useLocation, useNavigate } from 'react-router-dom';
import { HiCheck } from 'react-icons/hi';
import { bookingContent } from '../../content/bookingContent';

const { steps } = bookingContent.layout;

function getStepIndex(pathname: string): number {
  if (pathname === '/book/confirm') return 2;
  if (pathname === '/book/schedule') return 1;
  return 0;
}

export default function ProgressIndicator() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentIndex = getStepIndex(location.pathname);

  return (
    <nav aria-label="Progreso de reserva" className="w-full max-w-lg mx-auto">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <li key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-0.5 -z-10 ${
                    isCompleted ? 'bg-accent' : 'bg-border'
                  }`}
                />
              )}

              {/* Step circle */}
              {isCompleted ? (
                <button
                  onClick={() => navigate(step.path)}
                  className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center transition-colors hover:bg-accent-light"
                  aria-label={`Ir a ${step.label}`}
                >
                  <HiCheck className="w-4 h-4" />
                </button>
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-medium border-2 transition-colors ${
                    isCurrent
                      ? 'border-accent text-accent bg-transparent'
                      : 'border-border text-text-muted bg-transparent'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {index + 1}
                </div>
              )}

              {/* Step label */}
              <span
                className={`mt-2 text-xs font-sans tracking-wide ${
                  isCurrent ? 'text-accent font-medium' : isFuture ? 'text-text-muted' : 'text-text-secondary'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
