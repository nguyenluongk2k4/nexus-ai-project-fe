// Profile Page - Modern Bento Design

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User,
    Mail,
    Calendar,
    Clock,
    Award,
    Flame,
    MessageSquare,
    Wallet,
    Save,
    Key,
    Camera,
    CheckCircle,
    LogIn,
    BookOpen,
    PenSquare,
    Loader2,
    AtSign,
    Diamond,
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/modules/auth/AuthProvider';

const ACTIVITY_ICONS: Record<string, any> = {
    login: LogIn,
    skill_complete: CheckCircle,
    purchase: Wallet,
    forum_post: PenSquare,
    learning: BookOpen,
};

const ACTIVITY_COLORS: Record<string, string> = {
    login: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    skill_complete: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purchase: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    forum_post: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    learning: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
};

export function Profile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile, stats, activities, loading, error, updateProfile } = useProfile();

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Initialize form when profile loads
    useEffect(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setEmail(profile.email);
        }
    }, [profile]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);
        try {
            await updateProfile({
                fullName: fullName || undefined,
                email: email || undefined,
            });
            setSaveMessage(t('profile.success'));
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (err: any) {
            setSaveMessage(err.message || t('profile.error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        {t('common.retry')}
                    </button>
                </div>
            </div>
        );
    }

    const displayProfile = profile || {
        id: '',
        email: user?.email || '',
        username: user?.username || '',
        fullName: user?.fullName || '',
        avatarUrl: user?.avatarUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        balance: 0,
        subscriptionTier: 'free',
        subscriptionTierName: 'Free',
        subscriptionExpiresAt: null,
    };

    return (
        <div className="flex-1 overflow-auto min-h-screen bg-slate-50 relative">
            {/* Subtle animated background blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-[20%] w-[400px] h-[400px] bg-violet-200/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-0 right-[10%] w-[350px] h-[350px] bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{t('profile.title')}</h1>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Main Form */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Profile Card with Avatar and Form */}
                        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
                            {/* Avatar Section */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 pb-8 border-b border-slate-100">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 p-1">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-violet-600 overflow-hidden">
                                            {displayProfile.fullName?.charAt(0)?.toUpperCase() || displayProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    </div>
                                    <button className="absolute bottom-1 right-1 bg-white text-slate-600 p-2 rounded-full shadow-lg border border-slate-100 hover:scale-105 transition-transform">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                                            {displayProfile.fullName || displayProfile.username}
                                        </h2>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                            {t('profile.activeStatus')}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-lg mb-4">@{displayProfile.username}</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label htmlFor="fullname" className="text-sm font-semibold text-slate-700">
                                            {t('profile.fullName.label')}
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                id="fullname"
                                                type="text"
                                                value={fullName || displayProfile.fullName || ''}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder={t('profile.fullName.placeholder')}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-2">
                                        <label htmlFor="username" className="text-sm font-semibold text-slate-700">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                id="username"
                                                type="text"
                                                value={displayProfile.username}
                                                disabled
                                                className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-xl text-slate-500 cursor-not-allowed select-none"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{t('profile.username.hint')}</p>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email || displayProfile.email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Join Date */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="join_date" className="text-sm font-semibold text-slate-700">
                                            {t('profile.joined')}
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                id="join_date"
                                                type="text"
                                                value={formatDate(displayProfile.createdAt)}
                                                disabled
                                                className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-xl text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Success Message */}
                                {saveMessage && (
                                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <p className="text-green-700">{saveMessage}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full sm:w-auto flex-1 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-violet-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                        )}
                                        {t('profile.save')}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full sm:w-auto flex-1 bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Key className="w-5 h-5" />
                                        {t('profile.changePassword')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Activity History */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">{t('profile.activity.title')}</h3>
                                <button className="text-sm font-medium text-violet-600 hover:underline">{t('profile.activity.viewAll')}</button>
                            </div>
                            <div className="space-y-4">
                                {activities.slice(0, 3).map((activity) => {
                                    const Icon = ACTIVITY_ICONS[activity.type] || CheckCircle;
                                    const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-gray-100 text-gray-600';

                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            <div className={`p-2 rounded-xl ${colorClass} shrink-0`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-slate-800 font-medium">{activity.description}</p>
                                                <p className="text-sm text-slate-500 mt-1">{formatDateTime(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Stats Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('profile.stats.title')}</h3>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-slate-600">{t('profile.stats.learningHours')}</span>
                                    </div>
                                    <span className="font-bold text-violet-600 text-lg">{stats?.learningHours || 0}h</span>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-teal-100 text-teal-600">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-slate-600">{t('profile.stats.skillsCompleted')}</span>
                                    </div>
                                    <span className="font-bold text-teal-600 text-lg">{stats?.skillsCompleted || 0}</span>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600">
                                            <Flame className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-slate-600">{t('profile.stats.streak')}</span>
                                    </div>
                                    <span className="font-bold text-orange-600 text-lg">{stats?.streakDays || 0}</span>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-slate-600">{t('profile.stats.forumPosts')}</span>
                                    </div>
                                    <span className="font-bold text-blue-600 text-lg">{stats?.forumPosts || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Balance Card with Glass Effect */}
                        <div className="relative overflow-hidden rounded-3xl p-6 shadow-sm bg-white/70 backdrop-blur-md border border-white">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-400/20 rounded-full blur-3xl"></div>
                            <h3 className="relative z-10 text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Wallet className="text-violet-600" />
                                {t('profile.balance.title')}
                            </h3>
                            <div className="relative z-10 text-center py-4">
                                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 mb-1">
                                    {formatCurrency(displayProfile.balance)} ₫
                                </div>
                                <p className="text-sm text-slate-500">{t('profile.balance.current')}</p>
                            </div>
                            <button
                                onClick={() => navigate('/purchase')}
                                className="relative z-10 w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <Wallet className="w-5 h-5" />
                                {t('profile.balance.deposit')}
                            </button>
                        </div>

                        {/* Subscription Tier Card */}
                        <div className="relative overflow-hidden rounded-3xl p-6 shadow-lg text-white bg-gradient-to-br from-violet-600 to-cyan-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
                            <div className="relative z-10 flex items-start justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Diamond className="text-yellow-300" />
                                        <h3 className="text-lg font-bold">{t('profile.subscription.title')}</h3>
                                    </div>
                                    {displayProfile.subscriptionTier === 'free' ? (
                                        <p className="text-white/80 text-sm">{t('profile.subscription.freeHint')}</p>
                                    ) : displayProfile.subscriptionExpiresAt ? (
                                        <p className="text-white/80 text-sm">
                                            {t('profile.subscription.expires')}{formatDate(displayProfile.subscriptionExpiresAt)}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 shadow-sm">
                                    <span className="font-bold tracking-wide">
                                        {displayProfile.subscriptionTierName?.toUpperCase() || 'FREE'}
                                    </span>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10 shadow-inner">
                                    <Diamond className="w-10 h-10" />
                                </div>
                                <button
                                    onClick={() => navigate('/plans')}
                                    className="w-full bg-white text-violet-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Award className="w-5 h-5" />
                                    {displayProfile.subscriptionTier === 'free' ? t('profile.subscription.upgrade') : t('profile.subscription.manage')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center text-slate-400 py-8 text-sm mt-12">
                    © 2026 Learning Platform. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
