import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import userApi from '../../api/userAxios';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending,  setResending]  = useState(false);
  const [resendMsg,  setResendMsg]  = useState('');

  useEffect(() => {
    userApi.get(`/auth/verify/${token}`)
      .then(({ data }) => { setStatus('success'); setMessage(data.message); })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may be invalid.');
      });
  }, [token]);

  const handleResend = async e => {
    e.preventDefault();
    setResending(true); setResendMsg('');
    try {
      const { data } = await userApi.post('/auth/resend-verification', { email: resendEmail });
      setResendMsg(data.message);
    } catch (err) {
      setResendMsg(err.response?.data?.error || 'Failed to resend. Please try again.');
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Loading */}
        {status === 'loading' && (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900">Verifying your email…</h2>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment.</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h1>
            <p className="text-gray-500 text-sm mb-2">{message}</p>
            <p className="text-gray-400 text-xs mb-8">
              Your UBT BookStore account is now fully activated.
            </p>

            <Link to="/login"
              className="w-full inline-block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm">
              Sign In to Your Account →
            </Link>

            <div className="mt-5 p-3.5 bg-green-50 border border-green-100 rounded-xl text-left">
              <p className="text-xs text-green-700 leading-relaxed">
                <strong>✅ What's next?</strong><br/>
                Log in with your <strong>@ubt-uni.net</strong> email and start browsing
                thousands of books in our catalog.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-2xl p-10">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
                ✕
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
              <p className="text-xs text-orange-700 leading-relaxed">
                <strong>⚠ This link may have already been used</strong> or belongs to
                a different session. Request a new verification email below.
              </p>
            </div>

            {/* Resend form */}
            <form onSubmit={handleResend} className="space-y-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Resend Verification Email
              </label>
              <input
                type="email" required
                value={resendEmail}
                onChange={e => setResendEmail(e.target.value)}
                placeholder="student@ubt-uni.net"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {resendMsg && (
                <p className={`text-xs font-medium ${resendMsg.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
                  {resendMsg}
                </p>
              )}
              <button type="submit" disabled={resending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors">
                {resending ? 'Sending…' : 'Send New Verification Email'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-5">
              <Link to="/login" className="text-blue-600 hover:underline font-medium">← Back to Login</Link>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-blue-300/50 mt-4">
          <Link to="/" className="hover:text-blue-300">← BookStore Home</Link>
        </p>
      </div>
    </div>
  );
}
