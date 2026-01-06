export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  requiredSkills: string[];
  missingSkills: string[];
}
