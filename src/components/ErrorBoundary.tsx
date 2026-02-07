import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <h1 className="font-serif text-2xl text-text-primary mb-3">
              Algo salio mal
            </h1>
            <p className="text-text-secondary font-sans text-sm mb-6">
              Ocurrio un error inesperado. Por favor, intenta recargar la pagina.
            </p>
            <a href="/" className="btn-outline text-xs inline-block">
              Volver al inicio
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
