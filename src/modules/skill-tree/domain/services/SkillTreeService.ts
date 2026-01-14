import { SPECIALIZATIONS, SPECIALIZATION_DATA_MAP } from '@/domain/data/skillTreeData';

/**
 * SkillTree Service - Domain layer
 * Handles skill tree data fetching and processing
 */
export class SkillTreeService {
  async getSpecializations() {
    return SPECIALIZATIONS;
  }

  async getSpecializationData(id: string) {
    const data = SPECIALIZATION_DATA_MAP[id];
    if (!data || data.length === 0) {
      throw new Error('Không tìm thấy dữ liệu chuyên ngành');
    }
    return data[0];
  }

  async getNodeResources(nodeId: string) {
    // Lazy load: import HttpClient here if circular dependency issues, 
    // or just assume HttpClient is safe.
    // We'll use a direct fetch or the shared client if accessible.
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    try {
      // Use configured API_URL or relative path
      const res = await fetch(`http://localhost:8000/api/skill-tree/nodes/${nodeId}/resources`, {
        headers
      });
      
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch resources", e);
      return [];
    }
  }
}
