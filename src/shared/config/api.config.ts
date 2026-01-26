/**
 * API Configuration
 * Centralized config for all API endpoints
 */

// Environment configuration
const envApiUrl = import.meta.env.VITE_API_URL;
const envWsUrl = import.meta.env.VITE_WS_URL;

// Helper to join paths and handle overlaps generically
const joinUrl = (base: string, path: string): string => {
  if (!path) return base;
  if (!base) return path;

  // Clean slashes
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');

  const baseParts = cleanBase.split('/');
  const pathParts = cleanPath.split('/');

  // Find maximum overlap (e.g., base ends with /chat and path starts with /chat)
  let overlapCount = 0;
  const maxOverlap = Math.min(baseParts.length, pathParts.length);
  
  for (let i = 1; i <= maxOverlap; i++) {
    const baseTail = baseParts.slice(-i).join('/');
    const pathHead = pathParts.slice(0, i).join('/');
    if (baseTail === pathHead) {
      overlapCount = i;
    }
  }

  const mergedPath = pathParts.slice(overlapCount).join('/');
  return mergedPath ? `${cleanBase}/${mergedPath}` : cleanBase;
};

// Helper to determine Base URL
const getBaseUrl = () => {
  // If we have an override from env
  if (envApiUrl) {
    let url = envApiUrl;
    // CRITICAL for Mixed Content: If env URL is absolute, ensure it matches current protocol
    if (typeof window !== 'undefined' && url.startsWith('http:')) {
      if (window.location.protocol === 'https:') {
         url = url.replace('http:', 'https:');
      }
    }
    return url.endsWith('/api') ? url : joinUrl(url, '/api');
  }

  // DEFAULT: If on production, use relative path to avoid protocol issues
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api';
  }

  return '/api';
};

// Helper to determine WS URL
const getWsBaseUrl = () => {
  if (envWsUrl) {
    let url = envWsUrl;
    // Match protocol
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      url = url.replace('ws:', 'wss:');
    }
    return url;
  }
  
  // Default to current host with upgrading protocol
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api`;
  }
  return '/api';
};

export const apiConfig = {
  // Base URLs
  baseUrl: getBaseUrl(),
  wsUrl: getWsBaseUrl(),
  
  // All API Endpoints
  endpoints: {
    // Auth Module
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

    // Skill Tree Module
    skillTree: {
      nodeResources: (nodeId: string) => `/skill-tree/nodes/${nodeId}/resources`,
      nodeChildren: (nodeId: string) => `/skill-tree/nodes/${nodeId}/children`,
      resourceProgress: (resourceId: string) => `/skill-tree/resources/${resourceId}/progress`,
      treeBySession: (sessionId: string) => `/skill-tree/session/${sessionId}`,
      generate: '/skill-tree/generate',
      nodeAlternatives: (nodeId: string) => `/skill-tree/nodes/${encodeURIComponent(nodeId)}/alternatives`,
      swapNode: (sessionId: string) => `/skill-tree/session/${sessionId}/swap`,
      // My Skill Tree (User's saved tree)
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
      upload: '/upload', // Explicit upload endpoint
    },
    
    // Jobs Module (placeholders for future)
    jobs: {
      recommendations: '/jobs/recommendations',
      applications: '/jobs/applications',
    },
  },
  
  // Generic builders
  getWsUrl(path: string): string {
    return joinUrl(this.wsUrl, path);
  },
  
  getHttpUrl(path: string): string {
    return joinUrl(this.baseUrl, path);
  }
};
