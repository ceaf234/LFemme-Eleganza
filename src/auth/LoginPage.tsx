import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useAuthRedirect } from './useAuthRedirect';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { loading: authLoading } = useAuthRedirect();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Credenciales invalidas. Intenta de nuevo.');
      setLoading(false);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  // While checking if already authenticated, show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <p className="text-text-secondary animate-pulse text-sm font-sans">
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-primary-light border border-border rounded-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl text-text-primary mb-1">
            L'Femme <span className="italic text-accent">Admin</span>
          </h1>
          <p className="text-sm text-text-muted font-sans">
            Iniciar sesion
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-red-400 text-sm font-sans">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm text-text-secondary font-sans mb-1"
            >
              Correo electronico
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-primary-dark border border-border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm text-text-secondary font-sans mb-1"
            >
              Contrasena
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-primary-dark border border-border rounded-md px-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cta text-xs disabled:opacity-60"
          >
            {loading ? 'Iniciando sesion...' : 'Iniciar sesion'}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-text-muted hover:text-accent transition-colors font-sans"
          >
            &larr; Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
