// Profile Page - Vibrant True Purple Design

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Copy,
    ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/modules/auth/AuthProvider';

const ACTIVITY_ICONS: Record<string, any> = {
    login: LogIn,
    skill_complete: CheckCircle,
    purchase: Wallet,
    forum_post: PenSquare,
    learning: BookOpen,
};

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import fireStreakAnimation from '@/assets/lottile/fire-streak-orange.lottie';

export function Profile() {
    const { t, i18n } = useTranslation();
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
        return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { style: 'currency', currency: i18n.language === 'en' ? 'USD' : 'VND' }).format(i18n.language === 'en' ? amount / 23000 : amount);
        // Note: Simple conversion for demo, ideally backend provides currency
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
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
            setSaveMessage(t('profile.messages.saveSuccess'));
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (err: any) {
            setSaveMessage(err.message || t('profile.messages.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen" style={{ backgroundColor: '#faf5ff' }}>
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen" style={{ backgroundColor: '#faf5ff' }}>
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        {t('profile.buttons.retry')}
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
        <div
            className="flex-1 overflow-auto min-h-screen p-4 md:p-8"
            style={{
                backgroundColor: '#faf5ff',
                backgroundImage: 'radial-gradient(#e9d5ff 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-950 tracking-tight">{t('profile.title')}</h1>
                        <p className="text-slate-600 mt-2 text-lg font-medium">{t('profile.subtitle')}</p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100/50">
                            {/* Avatar Section */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 pb-8 border-b border-purple-100">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-purple-100 p-1 bg-white shadow-sm overflow-hidden relative">
                                        <img
                                            src={displayProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayProfile.fullName || displayProfile.username || 'User')}&background=random`}
                                            alt={displayProfile.fullName || displayProfile.username}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    <button className="absolute bottom-1 right-1 bg-white text-purple-600 p-2.5 rounded-full shadow-md border border-purple-100 hover:bg-purple-50 transition-colors">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                                            {displayProfile.fullName || displayProfile.username}
                                        </h2>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                                            {t('profile.activeStatus')}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-lg mb-4 font-medium">@{displayProfile.username}</p>
                                    <div className="flex gap-3">
                                        <button className="hidden md:inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg">
                                            <Copy className="w-4 h-4 mr-1.5" /> {t('profile.copyId')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label htmlFor="fullname" className="text-sm font-bold text-purple-900 uppercase tracking-wide">
                                            {t('profile.form.fullName')}
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
                                            <input
                                                id="fullname"
                                                type="text"
                                                value={fullName || displayProfile.fullName || ''}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder={t('profile.form.fullNamePlaceholder')}
                                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-400 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-2">
                                        <label htmlFor="username" className="text-sm font-bold text-purple-900 uppercase tracking-wide">
                                            {t('profile.form.username')}
                                        </label>
                                        <div className="relative">
                                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                id="username"
                                                type="text"
                                                value={displayProfile.username}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed select-none"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 pl-1">{t('profile.form.usernameHint')}</p>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="email" className="text-sm font-bold text-purple-900 uppercase tracking-wide">
                                            {t('profile.form.email')}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email || displayProfile.email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-400 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Join Date */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="join_date" className="text-sm font-bold text-purple-900 uppercase tracking-wide">
                                            {t('profile.form.joinDate')}
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                id="join_date"
                                                type="text"
                                                value={formatDate(displayProfile.createdAt)}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
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
                                <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 border-t border-purple-100 mt-8">
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5" />
                                        )}
                                        {t('profile.buttons.save')}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full sm:w-auto flex-1 bg-white border-2 border-purple-100 text-purple-700 font-bold py-3.5 px-6 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Key className="w-5 h-5" />
                                        {t('profile.buttons.changePassword')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Activity History */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100/50">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-extrabold text-slate-900">{t('profile.history.title')}</h3>
                                <a className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1 group" href="#">
                                    {t('profile.buttons.viewAll')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                            <div className="space-y-4">
                                {activities.slice(0, 3).map((activity) => {
                                    const Icon = ACTIVITY_ICONS[activity.type] || CheckCircle;

                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-5 p-5 rounded-xl border border-slate-100 bg-white hover:border-purple-200 hover:shadow-md transition-all group"
                                        >
                                            <div className="p-3 rounded-xl bg-purple-50 text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0 shadow-sm">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-slate-800 font-bold text-lg">{activity.description}</p>
                                                <p className="text-sm text-slate-500 mt-1 font-medium">{formatDateTime(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100/50">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-8">{t('profile.stats.title')}</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between group py-3 border-b border-dashed border-purple-100 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-200">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-600">{t('profile.stats.learningHours')}</span>
                                    </div>
                                    <span className="font-extrabold text-purple-900 text-xl">{stats?.learningHours || 0}h</span>
                                </div>

                                <div className="flex items-center justify-between group py-3 border-b border-dashed border-purple-100 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-fuchsia-500 text-white shadow-md shadow-fuchsia-200">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-600">{t('profile.stats.skillsCompleted')}</span>
                                    </div>
                                    <span className="font-extrabold text-purple-900 text-xl">{stats?.skillsCompleted || 0}</span>
                                </div>

                                <div className="flex items-center justify-between group py-3 border-b border-dashed border-purple-100 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-0 rounded-xl bg-transparent shadow-none w-12 h-12 flex items-center justify-center">
                                            <DotLottieReact
                                                src={fireStreakAnimation}
                                                loop
                                                autoplay
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                        <span className="font-bold text-slate-600">{t('profile.stats.streakDays')}</span>
                                    </div>
                                    <span className="font-extrabold text-purple-900 text-xl">{stats?.streakDays || 0}</span>
                                </div>

                                <div className="flex items-center justify-between group py-3 border-b border-dashed border-purple-100 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-cyan-500 text-white shadow-md shadow-cyan-200">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-600">{t('profile.stats.forumPosts')}</span>
                                    </div>
                                    <span className="font-extrabold text-purple-900 text-xl">{stats?.forumPosts || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="bg-purple-900 rounded-2xl p-8 shadow-lg relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-800 rounded-full blur-2xl opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 opacity-90">
                                        <Wallet className="text-purple-300" />
                                        {t('profile.balance.title')}
                                    </h3>
                                </div>
                                <div className="text-center py-8 bg-purple-800/50 rounded-xl border border-purple-700/50 backdrop-blur-sm mb-6">
                                    <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                                        {formatCurrency(displayProfile.balance)}
                                    </div>
                                    <p className="text-sm text-purple-200 font-bold uppercase tracking-wider">{t('profile.balance.available')}</p>
                                </div>
                                <button
                                    onClick={() => navigate('/purchase')}
                                    className="w-full bg-white text-purple-900 font-bold py-3.5 px-4 rounded-xl shadow-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Wallet className="w-5 h-5" />
                                    {t('profile.balance.deposit')}
                                </button>
                            </div>
                        </div>

                        {/* Subscription Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-purple-100/50 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 w-full"></div>
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Diamond className="text-purple-600" />
                                            <h3 className="text-lg font-bold text-slate-900">{t('profile.subscription.title')}</h3>
                                        </div>
                                        {displayProfile.subscriptionTier === 'free' ? (
                                            <p className="text-slate-500 text-sm font-medium">{t('profile.subscription.upgradeHint')}</p>
                                        ) : displayProfile.subscriptionExpiresAt ? (
                                            <p className="text-slate-500 text-sm font-medium">
                                                {t('profile.subscription.expires', { date: formatDate(displayProfile.subscriptionExpiresAt) })}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg border border-purple-200">
                                        <span className="font-bold text-xs tracking-wider">
                                            {displayProfile.subscriptionTierName?.toUpperCase() || 'FREE'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-center mb-8">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-purple-50 border-2 border-purple-100 text-purple-600 shadow-inner">
                                        <Diamond className="w-10 h-10" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/plans')}
                                    className="w-full bg-white text-purple-700 font-bold py-3 px-4 rounded-xl border-2 border-purple-100 hover:border-purple-600 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Award className="w-5 h-5" />
                                    {displayProfile.subscriptionTier === 'free' ? t('profile.subscription.upgrade') : t('profile.subscription.manage')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center text-slate-400 py-8 text-sm font-medium">
                    {t('profile.footer')}
                </footer>
            </div>
        </div>
    );
}
