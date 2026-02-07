import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import ProgressIndicator from './components/ProgressIndicator';
import ErrorBoundary from '../components/ErrorBoundary';
import { bookingContent } from '../content/bookingContent';

const { layout } = bookingContent;

export default function BookingLayout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/"
            className="font-serif text-xl text-text-primary hover:text-accent transition-colors"
          >
            {layout.brandName} <span className="italic text-accent">{layout.brandAccent}</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors font-sans"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            {layout.backLabel}
          </Link>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="py-6 px-4">
        <ProgressIndicator />
      </div>

      {/* Page content */}
      <main className="flex-1 pb-16">
        <ErrorBoundary
          fallback={
            <div className="text-center py-16 px-4">
              <h1 className="font-serif text-2xl text-text-primary mb-3">
                Algo salio mal
              </h1>
              <p className="text-text-secondary font-sans text-sm mb-6">
                Ocurrio un error al procesar tu reserva. Por favor, intenta de nuevo.
              </p>
              <a href="/book" className="btn-outline text-xs inline-block">
                Reiniciar reserva
              </a>
            </div>
          }
        >
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
