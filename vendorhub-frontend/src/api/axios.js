import axios from 'axios';

const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );
  return instance;
};

export const authApi        = createInstance('http://localhost:8081');
export const productApi     = createInstance('http://localhost:8082');
export const orderApi       = createInstance('http://localhost:8083');
export const notificationApi = createInstance('http://localhost:8084');

export default authApi;