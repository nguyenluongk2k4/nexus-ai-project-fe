import React, { useEffect, useState } from 'react';
import { Mission, UserMission } from '../../domain/entities/Coins';
import { CoinsApiGateway } from '../../infrastructure/CoinsApiGateway';
import { GetMissionsUseCase, ClaimMissionRewardUseCase } from '../../usecases/CoinsUseCases';
import { MissionCard } from '../components/MissionCard';
import { Trophy, Target, Calendar, Zap, ChevronRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/modules/auth/AuthProvider';
import { toast } from 'sonner';

const gateway = new CoinsApiGateway();
const getMissionsUseCase = new GetMissionsUseCase(gateway);
const claimRewardUseCase = new ClaimMissionRewardUseCase(gateway);

export const MissionsPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [userMissions, setUserMissions] = useState<UserMission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'incomplete' | 'completed'>('all');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const { available, userProgress } = await getMissionsUseCase.execute();
            setMissions(available);
            setUserMissions(userProgress);
        } catch (error) {
            console.error('Failed to fetch missions', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleClaim = async (missionId: string) => {
        try {
            await claimRewardUseCase.execute(missionId);
            toast.success(t('missions.reward_claimed'), {
                icon: '💰',
                style: {
                    borderRadius: '16px',
                    background: '#1e293b',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });
            // Refresh data
            fetchData();
            // Refresh user balance if needed (handled by AuthProvider refresh or similar)
            if (user) {
                // Ideally trigger a context update for balance
            }
        } catch (error: any) {
            console.error('Failed to claim reward', error);
            toast.error(error.message || t('missions.claim_failed'));
        }
    };

    if (isLoading) return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-black tracking-widest uppercase text-xs">{t('missions.loading')}</p>
            </div>
        </div>
    );

    const totalCoinsGoal = missions.reduce((acc, m) => acc + m.coin_reward, 0);
    const earnedCoins = userMissions.reduce((acc, um) => acc + (um.status === 'completed' ? um.coins_earned : 0), 0);
    const overallProgress = totalCoinsGoal > 0 ? Math.min(100, (earnedCoins / totalCoinsGoal) * 100) : 0;


    return (
        <div className="min-h-screen text-slate-900 font-sans selection:bg-violet-600 selection:text-white">
            <div className="mx-auto min-h-screen flex flex-col bg-white">

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto relative flex flex-col">

                        {/* Featured Header Card (Clean Light Style) */}
                        <div className="pb-4">
                            <div className="relative bg-white overflow-hidden">
                                {/* Custom Background Image & Overlay */}
                                <div className="absolute inset-0">
                                    <img
                                        src="/mission-compass-2.jpg"
                                        className="w-full h-full object-cover opacity-20 grayscale brightness-110"
                                        alt="Banner"
                                    />
                                    <div className="absolute inset-0 to-indigo-50/50" />
                                </div>

                                <div className="relative p-12 flex flex-col items-center">
                                    <div className="flex items-center gap-8 mb-8">
                                        <div>
                                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                                                {t('missions.title')}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Big Progress Bar */}
                                    <div className="w-full max-w-4xl mt-6">
                                        <div className="flex justify-between items-end mb-6 px-4">
                                            <div className="flex flex-col">
                                                {/* <span className="text-xs font-black text-slate-400 tracking-[0.3em] uppercase mb-1">{t('missions.event_status')}</span> */}
                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                                                    {t('missions.event_progress')}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-3xl font-black italic text-violet-600 leading-none">{earnedCoins}</span>
                                                    <span className="text-sm font-black text-slate-300 uppercase leading-none self-end mb-1">/ {totalCoinsGoal} {t('missions.coins')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-10 w-full bg-slate-100/50 rounded-2xl border-[6px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-1000 relative rounded-xl"
                                                style={{ width: `${overallProgress}%` }}
                                            >
                                                {/* Visual Shine */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-xl" />
                                                <div className="absolute top-0 right-0 h-full w-24 bg-white/20 blur-xl animate-pulse" />

                                                {/* User Avatar Checkpoint */}
                                                <div
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 group/avatar"
                                                >
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-violet-400 blur-md rounded-full animate-ping opacity-50" />
                                                        <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white rotate-3 group-hover:rotate-0 transition-transform duration-300">
                                                            <img
                                                                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=random`}
                                                                alt="You"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        {/* Progress Bubble */}
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {Math.round(overallProgress)}% Done
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mission List */}
                        <div className="pt-4 space-y-4 p-20 mx-auto w-full">
                            <div className="flex items-center justify-between mb-2 px-2">
                                <h4 className="text-[12px] font-black text-slate-500 tracking-[0.2em] uppercase italic">{t('missions.available_missions')}</h4>
                                <div className="flex gap-4">
                                    <span className={`text-[10px] font-black cursor-pointer transition-all ${activeTab === 'all' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-400 hover:text-slate-900'}`} onClick={() => setActiveTab('all')}>{t('missions.all')}</span>
                                    <span className={`text-[10px] font-black cursor-pointer transition-all ${activeTab === 'incomplete' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-400 hover:text-slate-900'}`} onClick={() => setActiveTab('incomplete')}>{t('missions.incomplete')}</span>
                                </div>
                            </div>
                            {missions
                                .filter(m => activeTab === 'all' || (activeTab === 'incomplete' && userMissions.find(um => um.mission_id === m.id)?.status !== 'completed'))
                                .map(mission => (
                                    <MissionCard
                                        key={mission.id}
                                        mission={mission}
                                        userMission={userMissions.find(um => um.mission_id === mission.id)}
                                        onClaim={handleClaim}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
