const BASE = process.env.REACT_APP_BACKEND_API || '';

export const ApiFetch = (path, options = {}) => {
  const token = localStorage.getItem('token');

  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};
