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
import { DotLottiePlayer } from '@dotlottie/react-player';

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
    <div className="flex-1 bg-white min-h-screen overflow-auto">
      <div className="mx-auto p-4 md:p-6 lg:p-8" id="tour-welcome">
        {/* ============ QUICK STATS (Mobile Only) ============ */}
        <div className="block lg:hidden mb-6" id="tour-stats">
          <QuickStatsCard
            streak={stats.streak}
            todayItems={stats.todayItems}
            completedToday={stats.completedToday}
            totalQuizzes={stats.totalQuizzes}
          />
        </div>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ============ MAIN COLUMN ============ */}
          <div className="space-y-6 lg:col-span-8 order-2 lg:order-1">
            {/* ... ContinueLearningCard, TodayScheduleCard, WeeklyActivityChart ... */}
            <div id="tour-continue">
              <ContinueLearningCard
                resource={continueResource}
                onContinue={() => navigate('/my-skills')}
              />
            </div>
            <TodayScheduleCard
              items={todayTimelineItems}
              onViewAll={() => navigate('/timeline')}
            />
            <WeeklyActivityChart data={weeklyActivity} />
          </div>

          {/* ============ SIDEBAR ============ */}
          <div className="space-y-6 lg:col-span-4 order-1 lg:order-2">
            {/* ... Sidebar contents ... */}
            <div className="hidden lg:block">
              <ProgressDonutCard
                percentage={stats.overallProgress}
                totalNodes={stats.totalNodes}
                completedNodes={stats.completedNodes}
                treeName={stats.treeName}
              />
            </div>
            <div id="tour-ai-insights">
              <AIInsightsCard
                weakTopics={aiInsights.weakTopics}
                recommendedFocus={aiInsights.recommendedFocus}
                nodeId={aiInsights.nodeId}
              />
            </div>
            <div id="tour-stats-desktop" className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
              <div className="flex items-center ml-3 mb-2 mt-4">
                <div className="w-14 h-14 ml-2 mr-2 flex items-center justify-center overflow-hidden">
                  <DotLottiePlayer
                    key="/assets/dashboard/quiz.lottie"
                    src="/assets/dashboard/quiz.lottie"
                    autoplay
                    loop
                    style={{ width: '100px', height: '100px' }}
                  />
                </div>
                <h3 className="font-bold text-slate-800 -ml-2">
                  {t('dashboard.quickStats', { defaultValue: 'Thống kê nhanh' })}
                </h3>
              </div>
              <div className="px-6 pb-6 grid grid-cols-2 gap-4">
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
