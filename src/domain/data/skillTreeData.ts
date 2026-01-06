import aiMachineLearningData from '../data/ai_and_machine_learning.json';
import cloudComputingData from '../data/cloud_computing.json';
import cyberSecurityData from '../data/cyber_security.json';
import dataScienceBigDataData from '../data/data_science_and_big_data.json';
import softwareEngineerData from '../data/software_engineer.json';

export interface SpecializationData {
  id: string;
  name: string;
  type: string;
  fileName: string;
  icon: string;
  color: string;
}

export const SPECIALIZATIONS: SpecializationData[] = [
  {
    id: 'ai_ml',
    name: 'AI & Machine Learning',
    type: 'specialization',
    fileName: 'ai_and_machine_learning.json',
    icon: '🤖',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    type: 'specialization',
    fileName: 'cloud_computing.json',
    icon: '☁️',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'security',
    name: 'Cyber Security',
    type: 'specialization',
    fileName: 'cyber_security.json',
    icon: '🔒',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'data_science',
    name: 'Data Science & Big Data',
    type: 'specialization',
    fileName: 'data_science_and_big_data.json',
    icon: '📊',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'software_eng',
    name: 'Software Engineering',
    type: 'specialization',
    fileName: 'software_engineer.json',
    icon: '💻',
    color: 'from-indigo-500 to-violet-500'
  }
];

export const SPECIALIZATION_DATA_MAP: Record<string, any> = {
  'ai_ml': aiMachineLearningData,
  'cloud': cloudComputingData,
  'security': cyberSecurityData,
  'data_science': dataScienceBigDataData,
  'software_eng': softwareEngineerData
};
