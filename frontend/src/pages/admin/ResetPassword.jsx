import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { Eye, EyeOff, Lock, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';

function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6)          score++;
  if (password.length >= 10)         score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Too short', color: 'bg-red-500'    },
    { label: 'Weak',      color: 'bg-red-400'    },
    { label: 'Fair',      color: 'bg-yellow-400' },
    { label: 'Good',      color: 'bg-blue-400'   },
    { label: 'Strong',    color: 'bg-green-500'  },
  ];
  const level = levels[Math.min(score, levels.length - 1)];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {levels.map((l, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? level.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">{level.label}</p>
    </div>
  );
}

export default function ResetPassword() {
  const navigate                  = useNavigate();
  const [searchParams]            = useSearchParams();
  const token                     = searchParams.get('token');

  const [form,    setForm]    = useState({ newPassword: '', confirmPassword: '' });
  const [show,    setShow]    = useState({ newPassword: false, confirmPassword: false });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set   = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError(''); };
  const toggle = (field)        => setShow(s => ({ ...s, [field]: !s[field] }));

  // ── Missing token ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-sm text-gray-500 mb-6">
            This reset link is missing a token. Please request a new one.
          </p>
          <Link
            to="/admin/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
          <p className="text-sm text-gray-500 mb-6">{success}</p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.newPassword || !form.confirmPassword)
      return setError('All fields are required.');
    if (form.newPassword.length < 6)
      return setError('Password must be at least 6 characters.');
    if (form.newPassword !== form.confirmPassword)
      return setError('Passwords do not match.');

    console.log('[ResetPassword] token:', token);

    setLoading(true);
    try {
      const { data } = await api.put('/admin/auth/reset-password', {
        token,
        newPassword: form.newPassword,
      });
      setSuccess(data.message);
      setTimeout(() => navigate('/admin/login', { replace: true }), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 text-xs font-semibold px-4 py-2 rounded-full border border-amber-400/25 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            Admin Panel — UBTNexus
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
            <p className="text-gray-500 text-sm mt-1">Choose a strong password for your admin account</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <input
                  type={show.newPassword ? 'text' : 'password'}
                  required
                  value={form.newPassword}
                  onChange={set('newPassword')}
                  placeholder="Min. 6 characters"
                  className="w-full pl-4 pr-14 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => toggle('newPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 select-none"
                  tabIndex={-1}
                >
                  {show.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.newPassword} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={show.confirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Repeat new password"
                  className="w-full pl-4 pr-14 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => toggle('confirmPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 select-none"
                  tabIndex={-1}
                >
                  {show.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            <Link
              to="/admin/forgot-password"
              className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Request a new link
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400/60 mt-4">
          <Link to="/login" className="hover:text-slate-300 transition-colors">
            ← Student Portal
          </Link>
        </p>
      </div>
    </div>
  );
}
