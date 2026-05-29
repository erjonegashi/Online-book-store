import { Link } from 'react-router-dom';
import { Clock, MapPin, BookOpen, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

function getOpenStatus() {
  const now  = new Date();
  const day  = now.getDay();                              // 0=Sun … 6=Sat
  const mins = now.getHours() * 60 + now.getMinutes();

  if (day === 0) return { open: false, label: 'Closed today — Sunday' };

  if (day === 6) {
    const open = mins >= 9 * 60 && mins < 20 * 60;
    return { open, label: open ? 'Open now' : 'Closed' };
  }

  // Monday – Friday
  const open = mins >= 7 * 60 && mins < 23 * 60;
  return { open, label: open ? 'Open now' : 'Closed' };
}

const schedule = [
  { day: 'Monday – Friday', hours: '07:00 – 23:00', closed: false },
  { day: 'Saturday',        hours: '09:00 – 20:00', closed: false },
  { day: 'Sunday',          hours: 'Closed',         closed: true  },
];

export default function About() {
  const { open, label } = getOpenStatus();

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-5">
            UBTNexus — University Bookstore
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white leading-tight tracking-tight mb-4">
            About UBTNexus
          </h1>
          <p className="text-base text-blue-200 max-w-xl mx-auto leading-relaxed">
            UBTNexus is a digital university bookstore platform created for UBT students to explore, discover, and order books online in a modern and simple way.
          </p>
        </div>
      </section>

      {/* ── Our History ──────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Text */}
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Background</p>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Our History</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                UBTNexus started as a student project developed by Computer Science students at UBT University. The goal of the platform is to modernize the way students discover and manage academic and personal reading materials.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                The platform combines a bookstore system with modern web technologies, offering an easy experience for browsing books, managing orders, and exploring authors and categories.
              </p>
            </div>

            {/* Highlight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <BookOpen size={16} className="text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Digital First</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Browse and order books entirely online — no physical store required.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
                  <BookOpen size={16} className="text-indigo-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Student Project</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Built by CS students at UBT University as a capstone web platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Working Hours ─────────────────────────────── */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock size={14} className="text-blue-600" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Schedule</p>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Working Hours</h2>

          <div className="max-w-sm">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

              {/* Live status badge */}
              <div className={`flex items-center gap-2 px-5 py-3 border-b ${open ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                {open
                  ? <CheckCircle size={13} className="text-green-600 shrink-0" />
                  : <XCircle    size={13} className="text-red-500  shrink-0" />
                }
                <span className={`text-xs font-semibold ${open ? 'text-green-700' : 'text-red-600'}`}>
                  {label}
                </span>
              </div>

              {/* Schedule rows */}
              {schedule.map((row, i) => (
                <div key={row.day}
                  className={`flex items-center justify-between px-5 py-4 ${i < schedule.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm font-medium text-gray-700">{row.day}</span>
                  <span className={`text-sm font-semibold ${row.closed ? 'text-red-400' : 'text-gray-900'}`}>
                    {row.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── University Info ───────────────────────────── */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin size={14} className="text-blue-600" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Location</p>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">UBT University</h2>

          <div className="max-w-sm">
            {/* Clickable Google Maps card */}
            <a
              href="https://www.google.com/maps/search/UBT+Campus+Lipjan+Kosovo"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-gray-50 border border-gray-200 rounded-xl overflow-hidden
                         hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5
                         transition-all duration-200 cursor-pointer"
            >
              {/* Static map preview strip */}
              <div className="w-full h-28 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative overflow-hidden">
                {/* Decorative grid lines mimicking a map */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="mapgrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mapgrid)" />
                </svg>
                {/* Roads */}
                <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="56" x2="100%" y2="56" stroke="#93C5FD" strokeWidth="3"/>
                  <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#93C5FD" strokeWidth="2"/>
                  <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#BFDBFE" strokeWidth="1.5"/>
                  <line x1="0" y1="30" x2="100%" y2="30" stroke="#BFDBFE" strokeWidth="1.5"/>
                </svg>
                {/* Pin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 shadow-lg flex items-center justify-center ring-4 ring-white">
                      <MapPin size={15} className="text-white" />
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5 opacity-60" />
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-200" />
              </div>

              {/* Card body */}
              <div className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">UBT Campus – Lipjan</p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    Faculty of Computer Science &amp; Engineering
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Lipjan, Kosovo</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                    <ExternalLink size={10} />
                    Open in Google Maps
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="border-t border-gray-100 py-14 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to explore?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Browse our full collection of books available for UBT students.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/books"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Browse Books
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
