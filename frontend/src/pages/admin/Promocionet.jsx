import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, AlertTriangle, Zap } from 'lucide-react';

const blank = { titulli: '', pershkrim: '', perqindja_zbritjes: '', kodi: '', data_fillimit: '', data_mbarimit: '', aktive: true };

export default function Promocionet() {
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
    try { const { data } = await api.get('/promocionet'); setItems(data); }
    catch { setError('Gabim në ngarkimin e promocioneve'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit = item => {
    setEditItem(item);
    setForm({
      titulli: item.titulli || '', pershkrim: item.pershkrim || '',
      perqindja_zbritjes: item.perqindja_zbritjes || '',
      kodi: item.kodi || '',
      data_fillimit: item.data_fillimit ? item.data_fillimit.slice(0, 10) : '',
      data_mbarimit: item.data_mbarimit ? item.data_mbarimit.slice(0, 10) : '',
      aktive: !!item.aktive,
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/promocionet/${editItem.promovim_id}`, form);
      else          await api.post('/promocionet', form);
      setShowModal(false); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/promocionet/${deleteId}`); setDeleteId(null); fetchItems(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = items.filter(i =>
    `${i.titulli} ${i.kodi || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = active => active
    ? <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Aktiv</span>
    : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">Joaktiv</span>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promocionet</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} promocione gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Shto Promovim
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
            <input type="text" placeholder="Kërko sipas titullit ose kodit..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#', 'Titulli', 'Kodi', 'Zbritja %', 'Nga — Deri', 'Statusi', 'Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Nuk u gjet asnjë promovim për "${search}"` : 'Nuk ka promocione akoma'}
                  </td></tr>
                ) : filtered.map(i => (
                  <tr key={i.promovim_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i.promovim_id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{i.titulli}</td>
                    <td className="px-4 py-3">
                      {i.kodi
                        ? <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-mono font-bold rounded">{i.kodi}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-bold">{i.perqindja_zbritjes}%</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {i.data_fillimit ? i.data_fillimit.slice(0, 10) : '—'} → {i.data_mbarimit ? i.data_mbarimit.slice(0, 10) : '—'}
                    </td>
                    <td className="px-4 py-3">{statusBadge(i.aktive)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(i)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(i.promovim_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
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
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Promovimin' : 'Shto Promovim të Ri'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="label">Titulli *</label>
                <input required type="text" value={form.titulli} onChange={set('titulli')} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kodi i Promovimit</label>
                  <input type="text" value={form.kodi} onChange={set('kodi')} placeholder="p.sh. SUMMER20" className="input" />
                </div>
                <div>
                  <label className="label">Zbritja (%) *</label>
                  <input required type="number" min="1" max="100" step="0.01" value={form.perqindja_zbritjes} onChange={set('perqindja_zbritjes')} className="input" />
                </div>
                <div>
                  <label className="label">Data e Fillimit</label>
                  <input type="date" value={form.data_fillimit} onChange={set('data_fillimit')} className="input" />
                </div>
                <div>
                  <label className="label">Data e Mbarimit</label>
                  <input type="date" value={form.data_mbarimit} onChange={set('data_mbarimit')} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Pershkrimi</label>
                <textarea rows={3} value={form.pershkrim} onChange={set('pershkrim')} className="input resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="aktive" checked={form.aktive}
                  onChange={e => setForm(f => ({ ...f, aktive: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <label htmlFor="aktive" className="text-sm font-medium text-gray-700">Aktiv</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Promovimin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><Zap size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Promovimin?</h3>
            <p className="text-gray-500 text-sm mb-6">Promovimi do të fshihet përgjithmonë.</p>
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
