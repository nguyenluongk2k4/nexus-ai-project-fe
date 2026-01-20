/**
 * API Configuration
 * Centralized config for all API endpoints
 */

const host = window.location.hostname || 'localhost';
const port = 8000;

export const apiConfig = {
  // Base URLs
  baseUrl: `http://${host}:${port}/api`,
  wsUrl: `ws://${host}:${port}/api`,
  
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
    return `${this.wsUrl}${path}`;
  },
  
  getHttpUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
};
