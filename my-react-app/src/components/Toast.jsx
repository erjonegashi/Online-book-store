import { useEffect, useState } from 'react';

const CONFIGS = {
  success: { bg: 'bg-emerald-600', border: 'border-emerald-500', icon: '✓', label: 'Success' },
  error:   { bg: 'bg-red-600',     border: 'border-red-500',     icon: '!', label: 'Error'   },
  info:    { bg: 'bg-blue-600',    border: 'border-blue-500',    icon: 'i', label: 'Info'    },
};

export default function Toast({ message, type = 'success', duration = 3500, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10);
    const t2 = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration, onDone]);

  const dismiss = () => { setVisible(false); setTimeout(onDone, 300); };
  const c = CONFIGS[type] || CONFIGS.success;

  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-start gap-3 ${c.bg} border ${c.border} text-white
      px-5 py-4 rounded-2xl shadow-2xl max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto
      transition-all duration-300 ease-out pointer-events-auto
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>

      <div className="shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
        {c.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">{c.label}</p>
        <p className="text-white/85 text-xs mt-0.5 leading-relaxed">{message}</p>
      </div>

      <button onClick={dismiss}
        className="shrink-0 text-white/60 hover:text-white text-xl leading-none transition-colors mt-0.5">
        ×
      </button>
    </div>
  );
}
