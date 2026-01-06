import { JobGateway } from '../../domain/ports/JobGateway';
import { Job } from '../../domain/entities/Job';
import { SuggestedSkill } from '../../domain/entities/SuggestedSkill';

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Machine Learning Engineer',
    company: 'TechCorp AI',
    location: 'San Francisco, CA',
    salary: '$140k - $180k',
    match: 87,
    requiredSkills: ['Python', 'ML Fundamentals', 'Data Analysis', 'Algorithms'],
    missingSkills: ['Deep Learning', 'MLOps']
  },
  {
    id: '2',
    title: 'Data Scientist',
    company: 'DataFlow Inc',
    location: 'Remote',
    salary: '$120k - $160k',
    match: 82,
    requiredSkills: ['Python', 'Data Analysis', 'ML Fundamentals'],
    missingSkills: ['NLP', 'Cloud Architecture']
  },
  {
    id: '3',
    title: 'AI Research Scientist',
    company: 'Innovation Labs',
    location: 'Boston, MA',
    salary: '$160k - $220k',
    match: 65,
    requiredSkills: ['Algorithms', 'ML Fundamentals'],
    missingSkills: ['Deep Learning', 'NLP', 'AI Research']
  },
  {
    id: '4',
    title: 'Backend Engineer',
    company: 'CloudScale',
    location: 'Austin, TX',
    salary: '$130k - $170k',
    match: 78,
    requiredSkills: ['Python', 'Algorithms', 'System Design'],
    missingSkills: ['Cloud Architecture', 'MLOps']
  },
  {
    id: '5',
    title: 'Analytics Engineer',
    company: 'DataViz Solutions',
    location: 'New York, NY',
    salary: '$110k - $150k',
    match: 91,
    requiredSkills: ['Python', 'Data Analysis', 'Algorithms'],
    missingSkills: ['Data Viz']
  },
];

const mockSuggestedSkills: SuggestedSkill[] = [
  { name: 'Deep Learning', impact: 'High', jobs: 12 },
  { name: 'Cloud Architecture', impact: 'High', jobs: 18 },
  { name: 'MLOps', impact: 'Medium', jobs: 8 },
  { name: 'NLP', impact: 'Medium', jobs: 10 },
  { name: 'Data Visualization', impact: 'Low', jobs: 6 },
];

export class MockJobGateway implements JobGateway {
  async getJobs(): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockJobs;
  }

  async getSuggestedSkills(): Promise<SuggestedSkill[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSuggestedSkills;
  }
}
