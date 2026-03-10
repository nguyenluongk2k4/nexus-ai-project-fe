import React from 'react';
import { Mission, UserMission, MissionType } from '../../domain/entities/Coins';
import { CheckCircle2, Circle, Coins, Trophy } from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { useTranslation } from 'react-i18next';

const MISSION_LOTTIE_MAP: Record<string, string> = {
    [MissionType.PURCHASE_PLAN]: '/assets/mission/purchase-plan.lottie',
    [MissionType.AI_CHAT]: '/assets/mission/ai-chat.lottie',
    [MissionType.UPDATE_PROFILE]: '/assets/mission/update-profile.lottie',
    [MissionType.WELCOME]: '/assets/mission/welcome.lottie',
    [MissionType.REFERRAL]: '/assets/mission/refferal.lottie',
};

interface MissionCardProps {
    mission: Mission;
    userMission?: UserMission;
    onClaim?: (missionId: string, x: number, y: number) => void;
    isClaiming?: boolean;
}


export const MissionCard: React.FC<MissionCardProps> = ({ mission, userMission, onClaim, isClaiming }) => {
    const { t } = useTranslation();
    const rewardRef = React.useRef<HTMLDivElement>(null);
    const isClaimable = userMission?.status === 'not_get_point' && !isClaiming;
    const isCompleted = userMission?.status === 'completed';

    // Calculate progress
    const requiredCount = mission.requirements?.count || 1;
    const currentCount = userMission?.progress?.count || 0;
    const isProgressCompleted = userMission?.progress?.progress === 'completed' || isCompleted || isClaimable;
    const progressPercent = isProgressCompleted ? 100 : Math.min(100, (currentCount / requiredCount) * 100);

    const getLottieSrc = () => {
        if (isCompleted) return "/assets/mission/completed.lottie";
        return MISSION_LOTTIE_MAP[mission.mission_type] || "/assets/mission/welcome.lottie";
    };

    return (
        <div
            onClick={(e) => {
                if (!isClaimable || !onClaim) return;

                let startX = e.clientX;
                let startY = e.clientY;

                if (rewardRef.current) {
                    const rect = rewardRef.current.getBoundingClientRect();
                    startX = rect.left + rect.width / 2;
                    startY = rect.top + rect.height / 2;
                }

                onClaim(mission.id, startX, startY);
            }}
            className={`
            group relative p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white border border-slate-100 transition-all duration-500
            hover:shadow-2xl hover:shadow-slate-200/60 hover:border-violet-200 cursor-pointer flex flex-row items-center flex-wrap sm:flex-nowrap gap-3 sm:gap-4 md:gap-8 overflow-hidden
            ${isCompleted ? 'opacity-70 bg-slate-50/50' : ''}
            ${isClaimable ? 'border-amber-200 bg-amber-50/30' : ''}
        `}>
            {/* Left side: Status Circle & Content Group for Mobile */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <div className={`
                        w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl border-2 flex items-center justify-center transition-all duration-500
                        ${isCompleted
                            ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100 rotate-0'
                            : isClaiming
                                ? 'border-violet-400 bg-violet-50 shadow-xl shadow-violet-100 animate-pulse'
                                : isClaimable
                                    ? 'border-amber-400 bg-amber-50 shadow-xl shadow-amber-100 animate-pulse scale-105'
                                    : 'border-slate-100 bg-white group-hover:border-violet-300 group-hover:bg-violet-50/30 group-hover:rotate-6 shadow-sm'}
                    `}>
                        <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
                            {isClaiming ? (
                                <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <DotLottiePlayer
                                    src={getLottieSrc()}
                                    autoplay
                                    loop={!isCompleted}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Status Indicator Badge */}
                    {!isCompleted && !isClaiming && currentCount > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-[8px] md:text-[10px] font-black w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center border-2 border-white shadow-lg">
                            {currentCount}
                        </div>
                    )}
                </div>

                {/* Middle: Content */}
                <div className="flex-1 min-w-0 w-full py-1">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <h3 className={`text-sm md:text-base font-black italic uppercase tracking-tighter transition-colors truncate
                            ${isCompleted ? 'text-slate-400 line-through' :
                                isClaimable ? 'text-amber-600' : 'text-slate-900 group-hover:text-violet-600'}`} title={mission.name}>
                            {mission.name}
                        </h3>
                        {isClaimable && (
                            <span className="text-[9px] sm:text-[10px] bg-amber-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full not-italic tracking-normal whitespace-nowrap">
                                {t('missions.ready_to_claim')}
                            </span>
                        )}
                        {mission.is_repeatable && !isCompleted && (
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.4)] hidden sm:block" />
                        )}
                    </div>
                    <p className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-600 mt-0.5 sm:mt-1 truncate">
                        {mission.description}
                    </p>

                    {/* Progress Bar Area */}
                    {!isCompleted && mission.requirements?.count && (
                        <div className="mt-2 sm:mt-3 w-full max-w-xs">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex items-center">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 transition-all duration-700"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Reward */}
            <div className="flex-shrink-0 flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-l sm:pl-4 md:pl-8">
                <span className="text-[10px] sm:hidden font-black uppercase text-slate-400">{t('missions.reward')}:</span>
                <div
                    className={`
                        flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border transition-all duration-500
                        ${isCompleted
                            ? 'bg-slate-50 border-slate-100 text-slate-300'
                            : isClaimable
                                ? 'bg-amber-500/10 border-amber-200 shadow-sm shadow-amber-100/50'
                                : 'bg-slate-50 border-slate-100 group-hover:bg-violet-50 group-hover:border-violet-100 group-hover:shadow-sm'}
                    `}
                    ref={rewardRef}
                >
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className={`text-lg sm:text-2xl font-black italic leading-none transition-colors ${isCompleted ? 'text-slate-300' : isClaimable ? 'text-amber-600' : 'text-slate-900 group-hover:text-violet-600'}`}>
                            {mission.coin_reward}
                        </span>
                        <div className="w-4 h-4 sm:w-5 sm:h-5">
                            <DotLottiePlayer
                                src="/assets/coin.lottie"
                                autoplay
                                loop
                                style={{ width: '100%', height: '100%', opacity: isCompleted ? 0.3 : 1 }}
                            />
                        </div>
                    </div>
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] leading-none mt-0 sm:mt-1 hidden sm:block ${isCompleted ? 'text-slate-300' : 'text-slate-400'}`}>
                        {t('missions.reward')}
                    </span>
                </div>
            </div>
        </div>
    );
};
