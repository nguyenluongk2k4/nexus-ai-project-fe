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
  // CRITICAL FIX: If running on production domain (not localhost), ALWAYS use relative path
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }

  let url = envApiUrl || '/api';

  // CRITICAL: If they point to localhost:8000 but forget /api, we MUST add it
  if (url.includes('localhost:8000') && !url.includes('/api')) {
    url = url.replace(/\/+$/, '') + '/api';
  }

  return formatUrl(url, false);
};

// Helper to determine WS URL
const getWsBaseUrl = () => {
  if (typeof window === 'undefined') return envWsUrl || '/api';

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  if (envWsUrl) {
    // If it's already a full URL, use as is
    if (envWsUrl.startsWith('ws://') || envWsUrl.startsWith('wss://')) {
      return envWsUrl;
    }
    // If it's just a host/path, add protocol
    return `${protocol}//${envWsUrl}`;
  }

  // Derive from getBaseUrl() to guarantee the exact same host and prefix (e.g. /api)
  const apiBase = getBaseUrl();

  if (apiBase.startsWith('/')) {
    // It's a relative path on production (like "/api")
    return `${protocol}//${window.location.host}${apiBase}`;
  }

  // It's an absolute path (like "http://localhost:8000/api")
  if (apiBase.startsWith('http')) {
    return apiBase.replace(/^http/, 'ws');
  }

  // Fallback
  return `${protocol}//${window.location.host}/api`;
};

export const apiConfig = {
  baseUrl: getBaseUrl(),
  wsUrl: getWsBaseUrl(),

  // All API Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      me: '/auth/me',
    },

    // Chat Module
    chat: {
      ws: '/chat/ws',
      message: '/chat/message',
      sessions: '/chat/sessions',
      session: (sessionId: string) => `/chat/session/${sessionId}`,
      sessionProgress: (sessionId: string) => `/chat/session/${sessionId}/progress`,
      sessionProgressStream: (sessionId: string) => `/chat/session/${sessionId}/progress-stream`,
      sessionMessages: (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
      sessionDelete: (sessionId: string) => `/chat/sessions/${sessionId}`,
    },

    // Admin Module - Templates
    admin: {
      templates: {
        list: '/admin/templates',
        create: '/admin/templates',
        get: (id: string) => `/admin/templates/${id}`,
        delete: (id: string) => `/admin/templates/${id}`,
        nodes: (templateId: string) => `/admin/templates/${templateId}/nodes`,
      },

      // Nodes
      nodes: {
        create: '/admin/nodes',
        get: (id: string) => `/admin/nodes/${id}`,
        update: (id: string) => `/admin/nodes/${id}`,
        delete: (id: string) => `/admin/nodes/${id}`,
        children: (id: string) => `/admin/nodes/${id}/children`,
        resources: (nodeId: string) => `/admin/nodes/${nodeId}/resources`,
      },

      // Resources
      resources: {
        create: '/admin/resources',
        delete: (id: string) => `/admin/resources/${id}`,
      },

      // Sync
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

    // Learning Module (placeholders for future)
    learning: {
      progress: '/learning/progress',
      timeline: '/learning/timeline',
    },

    // Forum Module (placeholders for future)
    forum: {
      categories: '/forum/categories',
      threads: '/forum/threads',
      posts: '/forum/posts',
      upload: '/upload',
    },

    // Jobs Module (placeholders for future)
    jobs: {
      recommendations: '/jobs/recommendations',
      applications: '/jobs/applications',
    },
  },

  // Helper methods
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



