import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Too short', color: 'bg-red-500' },
    { label: 'Weak',      color: 'bg-red-400' },
    { label: 'Fair',      color: 'bg-yellow-400' },
    { label: 'Good',      color: 'bg-blue-400' },
    { label: 'Strong',    color: 'bg-green-500' },
  ];

  const level = levels[Math.min(score, levels.length - 1)];

  return (
    <div className="mt-1 space-y-1">
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

function PasswordField({ id, label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const navigate   = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  const [show, setShow] = useState({
    currentPassword: false,
    newPassword:     false,
    confirmPassword: false,
  });

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  const handleChange = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword)
      return 'All fields are required.';
    if (form.newPassword.length < 6)
      return 'New password must be at least 6 characters.';
    if (form.newPassword !== form.confirmPassword)
      return 'New passwords do not match.';
    if (form.newPassword === form.currentPassword)
      return 'New password must be different from your current password.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      await api.put('/admin/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });

      setSuccess('Password changed successfully. Redirecting to login…');
      setTimeout(() => {
        logout();
        navigate('/admin/login', { replace: true });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Change Password</h1>
            <p className="text-sm text-gray-500">Update your admin account password</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            value={form.currentPassword}
            onChange={handleChange('currentPassword')}
            show={show.currentPassword}
            onToggle={() => toggle('currentPassword')}
            placeholder="Enter your current password"
          />

          <div>
            <PasswordField
              id="newPassword"
              label="New Password"
              value={form.newPassword}
              onChange={handleChange('newPassword')}
              show={show.newPassword}
              onToggle={() => toggle('newPassword')}
              placeholder="At least 6 characters"
            />
            <PasswordStrength password={form.newPassword} />
          </div>

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            show={show.confirmPassword}
            onToggle={() => toggle('confirmPassword')}
            placeholder="Repeat new password"
          />

          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-xs text-red-500 -mt-2">Passwords do not match.</p>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg text-sm transition-colors"
          >
            {loading ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
