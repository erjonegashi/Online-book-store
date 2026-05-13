import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import { CartProvider } from './context/CartContext';

import AdminLayout   from './components/Layout';
import AdminLogin    from './pages/Login';
import AdminRegister from './pages/AdminRegister';

import Dashboard  from './pages/Dashboard';
import Librat     from './pages/Librat';
import Autoret    from './pages/Autoret';
import Kategorite from './pages/Kategorite';
import Botuesit   from './pages/Botuesit';
import Gjuhet     from './pages/Gjuhet';
import Seria      from './pages/Seria';

import Klientet  from './pages/Klientet';
import Adresat   from './pages/Adresat';
import Njoftimet from './pages/Njoftimet';

import Porosite    from './pages/Porosite';
import Kuponat     from './pages/Kuponat';
import Promocionet from './pages/Promocionet';
import Pagesat     from './pages/Pagesat';

import Dergesat from './pages/Dergesat';
import Stoku    from './pages/Stoku';
import Kthimet  from './pages/Kthimet';
import Faturat  from './pages/Faturat';

import Vleresimet from './pages/Vleresimet';

import UserLayout  from './components/UserLayout';
import Home        from './pages/user/Home';
import Books       from './pages/user/Books';
import BookDetail  from './pages/user/BookDetail';
import Cart        from './pages/user/Cart';
import Checkout    from './pages/user/Checkout';
import UserLogin   from './pages/user/UserLogin';
import Register    from './pages/user/Register';
import Profile     from './pages/user/Profile';
import Wishlist    from './pages/user/Wishlist';
import About       from './pages/user/About';

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
              <Route path="/login"    element={<UserLogin />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<UserLayout />}>
                <Route index           element={<Home />} />
                <Route path="books"    element={<Books />} />
                <Route path="about"    element={<About />} />
                <Route path="book/:id" element={<BookDetail />} />
                <Route path="cart"     element={<Cart />} />
                <Route path="checkout" element={<UserGuard><Checkout /></UserGuard>} />
                <Route path="profile"  element={<UserGuard><Profile /></UserGuard>} />
                <Route path="wishlist" element={<UserGuard><Wishlist /></UserGuard>} />
              </Route>

              <Route path="/admin/login"    element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />

              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<Dashboard />} />

                <Route path="librat"      element={<Librat />} />
                <Route path="autoret"     element={<Autoret />} />
                <Route path="kategorite"  element={<Kategorite />} />
                <Route path="botuesit"    element={<Botuesit />} />
                <Route path="gjuhet"      element={<Gjuhet />} />
                <Route path="seria"       element={<Seria />} />

                <Route path="klientet"    element={<Klientet />} />
                <Route path="adresat"     element={<Adresat />} />
                <Route path="njoftimet"   element={<Njoftimet />} />

                <Route path="porosite"    element={<Porosite />} />
                <Route path="kuponat"     element={<Kuponat />} />
                <Route path="promocionet" element={<Promocionet />} />
                <Route path="pagesat"     element={<Pagesat />} />

                <Route path="dergesat"    element={<Dergesat />} />
                <Route path="stoku"       element={<Stoku />} />
                <Route path="kthimet"     element={<Kthimet />} />
                <Route path="faturat"     element={<Faturat />} />

                <Route path="vleresimet"  element={<Vleresimet />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </UserAuthProvider>
    </AuthProvider>
  );
}
