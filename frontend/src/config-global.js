import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: 'VajraAI',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL || '',
  assetsDir: import.meta.env.VITE_ASSETS_DIR || '',
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: '/dashboard',
    loginPath: '/auth/jwt/login',
  },
  mapbox: {
    apiKey: import.meta.env.VITE_MAPBOX_API_KEY || '',
  },
};
