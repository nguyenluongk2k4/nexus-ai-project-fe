/**
 * Dashboard Card Components
 * Responsive cards for the main dashboard
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DotLottiePlayer } from '@dotlottie/react-player';
import {
    Play,
    Clock,
    CheckCircle2,
    Circle,
    ChevronRight,
    BookOpen,
    Brain,
    TrendingUp,
    Target,
    Zap,
    AlertTriangle,
    Calendar
} from 'lucide-react';
import type { TimelineItem } from '@/modules/skill-tree/domain/types/learning';

// ============ Continue Learning Card ============
interface ContinueLearningCardProps {
    resource: {
        id: string;
        name: string;
        nodeName?: string;
        progress?: number;
        type?: string;
    } | null;
    onContinue?: () => void;
}

export function ContinueLearningCard({ resource, onContinue }: ContinueLearningCardProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!resource) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center -ml-3 mb-2">
                    <div className="w-24 h-24 ml-2 flex items-center justify-center overflow-hidden">
                        <DotLottiePlayer
                            src="/assets/dashboard/Book.lottie"
                            autoplay
                            loop
                            style={{ width: '100px', height: '100px' }}
                        />
                    </div>
                    <h3 className="font-bold text-slate-800 -ml-2">
                        {t('dashboard.continueLearning', { defaultValue: 'Tiếp tục học' })}
                    </h3>
                </div>
                <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Target className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">
                        {t('dashboard.noResourceInProgress', { defaultValue: 'Chưa có bài học nào đang học' })}
                    </p>
                    <button
                        onClick={() => navigate('/my-skill-tree')}
                        className="mt-4 text-violet-600 text-sm font-medium hover:underline"
                    >
                        {t('dashboard.exploreCourses', { defaultValue: 'Khám phá Skill Tree →' })}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white" />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                        <div>
                            <p className="text-violet-200 text-xs font-medium uppercase tracking-wider">
                                {t('dashboard.continueLearning', { defaultValue: 'Tiếp tục học' })}
                            </p>
                        </div>
                    </div>
                    {resource.type && (
                        <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                            {resource.type}
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-xl mb-1 line-clamp-2">{resource.name}</h3>
                {resource.nodeName && (
                    <p className="text-violet-200 text-sm mb-4">{resource.nodeName}</p>
                )}

                {resource.progress !== undefined && (
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-violet-200">Tiến độ</span>
                            <span className="font-bold">{resource.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${resource.progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={onContinue || (() => navigate('/my-skill-tree'))}
                    className="w-full py-3 bg-white text-violet-600 rounded-xl font-bold hover:bg-violet-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Play className="w-4 h-4 fill-current" />
                    {t('dashboard.continueNow', { defaultValue: 'Học tiếp ngay' })}
                </button>
            </div>
        </div>
    );
}

// ============ Today Schedule Card ============
interface TodayScheduleCardProps {
    items: TimelineItem[];
    onViewAll?: () => void;
}

export function TodayScheduleCard({ items, onViewAll }: TodayScheduleCardProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const sortedItems = [...items].sort((a, b) =>
        (a.scheduledTime || '').localeCompare(b.scheduledTime || '')
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'in_progress':
                return <Circle className="w-4 h-4 text-violet-500 fill-current" />;
            default:
                return <Circle className="w-4 h-4 text-slate-300" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500';
            case 'medium':
                return 'border-l-amber-500';
            default:
                return 'border-l-slate-300';
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center -ml-2">
                    <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
                        <DotLottiePlayer
                            src="/assets/dashboard/Calendar.lottie"
                            autoplay
                            loop
                            style={{ width: '100px', height: '100px' }}
                        />
                    </div>
                    <div className="-ml-2">
                        <h3 className="font-bold text-slate-800">
                            {t('dashboard.todaySchedule', { defaultValue: 'Lịch hôm nay' })}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
                <span className="px-2 mr-5 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                    {items.length} việc
                </span>
            </div>

            {sortedItems.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">
                        {t('dashboard.noScheduleToday', { defaultValue: 'Không có lịch học hôm nay' })}
                    </p>
                    <button
                        onClick={() => navigate('/timeline')}
                        className="mt-2 text-violet-600 text-sm font-medium hover:underline"
                    >
                        {t('dashboard.planSchedule', { defaultValue: 'Lên lịch học →' })}
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                        {sortedItems.slice(0, 5).map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 bg-slate-50 hover:bg-slate-100 transition-colors ${getPriorityColor(item.priority)}`}
                            >
                                {getStatusIcon(item.status)}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm truncate ${item.status === 'completed' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                        {item.resourceName}
                                    </p>
                                    <p className="text-xs text-slate-500">{item.nodeName}</p>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400 text-xs">
                                    <Clock className="w-3 h-3" />
                                    {item.scheduledTime || '08:00'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {items.length > 5 && (
                        <p className="text-center text-xs text-slate-400 mt-2">
                            +{items.length - 5} việc khác
                        </p>
                    )}

                    <button
                        onClick={onViewAll || (() => navigate('/timeline'))}
                        className="w-full mt-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                    >
                        {t('dashboard.viewFullSchedule', { defaultValue: 'Xem lịch đầy đủ' })}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
    );
}

// ============ Progress Donut Card ============
interface ProgressDonutCardProps {
    percentage: number;
    totalNodes: number;
    completedNodes: number;
    treeName?: string;
}

export function ProgressDonutCard({ percentage, totalNodes, completedNodes, treeName }: ProgressDonutCardProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // SVG Donut params
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center -ml-3">
                <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
                    <DotLottiePlayer
                        src="/assets/dashboard/progress.lottie"
                        autoplay
                        loop
                        style={{ width: '100px', height: '100px' }}
                    />
                </div>
                <div className="-ml-3 mt-1">
                    <h3 className="font-bold text-slate-800">
                        {t('dashboard.overallProgress', { defaultValue: 'Tiến độ tổng thể' })}
                    </h3>
                    {treeName && (
                        <p className="text-xs text-slate-500">{treeName}</p>
                    )}
                </div>
            </div>

            <div className="px-6 pb-6 mt-2">
                <div className="flex flex-col items-center py-4">
                    <div className="relative">
                        <svg width={size} height={size} className="-rotate-90">
                            {/* Background circle */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth={strokeWidth}
                            />
                            {/* Progress circle */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="url(#progressGradient)"
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                className="transition-all duration-700"
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-800">{percentage}%</span>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-slate-600">
                            <span className="font-bold text-emerald-600">{completedNodes}</span>
                            <span className="text-slate-400"> / {totalNodes} kỹ năng</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/my-skill-tree')}
                    className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                    {t('dashboard.viewSkillTree', { defaultValue: 'Xem Skill Tree' })}
                </button>
            </div>
        </div>
    );
}

// ============ AI Insights Card ============
interface AIInsightsCardProps {
    weakTopics: string[];
    recommendedFocus: string[];
    nodeId?: string;
}

export function AIInsightsCard({ weakTopics, recommendedFocus, nodeId }: AIInsightsCardProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const hasInsights = weakTopics.length > 0 || recommendedFocus.length > 0;

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                    <DotLottiePlayer
                        src="/assets/dashboard/AI.lottie"
                        autoplay
                        loop
                        style={{ width: '100px', height: '100px' }}
                    />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">
                        {t('dashboard.aiInsights', { defaultValue: 'AI Gợi ý' })}
                    </h3>
                    <p className="text-xs text-amber-600">
                        {t('dashboard.basedOnQuiz', { defaultValue: 'Dựa trên kết quả Quiz' })}
                    </p>
                </div>
            </div>

            {!hasInsights ? (
                <div className="text-center py-4">
                    <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                        {t('dashboard.noInsightsYet', { defaultValue: 'Làm thêm Quiz để nhận gợi ý từ AI' })}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {weakTopics.length > 0 && (
                        <div className="p-3 bg-white/80 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                    {t('dashboard.needsImprovement', { defaultValue: 'Cần cải thiện' })}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {weakTopics.slice(0, 3).map((topic, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {recommendedFocus.length > 0 && (
                        <div className="p-3 bg-white/80 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                    {t('dashboard.focusOn', { defaultValue: 'Nên ôn tập' })}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {recommendedFocus.slice(0, 3).map((topic, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {nodeId && hasInsights && (
                <button
                    onClick={() => navigate(`/quiz?nodeId=${nodeId}`)}
                    className="w-full mt-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors"
                >
                    {t('dashboard.practiceNow', { defaultValue: 'Ôn tập ngay' })}
                </button>
            )}
        </div>
    );
}

// ============ Quick Stats Card (Mobile) ============
interface QuickStatsProps {
    streak: number;
    todayItems: number;
    completedToday: number;
    totalQuizzes: number;
}

export function QuickStatsCard({ streak, todayItems, completedToday, totalQuizzes }: QuickStatsProps) {
    return (
        <div className="grid grid-cols-4 gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-center p-2">
                <div className="text-2xl font-bold text-orange-500">🔥 {streak}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Streak</div>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
                <div className="text-2xl font-bold text-blue-600">{todayItems}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Hôm nay</div>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
                <div className="text-2xl font-bold text-emerald-500">{completedToday}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Xong</div>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
                <div className="text-2xl font-bold text-violet-600">{totalQuizzes}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Quiz</div>
            </div>
        </div>
    );
}

// ============ Weekly Activity Chart ============
interface WeeklyActivityChartProps {
    data: { day: string; hours: number }[];
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
    const { t } = useTranslation();
    const maxHours = Math.max(...data.map(d => d.hours), 1);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center -ml-3">
                <div className="w-14 h-14 flex ml-6 mr-6 items-center justify-center overflow-hidden">
                    <DotLottiePlayer
                        src="/assets/dashboard/GrowthChart.lottie"
                        autoplay
                        loop
                        style={{ width: '100px', height: '100px' }}
                    />
                </div>
                <div className="-ml-3 mt-1">
                    <h3 className="font-bold text-slate-800">
                        {t('dashboard.weeklyActivity', { defaultValue: 'Hoạt động tuần này' })}
                    </h3>
                    <p className="text-xs text-slate-500">
                        {t('dashboard.completedItems', { defaultValue: 'Số việc hoàn thành' })}
                    </p>
                </div>
            </div>

            <div className="px-6 pb-6 mt-2">

                <div className="flex items-end justify-between gap-2 h-32">
                    {data.map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex justify-center">
                                <div
                                    className="w-8 md:w-10 rounded-t-lg bg-gradient-to-t from-violet-500 to-purple-400 transition-all hover:from-violet-600 hover:to-purple-500"
                                    style={{ height: `${(item.hours / maxHours) * 100}%`, minHeight: item.hours > 0 ? '8px' : '4px' }}
                                />
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
