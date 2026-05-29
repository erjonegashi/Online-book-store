import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, CreditCard, Banknote, Building2, Wallet, AlertTriangle } from 'lucide-react';

const blank = { porosi_id: '', shuma: '', metoda: 'Card', statusi: 'Pending', referenca_transaksionit: '' };

const STATUS_COLORS = {
  Pending:   'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-700',
  Failed:    'bg-red-100 text-red-700',
  Refunded:  'bg-purple-100 text-purple-700',
};

const METHOD_ICONS = { Card: CreditCard, Cash: Banknote, 'Bank Transfer': Building2, PayPal: Wallet };

const MethodIcon = ({ method }) => {
  const Icon = METHOD_ICONS[method] || CreditCard;
  return <Icon size={13} className="inline-block mr-1 -mt-px text-gray-500" strokeWidth={1.75} />;
};

export default function Pagesat() {
  const [items,     setItems]     = useState([]);
  const [porosite,  setPorosite]  = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(blank);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [error,     setError]     = useState('');

  useEffect(() => { fetchItems(); fetchPorosite(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try { const { data } = await api.get('/pagesat'); setItems(data); }
    catch { setError('Gabim në ngarkimin e pagesave'); }
    finally { setLoading(false); }
  };

  const fetchPorosite = async () => {
    try { const { data } = await api.get('/porosite'); setPorosite(data); }
    catch { /* non-critical */ }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditItem(null); setForm(blank); setShowModal(true); };
  const openEdit = item => {
    setEditItem(item);
    setForm({ porosi_id: item.porosi_id || '', shuma: item.shuma || '', metoda: item.metoda || 'Card', statusi: item.statusi || 'Pending', referenca_transaksionit: item.referenca_transaksionit || '' });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/pagesat/${editItem.pagese_id}`, form);
      else          await api.post('/pagesat', form);
      setShowModal(false); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/pagesat/${deleteId}`); setDeleteId(null); fetchItems(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = items.filter(i =>
    `${i.klient_emri || ''} ${i.metoda} ${i.statusi} ${i.referenca_transaksionit || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const total = items.filter(i => i.statusi === 'Completed').reduce((s, i) => s + Number(i.shuma || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pagesat</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} pagesa gjithsej · <span className="text-green-600 font-semibold">€{total.toFixed(2)} të arkëtuara</span></p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Shto Pagesë
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
            <input type="text" placeholder="Kërko sipas klientit, metodës ose statusit..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#', 'Porosia', 'Klienti', 'Shuma', 'Metoda', 'Statusi', 'Referenca', 'Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Nuk u gjet asnjë pagesë për "${search}"` : 'Nuk ka pagesa akoma'}
                  </td></tr>
                ) : filtered.map(i => (
                  <tr key={i.pagese_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i.pagese_id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">#{i.porosi_id}</td>
                    <td className="px-4 py-3 text-gray-700">{i.klient_emri || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">€{Number(i.shuma).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm flex items-center gap-1"><MethodIcon method={i.metoda} />{i.metoda}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[i.statusi] || 'bg-gray-100 text-gray-600'}`}>
                        {i.statusi}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 truncate max-w-[120px]">{i.referenca_transaksionit || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(i)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(i.pagese_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
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
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Pagesën' : 'Shto Pagesë të Re'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Porosia *</label>
                  <select required value={form.porosi_id} onChange={set('porosi_id')} className="input">
                    <option value="">— Zgjidh porosinë —</option>
                    {porosite.map(p => <option key={p.porosi_id} value={p.porosi_id}>#{p.porosi_id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Shuma (€) *</label>
                  <input required type="number" step="0.01" min="0" value={form.shuma} onChange={set('shuma')} className="input" />
                </div>
                <div>
                  <label className="label">Metoda</label>
                  <select value={form.metoda} onChange={set('metoda')} className="input">
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="label">Statusi</label>
                  <select value={form.statusi} onChange={set('statusi')} className="input">
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Referenca e Transaksionit</label>
                  <input type="text" value={form.referenca_transaksionit} onChange={set('referenca_transaksionit')} placeholder="p.sh. TXN-123456" className="input" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Pagesën')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><CreditCard size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Pagesën?</h3>
            <p className="text-gray-500 text-sm mb-6">Pagesa do të fshihet përgjithmonë.</p>
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
