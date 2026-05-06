import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/admin',              label: 'Dashboard',  icon: '▦',  end: true },
  { to: '/admin/librat',       label: 'Librat',      icon: '📚' },
  { to: '/admin/klientet',     label: 'Klientet',    icon: '👥' },
  { to: '/admin/porosite',     label: 'Porosite',    icon: '📦' },
  { to: '/admin/autoret',      label: 'Autoret',     icon: '✍️' },
  { to: '/admin/kategorite',   label: 'Kategorite',  icon: '🏷️' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-gray-700">
          <div className="text-2xl font-bold text-white tracking-tight">📖 Bookstore</div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-base leading-none w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-1 truncate">{user?.emri} {user?.mbiemri}</div>
          <div className="text-xs text-gray-500 mb-3 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Dilni
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
