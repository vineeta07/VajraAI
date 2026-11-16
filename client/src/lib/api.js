import axios from 'axios';

const root = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const API_BASE = `${root}/api`;
export const API_LABEL = root
  ? API_BASE
  : import.meta.env.DEV
    ? 'http://localhost:3000/api (via the dev proxy)'
    : `${window.location.origin}/api`;

export const api = axios.create({ baseURL: API_BASE, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && token !== 'local-preview') config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A web page coming back from an API path means the request never reached the
// API: the host served the app's own index.html instead.
api.interceptors.response.use((response) => {
  const type = String(response.headers?.['content-type'] || '');
  if (type.includes('text/html')) {
    const err = new Error('Received a web page instead of API data');
    err.code = 'NOT_API';
    throw err;
  }
  return response;
});

/**
 * Turn any request failure into something we can explain to a person.
 * kind: 'offline' | 'timeout' | 'server' | 'not_found' | 'unauthorized' | 'bad_request' | 'unknown'
 */
export function describeError(error) {
  if (!error) return null;
  const res = error.response;

  if (error.code === 'NOT_API') {
    return {
      kind: 'offline',
      title: 'The app isn’t pointed at an API server',
      detail: `Requests to ${API_LABEL} are answered by the website itself, not by the API. The front end was built without the API server’s address.`,
      tech: 'VITE_API_URL is missing or wrong in the front-end build',
    };
  }

  if (!res) {
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
      return {
        kind: 'timeout',
        title: 'The server took too long to answer',
        detail:
          `No reply came back from ${API_LABEL} within a minute. Free hosting tiers put idle servers to sleep, and waking one can take longer than that; try again shortly.`,
        tech: error.message,
      };
    }
    return {
      kind: 'offline',
      title: 'The API server can’t be reached',
      detail: `Nothing answered at ${API_LABEL}. Either the server isn’t running, or this browser is blocked from reaching it (network or CORS).`,
      tech: error.message,
    };
  }

  const body = res.data;
  const message = body && typeof body === 'object' ? body.error || body.message : null;

  // A 5xx with no JSON body is what a proxy returns when the upstream is down.
  const emptyBody = body == null || body === '';
  if (res.status >= 502 || (res.status === 500 && emptyBody)) {
    return {
      kind: 'offline',
      title: 'The API server can’t be reached',
      detail: `The request to ${API_LABEL} was refused, which means nothing is listening there.`,
      tech: `HTTP ${res.status}`,
    };
  }
  if (res.status >= 500) {
    return {
      kind: 'server',
      title: 'The server hit an error',
      detail:
        'The API is running but failed while handling this request. Most often the database isn’t connected or its tables haven’t been created.',
      tech: `HTTP ${res.status}${message ? ` — ${message}` : ''}${body?.detail ? ` (${body.detail})` : ''}`,
    };
  }
  if (res.status === 404) {
    return { kind: 'not_found', title: 'Not found', detail: message || 'This record doesn’t exist.', tech: 'HTTP 404' };
  }
  if (res.status === 401 || res.status === 403) {
    return {
      kind: 'unauthorized',
      title: 'Not authorised',
      detail: message || 'Your session isn’t allowed to do this.',
      tech: `HTTP ${res.status}`,
    };
  }
  return {
    kind: 'bad_request',
    title: 'The request was rejected',
    detail: message || 'The server refused this request.',
    tech: `HTTP ${res.status}`,
  };
}

const get = (url, params) => api.get(url, { params }).then((r) => r.data);

export const fetchStatus = () => get('/status');
export const fetchOverview = () => get('/dashboard/overview');
export const fetchRiskDistribution = () => get('/dashboard/risk-distribution');
export const fetchTopVendors = () => get('/dashboard/top-vendors');
export const fetchRecentAnomalies = () => get('/dashboard/recent-anomalies');
export const fetchDepartmentStats = () => get('/dashboard/department-stats');
export const fetchByLocation = (risk) => get('/heatmap/location', risk ? { risk } : undefined);
export const fetchByDate = () => get('/heatmap/time');
export const fetchAnomalies = (params) => get('/anomalies', params);
export const fetchAnomaly = (id) => get(`/anomalies/${id}`);
export const fetchVendors = () => get('/vendors');
export const fetchVendor = (id) => get(`/vendors/${encodeURIComponent(id)}`);

export const uploadTransactions = (rows) => api.post('/upload', rows, { timeout: 120000 }).then((r) => r.data);
export const runAnalysis = () => api.post('/analyze', null, { timeout: 180000 }).then((r) => r.data);
export const loginRequest = (body) => api.post('/auth/login', body).then((r) => r.data);
export const registerRequest = (body) => api.post('/auth/register', body).then((r) => r.data);
