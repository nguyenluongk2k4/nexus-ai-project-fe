/**
 * API Configuration
 * Centralized config for all API endpoints
 */

// Environment configuration
const envApiUrl = import.meta.env.VITE_API_URL;
const envWsUrl = import.meta.env.VITE_WS_URL;

/**
 * Formats a URL with the correct protocol (http/https or ws/wss) 
 * and ensures it's absolute for WebSocket constructors.
 */
/**
 * Formats a URL with the correct protocol (http/https or ws/wss) 
 * and ensures it's absolute for WebSocket constructors.
 * Also handles protocol downgrading for local dev if needed.
 */
const formatUrl = (url: string, isWs: boolean): string => {
  if (typeof window === 'undefined') return url;

  const isHttps = window.location.protocol === 'https:';
  let formatted = url || '';

  // 1. If relative (starts with /), make absolute using current host
  if (formatted.startsWith('/')) {
    formatted = `${window.location.host}${formatted}`;
  }

  // 2. Prepend protocol if missing
  if (formatted && !formatted.includes('://')) {
    const protocol = isWs 
      ? (isHttps ? 'wss:' : 'ws:') 
      : (isHttps ? 'https:' : 'http:');
    formatted = `${protocol}//${formatted.replace(/^\/+/, '')}`;
  }

  // 3. Force protocol to match window environment
  if (formatted.includes('://')) {
    if (isWs) {
      if (isHttps && formatted.startsWith('ws://')) formatted = formatted.replace('ws://', 'wss://');
      if (!isHttps && formatted.startsWith('wss://')) formatted = formatted.replace('wss://', 'ws://');
    } else {
      if (isHttps && formatted.startsWith('http://')) formatted = formatted.replace('http://', 'https://');
      if (!isHttps && formatted.startsWith('https://')) formatted = formatted.replace('https://', 'http://');
    }
  }

  return formatted;
};

// Helper to determine Base URL
const getBaseUrl = () => {
  let url = envApiUrl || '/api';
  
  // CRITICAL: If they point to localhost:8000 but forget /api, we MUST add it
  // because the backend serves all logic under /api
  if (url.includes('localhost:8000') && !url.includes('/api')) {
    url = url.replace(/\/+$/, '') + '/api';
  }
  
  return formatUrl(url, false);
};

// Helper to determine WS URL
const getWsBaseUrl = () => {
  const url = envWsUrl || '/api';
  return formatUrl(url, true);
};

export const apiConfig = {
  baseUrl: getBaseUrl(),
  wsUrl: getWsBaseUrl(),
  
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      me: '/auth/me',
    },
    chat: {
      ws: '/chat/ws',
      message: '/chat/message',
      sessions: '/chat/sessions',
      sessionMessages: (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
      sessionDelete: (sessionId: string) => `/chat/sessions/${sessionId}`,
    },
    admin: {
      templates: {
        list: '/admin/templates',
        create: '/admin/templates',
        get: (id: string) => `/admin/templates/${id}`,
        delete: (id: string) => `/admin/templates/${id}`,
        nodes: (templateId: string) => `/admin/templates/${templateId}/nodes`,
      },
      nodes: {
        create: '/admin/nodes',
        get: (id: string) => `/admin/nodes/${id}`,
        update: (id: string) => `/admin/nodes/${id}`,
        delete: (id: string) => `/admin/nodes/${id}`,
        children: (id: string) => `/admin/nodes/${id}/children`,
        resources: (nodeId: string) => `/admin/nodes/${nodeId}/resources`,
      },
      resources: {
        create: '/admin/resources',
        delete: (id: string) => `/admin/resources/${id}`,
      },
      sync: {
        rebuild: '/admin/sync/rebuild',
      },
    },
    skillTree: {
      nodeResources: (nodeId: string) => `/skill-tree/nodes/${nodeId}/resources`,
      nodeChildren: (nodeId: string) => `/skill-tree/nodes/${nodeId}/children`,
      resourceProgress: (resourceId: string) => `/skill-tree/resources/${resourceId}/progress`,
      treeBySession: (sessionId: string) => `/skill-tree/session/${sessionId}`,
      generate: '/skill-tree/generate',
      nodeAlternatives: (nodeId: string) => `/skill-tree/nodes/${encodeURIComponent(nodeId)}/alternatives`,
      swapNode: (sessionId: string) => `/skill-tree/session/${sessionId}/swap`,
      myTree: '/skill-tree/my-tree',
      saveToMyTree: '/skill-tree/my-tree/save',
      removeFromMyTree: (nodeId: string) => `/skill-tree/my-tree/nodes/${nodeId}`,
    },
    learning: {
      progress: '/learning/progress',
      timeline: '/learning/timeline',
    },
    forum: {
      categories: '/forum/categories',
      threads: '/forum/threads',
      posts: '/forum/posts',
      upload: '/upload',
    },
    jobs: {
      recommendations: '/jobs/recommendations',
      applications: '/jobs/applications',
    },
  },
  
  getWsUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If base already has the path, return as is (for full path envs)
    if (this.wsUrl.includes(cleanPath)) {
      return this.wsUrl;
    }
    return `${this.wsUrl.replace(/\/+$/, '')}${cleanPath}`;
  },
  
  getHttpUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If base already has the path, return as is
    if (this.baseUrl.includes(cleanPath)) {
      return this.baseUrl;
    }
    return `${this.baseUrl.replace(/\/+$/, '')}${cleanPath}`;
  }
};


