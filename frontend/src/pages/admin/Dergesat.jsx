import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Package, Truck, Plane, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

const blank = { porosi_id: '', kompania_dergeses: '', numri_gjurmimit: '', data_dergimit: '', data_mberritjes: '', statusi: 'Preparing' };

const STATUS_COLORS = {
  Preparing: 'bg-yellow-100 text-yellow-800',
  Shipped:   'bg-blue-100 text-blue-700',
  InTransit: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-green-100 text-green-700',
  Returned:  'bg-red-100 text-red-700',
};

const STATUS_ICONS = {
  Preparing: Package,
  Shipped:   Truck,
  InTransit: Plane,
  Delivered: CheckCircle2,
  Returned:  RotateCcw,
};

const StatusIcon = ({ status }) => {
  const Icon = STATUS_ICONS[status];
  return Icon ? <Icon size={11} className="inline-block mr-1 -mt-px" strokeWidth={2} /> : null;
};

export default function Dergesat() {
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
    try { const { data } = await api.get('/dergesat'); setItems(data); }
    catch { setError('Gabim në ngarkimin e dërgesave'); }
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
    setForm({
      porosi_id: item.porosi_id || '', kompania_dergeses: item.kompania_dergeses || '',
      numri_gjurmimit: item.numri_gjurmimit || '',
      data_dergimit: item.data_dergimit ? item.data_dergimit.slice(0, 10) : '',
      data_mberritjes: item.data_mberritjes ? item.data_mberritjes.slice(0, 10) : '',
      statusi: item.statusi || 'Preparing',
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editItem) await api.put(`/dergesat/${editItem.dergesa_id}`, form);
      else          await api.post('/dergesat', form);
      setShowModal(false); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/dergesat/${deleteId}`); setDeleteId(null); fetchItems(); }
    catch (err) { setError(err.response?.data?.error || 'Gabim gjatë fshirjes'); setDeleteId(null); }
  };

  const filtered = items.filter(i =>
    `${i.klient_emri || ''} ${i.kompania_dergeses || ''} ${i.numri_gjurmimit || ''} ${i.statusi}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dërgesat</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} dërgesa gjithsej</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm">
          + Shto Dërgim
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
            <input type="text" placeholder="Kërko sipas klientit, kompanisë ose nr. gjurmimit..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Duke ngarkuar...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['#', 'Porosia', 'Klienti', 'Kompania', 'Nr. Gjurmimit', 'Statusi', 'Dërguar', 'Veprime'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Nuk u gjet asnjë dërgim për "${search}"` : 'Nuk ka dërgesa akoma'}
                  </td></tr>
                ) : filtered.map(i => (
                  <tr key={i.dergesa_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i.dergesa_id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">#{i.porosi_id}</td>
                    <td className="px-4 py-3 text-gray-700">{i.klient_emri || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{i.kompania_dergeses || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{i.numri_gjurmimit || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[i.statusi] || 'bg-gray-100 text-gray-600'}`}>
                        <StatusIcon status={i.statusi} />{i.statusi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{i.data_dergimit ? i.data_dergimit.slice(0, 10) : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(i)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">Ndrysho</button>
                        <button onClick={() => setDeleteId(i.dergesa_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg">Fshi</button>
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
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Ndrysho Dërgimin' : 'Shto Dërgim të Ri'}</h2>
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
                  <label className="label">Statusi</label>
                  <select value={form.statusi} onChange={set('statusi')} className="input">
                    <option value="Preparing">Preparing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="InTransit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
                <div>
                  <label className="label">Kompania e Dërgimit</label>
                  <input type="text" value={form.kompania_dergeses} onChange={set('kompania_dergeses')} placeholder="p.sh. DHL, FedEx" className="input" />
                </div>
                <div>
                  <label className="label">Nr. Gjurmimit</label>
                  <input type="text" value={form.numri_gjurmimit} onChange={set('numri_gjurmimit')} placeholder="p.sh. TRK12345" className="input" />
                </div>
                <div>
                  <label className="label">Data e Dërgimit</label>
                  <input type="date" value={form.data_dergimit} onChange={set('data_dergimit')} className="input" />
                </div>
                <div>
                  <label className="label">Data e Mbërritjes</label>
                  <input type="date" value={form.data_mberritjes} onChange={set('data_mberritjes')} className="input" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium">Anulo</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold">
                  {saving ? 'Duke ruajtur...' : (editItem ? 'Ruaj Ndryshimet' : 'Shto Dërgimin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4"><Truck size={20} className="text-red-600" strokeWidth={1.75} /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Fshi Dërgimin?</h3>
            <p className="text-gray-500 text-sm mb-6">Dërgimi do të fshihet përgjithmonë.</p>
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
