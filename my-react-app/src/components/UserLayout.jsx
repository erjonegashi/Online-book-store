import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';

export default function UserLayout() {
  const { user, logout } = useUserAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const linkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Navbar ───────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">📖</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight">BookStore</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/" end className={linkCls}>Home</NavLink>
              <NavLink to="/books" className={linkCls}>Books</NavLink>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Cart icon */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/profile"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {user.emri?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.emri}</span>
                  </Link>
                  <button onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium px-2 py-1.5 rounded transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5">
                    Login
                  </Link>
                  <Link to="/register"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(o => !o)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
              <NavLink to="/" end onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                Home
              </NavLink>
              <NavLink to="/books" onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                Books
              </NavLink>
              {user && (
                <NavLink to="/profile" onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  My Profile
                </NavLink>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Page content ─────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 pt-12 pb-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📖</span>
                <span className="text-white text-lg font-bold tracking-tight">BookStore</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Your favourite online bookstore. Discover, read, and explore a world of stories.
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/20">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                UBT University Project
              </div>
            </div>

            {/* Browse */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Browse</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/"      className="hover:text-white transition-colors flex items-center gap-1.5"><span className="text-gray-600">›</span> Home</Link></li>
                <li><Link to="/books" className="hover:text-white transition-colors flex items-center gap-1.5"><span className="text-gray-600">›</span> All Books</Link></li>
                <li><Link to="/cart"  className="hover:text-white transition-colors flex items-center gap-1.5"><span className="text-gray-600">›</span> Cart</Link></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Account</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/login"    className="hover:text-white transition-colors flex items-center gap-1.5"><span className="text-gray-600">›</span> Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors flex items-center gap-1.5"><span className="text-gray-600">›</span> Register</Link></li>
                <li><Link to="/profile"  className="hover:text-white transition-colors flex items-center gap-1.5"><span className="text-gray-600">›</span> My Orders</Link></li>
              </ul>
            </div>

            {/* Developed by */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Developed by</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Viona Lushta',  initials: 'VL', color: 'bg-blue-600' },
                  { name: 'Suela Zeneli',  initials: 'SZ', color: 'bg-purple-600' },
                  { name: 'Erjona Gashi',  initials: 'EG', color: 'bg-emerald-600' },
                ].map(dev => (
                  <li key={dev.name} className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 ${dev.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                      {dev.initials}
                    </div>
                    <span className="text-sm text-gray-300">{dev.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span>© {new Date().getFullYear()} BookStore — UBT University. All rights reserved.</span>
            <span className="text-gray-600">Faculty of Computer Science &amp; Engineering</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
