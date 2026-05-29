import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Search, BookOpen, Trash2, AlertTriangle } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

const blank = {
  titulli: '', autori_id: '', isbn: '', kategoria_id: '',
  botuesi: '', viti_botimit: '', cmimi: '', sasia_stok: '',
  pershkrimi: '', formati: 'Softcover', foto_url: ''
};

export default function Librat() {
  const [librat,     setLibrat]     = useState([]);
  const [autoret,    setAutoret]    = useState([]);
  const [kategorite, setKategorite] = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [form,       setForm]       = useState(blank);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [error,      setError]      = useState('');
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, a, k] = await Promise.all([
        api.get('/librat'), api.get('/autoret'), api.get('/kategorite')
      ]);
      setLibrat(b.data); setAutoret(a.data); setKategorite(k.data);
    } catch { setError('Gabim në ngarkimin e të dhënave'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('foto', file);
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, foto_url: data.url }));
    } catch {
      setError('Gabim gjatë ngarkimit të imazhit');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit   = item => {
    setEditItem(item);
    setForm({
      titulli: item.titulli || '',       autori_id: item.autori_id || '',
      isbn: item.isbn || '',             kategoria_id: item.kategoria_id || '',
      botuesi: item.botuesi || '',       viti_botimit: item.viti_botimit || '',
      cmimi: item.cmimi || '',           sasia_stok: item.sasia_stok || '',
      pershkrimi: item.pershkrimi || '', formati: item.formati || 'Softcover',
      foto_url: item.foto_url || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/librat/${editItem.liber_id}`, form);
      else          await api.post('/librat', form);
      setShowModal(false); fetchAll();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/librat/${deleteId}`); setDeleteId(null); fetchAll(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = librat.filter(b =>
    `${b.titulli} ${b.autori_emri || ''} ${b.kategoria_emri || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const stockBadge = n => n > 10 ? 'bg-green-100 text-green-700' : n > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Librat</h1>
          <p className="text-sm text-gray-500 mt-0.5">{librat.length} libra gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Shto Libër
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <span className="flex items-center gap-1.5"><AlertTriangle size={14} />{error}</span>
          <button onClick={() => setError('')} className="text-red-400 font-bold text-lg leading-none">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Kërko sipas titullit, autorit ose kategorisë..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {search && (
            <span className="text-xs text-gray-400">
              {filtered.length} rezultat{filtered.length !== 1 ? 'e' : ''}
            </span>
          )}
          {search && (
            <button onClick={() => setSearch('')}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium">Pastro</button>
          )}
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['Foto','#','Titulli','Autori','Kategoria','Çmimi','Stok','Formati','Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <p className="text-gray-400 font-medium">
                        {search ? `Nuk u gjet asnjë libër për "${search}"` : 'Nuk ka libra akoma'}
                      </p>
                      {search && <p className="text-gray-300 text-xs mt-1">Provo me fjalë të ndryshme</p>}
                    </td>
                  </tr>
                ) : filtered.map(b => (
                  <tr key={b.liber_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      {imgSrc(b.foto_url)
                        ? <img src={imgSrc(b.foto_url)} alt={b.titulli}
                            className="w-10 h-14 object-cover rounded shadow-sm"
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        : null}
                      <div className={`w-10 h-14 bg-gray-100 rounded flex items-center justify-center ${imgSrc(b.foto_url) ? 'hidden' : ''}`}><BookOpen size={18} className="text-gray-400" strokeWidth={1.5} /></div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{b.liber_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800 max-w-[180px] truncate">{b.titulli}</div>
                      {b.isbn && <div className="text-xs text-gray-400 font-mono">{b.isbn}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.autori_emri || '—'}</td>
                    <td className="px-4 py-3">
                      {b.kategoria_emri
                        ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">{b.kategoria_emri}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 whitespace-nowrap">{Number(b.cmimi).toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stockBadge(b.sasia_stok)}`}>{b.sasia_stok}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{b.formati}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(b)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(b.liber_id)}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Librin' : 'Shto Libër të Ri'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">

              <div className="flex items-start gap-4">
                <div className="w-16 h-24 bg-gradient-to-br from-blue-50 to-violet-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 relative">
                  {imgSrc(form.foto_url) && (
                    <img src={imgSrc(form.foto_url)} alt="preview" className="w-full h-full object-cover"
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  )}
                  <div className={`w-full h-full items-center justify-center ${imgSrc(form.foto_url) ? 'hidden' : 'flex'}`}><BookOpen size={28} className="text-gray-300" strokeWidth={1.25} /></div>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="label">Kopertina e Librit</label>
                  <div className="flex gap-2 mb-1.5">
                    <input type="text" value={form.foto_url} onChange={set('foto_url')}
                      placeholder="https://covers.openlibrary.org/b/isbn/..."
                      className="input flex-1 min-w-0 text-xs" />
                    <input type="file" accept="image/*" ref={fileRef} onChange={handleImageUpload} className="hidden" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 whitespace-nowrap transition-colors disabled:opacity-50 shrink-0">
                      {uploading ? <span className="flex items-center gap-1"><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Duke ngarkuar...</span> : 'Ngarko Foto'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Ngarko nga kompjuteri <span className="text-gray-300 mx-1">·</span> ose paste URL nga interneti
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Titulli *</label>
                  <input type="text" required value={form.titulli} onChange={set('titulli')} className="input" />
                </div>
                <div>
                  <label className="label">Autori</label>
                  <select value={form.autori_id} onChange={set('autori_id')} className="input">
                    <option value="">— Zgjidh —</option>
                    {autoret.map(a => <option key={a.autori_id} value={a.autori_id}>{a.emri} {a.mbiemri}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Kategoria</label>
                  <select value={form.kategoria_id} onChange={set('kategoria_id')} className="input">
                    <option value="">— Zgjidh —</option>
                    {kategorite.map(k => <option key={k.kategori_id} value={k.kategori_id}>{k.emri}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">ISBN</label>
                  <input type="text" value={form.isbn} onChange={set('isbn')} className="input" />
                </div>
                <div>
                  <label className="label">Botuesi</label>
                  <input type="text" value={form.botuesi} onChange={set('botuesi')} className="input" />
                </div>
                <div>
                  <label className="label">Viti Botimit</label>
                  <input type="number" min="1800" max="2030" value={form.viti_botimit} onChange={set('viti_botimit')} className="input" />
                </div>
                <div>
                  <label className="label">Çmimi (€) *</label>
                  <input type="number" step="0.01" min="0" required value={form.cmimi} onChange={set('cmimi')} className="input" />
                </div>
                <div>
                  <label className="label">Sasia Stok</label>
                  <input type="number" min="0" value={form.sasia_stok} onChange={set('sasia_stok')} className="input" />
                </div>
                <div>
                  <label className="label">Formati</label>
                  <select value={form.formati} onChange={set('formati')} className="input">
                    {['Softcover','Hardcover','Ebook','Audiobook'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Përshkrimi</label>
                  <textarea rows={3} value={form.pershkrimi} onChange={set('pershkrimi')} className="input resize-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Librin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><Trash2 size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Konfirmo Fshirjen</h3>
            <p className="text-gray-500 text-sm mb-6">A jeni i sigurt? Ky veprim nuk mund të kthehet.</p>
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
