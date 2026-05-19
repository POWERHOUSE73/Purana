const API_URL = import.meta.env.VITE_API_URL || '/api';

export function getSession() {
  try {
    const raw = localStorage.getItem('purana-session');
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    localStorage.removeItem('purana-session');
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem('purana-session', JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem('purana-session');
}

async function request(path, options = {}) {
  const session = getSession();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('purana-session-expired'));
      }
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  products: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  recommendations: (limit = 6) => request(`/products/recommendations/mine?limit=${limit}`),
  sellerProducts: () => request('/products/mine'),
  createProduct: (formData) => request('/products', { method: 'POST', body: formData }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  orders: () => request('/orders/mine'),
  placeOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  checkout: (payload) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};
