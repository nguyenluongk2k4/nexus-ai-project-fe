import { SPECIALIZATIONS, SPECIALIZATION_DATA_MAP } from '@/domain/data/skillTreeData';
import { SkillTreeGateway } from '../ports/SkillTreeGateway';

/**
 * SkillTree Service - Domain layer
 * Handles skill tree data fetching and processing
 */
export class SkillTreeService {
  constructor(private gateway: SkillTreeGateway) {}

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
    return this.gateway.getNodeResources(nodeId);
  }

  async updateResourceStatus(resourceId: string, status: 'not_started' | 'in_progress' | 'completed') {
    return this.gateway.updateResourceStatus(resourceId, status);
  }

  async getTreeBySession(sessionId: string) {
    return this.gateway.getTreeBySession(sessionId);
  }
}
