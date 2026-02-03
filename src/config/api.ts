export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const getWsProtocol = () => window.location.protocol === 'https:' ? 'wss:' : 'ws:';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || `${getWsProtocol()}//${window.location.host}/api/chat/ws`;

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
