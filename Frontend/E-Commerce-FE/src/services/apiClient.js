export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-blackn-white-backend1-pvc2rn3sb-jameel3654s-projects.vercel.app/api';

export class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export const getAuthToken = () => {
  const saved = JSON.parse(localStorage.getItem('auth') || 'null');
  return saved?.token || null;
};

export const request = async (path, options = {}) => {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiRequestError(data.message || 'Request failed', response.status);
  }

  return data;
};
