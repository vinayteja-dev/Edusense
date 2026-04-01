import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const login = (username, password, role) =>
  api.post('/login', { username, password, role });

export const uploadData = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload-data', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const trainModels = (columnMap) =>
  api.post('/train', { column_map: columnMap });

export const getTrainingStatus = () =>
  api.get('/training-status');

export const getModelStats = () =>
  api.get('/model-stats');

export const predictCombined = (features) =>
  api.post('/predict/combined', features);

export const getStudent = (rollNo) =>
  api.get(`/student/${rollNo}`);

export const listStudents = () =>
  api.get('/students');

export const healthCheck = () =>
  api.get('/health');

export default api;
