import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Ticket, AlertTriangle } from 'lucide-react';

const blank = { kodi: '', pershkrimi: '', perqindja_zbritjes: '', vlera_minimale: '0', data_fillimit: '', data_perfundimit: '', statusi: 'Active' };

export default function Kuponat() {
  const [items,     setItems]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(blank);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [error,     setError]     = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try { const { data } = await api.get('/kuponat'); setItems(data); }
    catch { setError('Gabim në ngarkimin e kuponave'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit = item => {
    setEditItem(item);
    setForm({
      kodi: item.kodi || '', pershkrimi: item.pershkrimi || '',
      perqindja_zbritjes: item.perqindja_zbritjes || '',
      vlera_minimale: item.vlera_minimale || '0',
      data_fillimit: item.data_fillimit ? item.data_fillimit.slice(0, 10) : '',
      data_perfundimit: item.data_perfundimit ? item.data_perfundimit.slice(0, 10) : '',
      statusi: item.statusi || 'Active',
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/kuponat/${editItem.kupon_id}`, form);
      else          await api.post('/kuponat', form);
      setShowModal(false); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/kuponat/${deleteId}`); setDeleteId(null); fetchItems(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = items.filter(i =>
    `${i.kodi} ${i.pershkrimi || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kuponat</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} kupona gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Shto Kupon
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <span className="flex items-center gap-1.5"><AlertTriangle size={14} />{error}</span>
          <button onClick={() => setError('')} className="text-red-400 font-bold text-lg">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Kërko kodin ose pershkrimin..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#', 'Kodi', 'Zbritja %', 'Min. Porosia', 'Skadon', 'Statusi', 'Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Nuk u gjet asnjë kupon për "${search}"` : 'Nuk ka kupona akoma'}
                  </td></tr>
                ) : filtered.map(i => (
                  <tr key={i.kupon_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i.kupon_id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-orange-50 text-orange-700 font-mono font-bold rounded text-sm tracking-widest">{i.kodi}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">{i.perqindja_zbritjes}%</td>
                    <td className="px-4 py-3 text-gray-500">€{Number(i.vlera_minimale || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{i.data_perfundimit ? i.data_perfundimit.slice(0, 10) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${i.statusi === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {i.statusi}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(i)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(i.kupon_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Kuponin' : 'Shto Kupon të Ri'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kodi i Kuponit *</label>
                  <input required type="text" value={form.kodi} onChange={set('kodi')} placeholder="p.sh. SAVE15" className="input uppercase" />
                </div>
                <div>
                  <label className="label">Zbritja (%) *</label>
                  <input required type="number" min="1" max="100" step="0.01" value={form.perqindja_zbritjes} onChange={set('perqindja_zbritjes')} className="input" />
                </div>
                <div>
                  <label className="label">Vlera Min. e Porosisë (€)</label>
                  <input type="number" step="0.01" min="0" value={form.vlera_minimale} onChange={set('vlera_minimale')} className="input" />
                </div>
                <div>
                  <label className="label">Statusi</label>
                  <select value={form.statusi} onChange={set('statusi')} className="input">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="label">Data e Fillimit</label>
                  <input type="date" value={form.data_fillimit} onChange={set('data_fillimit')} className="input" />
                </div>
                <div>
                  <label className="label">Data e Skadimit</label>
                  <input type="date" value={form.data_perfundimit} onChange={set('data_perfundimit')} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Pershkrimi</label>
                <textarea rows={2} value={form.pershkrimi} onChange={set('pershkrimi')} className="input resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Kuponin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><Ticket size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Kuponin?</h3>
            <p className="text-gray-500 text-sm mb-6">Kuponi do të fshihet përgjithmonë.</p>
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
