import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
