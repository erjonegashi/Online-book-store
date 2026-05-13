import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { AlertTriangle, ShieldCheck, Check, X } from 'lucide-react';

function pwStrength(pw) {
  if (!pw) return null;
  if (pw.length < 6) return { level: 0, label: 'Too short', color: 'bg-red-400' };
  if (pw.length < 8)  return { level: 1, label: 'Weak',     color: 'bg-orange-400' };
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { level: 3, label: 'Strong', color: 'bg-green-500' };
  return { level: 2, label: 'Fair', color: 'bg-yellow-400' };
}

export default function AdminRegister() {
  const [form, setForm] = useState({ emri: '', mbiemri: '', email: '', password: '', confirmPassword: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const strength = pwStrength(form.password);
  const pwMatch  = form.confirmPassword && form.password === form.confirmPassword;
  const pwMiss   = form.confirmPassword && form.password !== form.confirmPassword;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const { data } = await api.post('/admin/auth/register', payload);
      login(data.user, data.token);
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (err.response?.status === 409) {
        setError('An admin account with this email already exists.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 text-xs font-semibold px-4 py-2 rounded-full border border-amber-400/25 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Admin Panel — UBTNexus
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Admin Account</h1>
            <p className="text-gray-500 text-sm mt-1">Register as a UBTNexus administrator</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">First Name *</label>
                <input type="text" required value={form.emri} onChange={set('emri')}
                  placeholder="Name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name *</label>
                <input type="text" required value={form.mbiemri} onChange={set('mbiemri')}
                  placeholder="Last Name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address *</label>
              <input type="email" required value={form.email} onChange={set('email')}
                placeholder="admin@gmail.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <p className="mt-1.5 text-xs text-gray-400">Any valid email provider (Gmail, Outlook, Yahoo, etc.)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="w-full pl-4 pr-14 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 select-none">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1 mb-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-all ${i < strength.level ? strength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.level === 3 ? 'text-green-600' : strength.level === 2 ? 'text-yellow-600' : strength.level === 1 ? 'text-orange-500' : 'text-red-500'}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Repeat password"
                  className={`w-full pl-4 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    pwMiss ? 'border-red-400 focus:ring-red-400' : pwMatch ? 'border-green-400 focus:ring-green-400' : 'border-gray-300 focus:ring-blue-500'
                  }`} />
                {form.confirmPassword && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${pwMatch ? 'text-green-500' : 'text-red-400'}`}>
                    {pwMatch ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
                  </span>
                )}
              </div>
              {pwMiss && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />Passwords do not match</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors shadow-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <ShieldCheck size={15} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Admin access:</strong> Admin accounts have full access to the UBTNexus
              management dashboard including orders, products, users, and reports.
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/admin/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400/60 mt-4">
          <Link to="/login" className="hover:text-slate-300 transition-colors">← Student Portal</Link>
        </p>
      </div>
    </div>
  );
}
