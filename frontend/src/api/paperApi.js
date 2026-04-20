import axios from 'axios';

const API_URL = import.meta.env.PROD ? 'https://research-annotation-platform.onrender.com' : 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const getPapers = () => api.get('/papers');
export const uploadPaper = (formData) => api.post('/papers/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getAnnotations = (paperId) => api.get(`/papers/${paperId}/annotations`);
export const createAnnotation = (annotation) => api.post('/annotations', annotation);
export const searchAnnotations = (query) => api.get(`/search?q=${query}`);

export const getCollections = () => api.get('/collections');
export const createCollection = (data) => api.post('/collections', data);
export const addPaperToCollection = (collectionId, paperId) => api.post(`/collections/${collectionId}/papers`, { paperId });
export const deletePaper = (id) => api.delete(`/papers/${id}`);

export default api;
