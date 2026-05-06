import { useState } from 'react';
import { Link } from 'react-router-dom';
import userApi from '../../api/userAxios';
import Toast from '../../components/Toast';

const UBT = '@ubt-uni.net';
const isUBT = email => email.toLowerCase().endsWith(UBT);

export default function ForgotPassword() {
  const [email,    setEmail]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState(null);

  const emailOk  = email && isUBT(email);
  const emailBad = email && !isUBT(email);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!isUBT(email)) {
      setError(`Only UBT university emails are allowed (${UBT})`);
      return;
    }

    setLoading(true);
    try {
      await userApi.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (err.response?.status === 403) {
        setError(`Only UBT university emails are allowed (${UBT})`);
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <div className="w-full max-w-md">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full border border-blue-400/25">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            UBT University — BookStore Portal
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Email sent state */}
          {sent ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-gray-500 text-sm mb-2">
                We sent a password reset link to:
              </p>
              <p className="text-blue-600 font-semibold text-sm mb-6">{email}</p>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>📧 Check your Outlook inbox</strong> and click the
                  "Reset My Password" button in the email.
                  The link expires in <strong>1 hour</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition-colors">
                  Try a different email
                </button>
                <Link to="/login"
                  className="block text-center text-sm text-blue-600 font-semibold hover:underline pt-1">
                  ← Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <Link to="/" className="inline-block text-4xl mb-3">📖</Link>
                <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                  Enter your <strong>@ubt-uni.net</strong> email and we'll send
                  you a password reset link.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    UBT Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email" required
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder={`student${UBT}`}
                      className={`w-full pl-4 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        error
                          ? 'border-red-400 bg-red-50 focus:ring-red-400'
                          : emailOk
                            ? 'border-green-400 focus:ring-green-400'
                            : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {email && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${emailOk ? 'text-green-500' : 'text-red-400'}`}>
                        {emailOk ? '✓' : '✕'}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Must end with <span className="font-semibold text-gray-500">{UBT}</span>
                  </p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending reset link…
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remembered your password?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-blue-300/50 mt-4">
          <Link to="/" className="hover:text-blue-300">← BookStore Home</Link>
        </p>
      </div>
    </div>
  );
}
