import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${BASE}/api` });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue        = [];

const flush = (err, token) => {
  queue.forEach(({ resolve, reject }) => err ? reject(err) : resolve(token));
  queue = [];
};

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config;

    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;

      const rt = localStorage.getItem('refresh_token');
      if (!rt) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then(token => { orig.headers.Authorization = `Bearer ${token}`; return api(orig); })
          .catch(e => Promise.reject(e));
      }

      isRefreshing = true;

      try {
        const res = await fetch(`${BASE}/api/admin/auth/refresh`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ refresh_token: rt }),
        });

        if (!res.ok) throw new Error('Refresh failed');

        const { token } = await res.json();
        localStorage.setItem('token', token);
        orig.headers.Authorization = `Bearer ${token}`;
        flush(null, token);
        return api(orig);
      } catch (e) {
        flush(e, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
