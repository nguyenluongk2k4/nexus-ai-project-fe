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
    onClaim?: (missionId: string) => void;
}


export const MissionCard: React.FC<MissionCardProps> = ({ mission, userMission, onClaim }) => {
    const { t } = useTranslation();
    const isClaimable = userMission?.status === 'not_get_point';
    const isCompleted = userMission?.status === 'completed';

    // Calculate progress
    const requiredCount = mission.requirements?.count || 1;
    const currentCount = userMission?.progress?.count || 0;
    const progressPercent = Math.min(100, (currentCount / requiredCount) * 100);

    const getLottieSrc = () => {
        if (isCompleted) return "/assets/mission/completed.lottie";
        return MISSION_LOTTIE_MAP[mission.mission_type] || "/assets/mission/welcome.lottie";
    };

    return (
        <div
            onClick={() => isClaimable && onClaim?.(mission.id)}
            className={`
            group relative p-6 rounded-3xl bg-white border border-slate-100 transition-all duration-500
            hover:shadow-2xl hover:shadow-slate-200/60 hover:border-violet-200 cursor-pointer flex items-center gap-8 overflow-hidden
            ${isCompleted ? 'opacity-70 bg-slate-50/50' : ''}
            ${isClaimable ? 'border-amber-200 bg-amber-50/30' : ''}
        `}>
            {/* Left side: Status Circle */}
            <div className="relative flex-shrink-0">
                <div className={`
                    w-16 h-16 rounded-3xl border-2 flex items-center justify-center transition-all duration-500
                    ${isCompleted
                        ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100 rotate-0'
                        : isClaimable
                            ? 'border-amber-400 bg-amber-50 shadow-xl shadow-amber-100 animate-pulse scale-105'
                            : 'border-slate-100 bg-white group-hover:border-violet-300 group-hover:bg-violet-50/30 group-hover:rotate-6 shadow-sm'}
                `}>
                    <div className="w-12 h-12 flex items-center justify-center">
                        <DotLottiePlayer
                            src={getLottieSrc()}
                            autoplay
                            loop={!isCompleted}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                </div>

                {/* Status Indicator Badge */}
                {!isCompleted && !isClaimable && currentCount > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white shadow-lg">
                        {currentCount}
                    </div>
                )}
            </div>

            {/* Middle: Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <h3 className={`text-base font-black italic uppercase tracking-tighter transition-colors 
                        ${isCompleted ? 'text-slate-400 line-through' :
                            isClaimable ? 'text-amber-600' : 'text-slate-900 group-hover:text-violet-600'}`}>
                        {mission.name}
                        {isClaimable && (
                            <span className="ml-3 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full not-italic tracking-normal">
                                {t('missions.ready_to_claim')}
                            </span>
                        )}
                    </h3>
                    {mission.is_repeatable && !isCompleted && (
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.4)]" />
                    )}
                </div>
                <p className="text-sm font-medium text-slate-600 mt-1 truncate">
                    {mission.description}
                </p>

                {/* Progress Bar Area */}
                {!isCompleted && mission.requirements?.count && (
                    <div className="mt-3 w-64">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 transition-all duration-700"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Reward */}
            <div className="flex-shrink-0 flex items-center gap-6 min-w-[140px] justify-end border-l border-slate-50 pl-8">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                        <span className={`text-2xl font-black italic leading-none transition-colors ${isCompleted ? 'text-slate-300' : 'text-slate-900'}`}>
                            {mission.coin_reward}
                        </span>
                        <div className="w-12 h-12 flex items-center justify-center relative">
                            <DotLottiePlayer
                                src="/assets/coin.lottie"
                                autoplay
                                loop
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mt-2">{t('missions.reward')}</span>
                </div>
            </div>
        </div>
    );
};
