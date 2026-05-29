import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, MapPin, AlertTriangle } from 'lucide-react';

const blank = { klient_id: '', emri_pranuesit: '', adresa: '', qyteti: '', kodi_postar: '', telefoni: '', eshte_kryesore: false };

export default function Adresat() {
  const [items,     setItems]     = useState([]);
  const [klientet,  setKlientet]  = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(blank);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [error,     setError]     = useState('');

  useEffect(() => { fetchItems(); fetchKlientet(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try { const { data } = await api.get('/adresat'); setItems(data); }
    catch { setError('Gabim në ngarkimin e adresave'); }
    finally { setLoading(false); }
  };

  const fetchKlientet = async () => {
    try { const { data } = await api.get('/klientet'); setKlientet(data); }
    catch { /* non-critical */ }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit = item => {
    setEditItem(item);
    setForm({
      klient_id: item.klient_id || '', emri_pranuesit: item.emri_pranuesit || '',
      adresa: item.adresa || '', qyteti: item.qyteti || '',
      kodi_postar: item.kodi_postar || '', telefoni: item.telefoni || '',
      eshte_kryesore: !!item.eshte_kryesore,
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/adresat/${editItem.adrese_id}`, form);
      else          await api.post('/adresat', form);
      setShowModal(false); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/adresat/${deleteId}`); setDeleteId(null); fetchItems(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = items.filter(i =>
    `${i.emri_pranuesit} ${i.adresa} ${i.qyteti} ${i.klient_emri || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Adresat e Dërgimit</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} adresa gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Shto Adresë
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
            <input type="text" placeholder="Kërko sipas emrit, qytetit ose klientit..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#', 'Klienti', 'Pranues', 'Adresa', 'Qyteti', 'Kryesore', 'Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Nuk u gjet asnjë adresë për "${search}"` : 'Nuk ka adresa akoma'}
                  </td></tr>
                ) : filtered.map(i => (
                  <tr key={i.adrese_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i.adrese_id}</td>
                    <td className="px-4 py-3 text-gray-700">{i.klient_emri || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{i.emri_pranuesit}</td>
                    <td className="px-4 py-3 text-gray-500">{i.adresa}</td>
                    <td className="px-4 py-3 text-gray-500">{i.qyteti}</td>
                    <td className="px-4 py-3">
                      {i.eshte_kryesore
                        ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Kryesore</span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(i)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(i.adrese_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Adresën' : 'Shto Adresë të Re'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Klienti *</label>
                <select required value={form.klient_id} onChange={set('klient_id')} className="input">
                  <option value="">— Zgjidh klientin —</option>
                  {klientet.map(k => (
                    <option key={k.klient_id} value={k.klient_id}>{k.emri} {k.mbiemri}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Emri i Pranuesit *</label>
                <input required type="text" value={form.emri_pranuesit} onChange={set('emri_pranuesit')} className="input" />
              </div>
              <div>
                <label className="label">Adresa *</label>
                <input required type="text" value={form.adresa} onChange={set('adresa')} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Qyteti *</label>
                  <input required type="text" value={form.qyteti} onChange={set('qyteti')} className="input" />
                </div>
                <div>
                  <label className="label">Kodi Postar</label>
                  <input type="text" value={form.kodi_postar} onChange={set('kodi_postar')} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">Telefoni</label>
                  <input type="text" value={form.telefoni} onChange={set('telefoni')} className="input" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="kryesore" checked={form.eshte_kryesore}
                  onChange={e => setForm(f => ({ ...f, eshte_kryesore: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <label htmlFor="kryesore" className="text-sm font-medium text-gray-700">Adresë kryesore</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Adresën')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><MapPin size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Adresën?</h3>
            <p className="text-gray-500 text-sm mb-6">Adresa do të fshihet përgjithmonë.</p>
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
