import React, { useEffect, useState } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '@/shared/infrastructure/HttpClient';
import { Loader2, Copy, Link, Share2, CheckCircle, XCircle, Gift, Users } from 'lucide-react';

interface ReferralStats {
    my_code: string;
    total_invited: number;
    total_earned: number;
    referred_by_code?: string;
    history: { referee_id: string; status: string; date: string }[];
}

export const ReferralPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [inputCode, setInputCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyResult, setApplyResult] = useState<{ success: boolean; message: string } | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        const refFromUrl = searchParams.get('ref');
        if (refFromUrl) {
            setInputCode(refFromUrl.toUpperCase());
            toast.info(t('referral.filledFromLink', { code: refFromUrl.toUpperCase() }));
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await httpClient.get<ReferralStats>('/referral/stats');
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch referral stats', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const copyCode = () => {
        if (!stats?.my_code) return;
        navigator.clipboard.writeText(stats.my_code);
        toast.success(t('referral.copiedCode'));
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const copyLink = () => {
        if (!stats?.my_code) return;
        const link = `${window.location.origin}/register?ref=${stats.my_code}`;
        navigator.clipboard.writeText(link);
        toast.success(t('referral.copiedLink'));
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleApplyCode = async () => {
        const code = inputCode.trim().toUpperCase();
        if (!code || code.length < 6) {
            toast.error(t('referral.codeTooShort'));
            return;
        }
        setIsApplying(true);
        setApplyResult(null);
        try {
            const result = await httpClient.post<{ success: boolean; message: string; coins_awarded: number }>(
                '/referral/apply',
                { code }
            );
            setApplyResult({ success: result.success, message: result.message });
            if (result.success) {
                toast.success(result.message);
                setInputCode('');
                // Update local state to immediately show the "already applied" UI
                setStats(prev => prev ? { ...prev, referred_by_code: code } : prev);
            } else {
                toast.error(result.message);
            }
        } catch (err: any) {
            const msg = err.message || t('referral.errorGeneric');
            setApplyResult({ success: false, message: msg });
            toast.error(msg);
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    const referralCode = stats?.my_code || '';

    return (
        <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
            {/* Header */}
            <div className="mb-10 flex items-center gap-5">
                <div className="w-16 h-16 flex-shrink-0 bg-violet-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('referral.title')}</h1>
                    <p className="text-gray-500 mt-1 text-base">{t('referral.subtitle')}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* ===== CỘT TRÁI ===== */}
                <div className="space-y-6">

                    {/* Mã giới thiệu */}
                    <div className="bg-white border border-violet-100 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-bold mb-4 text-gray-800">{t('referral.yourCode')}</h2>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 bg-violet-50 border-2 border-violet-200 px-5 py-3.5 rounded-xl font-mono text-2xl tracking-[0.25em] text-violet-700 text-center uppercase font-black select-all">
                                {referralCode || '••••••••'}
                            </div>
                            <button
                                onClick={copyCode}
                                title={t('referral.copyCodeBtn')}
                                className="w-14 h-14 flex-shrink-0 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                            >
                                {copiedCode
                                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                                    : <Copy className="w-5 h-5" />
                                }
                            </button>
                        </div>
                        <button
                            onClick={copyLink}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] active:scale-95 ${copiedLink
                                ? 'bg-violet-600 text-white border-2 border-violet-700'
                                : 'bg-violet-50 hover:bg-violet-100 border-2 border-violet-200 text-violet-600'
                                }`}
                        >
                            <Link className="w-4 h-4 flex-shrink-0" />
                            {copiedLink ? t('referral.linkCopiedBtn') : t('referral.copyLinkBtn')}
                        </button>
                    </div>

                    {/* Nhập mã của bạn bè */}
                    <div className="bg-white border border-violet-100 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-bold mb-1 text-gray-800">{t('referral.friendCode')}</h2>
                        <p className="text-sm text-gray-400 mb-4">{t('referral.friendCodeDesc')}</p>

                        {stats?.referred_by_code ? (
                            <div className="bg-green-50/50 border-2 border-green-100 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-green-600 uppercase tracking-widest mb-0.5">{t('referral.alreadyAppliedCode')}</div>
                                        <div className="text-xl font-mono font-black text-slate-800 tracking-widest">{stats.referred_by_code}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputCode}
                                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                        placeholder={t('referral.friendCodePlaceholder')}
                                        className="flex-1 bg-violet-50 border-2 border-violet-100 text-gray-900 px-4 py-3 rounded-xl font-mono tracking-widest text-sm focus:outline-none focus:border-violet-400 placeholder-violet-200 transition-colors"
                                    />
                                    <button
                                        onClick={handleApplyCode}
                                        disabled={isApplying || !inputCode.trim()}
                                        className={`px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 flex items-center gap-2 ${inputCode.trim() ? 'shiny-tag' : ''}`}
                                    >
                                        {isApplying
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Gift className="w-4 h-4" />
                                        }
                                        {t('referral.applyBtn')}
                                    </button>
                                </div>
                                {applyResult && (
                                    <div className={`flex items-center gap-2 mt-3 text-sm font-medium ${applyResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                        {applyResult.success
                                            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                            : <XCircle className="w-4 h-4 flex-shrink-0" />
                                        }
                                        {applyResult.message}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Cách thức hoạt động */}
                    <div className="bg-white border border-violet-100 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-bold mb-5 text-gray-800">{t('referral.howItWorks')}</h2>
                        <div className="space-y-5">
                            {[
                                { step: 1, text: t('referral.step1'), lottie: '/assets/SMS Icon.lottie', scale: '1.5' },
                                { step: 2, text: t('referral.step2'), lottie: '/assets/mission/update-profile.lottie', scale: '1' },
                                { step: 3, text: t('referral.step3'), lottie: '/assets/coin.lottie', scale: '1.8' },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 items-center group">
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-50 border-2 border-violet-100 group-hover:border-violet-300 group-hover:bg-violet-100 transition-all duration-200 flex items-center justify-center overflow-hidden p-1.5">
                                            <DotLottiePlayer
                                                src={item.lottie}
                                                autoplay
                                                loop
                                                style={{ width: '100%', height: '100%', transform: `scale(${item.scale})` }}
                                            />
                                        </div>
                                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                                            {item.step}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== CỘT PHẢI ===== */}
                <div className="space-y-6">
                    {/* Thống kê */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-violet-100 p-6 rounded-2xl text-center shadow-sm hover:border-violet-300 hover:shadow-md transition-all duration-200">
                            <div className="w-16 h-16 mx-auto mb-2">
                                <DotLottiePlayer
                                    src="/assets/mission/refferal.lottie"
                                    autoplay
                                    loop
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                            <div className="text-3xl font-black text-violet-700">{stats?.total_invited ?? 0}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold">{t('referral.stats.friends')}</div>
                        </div>
                        <div className="bg-white border border-violet-100 p-6 rounded-2xl text-center shadow-sm hover:border-violet-300 hover:shadow-md transition-all duration-200">
                            <div className="w-16 h-16 mx-auto mb-2">
                                <DotLottiePlayer
                                    src="/assets/Award Winning.lottie"
                                    autoplay
                                    loop
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                            <div className="text-3xl font-black text-violet-700">+{stats?.total_earned ?? 0}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold">{t('referral.stats.earnedCoins')}</div>
                        </div>
                    </div>

                    {/* Phần thưởng */}
                    <div className="relative bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 p-8 rounded-2xl text-white shadow-2xl shadow-violet-400/30 overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-16 h-16 flex-shrink-0">
                                    <DotLottiePlayer
                                        src="/assets/coin.lottie"
                                        autoplay
                                        loop
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>
                                <h2 className="text-xl font-black text-white">{t('referral.rewardsTitle')}</h2>
                            </div>

                            <ul className="space-y-3">
                                <li className="flex justify-between items-center text-sm border-b border-white/15 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-violet-300" />
                                        <span className="font-medium">{t('referral.referrer')}</span>
                                    </div>
                                    <span className="font-black text-lg text-yellow-300">+500 Xu</span>
                                </li>
                                <li className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-violet-300" />
                                        <span className="font-medium">{t('referral.referee')}</span>
                                    </div>
                                    <span className="font-black text-lg text-yellow-300">+500 Xu</span>
                                </li>
                            </ul>

                            <button
                                onClick={copyLink}
                                className="w-full mt-6 py-3.5 bg-white text-violet-700 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-violet-50 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg"
                            >
                                <Share2 className="w-5 h-5" />
                                {t('referral.shareBtn')}
                            </button>
                        </div>
                    </div>

                    {/* Lịch sử mời */}
                    {stats?.history && stats.history.length > 0 && (
                        <div className="bg-white border border-violet-100 p-6 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 flex-shrink-0">
                                    <DotLottiePlayer
                                        src="/assets/Clock Lottie Animation.lottie"
                                        autoplay
                                        loop
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">{t('referral.history')}</h2>
                            </div>
                            <div className="space-y-1">
                                {stats.history.map((h, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-2.5 border-b border-violet-50 last:border-0">
                                        <span className="text-gray-400 font-mono text-xs">{h.referee_id.slice(0, 12)}…</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${h.status === 'completed'
                                            ? 'bg-violet-100 text-violet-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {h.status === 'completed' ? t('referral.statusCompleted') : t('referral.statusPending')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
