import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Optionally, add interceptors if tokens are needed later
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/overview');
  return response.data;
};

export const getHeatmapLocations = async () => {
  const response = await api.get('/heatmap');
  return response.data;
};

export const getHeatmapDepartments = async () => {
  const response = await api.get('/dashboard/department-stats');
  return response.data;
};

export const getAnomalies = async (riskLevel) => {
  const params = riskLevel ? { risk: riskLevel } : {};
  const response = await api.get('/dashboard/recent-anomalies', { params });
  return response.data;
};

export default api;
