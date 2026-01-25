/**
 * API Configuration
 * Centralized config for all API endpoints
 */

// Environment configuration
const envApiUrl = import.meta.env.VITE_API_URL;
const envWsUrl = import.meta.env.VITE_WS_URL;

// Helper to determine Base URL
const getBaseUrl = () => {
  if (envApiUrl) {
    // Ensure it ends with /api if provided
    return envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`;
  }
  // Default to relative path for Nginx proxy
  return '/api';
};

// Helper to determine WS URL
const getWsBaseUrl = () => {
  if (envWsUrl) return envWsUrl;
  
  // Default to current host with upgrading protocol
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api`;
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
    },
    
    // Jobs Module (placeholders for future)
    jobs: {
      recommendations: '/jobs/recommendations',
      applications: '/jobs/applications',
    },
  },
  
  // Helper methods
  getWsUrl(path: string): string {
    // Prevent double path if env var already includes it (common config error)
    if (this.wsUrl.endsWith(path)) {
      return this.wsUrl;
    }
    return `${this.wsUrl}${path}`;
  },
  
  getHttpUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
};
