import { useState, useEffect } from 'react';
import api from '../api/axios';

const BACKEND = 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

const blank = { emri: '', mbiemri: '', biografia: '', shtati: '', website: '', email: '', foto_url: '' };

export default function Autoret() {
  const [autoret,   setAutoret]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(blank);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [error,     setError]     = useState('');

  useEffect(() => { fetchAutoret(); }, []);

  const fetchAutoret = async () => {
    setLoading(true);
    try { const { data } = await api.get('/autoret'); setAutoret(data); }
    catch { setError('Gabim në ngarkimin e autorëve'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit   = item => {
    setEditItem(item);
    setForm({
      emri: item.emri || '',         mbiemri: item.mbiemri || '',
      biografia: item.biografia || '', shtati: item.shtati || '',
      website: item.website || '',   email: item.email || '',
      foto_url: item.foto_url || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/autoret/${editItem.autori_id}`, form);
      else          await api.post('/autoret', form);
      setShowModal(false); fetchAutoret();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/autoret/${deleteId}`); setDeleteId(null); fetchAutoret(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = autoret.filter(a =>
    `${a.emri} ${a.mbiemri} ${a.email || ''} ${a.shtati || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Autorët</h1>
          <p className="text-sm text-gray-500 mt-0.5">{autoret.length} autorë gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Shto Autor
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} className="text-red-400 font-bold text-lg">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" placeholder="Kërko sipas emrit, shtetit ose email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Pastro</button>
          )}
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['Foto','#','Emri','Email','Shteti','Website','Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Nuk u gjet asnjë autor për "${search}"` : 'Nuk ka autorë akoma'}
                  </td></tr>
                ) : filtered.map(a => (
                  <tr key={a.autori_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      {imgSrc(a.foto_url)
                        ? <img src={imgSrc(a.foto_url)} alt={a.emri}
                            className="w-10 h-10 object-cover rounded-full shadow-sm"
                            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                        : null}
                      <div className={`w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold ${imgSrc(a.foto_url) ? 'hidden' : ''}`}>
                        {a.emri?.[0]?.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{a.autori_id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{a.emri} {a.mbiemri}</td>
                    <td className="px-4 py-3 text-blue-600">{a.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{a.shtati || '—'}</td>
                    <td className="px-4 py-3">
                      {a.website
                        ? <a href={a.website} target="_blank" rel="noreferrer"
                            className="text-blue-500 hover:underline truncate max-w-[140px] block">
                            {a.website.replace(/^https?:\/\//, '')}
                          </a>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(a)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(a.autori_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Autorin' : 'Shto Autor të Ri'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">

              {/* Photo URL + preview */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                  {form.foto_url
                    ? <img src={form.foto_url} alt="preview" className="w-full h-full object-cover"
                        onError={e => { e.target.style.display='none'; }} />
                    : <span className="text-2xl">👤</span>}
                </div>
                <div className="flex-1">
                  <label className="label">URL e Fotos</label>
                  <input type="text" value={form.foto_url} onChange={set('foto_url')}
                    placeholder="https://ui-avatars.com/api/?name=..." className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Emri *</label>
                  <input type="text" required value={form.emri} onChange={set('emri')} className="input" />
                </div>
                <div>
                  <label className="label">Mbiemri *</label>
                  <input type="text" required value={form.mbiemri} onChange={set('mbiemri')} className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={form.email} onChange={set('email')} className="input" />
                </div>
                <div>
                  <label className="label">Shteti</label>
                  <input type="text" value={form.shtati} onChange={set('shtati')} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">Website</label>
                  <input type="text" value={form.website} onChange={set('website')} placeholder="https://..." className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">Biografia</label>
                  <textarea rows={4} value={form.biografia} onChange={set('biografia')}
                    className="input resize-none" placeholder="Shkruaj një biografi të shkurtër..." />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Autorin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ──────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Autorin?</h3>
            <p className="text-gray-500 text-sm mb-6">Autori do të fshihet përgjithmonë. Librat e lidhur mund të preken.</p>
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
