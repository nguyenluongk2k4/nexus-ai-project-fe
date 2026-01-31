/**
 * Dashboard Page
 * Responsive layout with real-time data from Timeline, Skill Tree, and Quiz modules
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { PageLoading } from '@/shared/components/PageLoading';
import { useDashboard } from '../hooks/useDashboard';
import {
  ContinueLearningCard,
  TodayScheduleCard,
  ProgressDonutCard,
  AIInsightsCard,
  QuickStatsCard,
  WeeklyActivityChart
} from '../components/DashboardCards';
import { Sparkles, Bell, Settings } from 'lucide-react';

export function Dashboard() {
  const { data, loading, error } = useDashboard();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) return <PageLoading />;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return null;

  const { continueResource, todayTimelineItems, stats, aiInsights, weeklyActivity } = data;
  const displayName = user?.fullName || user?.username || t('common.user');

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 min-h-screen overflow-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">

        {/* ============ HEADER ============ */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Greeting */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  {t('dashboard.greeting', { defaultValue: 'Chào' })} {displayName}! 👋
                </h1>
                <p className="text-sm text-slate-500">
                  {t('dashboard.subtitle', { defaultValue: 'Tiếp tục hành trình học tập của bạn' })}
                </p>
              </div>
            </div>

            {/* Streak Badge & Actions */}
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-xl">
                <span className="text-xl">🔥</span>
                <div>
                  <div className="text-lg font-bold text-orange-600">{stats.streak}</div>
                  <div className="text-[10px] text-orange-500 uppercase tracking-wider font-medium">
                    {t('dashboard.streak', { defaultValue: 'Streak' })}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2">
                <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-violet-600 hover:border-violet-200 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-violet-600 hover:border-violet-200 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ============ QUICK STATS (Mobile Only) ============ */}
        <div className="block lg:hidden mb-6">
          <QuickStatsCard
            streak={stats.streak}
            todayItems={stats.todayItems}
            completedToday={stats.completedToday}
            totalQuizzes={stats.totalQuizzes}
          />
        </div>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">

          {/* ============ MAIN COLUMN ============ */}
          <div className="space-y-6 order-2 lg:order-1">

            {/* Continue Learning Card */}
            <ContinueLearningCard
              resource={continueResource}
              onContinue={() => navigate('/my-skill-tree')}
            />

            {/* Today's Schedule */}
            <TodayScheduleCard
              items={todayTimelineItems}
              onViewAll={() => navigate('/timeline')}
            />

            {/* Weekly Activity Chart */}
            <WeeklyActivityChart data={weeklyActivity} />

          </div>

          {/* ============ SIDEBAR ============ */}
          <div className="space-y-6 order-1 lg:order-2">

            {/* Overall Progress - Hidden on mobile (shown in QuickStats) */}
            <div className="hidden lg:block">
              <ProgressDonutCard
                percentage={stats.overallProgress}
                totalNodes={stats.totalNodes}
                completedNodes={stats.completedNodes}
                treeName={stats.treeName}
              />
            </div>

            {/* AI Insights */}
            <AIInsightsCard
              weakTopics={aiInsights.weakTopics}
              recommendedFocus={aiInsights.recommendedFocus}
              nodeId={aiInsights.nodeId}
            />

            {/* Desktop Stats (alternative to QuickStats) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-bold text-slate-800">
                  {t('dashboard.quickStats', { defaultValue: 'Thống kê nhanh' })}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-violet-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-violet-600">{stats.todayItems}</div>
                  <div className="text-xs text-violet-500">Việc hôm nay</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-emerald-600">{stats.completedToday}</div>
                  <div className="text-xs text-emerald-500">Đã hoàn thành</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalNodes}</div>
                  <div className="text-xs text-blue-500">Kỹ năng</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.totalQuizzes}</div>
                  <div className="text-xs text-amber-500">Quiz đã làm</div>
                </div>
              </div>
            </div>

            {/* Mobile: Show Progress Donut */}
            <div className="block lg:hidden">
              <ProgressDonutCard
                percentage={stats.overallProgress}
                totalNodes={stats.totalNodes}
                completedNodes={stats.completedNodes}
                treeName={stats.treeName}
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
