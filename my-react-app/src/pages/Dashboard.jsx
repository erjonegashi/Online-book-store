import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BACKEND = 'http://localhost:5000';

const StatCard = ({ icon, label, value, sub, color, textColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${color}`}>{icon}</div>
    </div>
    <p className={`text-3xl font-bold ${textColor || 'text-gray-800'}`}>{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const statusMeta = {
  Pending:    { label: 'Pending',    color: 'bg-yellow-400' },
  Processing: { label: 'Processing', color: 'bg-blue-400'   },
  Shipped:    { label: 'Dërguar',    color: 'bg-purple-400' },
  Delivered:  { label: 'Dorëzuar',   color: 'bg-green-400'  },
  Cancelled:  { label: 'Anuluar',    color: 'bg-red-400'    },
};

const statusBadge = s => ({
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600');

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Duke ngarkuar...</div>;
  if (!stats)  return <div className="flex items-center justify-center h-64 text-red-400">Gabim në ngarkimin e statistikave</div>;

  const totalOrdersForChart = Math.max(stats.orders, 1);
  const revenue = stats.revenue?.toLocaleString('sq-AL', { maximumFractionDigits: 0 }) ?? '0';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mirë se erdhe, {user?.emri}!</h1>
        <p className="text-gray-500 mt-0.5 text-sm">
          {new Date().toLocaleDateString('sq-AL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📚" label="Libra"    value={stats.books}      sub={`${stats.totalStock} copë në stok`} color="bg-blue-50"   textColor="text-blue-700" />
        <StatCard icon="👥" label="Klientë"  value={stats.clients}    sub="të regjistruar"                     color="bg-green-50"  textColor="text-green-700" />
        <StatCard icon="📦" label="Porosi"   value={stats.orders}     sub={`${stats.statusCounts?.Pending ?? 0} pending`}           color="bg-purple-50" textColor="text-purple-700" />
        <StatCard icon="✍️" label="Autorë"   value={stats.authors}    sub={`${stats.categories} kategori`}    color="bg-orange-50" textColor="text-orange-700" />
      </div>

      {/* Revenue + Order status chart + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-sm">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-2">Të Ardhura Totale</p>
          <p className="text-4xl font-bold mb-1">{revenue} <span className="text-xl font-normal text-blue-200">€</span></p>
          <p className="text-blue-300 text-sm">{stats.orders} porosi gjithsej</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-blue-200 text-xs mb-0.5">Dorëzuar</p>
              <p className="text-white text-xl font-bold">{stats.statusCounts?.Delivered ?? 0}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-blue-200 text-xs mb-0.5">Anuluar</p>
              <p className="text-white text-xl font-bold">{stats.statusCounts?.Cancelled ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Statusi i Porosive</h3>
          <div className="space-y-3">
            {Object.entries(statusMeta).map(([key, meta]) => {
              const count = stats.statusCounts?.[key] ?? 0;
              const pct   = Math.round((count / totalOrdersForChart) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{meta.label}</span>
                    <span className="text-gray-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${meta.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Stok i Ulët
          </h3>
          {stats.lowStock?.length === 0
            ? <p className="text-gray-400 text-sm">Të gjitha librat kanë stok të mjaftueshëm.</p>
            : (
              <div className="space-y-2.5">
                {stats.lowStock.map(b => (
                  <div key={b.liber_id} className="flex items-center gap-3">
                    {b.foto_url
                      ? <img src={BACKEND + b.foto_url} alt={b.titulli} className="w-8 h-11 object-cover rounded shrink-0" />
                      : <div className="w-8 h-11 bg-gray-100 rounded flex items-center justify-center text-base shrink-0">📖</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{b.titulli}</p>
                      <p className={`text-xs font-semibold ${b.sasia_stok === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {b.sasia_stok === 0 ? 'Pa stok' : `${b.sasia_stok} mbetur`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Top categories + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top categories */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Kategoritë Kryesore</h3>
          {stats.topCats?.length === 0
            ? <p className="text-gray-400 text-sm">Nuk ka kategori ende.</p>
            : (
              <div className="space-y-3">
                {stats.topCats.map((c, i) => {
                  const maxCnt = stats.topCats[0]?.cnt || 1;
                  const pct = Math.round((c.cnt / maxCnt) * 100);
                  const colors = ['bg-blue-400','bg-purple-400','bg-green-400','bg-orange-400','bg-pink-400'];
                  return (
                    <div key={c.emri}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{c.emri}</span>
                        <span className="text-gray-400">{c.cnt} libra</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Porosite e Fundit</h3>
            <span className="text-xs text-gray-400">{stats.recent?.length} rekorde</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['ID','Klienti','Data','Shuma','Statusi'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!stats.recent?.length ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nuk ka porosi akoma</td></tr>
                ) : stats.recent.map(o => (
                  <tr key={o.porosi_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{o.porosi_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{o.klient_emri || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.data_porosise).toLocaleDateString('sq-AL')}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{Number(o.shuma_totale).toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(o.statusi)}`}>{o.statusi}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
