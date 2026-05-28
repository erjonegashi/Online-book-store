import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import userApi from '../../api/userAxios';
import { Clock, Settings, Truck, CheckCircle, XCircle, Package, BookOpen, Check, AlertTriangle, ChevronDown } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

const STATUS_STYLES = {
  Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-50   text-blue-700   border-blue-200',
  Shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  Delivered:  'bg-green-50  text-green-700  border-green-200',
  Cancelled:  'bg-red-50    text-red-700    border-red-200',
};
const STATUS_ICON_MAP = {
  Pending: Clock, Processing: Settings, Shipped: Truck, Delivered: CheckCircle, Cancelled: XCircle,
};
const StatusIcon = ({ status }) => {
  const Icon = STATUS_ICON_MAP[status];
  return Icon ? <Icon size={11} className="inline-block mr-1 -mt-px" strokeWidth={2} /> : null;
};

export default function Profile() {
  const { user, updateUser } = useUserAuth();
  const [tab, setTab] = useState('orders');

  const [profile, setProfile] = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState({ total: 0, spent: 0 });

  const [expanded, setExpanded] = useState(null);

  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');
  const [formErr, setFormErr] = useState('');

  const [pwForm,    setPwForm]    = useState({ current: '', next: '', confirm: '' });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwMsg,     setPwMsg]     = useState('');
  const [pwErr,     setPwErr]     = useState('');

  useEffect(() => {
    Promise.all([
      userApi.get('/user/me'),
      userApi.get('/user/orders'),
    ]).then(([pRes, oRes]) => {
      setProfile(pRes.data);
      setForm(pRes.data);
      const ords = oRes.data;
      setOrders(ords);
      setStats({
        total: ords.length,
        spent: ords.reduce((s, o) => s + Number(o.shuma_totale), 0),
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user.id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true); setFormErr(''); setMsg('');
    try {
      await userApi.put('/user/me', form);
      updateUser({ emri: form.emri, mbiemri: form.mbiemri, email: form.email });
      setProfile({ ...profile, ...form });
      setMsg('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      setFormErr(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    setPwErr(''); setPwMsg('');
    if (pwForm.next !== pwForm.confirm) { setPwErr('New passwords do not match'); return; }
    if (pwForm.next.length < 6)         { setPwErr('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await userApi.put('/user/me', { ...profile, password: pwForm.next, currentPassword: pwForm.current });
      setPwMsg('Password changed successfully!');
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwMsg(''), 3500);
    } catch (err) {
      setPwErr(err.response?.data?.error || 'Failed to change password');
    } finally { setPwSaving(false); }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 animate-pulse">
      <div className="h-40 bg-gray-200 rounded-2xl mb-6" />
      <div className="h-10 bg-gray-200 rounded-xl w-56 mb-6" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Hero card ──────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 rounded-2xl p-6 mb-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/25 flex items-center justify-center text-2xl font-extrabold shrink-0">
            {user.emri?.[0]?.toUpperCase()}{user.mbiemri?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{user.emri} {user.mbiemri}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10 text-center">
          <div>
            <p className="text-2xl font-extrabold">{stats.total}</p>
            <p className="text-xs text-blue-200/80 mt-0.5">Orders</p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-2xl font-extrabold">{stats.spent.toFixed(2)} €</p>
            <p className="text-xs text-blue-200/80 mt-0.5">Total Spent</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">
              {profile?.data_regjistrimit
                ? new Date(profile.data_regjistrimit).getFullYear()
                : new Date().getFullYear()}
            </p>
            <p className="text-xs text-blue-200/80 mt-0.5">Member Since</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[['orders', Package, 'My Orders'], ['settings', Settings, 'Settings']].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={14} strokeWidth={1.75} />{label}
          </button>
        ))}
      </div>

      {/* ── Orders ─────────────────────────────────────── */}
      {tab === 'orders' && (
        orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5"><Package size={32} className="text-gray-300" strokeWidth={1.25} /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-7">
              Browse our collection and place your first order!
            </p>
            <Link to="/books"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.porosi_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Summary row */}
                <button
                  onClick={() => setExpanded(e => e === order.porosi_id ? null : order.porosi_id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left gap-4">
                  <div className="flex items-center gap-5 flex-wrap min-w-0">
                    <div className="shrink-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Order</p>
                      <p className="font-bold text-gray-900">#{order.porosi_id}</p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Date</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(order.data_porosise).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
                      <p className="text-sm font-bold text-blue-700">
                        {Number(order.shuma_totale).toFixed(2)} €
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${STATUS_STYLES[order.statusi] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      <StatusIcon status={order.statusi} />{order.statusi}
                    </span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-200 ${expanded === order.porosi_id ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded details */}
                {expanded === order.porosi_id && (
                  <div className="border-t border-gray-100 bg-gray-50/70 p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Payment</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{order.metoda_pageses || '—'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Shipping</p>
                        <p className="text-sm font-semibold mt-0.5">
                          {Number(order.kostoja_dergeses) === 0
                            ? <span className="text-green-600">Free</span>
                            : `${Number(order.kostoja_dergeses).toFixed(2)} €`}
                        </p>
                      </div>
                      {order.adresa_dergeses && (
                        <div className="bg-white rounded-lg p-3 border border-gray-100 col-span-2 sm:col-span-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Delivery Address</p>
                          <p className="text-xs font-semibold text-gray-700 mt-0.5 leading-snug">{order.adresa_dergeses}</p>
                        </div>
                      )}
                    </div>

                    {order.items && order.items.length > 0 ? (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                          Items Ordered ({order.items.length})
                        </p>
                        <div className="space-y-2">
                          {order.items.map(item => {
                            const cover = imgSrc(item.foto_url);
                            return (
                              <div key={item.detaji_id}
                                className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
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
                                <Link to={`/book/${item.liber_id}`}
                                  className="flex-1 text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors truncate">
                                  {item.titulli}
                                </Link>
                                <span className="text-xs text-gray-500 shrink-0">×{item.sasia}</span>
                                <span className="text-sm font-bold text-gray-900 shrink-0 ml-2">
                                  {Number(item.cmimi_total).toFixed(2)} €
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No items found for this order.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Settings ───────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="space-y-6">

          {/* Personal info card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              {!editing && (
                <button onClick={() => { setEditing(true); setFormErr(''); setMsg(''); }}
                  className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  Edit Profile
                </button>
              )}
            </div>

            {msg && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <Check size={14} className="shrink-0" />{msg}
              </div>
            )}
            {formErr && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertTriangle size={14} className="shrink-0" />{formErr}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      First Name *
                    </label>
                    <input required value={form.emri || ''} onChange={set('emri')}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      Last Name *
                    </label>
                    <input required value={form.mbiemri || ''} onChange={set('mbiemri')}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Email *
                  </label>
                  <input type="email" required value={form.email || ''} onChange={set('email')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input type="tel" value={form.telefoni || ''} onChange={set('telefoni')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Address</label>
                  <input value={form.adresa || ''} onChange={set('adresa')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
                    <input value={form.qyteti || ''} onChange={set('qyteti')}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Postal Code</label>
                    <input value={form.kodi_postar || ''} onChange={set('kodi_postar')}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button type="button"
                    onClick={() => { setEditing(false); setForm(profile); setFormErr(''); }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ['First Name',   profile?.emri],
                  ['Last Name',    profile?.mbiemri],
                  ['Email',        profile?.email],
                  ['Phone',        profile?.telefoni],
                  ['Address',      profile?.adresa],
                  ['City',         profile?.qyteti],
                  ['Postal Code',  profile?.kodi_postar],
                  ['Member Since', profile?.data_regjistrimit
                    ? new Date(profile.data_regjistrimit).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })
                    : null],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4">
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
                    <dd className="text-sm font-medium text-gray-800">
                      {value || <span className="text-gray-400 italic text-xs">Not set</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Change password card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Change Password</h2>

            {pwMsg && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <Check size={14} className="shrink-0" />{pwMsg}
              </div>
            )}
            {pwErr && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertTriangle size={14} className="shrink-0" />{pwErr}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  New Password *
                </label>
                <input type="password" required minLength={6}
                  value={pwForm.next} placeholder="Min. 6 characters"
                  onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Confirm New Password *
                </label>
                <input type="password" required minLength={6}
                  value={pwForm.confirm} placeholder="Repeat new password"
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={pwSaving}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-xl text-sm transition-colors">
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
