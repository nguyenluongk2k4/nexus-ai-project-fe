export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/api`;

/** 
 * Helper to build full API URL 
 * If path starts with /, it will be appended to base
 */
export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  return `/api${cleanPath}`;
};
