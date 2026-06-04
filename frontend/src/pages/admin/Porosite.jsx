import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Search, BookOpen, ShoppingCart, AlertTriangle } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const blank = {
  klient_id: '', shuma_totale: '', kostoja_dergeses: '0',
  statusi: 'Pending', metoda_pageses: 'Card', adresa_dergeses: ''
};
const STATUSET = ['Pending','Processing','Shipped','Delivered','Cancelled'];
const METODAT  = ['Cash','Card','PayPal','Bank Transfer'];

const statusColor = s => ({
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600');

export default function Porosite() {
  const [porosite,     setPorosite]     = useState([]);
  const [klientet,     setKlientet]     = useState([]);
  const [librat,       setLibrat]       = useState([]);
  const [showModal,    setShowModal]    = useState(false);
  const [showDetail,   setShowDetail]   = useState(false);
  const [detailOrder,  setDetailOrder]  = useState(null);
  const [detailItems,  setDetailItems]  = useState([]);
  const [editItem,     setEditItem]     = useState(null);
  const [form,         setForm]         = useState(blank);
  const [itemForm,     setItemForm]     = useState({ liber_id: '', sasia: '1', cmimi_njesi: '' });
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading,      setLoading]      = useState(true);
  const [detailLoading,setDetailLoading]= useState(false);
  const [saving,       setSaving]       = useState(false);
  const [deleteId,     setDeleteId]     = useState(null);
  const [error,        setError]        = useState('');
  const [detailError,  setDetailError]  = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, k, l] = await Promise.all([api.get('/porosite'), api.get('/klientet'), api.get('/librat')]);
      setPorosite(p.data); setKlientet(k.data); setLibrat(l.data);
    } catch { setError('Gabim në ngarkimin e të dhënave'); }
    finally { setLoading(false); }
  };

  const fetchDetail = useCallback(async (order) => {
    setDetailLoading(true); setDetailError('');
    try {
      const { data } = await api.get(`/porosite/${order.porosi_id}`);
      setDetailOrder(data);
      setDetailItems(data.detajet || []);
    } catch { setDetailError('Gabim në ngarkimin e detajeve'); }
    finally { setDetailLoading(false); }
  }, []);

  const openDetail = order => { setShowDetail(true); fetchDetail(order); };
  const refreshDetail = () => detailOrder && fetchDetail(detailOrder);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setItem = k => e => {
    const val = e.target.value;
    setItemForm(f => {
      const next = { ...f, [k]: val };
      if (k === 'liber_id' && val) {
        const book = librat.find(b => String(b.liber_id) === String(val));
        if (book) next.cmimi_njesi = book.cmimi;
      }
      return next;
    });
  };

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit   = item => {
    setEditItem(item);
    setForm({
      klient_id: item.klient_id || '', shuma_totale: item.shuma_totale || '',
      kostoja_dergeses: item.kostoja_dergeses || '0', statusi: item.statusi || 'Pending',
      metoda_pageses: item.metoda_pageses || 'Card', adresa_dergeses: item.adresa_dergeses || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/porosite/${editItem.porosi_id}`, form);
      else          await api.post('/porosite', form);
      setShowModal(false); fetchAll();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/porosite/${deleteId}`); setDeleteId(null); fetchAll(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const quickStatus = async (order, newStatus) => {
    try {
      await api.put(`/porosite/${order.porosi_id}`, { ...order, statusi: newStatus });
      fetchAll();
      if (detailOrder?.porosi_id === order.porosi_id) fetchDetail({ porosi_id: order.porosi_id });
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ndryshimit të statusit'); }
  };

  const addItem = async e => {
    e.preventDefault(); setDetailError('');
    const { liber_id, sasia, cmimi_njesi } = itemForm;
    if (!liber_id || !sasia || !cmimi_njesi) return;
    try {
      await api.post('/detajet', {
        porosi_id: detailOrder.porosi_id,
        liber_id, sasia: Number(sasia), cmimi_njesi: Number(cmimi_njesi)
      });
      const newTotal = detailItems.reduce((s, i) => s + Number(i.cmimi_total), 0) + Number(sasia) * Number(cmimi_njesi);
      await api.put(`/porosite/${detailOrder.porosi_id}`, { ...detailOrder, shuma_totale: newTotal.toFixed(2) });
      setItemForm({ liber_id: '', sasia: '1', cmimi_njesi: '' });
      await refreshDetail(); fetchAll();
    } catch (err) { setDetailError(err.response?.data?.error || 'Gabim gjatë shtimit'); }
  };

  const removeItem = async (item) => {
    try {
      await api.delete(`/detajet/${item.detaji_id}`);
      const newTotal = detailItems.filter(i => i.detaji_id !== item.detaji_id).reduce((s, i) => s + Number(i.cmimi_total), 0);
      await api.put(`/porosite/${detailOrder.porosi_id}`, { ...detailOrder, shuma_totale: newTotal.toFixed(2) });
      await refreshDetail(); fetchAll();
    } catch (err) { setDetailError(err.response?.data?.error || 'Gabim gjatë fshirjes'); }
  };

  const filtered = porosite.filter(p => {
    const matchSearch = `${p.klient_emri || ''} ${p.porosi_id}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.statusi === filterStatus;
    return matchSearch && matchStatus;
  });

  const itemTotal = Number(itemForm.sasia || 0) * Number(itemForm.cmimi_njesi || 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Porosite</h1>
          <p className="text-sm text-gray-500 mt-0.5">{porosite.length} porosi gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Porosi e Re
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <span className="flex items-center gap-1.5"><AlertTriangle size={14} />{error}</span>
          <button onClick={() => setError('')} className="text-red-400 font-bold text-lg">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3">
          <input type="text" placeholder="Kërko sipas klientit ose ID..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Të gjitha statuset</option>
            {STATUSET.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#','Klienti','Data','Shuma','Dërgesa','Metoda','Statusi','Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Nuk u gjet asnjë porosi</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.porosi_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{p.porosi_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{p.klient_emri || '—'}</div>
                      <div className="text-xs text-gray-400">{p.klient_email || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {p.data_porosise ? new Date(p.data_porosise).toLocaleDateString('sq-AL') : '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{Number(p.shuma_totale).toFixed(2)} €</td>
                    <td className="px-4 py-3 text-gray-500">{Number(p.kostoja_dergeses).toFixed(2)} €</td>
                    <td className="px-4 py-3 text-gray-600">{p.metoda_pageses}</td>
                    <td className="px-4 py-3">
                      <select value={p.statusi}
                        onChange={e => quickStatus(p, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${statusColor(p.statusi)}`}>
                        {STATUSET.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openDetail(p)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">Detaje</button>
                        <button onClick={() => openEdit(p)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(p.porosi_id)}
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

      {/* ── Detail Modal ───────────────────────────────────────────── */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Porosia #{detailOrder?.porosi_id}
                </h2>
                {detailOrder && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {detailOrder.klient_emri} · {new Date(detailOrder.data_porosise).toLocaleDateString('sq-AL')}
                  </p>
                )}
              </div>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {detailLoading ? (
                <div className="py-12 text-center text-gray-400">Duke ngarkuar...</div>
              ) : (
                <>
                  {detailError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2"><AlertTriangle size={14} />{detailError}</div>
                  )}

                  {/* Order summary */}
                  {detailOrder && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Statusi', value: <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(detailOrder.statusi)}`}>{detailOrder.statusi}</span> },
                        { label: 'Metoda', value: detailOrder.metoda_pageses },
                        { label: 'Shuma Totale', value: <span className="font-bold text-emerald-600">{Number(detailOrder.shuma_totale).toFixed(2)} €</span> },
                        { label: 'Dërgesa', value: `${Number(detailOrder.kostoja_dergeses).toFixed(2)} €` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">{label}</p>
                          <p className="text-sm font-semibold text-gray-700">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {detailOrder?.adresa_dergeses && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      <span className="font-semibold text-gray-600">Adresa: </span>{detailOrder.adresa_dergeses}
                    </div>
                  )}

                  {/* Items list */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Librat në Porosi</h3>
                    {detailItems.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">Asnjë libër i shtuar ende.</div>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase">
                              <th className="px-4 py-2.5 text-left">Libri</th>
                              <th className="px-4 py-2.5 text-right">Çmimi</th>
                              <th className="px-4 py-2.5 text-right">Sasia</th>
                              <th className="px-4 py-2.5 text-right">Totali</th>
                              <th className="px-4 py-2.5"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailItems.map(item => (
                              <tr key={item.detaji_id} className="border-b border-gray-100 last:border-0">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const book = librat.find(b => b.liber_id === item.liber_id);
                                      return book?.foto_url
                                        ? <img src={BACKEND + book.foto_url} alt="" className="w-7 h-10 object-cover rounded shrink-0" />
                                        : <div className="w-7 h-10 bg-gray-100 rounded flex items-center justify-center shrink-0"><BookOpen size={14} className="text-gray-400" strokeWidth={1.5} /></div>;
                                    })()}
                                    <span className="font-medium text-gray-800">{item.titulli || '—'}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-500">{Number(item.cmimi_njesi).toFixed(2)} €</td>
                                <td className="px-4 py-3 text-right text-gray-600 font-medium">×{item.sasia}</td>
                                <td className="px-4 py-3 text-right font-bold text-emerald-600">{Number(item.cmimi_total).toFixed(2)} €</td>
                                <td className="px-4 py-3 text-right">
                                  <button onClick={() => removeItem(item)}
                                    className="text-red-400 hover:text-red-600 text-lg font-bold leading-none">×</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 border-t border-gray-200">
                              <td colSpan={3} className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase">Totali i Librave</td>
                              <td className="px-4 py-2.5 text-right font-bold text-gray-800">
                                {detailItems.reduce((s, i) => s + Number(i.cmimi_total), 0).toFixed(2)} €
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Add item form */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Shto Libër në Porosi</h3>
                    <form onSubmit={addItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div className="sm:col-span-2">
                        <label className="label">Libri *</label>
                        <select required value={itemForm.liber_id} onChange={setItem('liber_id')} className="input">
                          <option value="">— Zgjidh Librin —</option>
                          {librat.map(b => (
                            <option key={b.liber_id} value={b.liber_id}>
                              {b.titulli} ({Number(b.cmimi).toFixed(2)} €)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Sasia *</label>
                        <input type="number" min="1" required value={itemForm.sasia} onChange={setItem('sasia')} className="input" />
                      </div>
                      <div>
                        <label className="label">Çmimi (L) *</label>
                        <input type="number" step="0.01" min="0" required value={itemForm.cmimi_njesi} onChange={setItem('cmimi_njesi')} className="input" />
                      </div>
                      <div className="sm:col-span-4 flex items-center justify-between">
                        {itemTotal > 0 && (
                          <span className="text-sm text-gray-500">
                            Totali: <strong className="text-emerald-600">{itemTotal.toFixed(2)} €</strong>
                          </span>
                        )}
                        <button type="submit"
                          className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                          + Shto Librin
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Porosinë' : 'Porosi e Re'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="label">Klienti *</label>
                <select required value={form.klient_id} onChange={set('klient_id')} className="input">
                  <option value="">— Zgjidh Klientin —</option>
                  {klientet.map(k => <option key={k.klient_id} value={k.klient_id}>{k.emri} {k.mbiemri} ({k.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Shuma Totale (L)</label>
                  <input type="number" step="0.01" min="0" value={form.shuma_totale} onChange={set('shuma_totale')} className="input" placeholder="Llogaritet automatikisht" />
                </div>
                <div>
                  <label className="label">Kostoja Dërgeses (L)</label>
                  <input type="number" step="0.01" min="0" value={form.kostoja_dergeses} onChange={set('kostoja_dergeses')} className="input" />
                </div>
                <div>
                  <label className="label">Statusi</label>
                  <select value={form.statusi} onChange={set('statusi')} className="input">
                    {STATUSET.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Metoda Pageses</label>
                  <select value={form.metoda_pageses} onChange={set('metoda_pageses')} className="input">
                    {METODAT.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Adresa Dërgeses</label>
                <textarea rows={2} value={form.adresa_dergeses} onChange={set('adresa_dergeses')} className="input resize-none" />
              </div>
              {!editItem && (
                <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-3">
                  Pas krijimit të porosisë, kliko <strong>Detaje</strong> për të shtuar librat.
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj' : 'Krijo Porosinë')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ─────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><ShoppingCart size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Porosinë?</h3>
            <p className="text-gray-500 text-sm mb-6">Të gjitha detajet dhe pagesat e kësaj porosie do të fshihen gjithashtu.</p>
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