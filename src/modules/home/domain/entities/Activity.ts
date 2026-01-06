export interface WeeklyActivity {
  day: string;
  hours: number;
}

export interface RecentActivity {
  action: string;
  detail: string;
  score?: string;
  time: string;
}
