import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { Bell, Settings, Flame, User, ChevronDown, TreeDeciduous, Globe, Wallet, Coins, LogOut } from 'lucide-react';
import { CoinsDisplay } from '@/modules/coins/ui/components/CoinsDisplay';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { useDashboard } from '@/modules/home/ui/hooks/useDashboard';

export const TopHeader: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { data: dashboardData } = useDashboard();
    const stats = dashboardData?.stats;
    const { t, i18n } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
            {/* Left: Greeting Info - Hide on Mobile */}
            <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-lg font-black text-slate-900 leading-tight tracking-tight">
                        {t('header.greeting', { name: user.fullName || user.username })} 👋
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                        {t('header.subtitle')}
                    </p>
                </div>
            </div>

            {/* Right: Streak & Actions */}
            <div className="flex items-center gap-6">
                {/* Streak Indicator - Condensed on Mobile */}
                <div className="flex items-center bg-orange-50/50 pl-1 pr-3 md:pr-5 rounded-3xl border border-orange-100/50 shadow-sm gap-0 group transition-all hover:bg-orange-100/50 cursor-help h-12 md:h-14">
                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center relative">
                        <DotLottiePlayer
                            src="/assets/lottile/fire-streak-orange.lottie"
                            autoplay
                            loop
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                    <div className="flex flex-col items-start justify-center -ml-2 md:-ml-3 h-full">
                        <span className="text-lg md:text-2xl font-black text-orange-600 leading-tight whitespace-nowrap">
                            {stats?.streak || 0}
                        </span>
                        <span className="hidden md:block text-[9px] font-black text-orange-400 tracking-[0.2em] uppercase whitespace-nowrap">
                            {t('header.streak')}
                        </span>
                    </div>
                </div>

                {/* Coins Display (Persistent) - Condensed on Mobile */}
                <div id="header-coins-target" className="flex items-center bg-yellow-50/50 pl-1 pr-3 md:pr-5 rounded-3xl border border-yellow-100/50 shadow-sm gap-0 group transition-all hover:bg-yellow-100/50 h-12 md:h-14 cursor-pointer" onClick={() => navigate('/missions')}>
                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center relative">
                        <DotLottiePlayer
                            src="/assets/coin.lottie"
                            autoplay
                            loop
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                    <div className="flex flex-col items-start justify-center -ml-2 md:-ml-3 h-full">
                        <span className="text-lg md:text-2xl font-black text-yellow-600 leading-tight whitespace-nowrap">
                            <CoinsDisplay minimal />
                        </span>
                        <span className="hidden md:block text-[9px] font-black text-yellow-400 tracking-[0.2em] uppercase whitespace-nowrap">
                            {t('missions.coins')}
                        </span>
                    </div>
                </div>

                {/* Vertical Divider */}

                {/* Action Buttons & User Dropdown */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2.5 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-violet-600 hover:border-violet-100 hover:bg-violet-50 transition-all shadow-sm group">
                        < Bell className="w-5 h-5 group-hover:shake" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                        >
                            <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'User')}&background=random`}
                                alt={user.fullName || user.username}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                            />
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-black text-slate-900 leading-tight">
                                    {user.fullName || user.username}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 py-3 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
                                {/* Balance Section */}
                                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Ví của bạn
                                        </div>
                                        <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 px-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <Wallet className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">Số dư</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900">
                                                {user.balance?.toLocaleString() || 0}đ
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 px-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
                                                    <Coins className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">Xu</span>
                                            </div>
                                            <div className="text-xs font-black text-yellow-600">
                                                <CoinsDisplay minimal />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-2 space-y-1">
                                    <button
                                        onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 rounded-xl transition-all group"
                                    >
                                        <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        {t('nav.profile')}
                                    </button>
                                    <button
                                        onClick={() => { navigate('/my-skills'); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 rounded-xl transition-all group"
                                    >
                                        <TreeDeciduous className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        {t('nav.mySkillTree')}
                                    </button>
                                    <button
                                        onClick={toggleLanguage}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 rounded-xl transition-all group"
                                    >
                                        <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
                                    </button>

                                    <div className="my-2 border-t border-slate-50 mx-2" />

                                    <button
                                        onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                                    >
                                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        {t('nav.logout')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
