import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Email is required.');

    setLoading(true);
    try {
      await api.post('/admin/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check the server console</h2>
          <p className="text-sm text-gray-500 mb-2">
            If <span className="font-medium text-gray-700">{email}</span> is registered, a reset
            link has been printed to the backend console.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            The link expires in <span className="font-semibold">15 minutes</span>.
          </p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

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
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your admin email and we&apos;ll generate a reset link
            </p>
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
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@bookstore.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Remembered it?{' '}
            <Link to="/admin/login" className="text-blue-600 font-semibold hover:underline">
              Back to login
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
