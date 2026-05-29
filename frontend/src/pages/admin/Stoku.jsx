import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Package } from 'lucide-react';

const blank = { liber_id: '', sasia_ndryshimit: '', arsyeja: '' };

export default function Stoku() {
  const [items,     setItems]     = useState([]);
  const [librat,    setLibrat]    = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(blank);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [error,     setError]     = useState('');

  useEffect(() => { fetchItems(); fetchLibrat(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try { const { data } = await api.get('/stoku'); setItems(data); }
    catch { setError('Gabim në ngarkimin e stokut'); }
    finally { setLoading(false); }
  };

  const fetchLibrat = async () => {
    try { const { data } = await api.get('/librat'); setLibrat(data); }
    catch { /* non-critical */ }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit = item => {
    setEditItem(item);
    setForm({ liber_id: item.liber_id || '', sasia_ndryshimit: item.sasia_ndryshimit || '', arsyeja: item.arsyeja || '' });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/stoku/${editItem.stok_id}`, form);
      else          await api.post('/stoku', form);
      setShowModal(false); fetchItems(); fetchLibrat();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/stoku/${deleteId}`); setDeleteId(null); fetchItems(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = items.filter(i =>
    `${i.titulli || ''} ${i.arsyeja || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lëvizjet e Stokut</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} lëvizje gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Regjistro Lëvizje
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
            <input type="text" placeholder="Kërko sipas librit ose arsyes..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#', 'Libri', 'Sasia (+/−)', 'Arsyeja', 'Data', 'Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Nuk u gjet asnjë lëvizje për "${search}"` : 'Nuk ka lëvizje stoku akoma'}
                  </td></tr>
                ) : filtered.map(i => (
                  <tr key={i.stok_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i.stok_id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 max-w-[200px] truncate">{i.titulli || `Libri #${i.liber_id}`}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-base ${Number(i.sasia_ndryshimit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(i.sasia_ndryshimit) >= 0 ? '+' : ''}{i.sasia_ndryshimit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{i.arsyeja || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{i.created_at ? new Date(i.created_at).toLocaleDateString('sq-AL') : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(i)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(i.stok_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Lëvizjen' : 'Regjistro Lëvizje Stoku'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Libri *</label>
                <select required value={form.liber_id} onChange={set('liber_id')} className="input">
                  <option value="">— Zgjidh librin —</option>
                  {librat.map(l => (
                    <option key={l.liber_id} value={l.liber_id}>{l.titulli} (Stoku: {l.sasia_stokut})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Sasia e Ndryshimit *</label>
                <input required type="number" value={form.sasia_ndryshimit} onChange={set('sasia_ndryshimit')}
                  placeholder="Pozitive = hyrje, negative = dalje (p.sh. +50 ose -10)" className="input" />
                <p className="text-xs text-gray-400 mt-1">Vendos numër pozitiv për hyrje stoku, negativ për dalje.</p>
              </div>
              <div>
                <label className="label">Arsyeja</label>
                <input type="text" value={form.arsyeja} onChange={set('arsyeja')} placeholder="p.sh. Blerje nga furnizuesi, Shitje..." className="input" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Regjistro')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><Package size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Lëvizjen?</h3>
            <p className="text-gray-500 text-sm mb-6">Lëvizja e stokut do të fshihet.</p>
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
