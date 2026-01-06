import { useMemo } from 'react';
import { Award, TrendingUp, Target, Brain, Trophy, Zap, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLearningProgress } from '@/modules/skill-tree/ui/contexts/LearningProgressContext';

export function LearningInsights() {
  const { stats, progressData, studySessions, timelineItems, getOverdueItems } = useLearningProgress();

  // Calculate weekly study data from sessions
  const weeklyData = useMemo(() => {
    const weeks: { [key: string]: { hours: number, sessions: number } } = {};
    const now = new Date();
    
    studySessions.forEach(session => {
      if (!session.endTime || !session.duration) return;
      
      const weekAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000); // 6 weeks
      if (session.startTime < weekAgo) return;
      
      const weekNumber = Math.floor(
        (now.getTime() - session.startTime.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      const weekLabel = `${6 - weekNumber} tuần trước`;
      
      if (!weeks[weekLabel]) {
        weeks[weekLabel] = { hours: 0, sessions: 0 };
      }
      weeks[weekLabel].hours += session.duration / 60;
      weeks[weekLabel].sessions += 1;
    });
    
    return Object.entries(weeks)
      .map(([week, data]) => ({
        week,
        hours: Math.round(data.hours * 10) / 10,
        sessions: data.sessions
      }))
      .reverse();
  }, [studySessions]);

  // Calculate specialization distribution
  const specializationData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    Array.from(progressData.values()).forEach(progress => {
      const spec = progress.specializationName || 'Khác';
      counts[spec] = (counts[spec] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [progressData]);

  // Calculate progress distribution
  const progressDistribution = [
    { name: 'Chưa học', value: stats.notStarted, color: '#9ca3af' },
    { name: 'Đang học', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Học xong', value: stats.completed, color: '#10b981' },
  ];

  // Achievements/Badges
  const badges = [
    { 
      name: 'Week Streak', 
      description: `${stats.currentStreak} ngày liên tục`, 
      icon: Zap, 
      color: 'from-yellow-400 to-orange-500', 
      earned: stats.currentStreak >= 7 
    },
    { 
      name: 'Dedicated Learner', 
      description: `${stats.completed} tài liệu hoàn thành`, 
      icon: Trophy, 
      color: 'from-violet-400 to-purple-500', 
      earned: stats.completed >= 10 
    },
    { 
      name: 'Quick Learner', 
      description: 'Hoàn thành nhiều tài liệu', 
      icon: Brain, 
      color: 'from-teal-400 to-cyan-500', 
      earned: stats.completed >= 5 
    },
    { 
      name: 'Night Owl', 
      description: 'Học sau nửa đêm', 
      icon: Target, 
      color: 'from-blue-400 to-indigo-500', 
      earned: false // Can implement this with session time checking
    },
    { 
      name: 'Quality Focused', 
      description: `Đánh giá TB: ${stats.averageRating.toFixed(1)}/5`, 
      icon: Award, 
      color: 'from-pink-400 to-rose-500', 
      earned: stats.averageRating >= 4 
    },
    { 
      name: 'Marathon Runner', 
      description: `${Math.round(stats.totalTimeSpent / 60)} giờ học`, 
      icon: TrendingUp, 
      color: 'from-green-400 to-emerald-500', 
      earned: stats.totalTimeSpent >= 3000 // 50 hours
    },
  ];

  const overdueCount = getOverdueItems().length;
  const completionRate = stats.totalResources > 0 
    ? Math.round((stats.completed / stats.totalResources) * 100) 
    : 0;
  return (
    <div className="flex-1 bg-gradient-to-br from-white via-violet-50/20 to-teal-50/20 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Learning Insights</h1>
          <p className="text-muted-foreground">Track your progress and analyze your performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-3xl font-bold text-foreground">{stats.totalResources}</span>
            </div>
            <h3 className="text-sm text-muted-foreground">Tổng tài liệu</h3>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">{stats.completed}</span>
            </div>
            <h3 className="text-sm text-muted-foreground">Hoàn thành ({completionRate}%)</h3>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-3xl font-bold text-amber-600">{Math.round(stats.totalTimeSpent / 60)}h</span>
            </div>
            <h3 className="text-sm text-muted-foreground">Thời gian học</h3>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">{stats.currentStreak}</span>
            </div>
            <h3 className="text-sm text-muted-foreground">Chuỗi ngày học</h3>
          </div>
        </div>

        {/* AI Insight Banner */}
        {stats.totalResources > 0 && (
          <div className="bg-gradient-to-r from-violet-600 to-teal-500 rounded-xl p-6 text-white mb-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="mb-2">Phân Tích Tiến Độ Học Tập</h3>
                <p className="text-white/90 mb-4">
                  Bạn đã hoàn thành {stats.completed}/{stats.totalResources} tài liệu ({completionRate}%).
                  {stats.currentStreak >= 7 && ' Xuất sắc! Bạn đang duy trì chuỗi học tập ổn định.'}
                  {stats.inProgress > 0 && ` Hiện có ${stats.inProgress} tài liệu đang học, hãy tiếp tục cố gắng!`}
                  {overdueCount > 0 && ` Lưu ý: Bạn có ${overdueCount} mục đã quá hạn.`}
                </p>
                {stats.inProgress > 0 && (
                  <button 
                    onClick={() => window.location.href = '#timeline'}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    Xem lịch học
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Progress Distribution */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-foreground mb-1">Phân Bố Tiến Độ</h3>
                <p className="text-muted-foreground">Trạng thái tài liệu học tập</p>
              </div>
              <Target className="w-5 h-5 text-violet-600" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={progressDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {progressDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Specialization Distribution */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-foreground mb-1">Phân Bố Chuyên Ngành</h3>
                <p className="text-muted-foreground">Tài liệu theo lĩnh vực</p>
              </div>
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            {specializationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={specializationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#71717a" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Study Time Analysis */}
        {weeklyData.length > 0 && (
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-foreground mb-1">Phân Bố Thời Gian Học</h3>
                <p className="text-muted-foreground">Thời gian học theo tuần (6 tuần gần nhất)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', r: 5 }}
                  name="Giờ học"
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  name="Số phiên"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Achievement Badges */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-violet-600" />
            <h3 className="text-foreground">Achievements</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border-2 transition-all ${
                    badge.earned 
                      ? 'border-violet-200 bg-gradient-to-br from-violet-50 to-teal-50' 
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${badge.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-foreground mb-1">{badge.name}</h4>
                  <p className="text-muted-foreground">{badge.description}</p>
                  {badge.earned && (
                    <div className="mt-2 flex items-center gap-1 text-teal-600">
                      <Award className="w-4 h-4" />
                      <span>Earned</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
