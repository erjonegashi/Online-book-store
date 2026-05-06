import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import { CartProvider } from './context/CartContext';

// Admin
import AdminLayout   from './components/Layout';
import AdminLogin    from './pages/Login';
import Dashboard     from './pages/Dashboard';
import Librat        from './pages/Librat';
import Klientet      from './pages/Klientet';
import Porosite      from './pages/Porosite';
import Autoret       from './pages/Autoret';
import Kategorite    from './pages/Kategorite';

// User
import UserLayout    from './components/UserLayout';
import Home          from './pages/user/Home';
import Books         from './pages/user/Books';
import BookDetail    from './pages/user/BookDetail';
import Cart          from './pages/user/Cart';
import Checkout      from './pages/user/Checkout';
import UserLogin     from './pages/user/UserLogin';
import Register      from './pages/user/Register';
import Profile       from './pages/user/Profile';
import VerifyEmail   from './pages/user/VerifyEmail';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword  from './pages/user/ResetPassword';

function AdminGuard({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/admin/login" replace />;
}

function UserGuard({ children }) {
  const { user } = useUserAuth();
  return user ? children : <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* ── User / Public ────────────────────────── */}
              <Route path="/login"           element={<UserLogin />} />
              <Route path="/register"        element={<Register />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              <Route path="/" element={<UserLayout />}>
                <Route index           element={<Home />} />
                <Route path="books"    element={<Books />} />
                <Route path="book/:id" element={<BookDetail />} />
                <Route path="cart"     element={<Cart />} />
                <Route path="checkout" element={<UserGuard><Checkout /></UserGuard>} />
                <Route path="profile"  element={<UserGuard><Profile /></UserGuard>} />
              </Route>

              {/* ── Admin ────────────────────────────────── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index                 element={<Dashboard />} />
                <Route path="librat"         element={<Librat />} />
                <Route path="klientet"       element={<Klientet />} />
                <Route path="porosite"       element={<Porosite />} />
                <Route path="autoret"        element={<Autoret />} />
                <Route path="kategorite"     element={<Kategorite />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </UserAuthProvider>
    </AuthProvider>
  );
}
