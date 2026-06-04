import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const userApi = axios.create({
  baseURL:         `${BASE}/api`,
  withCredentials: true,
});

userApi.interceptors.request.use(config => {
  const token = localStorage.getItem('user_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue        = [];

const flush = (err, token) => {
  queue.forEach(({ resolve, reject }) => err ? reject(err) : resolve(token));
  queue = [];
};

userApi.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config;

    const isAuthRoute = orig.url?.includes('/auth/login') ||
                        orig.url?.includes('/auth/register') ||
                        orig.url?.includes('/auth/refresh');

    if (err.response?.status === 401 && !orig._retry && !isAuthRoute) {
      orig._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then(token => { orig.headers.Authorization = `Bearer ${token}`; return userApi(orig); })
          .catch(e => Promise.reject(e));
      }

      isRefreshing = true;

      try {
        // cookie user_rt dërgohet automatikisht nga browser (withCredentials)
        const res = await fetch(`${BASE}/api/auth/refresh`, {
          method:      'POST',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Refresh failed');

        const { token } = await res.json();
        localStorage.setItem('user_token', token);
        orig.headers.Authorization = `Bearer ${token}`;
        flush(null, token);
        return userApi(orig);
      } catch (e) {
        flush(e, null);
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default userApi;
