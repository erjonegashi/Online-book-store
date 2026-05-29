import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import userApi from '../api/userAxios';

const TYPE_DOT = {
  info:    'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-400',
  error:   'bg-red-500',
};

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('sq-AL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationBell() {
  const [items,   setItems]   = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);
  const ref = useRef(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await userApi.get('/user/notifications');
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [fetch]);

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unread = items.filter(n => !n.lexuar).length;

  const markRead = async (id) => {
    if (items.find(n => n.njoftime_id === id)?.lexuar) return;
    try {
      await userApi.patch(`/user/notifications/${id}/read`);
      setItems(prev => prev.map(n => n.njoftime_id === id ? { ...n, lexuar: 1 } : n));
    } catch { /* non-critical */ }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors"
        aria-label="Njoftimet"
      >
        <Bell size={18} strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Njoftimet</span>
            {unread > 0 && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                {unread} të palexuara
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading && items.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">Duke ngarkuar...</div>
            ) : error ? (
              <div className="py-8 text-center text-sm text-red-400">Gabim në lidhje</div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">Nuk ka njoftime</div>
            ) : (
              items.map(n => (
                <button
                  key={n.njoftime_id}
                  onClick={() => markRead(n.njoftime_id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${n.lexuar ? 'opacity-60' : ''}`}
                >
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[n.lloji] || 'bg-gray-400'}`} />
                  <div className="min-w-0">
                    <p className={`text-sm leading-snug ${n.lexuar ? 'text-gray-500 font-normal' : 'text-gray-800 font-semibold'}`}>
                      {n.titulli}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.mesazhi}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{fmt(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
//notification bell component
