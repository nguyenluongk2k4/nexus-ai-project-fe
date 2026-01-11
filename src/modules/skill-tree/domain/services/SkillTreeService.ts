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
}
