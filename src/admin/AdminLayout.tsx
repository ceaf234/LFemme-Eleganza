import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineUserGroup,
} from 'react-icons/hi';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: HiOutlineHome, exact: true },
  { path: '/admin/appointments', label: 'Citas', icon: HiOutlineCalendar },
  { path: '/admin/services', label: 'Servicios', icon: HiOutlineSparkles },
  { path: '/admin/staff', label: 'Personal', icon: HiOutlineUserGroup },
  { path: '/admin/clients', label: 'Clientes', icon: HiOutlineUsers },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

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
        <div className="p-4 border-t border-border">
          <Link
            to="/"
            className="text-xs text-text-muted hover:text-accent transition-colors font-sans"
          >
            &larr; Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
