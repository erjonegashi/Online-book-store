import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import userApi from '../../api/userAxios';
import { AlertTriangle, GraduationCap, Check, X } from 'lucide-react';

const UBT   = '@ubt-uni.net';
const isUBT = email => email.toLowerCase().endsWith(UBT);

function pwStrength(pw) {
  if (!pw) return null;
  if (pw.length < 6) return { level: 0, label: 'Too short', color: 'bg-red-400' };
  if (pw.length < 8)  return { level: 1, label: 'Weak',     color: 'bg-orange-400' };
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { level: 3, label: 'Strong', color: 'bg-green-500' };
  return { level: 2, label: 'Fair', color: 'bg-yellow-400' };
}

export default function Register() {
  const [form, setForm] = useState({
    emri: '', mbiemri: '', email: '', password: '', confirmPassword: '',
    telefoni: '', adresa: '', qyteti: '', kodi_postar: '',
  });
  const [error,      setError]      = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [showPw,     setShowPw]     = useState(false);

  const { login }  = useUserAuth();
  const navigate   = useNavigate();

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (k === 'email') setEmailError('');
    setError('');
  };

  const handleEmailBlur = () => {
    if (form.email && !isUBT(form.email))
      setEmailError(`Only UBT university emails allowed (${UBT})`);
  };

  const strength = pwStrength(form.password);
  const pwMatch  = form.confirmPassword && form.password === form.confirmPassword;
  const pwMiss   = form.confirmPassword && form.password !== form.confirmPassword;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!isUBT(form.email)) {
      setEmailError(`Only UBT university emails are allowed (${UBT})`);
      return;
    }
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
      const { data } = await userApi.post('/auth/register', payload);
      // Auto-login immediately — no email verification required
      login(data.user, data.token, data.refreshToken);
      navigate('/', { replace: true });
    } catch (err) {
      const msg    = err.response?.data?.error || '';
      const status = err.response?.status;
      if (status === 409) {
        setError('An account with this email already exists.');
      } else if (status === 403) {
        setEmailError(`Only UBT university emails are allowed (${UBT})`);
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const emailOk = form.email && isUBT(form.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">

        {/* UBT badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full border border-blue-400/25">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            UBT University — UBTNexus
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join using your UBT university email</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">First Name *</label>
                <input type="text" required value={form.emri} onChange={set('emri')}
                  placeholder="Name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name *</label>
                <input type="text" required value={form.mbiemri} onChange={set('mbiemri')}
                  placeholder="Last Name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* UBT Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                UBT Email *
              </label>
              <div className="relative">
                <input
                  type="email" required
                  value={form.email} onChange={set('email')} onBlur={handleEmailBlur}
                  placeholder={`student${UBT}`}
                  className={`w-full pl-4 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? 'border-red-400 bg-red-50 focus:ring-red-400'
                      : emailOk
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {form.email && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${emailOk ? 'text-green-500' : 'text-red-400'}`}>
                    {emailOk ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
                  </span>
                )}
              </div>
              {emailError ? (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={11} />{emailError}</p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-400">
                  Must end with <span className="font-semibold text-gray-500">{UBT}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="w-full pl-4 pr-14 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Repeat password"
                  className={`w-full pl-4 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    pwMiss ? 'border-red-400 focus:ring-red-400' : pwMatch ? 'border-green-400 focus:ring-green-400' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {form.confirmPassword && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${pwMatch ? 'text-green-500' : 'text-red-400'}`}>
                    {pwMatch ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
                  </span>
                )}
              </div>
              {pwMiss && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={11} />Passwords do not match</p>}
            </div>

            {/* Optional address */}
            <details className="group">
              <summary className="text-xs font-semibold text-blue-600 cursor-pointer list-none flex items-center gap-1 hover:text-blue-700 select-none">
                <span className="group-open:rotate-90 transition-transform inline-block mr-0.5">▶</span>
                Add contact details (optional)
              </summary>
              <div className="mt-3 space-y-3 pl-1">
                <input type="tel" value={form.telefoni} onChange={set('telefoni')}
                  placeholder="Phone"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" value={form.adresa} onChange={set('adresa')}
                  placeholder="Address"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={form.qyteti} onChange={set('qyteti')}
                    placeholder="City"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={form.kodi_postar} onChange={set('kodi_postar')}
                    placeholder="Postal Code"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </details>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create UBT Account'}
            </button>
          </form>

          {/* UBT notice */}
          <div className="mt-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <GraduationCap size={15} className="shrink-0 text-blue-500 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              This portal is exclusively for <strong>UBT University</strong> students and staff.
              Only <strong>{UBT}</strong> emails are accepted.
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
//register component

