import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { UserCircle, AlertTriangle } from 'lucide-react';

const blank = { emri: '', mbiemri: '', email: '', password: '', telefoni: '', adresa: '', qyteti: '', kodi_postar: '' };

const statusColor = s => ({
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600');

function Avatar({ emri, size = 'md' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sz} bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0`}>
      {emri?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Klientet() {
  const [klientet,     setKlientet]     = useState([]);
  const [showModal,    setShowModal]    = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [profileData,  setProfileData]  = useState(null);
  const [profileOrders,setProfileOrders]= useState(null);
  const [editItem,     setEditItem]     = useState(null);
  const [form,         setForm]         = useState(blank);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [profileLoading,setProfileLoading] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [deleteId,     setDeleteId]     = useState(null);
  const [error,        setError]        = useState('');

  useEffect(() => { fetchKlientet(); }, []);

  const fetchKlientet = async () => {
    setLoading(true);
    try { const { data } = await api.get('/klientet'); setKlientet(data); }
    catch { setError('Gabim në ngarkimin e klientëve'); }
    finally { setLoading(false); }
  };

  const openProfile = useCallback(async (k) => {
    setProfileData(k); setProfileOrders(null); setShowProfile(true);
    setProfileLoading(true);
    try {
      const { data } = await api.get(`/klientet/${k.klient_id}/porosite`);
      setProfileOrders(data);
    } catch { setProfileOrders({ orders: [], total: 0, shpenzuar: 0 }); }
    finally { setProfileLoading(false); }
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit   = item => {
    setEditItem(item);
    setForm({ emri: item.emri||'', mbiemri: item.mbiemri||'', email: item.email||'',
      password: '', telefoni: item.telefoni||'', adresa: item.adresa||'',
      qyteti: item.qyteti||'', kodi_postar: item.kodi_postar||'' });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editItem) await api.put(`/klientet/${editItem.klient_id}`, payload);
      else          await api.post('/klientet', payload);
      setShowModal(false); fetchKlientet();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/klientet/${deleteId}`); setDeleteId(null); fetchKlientet(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = klientet.filter(k =>
    `${k.emri} ${k.mbiemri} ${k.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Klientët</h1>
          <p className="text-sm text-gray-500 mt-0.5">{klientet.length} klientë gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
          + Shto Klient
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <span className="flex items-center gap-1.5"><AlertTriangle size={14} />{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold text-lg">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <input type="text" placeholder="Kërko sipas emrit ose email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#','Klienti','Email','Telefoni','Qyteti','Kodi Postar','Regjistrimi','Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Nuk u gjet asnjë klient</td></tr>
                ) : filtered.map(k => (
                  <tr key={k.klient_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{k.klient_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar emri={k.emri} />
                        <span className="font-semibold text-gray-800">{k.emri} {k.mbiemri}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-600">{k.email}</td>
                    <td className="px-4 py-3 text-gray-500">{k.telefoni || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{k.qyteti || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{k.kodi_postar || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {k.data_regjistrimit ? new Date(k.data_regjistrimit).toLocaleDateString('sq-AL') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openProfile(k)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">Profil</button>
                        <button onClick={() => openEdit(k)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(k.klient_id)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showProfile && profileData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Profili i Klientit</h2>
              <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar emri={profileData.emri} size="lg" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{profileData.emri} {profileData.mbiemri}</h3>
                  <p className="text-blue-600 text-sm">{profileData.email}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Regjistruar: {profileData.data_regjistrimit ? new Date(profileData.data_regjistrimit).toLocaleDateString('sq-AL') : '—'}
                  </p>
                </div>
                <button onClick={() => { setShowProfile(false); openEdit(profileData); }}
                  className="ml-auto px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">
                  Ndrysho
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Telefoni',    value: profileData.telefoni   || '—' },
                  { label: 'Qyteti',      value: profileData.qyteti     || '—' },
                  { label: 'Kodi Postar', value: profileData.kodi_postar || '—' },
                  { label: 'Adresa',      value: profileData.adresa     || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-700">{value}</p>
                  </div>
                ))}
              </div>

              {profileLoading ? (
                <div className="py-8 text-center text-gray-400">Duke ngarkuar historikun...</div>
              ) : profileOrders && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-700">{profileOrders.total}</p>
                      <p className="text-xs text-blue-500 font-medium mt-1">Porosi Gjithsej</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-emerald-700">
                        {Number(profileOrders.shpenzuar).toFixed(2)} €
                      </p>
                      <p className="text-xs text-emerald-500 font-medium mt-1">Totali i Shpenzuar</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Historiku i Porosive</h4>
                    {profileOrders.orders.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
                        Ky klient nuk ka bërë asnjë porosi ende.
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase">
                              <th className="px-4 py-2.5 text-left">ID</th>
                              <th className="px-4 py-2.5 text-left">Data</th>
                              <th className="px-4 py-2.5 text-left">Metoda</th>
                              <th className="px-4 py-2.5 text-right">Shuma</th>
                              <th className="px-4 py-2.5 text-left">Statusi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileOrders.orders.map(o => (
                              <tr key={o.porosi_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{o.porosi_id}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                  {new Date(o.data_porosise).toLocaleDateString('sq-AL')}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{o.metoda_pageses}</td>
                                <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                  {Number(o.shuma_totale).toFixed(2)} €
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(o.statusi)}`}>
                                    {o.statusi}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Klientin' : 'Shto Klient të Ri'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Emri *</label>
                  <input type="text" required value={form.emri} onChange={set('emri')} className="input" />
                </div>
                <div>
                  <label className="label">Mbiemri *</label>
                  <input type="text" required value={form.mbiemri} onChange={set('mbiemri')} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">Email *</label>
                  <input type="email" required value={form.email} onChange={set('email')} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">{editItem ? 'Fjalëkalimi i Ri (lër bosh për ta mbajtur)' : 'Fjalëkalimi *'}</label>
                  <input type="password" required={!editItem} value={form.password} onChange={set('password')}
                    placeholder={editItem ? '••••••••' : 'Minimumi 6 karaktere'} className="input" />
                </div>
                <div>
                  <label className="label">Telefoni</label>
                  <input type="text" value={form.telefoni} onChange={set('telefoni')} className="input" />
                </div>
                <div>
                  <label className="label">Qyteti</label>
                  <input type="text" value={form.qyteti} onChange={set('qyteti')} className="input" />
                </div>
                <div>
                  <label className="label">Kodi Postar</label>
                  <input type="text" value={form.kodi_postar} onChange={set('kodi_postar')} className="input" />
                </div>
                <div>
                  <label className="label">Adresa</label>
                  <input type="text" value={form.adresa} onChange={set('adresa')} className="input" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Klientin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><UserCircle size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Klientin?</h3>
            <p className="text-gray-500 text-sm mb-6">Të gjitha porosite dhe të dhënat e klientit do të fshihen. Ky veprim nuk mund të kthehet.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm">Anulo</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold">Fshi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
