import { useState, useEffect } from 'react';
import api from '../api/axios';

const blank = { emri: '', pershkrimi: '', kategoria_prind_id: '' };

export default function Kategorite() {
  const [kategorite, setKategorite] = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [form, setForm]             = useState(blank);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [deleteId, setDeleteId]     = useState(null);
  const [error, setError]           = useState('');

  useEffect(() => { fetchKategorite(); }, []);

  const fetchKategorite = async () => {
    setLoading(true);
    try { const { data } = await api.get('/kategorite'); setKategorite(data); }
    catch { setError('Gabim në ngarkimin e kategorive'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit   = item => {
    setEditItem(item);
    setForm({
      emri: item.emri || '',
      pershkrimi: item.pershkrimi || '',
      kategoria_prind_id: item.kategoria_prind_id || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    try {
      const payload = {
        ...form,
        kategoria_prind_id: form.kategoria_prind_id || null
      };
      if (editItem) await api.put(`/kategorite/${editItem.kategori_id}`, payload);
      else          await api.post('/kategorite', payload);
      setShowModal(false); fetchKategorite();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/kategorite/${deleteId}`); setDeleteId(null); fetchKategorite(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = kategorite.filter(k =>
    `${k.emri} ${k.pershkrimi || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const parentOptions = kategorite.filter(k => !editItem || k.kategori_id !== editItem.kategori_id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kategoritë</h1>
          <p className="text-sm text-gray-500 mt-0.5">{kategorite.length} kategori gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
          + Shto Kategori
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold text-lg">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <input type="text" placeholder="Kërko sipas emrit..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#', 'Emri', 'Kategoria Prind', 'Përshkrimi', 'Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Nuk u gjet asnjë kategori</td></tr>
                ) : filtered.map(k => (
                  <tr key={k.kategori_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{k.kategori_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {k.emri?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{k.emri}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {k.prind_emri
                        ? <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{k.prind_emri}</span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[260px] truncate">{k.pershkrimi || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(k)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(k.kategori_id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Kategorinë' : 'Shto Kategori të Re'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="label">Emri *</label>
                <input type="text" required value={form.emri} onChange={set('emri')} className="input" />
              </div>
              <div>
                <label className="label">Kategoria Prind</label>
                <select value={form.kategoria_prind_id} onChange={set('kategoria_prind_id')} className="input">
                  <option value="">— Asnjë (kategori kryesore) —</option>
                  {parentOptions.map(k => (
                    <option key={k.kategori_id} value={k.kategori_id}>{k.emri}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Përshkrimi</label>
                <textarea rows={3} value={form.pershkrimi} onChange={set('pershkrimi')}
                  className="input resize-none" placeholder="Përshkrim i shkurtër i kategorisë..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                  {editItem ? 'Ruaj Ndryshimet' : 'Shto Kategorinë'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="text-3xl mb-3">🗂️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Kategorinë?</h3>
            <p className="text-gray-500 text-sm mb-6">Kategoria do të fshihet përgjithmonë. Librat e lidhur mund të preken.</p>
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
