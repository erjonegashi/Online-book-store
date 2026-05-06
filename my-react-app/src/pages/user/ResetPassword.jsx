import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import userApi from '../../api/userAxios';

function pwStrength(pw) {
  if (!pw) return null;
  if (pw.length < 6)  return { level: 0, label: 'Too short', color: 'bg-red-400' };
  if (pw.length < 8)  return { level: 1, label: 'Weak',      color: 'bg-orange-400' };
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw))
    return { level: 3, label: 'Strong', color: 'bg-green-500' };
  return { level: 2, label: 'Fair', color: 'bg-yellow-400' };
}

export default function ResetPassword() {
  const { token } = useParams();

  const [pw,       setPw]       = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [expired,  setExpired]  = useState(false);

  const strength = pwStrength(pw);
  const pwMatch  = confirm && pw === confirm;
  const pwMiss   = confirm && pw !== confirm;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (pw !== confirm) { setError('Passwords do not match.'); return; }
    if (pw.length < 6)  { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await userApi.post('/auth/reset-password', { token, password: pw });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data || {};
      if (data.expired || err.response?.status === 400) {
        setExpired(true);
        setError(data.error || 'This reset link has expired.');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full border border-blue-400/25">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            UBT University — BookStore Portal
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Success state */}
          {success && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
                ✓
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h1>
              <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                Your password has been successfully changed.
                You can now sign in with your new password.
              </p>
              <Link to="/login"
                className="w-full inline-block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors">
                Sign In Now →
              </Link>
            </div>
          )}

          {/* Expired state */}
          {!success && expired && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
                ⏰
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                Password reset links expire after <strong>1 hour</strong>.
                Please request a new one.
              </p>
              <Link to="/forgot-password"
                className="w-full inline-block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors mb-3">
                Request New Reset Link
              </Link>
              <Link to="/login"
                className="block text-center text-sm text-gray-500 hover:text-gray-700 font-medium">
                ← Back to Login
              </Link>
            </div>
          )}

          {/* Form state */}
          {!success && !expired && (
            <>
              <div className="text-center mb-7">
                <Link to="/" className="inline-block text-4xl mb-3">📖</Link>
                <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
                <p className="text-gray-500 text-sm mt-1.5">
                  Choose a strong password for your UBT BookStore account.
                </p>
              </div>

              {error && !expired && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'} required
                      value={pw}
                      onChange={e => { setPw(e.target.value); setError(''); }}
                      placeholder="Min. 6 characters"
                      className="w-full pl-4 pr-14 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          <div key={i}
                            className={`flex-1 rounded-full transition-all ${i < strength.level ? strength.color : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        strength.level === 3 ? 'text-green-600'  :
                        strength.level === 2 ? 'text-yellow-600' :
                        strength.level === 1 ? 'text-orange-500' : 'text-red-500'}`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'} required
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      className={`w-full pl-4 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        pwMiss ? 'border-red-400 focus:ring-red-400' :
                        pwMatch ? 'border-green-400 focus:ring-green-400' :
                        'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {confirm && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${pwMatch ? 'text-green-500' : 'text-red-400'}`}>
                        {pwMatch ? '✓' : '✕'}
                      </span>
                    )}
                  </div>
                  {pwMiss && (
                    <p className="mt-1.5 text-xs text-red-500">⚠ Passwords do not match</p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating password…
                    </span>
                  ) : 'Update Password'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-5">
                <Link to="/login" className="text-blue-600 hover:underline font-medium">← Back to Login</Link>
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
