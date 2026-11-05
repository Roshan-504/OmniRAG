import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/ingest/pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const ingestUrl = async (url) => {
  const response = await api.post('/ingest/url', { url });
  return response.data;
};

export const getSources = async () => {
  const response = await api.get('/ingest/sources');
  return response.data;
};

export const deleteSource = async (id) => {
  const response = await api.delete(`/ingest/sources/${id}`);
  return response.data;
};

export const sendChatMessage = async (message, history = [], topK = 5) => {
  const response = await api.post('/chat/', {
    message,
    history,
    top_k: topK,
  });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export default api;

