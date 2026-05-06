import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const blank = { emri: '', mbiemri: '', email: '', password: '' };

export default function Login() {
  const [isReg, setIsReg]   = useState(false);
  const [form, setForm]     = useState(blank);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(isReg ? '/auth/register' : '/auth/login', form);
      login(data.user, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Ndodhi një gabim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-gray-800">Bookstore Admin</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isReg ? 'Krijo llogari të re' : 'Hyr në panelin e administrimit'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isReg && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Emri</label>
                <input type="text" required value={form.emri} onChange={set('emri')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Mbiemri</label>
                <input type="text" required value={form.mbiemri} onChange={set('mbiemri')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Email</label>
            <input type="email" required value={form.email} onChange={set('email')}
              placeholder="admin@bookstore.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Fjalëkalimi</label>
            <input type="password" required value={form.password} onChange={set('password')}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors text-sm mt-2">
            {loading ? 'Duke u ngarkuar...' : (isReg ? 'Regjistrohu' : 'Hyr')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {isReg ? 'Ke tashmë llogari?' : 'Nuk ke llogari?'}{' '}
          <button onClick={() => { setIsReg(!isReg); setError(''); }}
            className="text-blue-600 font-semibold hover:underline">
            {isReg ? 'Hyr' : 'Regjistrohu'}
          </button>
        </div>

        {!isReg && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 text-center">
            Demo: <strong>admin@bookstore.com</strong> / <strong>admin123</strong>
          </div>
        )}
      </div>
    </div>
  );
}
