import { LearningGateway } from '../ports/LearningGateway';
import { LearningStats, LearningProgress, StudySession } from '../entities/LearningEntities';

export class LearningService {
  constructor(private gateway: LearningGateway) {}

  calculateStats(progressData: LearningProgress[], sessions: StudySession[]): LearningStats {
    const notStarted = progressData.filter(p => p.status === 'not_started').length;
    const inProgress = progressData.filter(p => p.status === 'in_progress').length;
    const completed = progressData.filter(p => p.status === 'completed').length;
    
    // Calculate total time
    const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.actualTimeSpent || 0), 0);
    
    // Calculate average rating
    const ratings = progressData.filter(p => p.rating !== undefined).map(p => p.rating!);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    // Calculate streak
    const studyDates = sessions
      .map(s => new Date(s.startTime).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    studyDates.forEach(dateStr => {
      const date = new Date(dateStr);
      if (!lastDate) {
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const diffDays = Math.floor(
          (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
          if (dateStr === new Date().toDateString() || diffDays === 1) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = date;
    });

    const lastStudyDate = studyDates.length > 0 ? new Date(studyDates[0]) : undefined;

    return {
      totalResources: progressData.length,
      notStarted,
      inProgress,
      completed,
      totalTimeSpent,
      averageRating,
      currentStreak,
      longestStreak,
      lastStudyDate
    };
  }

  async loadAllData() {
    const [progress, reminders, timeline, sessions, goals] = await Promise.all([
      this.gateway.loadProgress(),
      this.gateway.loadReminders(),
      this.gateway.loadTimeline(),
      this.gateway.loadSessions(),
      this.gateway.loadGoals(),
    ]);

    return { progress, reminders, timeline, sessions, goals };
  }
}
