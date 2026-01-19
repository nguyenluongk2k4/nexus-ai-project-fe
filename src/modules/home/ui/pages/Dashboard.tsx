import { MetricCard } from '@/shared/components/MetricCard';
import { Clock, Award, Target, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '@/modules/auth/AuthProvider';

export function Dashboard() {
  const { data, loading, error } = useDashboard();
  const { user } = useAuth();

  if (loading) return <div className="p-8">Đang tải dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return null;

  const { metrics, weeklyActivity, skillProgress, recentActivity } = data;

  // Get display name
  const displayName = user?.fullName || user?.username || 'bạn';

  return (
    <div className="flex-1 bg-white p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Chào mừng trở lại, {displayName}</h1>
          <p className="text-muted-foreground">Track your learning progress and continue your journey</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric: any, idx: number) => (
            <MetricCard
              key={idx}
              title={metric.title}
              value={metric.value}
              icon={idx === 0 ? Clock : idx === 1 ? Award : Target}
              subtitle={metric.subtitle}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-foreground mb-1">Weekly Activity</h3>
                <p className="text-muted-foreground">Hours spent learning</p>
              </div>
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#71717a" />
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
                  stroke="url(#colorGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Progress */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-foreground mb-1">Skill Progress</h3>
                <p className="text-muted-foreground">Current skill levels</p>
              </div>
              <Award className="w-5 h-5 text-violet-600" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={skillProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#71717a" />
                <YAxis type="category" dataKey="skill" stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="progress" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-foreground">{item.action}</p>
                  <p className="text-muted-foreground">{item.detail}</p>
                </div>
                <div className="text-right">
                  {item.score && (
                    <p className="text-teal-600 mb-1">{item.score}</p>
                  )}
                  <p className="text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
