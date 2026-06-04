import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';
import NexusLogo from './NexusLogo';
import { Heart, ShoppingCart, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function UserLayout() {
  const { user, logout } = useUserAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const linkCls = ({ isActive }) =>
    `text-sm transition-colors ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-800'}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            <Link to="/" className="flex items-center gap-2 shrink-0">
              <NexusLogo size={26} className="-translate-y-[1px]" />
              <span className="text-base font-bold tracking-tight">
                <span className="text-blue-600">UBT</span>
                <span className="text-gray-900">Nexus</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5">
              <NavLink to="/" end className={linkCls}>Home</NavLink>
              <NavLink to="/books" className={linkCls}>Books</NavLink>
              <NavLink to="/about" className={linkCls}>About Us</NavLink>
              {user && (
                <>
                  <NavLink to="/wishlist" className={({ isActive }) =>
                    `flex items-center gap-1.5 text-sm transition-colors ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>
                    <Heart size={13} className="shrink-0" />
                    Wishlist
                  </NavLink>
                  <NavLink to="/profile" className={linkCls}>My Orders</NavLink>
                </>
              )}
            </nav>

            <div className="flex items-center gap-1">
              {user && <NotificationBell />}
              <Link to="/cart" className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors">
                <ShoppingCart size={18} strokeWidth={1.75} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-1">
                  <Link to="/profile"
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {user.emri?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700">{user.emri}</span>
                  </Link>
                  <button onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium px-2 py-1.5 rounded transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 ml-1">
                  <Link to="/login"
                    className="text-sm text-gray-500 hover:text-gray-800 px-2.5 py-1.5 transition-colors">
                    Login
                  </Link>
                  <Link to="/register"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}

              <button onClick={() => setMobileOpen(o => !o)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-800 ml-0.5">
                {mobileOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 py-2 space-y-0.5">
              <NavLink to="/" end onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                Home
              </NavLink>
              <NavLink to="/books" onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                Books
              </NavLink>
              <NavLink to="/about" onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                About Us
              </NavLink>
              {user && (
                <>
                  <NavLink to="/wishlist" onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${isActive ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Heart size={13} className="shrink-0" />
                    Wishlist
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                    My Orders
                  </NavLink>
                </>
              )}
              {!user && (
                <div className="pt-1 pb-0.5 flex gap-2 px-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white font-medium transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-blue-200 pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <NexusLogo size={22} />
                <span className="text-sm font-bold tracking-tight">
                  <span className="text-blue-300">UBT</span>
                  <span className="text-white">Nexus</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-blue-300">
                UBT University&rsquo;s digital bookstore platform. Discover, read, and explore a world of stories.
              </p>
            </div>

            <div>
              <h4 className="text-white text-xs font-semibold mb-3 uppercase tracking-wide">Browse</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/"         className="text-blue-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/books"    className="text-blue-300 hover:text-white transition-colors">All Books</Link></li>
                <li><Link to="/cart"     className="text-blue-300 hover:text-white transition-colors">Cart</Link></li>
                <li><Link to="/wishlist" className="text-blue-300 hover:text-white transition-colors">Wishlist</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-semibold mb-3 uppercase tracking-wide">Account</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login"    className="text-blue-300 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="text-blue-300 hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/profile"  className="text-blue-300 hover:text-white transition-colors">My Orders</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-semibold mb-3 uppercase tracking-wide">About</h4>
              <ul className="space-y-2 text-xs text-blue-300">
                <li>Faculty of CS &amp; Engineering</li>
                <li>UBT University, Kosovo</li>
                <li>Student Project 2026</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-blue-400">
            <span>© {new Date().getFullYear()} UBTNexus — UBT University. All rights reserved.</span>
            <span>Faculty of Computer Science &amp; Engineering</span>
          </div>
        </div>
      </footer>
    </div>
  );
}