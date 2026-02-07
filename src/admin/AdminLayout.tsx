import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineLogout,
} from 'react-icons/hi';
import { useAuth } from '../auth/AuthContext';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: HiOutlineHome, exact: true },
  { path: '/admin/appointments', label: 'Citas', icon: HiOutlineCalendar },
  { path: '/admin/services', label: 'Servicios', icon: HiOutlineSparkles },
  { path: '/admin/staff', label: 'Personal', icon: HiOutlineUserGroup },
  { path: '/admin/clients', label: 'Clientes', icon: HiOutlineUsers },
  { path: '/admin/blocked-times', label: 'Tiempos Bloqueados', icon: HiOutlineClock },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-light border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="font-serif text-xl text-text-primary hover:text-accent transition-colors">
            L'Femme <span className="italic text-accent">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-sans transition-colors ${
                      active
                        ? 'bg-accent/10 text-accent border-l-2 border-accent'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {/* User info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-sans font-medium shrink-0">
              {user?.email?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-primary font-sans truncate">
                {user?.email ?? ''}
              </p>
              <p className="text-[10px] text-text-muted font-sans">
                Administrador
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-xs text-text-muted hover:text-accent transition-colors font-sans"
            >
              &larr; Volver al sitio
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors font-sans"
            >
              <HiOutlineLogout className="w-3.5 h-3.5" />
              Cerrar sesion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
