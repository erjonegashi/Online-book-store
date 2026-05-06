import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import userApi from '../../api/userAxios';
import Toast from '../../components/Toast';

const UBT = '@ubt-uni.net';
const isUBT = email => email.toLowerCase().endsWith(UBT);

// Shown when the account exists but email is not yet verified
function UnverifiedAccount({ email, onBack }) {
  const [resending, setResending] = useState(false);
  const [msg,       setMsg]       = useState('');
  const [msgType,   setMsgType]   = useState('');

  const handleResend = async () => {
    setResending(true); setMsg('');
    try {
      const { data } = await userApi.post('/auth/resend-verification', { email });
      setMsg(data.message);
      setMsgType('success');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to resend. Please try again.');
      setMsgType('error');
    } finally { setResending(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">
        📧
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Email Not Verified</h2>
      <p className="text-gray-500 text-sm mb-1 leading-relaxed">
        Your account (<strong className="text-gray-700">{email}</strong>) hasn't
        been verified yet.
      </p>
      <p className="text-gray-400 text-xs mb-6">
        Check your Outlook inbox for the verification email we sent when you registered.
      </p>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${
          msgType === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="space-y-3">
        <button onClick={handleResend} disabled={resending}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors">
          {resending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Sending…
            </span>
          ) : 'Resend Verification Email'}
        </button>
        <button onClick={onBack}
          className="w-full py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition-colors">
          ← Back to Login
        </button>
      </div>

      <div className="mt-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-left">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>📬 Can't find the email?</strong> Check your Spam or Junk folder.
          Verification emails are sent from your configured SMTP sender.
        </p>
      </div>
    </div>
  );
}

export default function UserLogin() {
  const [form,       setForm]       = useState({ email: '', password: '' });
  const [error,      setError]      = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [toast,      setToast]      = useState(null);
  const [showPw,     setShowPw]     = useState(false);
  const [unverified, setUnverified] = useState(null);

  const { login }  = useUserAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from = location.state?.from || '/';

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (k === 'email') setEmailError('');
    setError('');
  };

  const handleEmailBlur = () => {
    if (form.email && !isUBT(form.email))
      setEmailError(`Only UBT university emails are allowed (${UBT})`);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!isUBT(form.email)) {
      setEmailError(`Only UBT university emails are allowed (${UBT})`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await userApi.post('/auth/login', form);
      login(data.user, data.token);
      setToast({
        message: `Welcome back, ${data.user.emri}! Logged in with your UBT account.`,
        type: 'success',
      });
      setTimeout(() => navigate(from, { replace: true }), 1800);
    } catch (err) {
      const status = err.response?.status;
      const data   = err.response?.data || {};

      if (data.needsVerification) {
        setUnverified({ email: form.email });
      } else if (status === 401) {
        setError('Incorrect email or password. Please check your UBT credentials.');
      } else if (status === 403) {
        setEmailError(`Only UBT university emails are allowed (${UBT})`);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } finally { setLoading(false); }
  };

  const emailOk  = form.email && isUBT(form.email);

  // Show unverified account UI
  if (unverified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
        <div className="w-full max-w-md">
          <UnverifiedAccount email={unverified.email} onBack={() => setUnverified(null)} />
          <p className="text-center text-xs text-blue-300/50 mt-4">
            Admin access?{' '}
            <Link to="/admin/login" className="hover:text-blue-300 underline">Admin panel →</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <div className="w-full max-w-md">

        {/* UBT badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full border border-blue-400/25 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            UBT University — BookStore Portal
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block text-4xl mb-3">📖</Link>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in with your UBT university account</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                UBT Email
              </label>
              <div className="relative">
                <input
                  type="email" required
                  value={form.email} onChange={set('email')} onBlur={handleEmailBlur}
                  placeholder={`student${UBT}`}
                  className={`w-full pl-4 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? 'border-red-400 bg-red-50 focus:ring-red-400'
                      : emailOk
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-gray-300 focus:ring-blue-500'}`}
                />
                {form.email && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${emailOk ? 'text-green-500' : 'text-red-400'}`}>
                    {emailOk ? '✓' : '✕'}
                  </span>
                )}
              </div>
              {emailError ? (
                <p className="mt-1.5 text-xs text-red-500">⚠ {emailError}</p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-400">
                  Must end with <span className="font-semibold text-gray-500">{UBT}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password} onChange={set('password')}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-14 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 select-none">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In with UBT Account'}
            </button>
          </form>

          {/* UBT notice */}
          <div className="mt-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <span className="shrink-0 text-blue-500 text-sm mt-0.5">🎓</span>
            <p className="text-xs text-blue-700 leading-relaxed">
              This portal is exclusively for <strong>UBT University</strong> students and staff.
              Only <strong>{UBT}</strong> emails are accepted.
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
          </p>
        </div>

        <p className="text-center text-xs text-blue-300/50 mt-4">
          Admin access?{' '}
          <Link to="/admin/login" className="hover:text-blue-300 underline">Admin panel →</Link>
        </p>
      </div>
    </div>
  );
}
