import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUserAuth } from '../../context/UserAuthContext';
import userApi from '../../api/userAxios';
import { CheckCircle, ShoppingCart, AlertTriangle, BookOpen } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;
const METHODS  = ['Card', 'Cash', 'PayPal', 'Bank Transfer'];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const shipping = total >= 30 ? 0 : 3.5;
  const grandTotal = total + shipping;

  const [form, setForm] = useState({
    emri: user?.emri || '', mbiemri: user?.mbiemri || '',
    email: user?.email || '', telefoni: '',
    adresa: '', qyteti: '', kodi_postar: '',
    metoda_pageses: 'Card',
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!items.length) return;
    setError(''); setSaving(true);
    try {
      const adresa_dergeses = [form.adresa, form.qyteti, form.kodi_postar].filter(Boolean).join(', ');

      const { data: orderData } = await userApi.post('/porosite', {
        klient_id: user.id,
        shuma_totale: grandTotal.toFixed(2),
        kostoja_dergeses: shipping.toFixed(2),
        statusi: 'Pending',
        metoda_pageses: form.metoda_pageses,
        adresa_dergeses,
      });

      const porosi_id = orderData.porosi_id;

      await Promise.all(items.map(item =>
        userApi.post('/detajet', {
          porosi_id,
          liber_id: item.liber_id,
          sasia: item.qty,
          cmimi_njesi: Number(item.cmimi),
        })
      ));

      clearCart();
      setSuccess(porosi_id);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (success) return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={36} className="text-green-600" strokeWidth={1.5} /></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-1">Thank you for your purchase.</p>
      <p className="text-sm text-gray-400 mb-8">Order <strong className="text-gray-700">#{success}</strong> has been received and is being processed.</p>
      <div className="flex items-center justify-center gap-4">
        <Link to="/profile"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
          My Orders
        </Link>
        <Link to="/books"
          className="px-6 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4"><ShoppingCart size={28} className="text-blue-300" strokeWidth={1.25} /></div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
      <Link to="/books" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
        Browse Books
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── Form ─────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertTriangle size={14} className="inline-block mr-1.5 -mt-px" />{error}
            </div>
          )}

          {/* Contact */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">First Name *</label>
                <input type="text" required value={form.emri} onChange={set('emri')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Last Name *</label>
                <input type="text" required value={form.mbiemri} onChange={set('mbiemri')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Email *</label>
                <input type="email" required value={form.email} onChange={set('email')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Phone</label>
                <input type="tel" value={form.telefoni} onChange={set('telefoni')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Street Address *</label>
                <input type="text" required value={form.adresa} onChange={set('adresa')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">City *</label>
                  <input type="text" required value={form.qyteti} onChange={set('qyteti')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Postal Code</label>
                  <input type="text" value={form.kodi_postar} onChange={set('kodi_postar')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map(m => (
                <label key={m}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.metoda_pageses === m ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={m} checked={form.metoda_pageses === m}
                    onChange={set('metoda_pageses')} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    form.metoda_pageses === m ? 'border-blue-500' : 'border-gray-300'}`}>
                    {form.metoda_pageses === m && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-base transition-colors shadow-sm">
            {saving ? 'Placing Order…' : `Place Order — ${grandTotal.toFixed(2)} €`}
          </button>
        </form>

        {/* ── Order summary sidebar ─────────────── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Your Order</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => {
                const cover = imgSrc(item.foto_url);
                return (
                  <div key={item.liber_id} className="flex gap-3 items-center">
                    <div className="w-10 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {cover ? (
                        <>
                          <img src={cover} alt={item.titulli} className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          <div className="w-full h-full items-center justify-center" style={{ display: 'none' }}>
                            <BookOpen size={18} className="text-gray-300" strokeWidth={1.25} />
                          </div>
                        </>
                      ) : (
                        <BookOpen size={18} className="text-gray-300" strokeWidth={1.25} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.titulli}</p>
                      <p className="text-xs text-gray-400">×{item.qty}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-700 shrink-0">
                      {(Number(item.cmimi) * item.qty).toFixed(2)} €
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : `${shipping.toFixed(2)} €`}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-lg font-extrabold text-blue-700">{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
