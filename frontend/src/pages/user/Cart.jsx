import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUserAuth } from '../../context/UserAuthContext';
import { ShoppingCart, BookOpen } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

export default function Cart() {
  const { items, removeFromCart, updateQty, total, clearCart } = useCart();
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const shipping = items.length > 0 ? (total >= 30 ? 0 : 3.5) : 0;
  const grandTotal = total + shipping;

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6"><ShoppingCart size={32} className="text-blue-300" strokeWidth={1.25} /></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
      <p className="text-gray-500 mb-8">Browse our collection and add some books!</p>
      <Link to="/books"
        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
        Browse Books
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium">
          Clear cart
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Items list ───────────────────────── */}
        <div className="flex-1 space-y-3">
          {items.map(item => {
            const cover = imgSrc(item.foto_url);
            const lineTotal = Number(item.cmimi) * item.qty;
            return (
              <div key={item.liber_id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 shadow-sm">
                {/* Cover */}
                <Link to={`/book/${item.liber_id}`} className="shrink-0">
                  <div className="w-16 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {cover ? (
                      <>
                        <img src={cover} alt={item.titulli} className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <div className="w-full h-full items-center justify-center" style={{ display: 'none' }}>
                          <BookOpen size={22} className="text-gray-300" strokeWidth={1.25} />
                        </div>
                      </>
                    ) : (
                      <BookOpen size={22} className="text-gray-300" strokeWidth={1.25} />
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/book/${item.liber_id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                    {item.titulli}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{item.autori_emri || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{Number(item.cmimi).toFixed(2)} € / item</p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty control */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(item.liber_id, item.qty - 1)}
                        className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 font-bold text-sm transition-colors">−</button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-gray-800 min-w-[2.5rem] text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.liber_id, item.qty + 1)}
                        className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 font-bold text-sm transition-colors">+</button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{lineTotal.toFixed(2)} €</span>
                      <button onClick={() => removeFromCart(item.liber_id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Order summary ────────────────────── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm mb-5">
              {items.map(item => (
                <div key={item.liber_id} className="flex justify-between text-gray-600">
                  <span className="truncate flex-1 mr-3">{item.titulli} ×{item.qty}</span>
                  <span className="shrink-0 font-medium">{(Number(item.cmimi) * item.qty).toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : `${shipping.toFixed(2)} €`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Free shipping on orders over 30 €</p>
              )}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-extrabold text-blue-700">{grandTotal.toFixed(2)} €</span>
            </div>

            <button
              onClick={() => user ? navigate('/checkout') : navigate('/login', { state: { from: '/checkout' } })}
              className="w-full mt-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm">
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
            <Link to="/books"
              className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-700 font-medium">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
