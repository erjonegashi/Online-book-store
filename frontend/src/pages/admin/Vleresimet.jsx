import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, AlertTriangle, Star } from 'lucide-react';

const blank = { liber_id: '', klient_id: '', nota: '5', komenti: '', statusi: 'Pending' };

const STATUS_COLORS = {
  Pending:  'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const Stars = ({ nota }) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={13} className={n <= Number(nota) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} strokeWidth={0} />
    ))}
  </span>
);

export default function Vleresimet() {
  const [items,     setItems]     = useState([]);
  const [librat,    setLibrat]    = useState([]);
  const [klientet,  setKlientet]  = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(blank);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [error,     setError]     = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [v, l, k] = await Promise.all([
        api.get('/vleresimet'), api.get('/librat'), api.get('/klientet'),
      ]);
      setItems(v.data); setLibrat(l.data); setKlientet(k.data);
    } catch { setError('Gabim në ngarkimin e vlerësimeve'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit = item => {
    setEditItem(item);
    setForm({ liber_id: item.liber_id || '', klient_id: item.klient_id || '', nota: item.nota || '5', komenti: item.komenti || '', statusi: item.statusi || 'Pending' });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/vleresimet/${editItem.vleresim_id}`, form);
      else          await api.post('/vleresimet', form);
      setShowModal(false); fetchAll();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/vleresimet/${deleteId}`); setDeleteId(null); fetchAll(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = items.filter(i =>
    `${i.titulli || ''} ${i.klient_emri || ''} ${i.komenti || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vlerësimet</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} vlerësime gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Shto Vlerësim
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
            <input type="text" placeholder="Kërko sipas librit, klientit ose komentit..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#', 'Libri', 'Klienti', 'Nota', 'Komenti', 'Statusi', 'Data', 'Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Nuk u gjet asnjë vlerësim për "${search}"` : 'Nuk ka vlerësime akoma'}
                  </td></tr>
                ) : filtered.map(i => (
                  <tr key={i.vleresim_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i.vleresim_id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 max-w-[160px] truncate">{i.titulli || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{i.klient_emri || '—'}</td>
                    <td className="px-4 py-3"><Stars nota={i.nota} /></td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{i.komenti || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[i.statusi] || 'bg-gray-100 text-gray-600'}`}>
                        {i.statusi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{i.data ? new Date(i.data).toLocaleDateString('sq-AL') : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(i)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(i.vleresim_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Vlerësimin' : 'Shto Vlerësim'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Libri *</label>
                  <select required value={form.liber_id} onChange={set('liber_id')} className="input">
                    <option value="">— Zgjidh librin —</option>
                    {librat.map(l => <option key={l.liber_id} value={l.liber_id}>{l.titulli}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Klienti *</label>
                  <select required value={form.klient_id} onChange={set('klient_id')} className="input">
                    <option value="">— Zgjidh klientin —</option>
                    {klientet.map(k => <option key={k.klient_id} value={k.klient_id}>{k.emri} {k.mbiemri}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Nota (1–5) *</label>
                  <select required value={form.nota} onChange={set('nota')} className="input">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Statusi</label>
                  <select value={form.statusi} onChange={set('statusi')} className="input">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Komenti</label>
                <textarea rows={3} value={form.komenti} onChange={set('komenti')} className="input resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Vlerësimin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><Star size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Vlerësimin?</h3>
            <p className="text-gray-500 text-sm mb-6">Vlerësimi do të fshihet përgjithmonë.</p>
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
