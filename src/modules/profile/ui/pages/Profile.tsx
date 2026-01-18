// Profile Page

import { useState } from 'react';
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
    Loader2
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/modules/auth/AuthProvider';
import { ActivityItem } from '../../domain/entities/ProfileEntities';

const ACTIVITY_ICONS: Record<string, any> = {
    login: LogIn,
    skill_complete: CheckCircle,
    purchase: Wallet,
    forum_post: PenSquare,
    learning: BookOpen,
};

const ACTIVITY_COLORS: Record<string, string> = {
    login: 'text-blue-500 bg-blue-50',
    skill_complete: 'text-green-500 bg-green-50',
    purchase: 'text-violet-500 bg-violet-50',
    forum_post: 'text-teal-500 bg-teal-50',
    learning: 'text-orange-500 bg-orange-50',
};

export function Profile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile, stats, activities, loading, error, updateProfile } = useProfile();

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Initialize form when profile loads
    useState(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setEmail(profile.email);
        }
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
            setSaveMessage('Đã lưu thay đổi thành công!');
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (err: any) {
            setSaveMessage(err.message || 'Không thể lưu thay đổi');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    <span className="text-lg text-muted-foreground">Đang tải hồ sơ...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg"
                    >
                        Thử lại
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
    };

    return (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-accent/20">
            <div className="max-w-[1400px] mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                        Hồ Sơ Cá Nhân
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý thông tin cá nhân và theo dõi tiến độ học tập của bạn
                    </p>
                </div>

                {/* Main Layout - 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                    {/* Left Column - Profile Form */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 to-teal-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                        {displayProfile.fullName?.charAt(0)?.toUpperCase() || displayProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-violet-50 transition-colors border border-border">
                                        <Camera className="w-4 h-4 text-violet-600" />
                                    </button>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">{displayProfile.fullName || displayProfile.username}</h2>
                                    <p className="text-muted-foreground">@{displayProfile.username}</p>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mt-2">
                                        <CheckCircle className="w-3 h-3" />
                                        Đang hoạt động
                                    </span>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Tên đầy đủ
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName || displayProfile.fullName || ''}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Nhập tên đầy đủ"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        <span className="text-muted-foreground">@</span> Username
                                    </label>
                                    <input
                                        type="text"
                                        value={displayProfile.username}
                                        disabled
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-slate-50 text-muted-foreground cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Username không thể thay đổi</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email || displayProfile.email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Nhập email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Ngày tham gia
                                    </label>
                                    <input
                                        type="text"
                                        value={formatDate(displayProfile.createdAt)}
                                        disabled
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-slate-50 text-muted-foreground cursor-not-allowed"
                                    />
                                </div>

                                {/* Success Message */}
                                {saveMessage && (
                                    <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {saveMessage}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-teal-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5" />
                                        )}
                                        Lưu thay đổi
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border hover:bg-accent transition-all">
                                        <Key className="w-5 h-5" />
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Activity */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-gradient-to-br from-violet-50 to-teal-50 rounded-xl p-6 border border-violet-100">
                            <h3 className="text-lg font-bold mb-4">Thống kê của tôi</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Số giờ học</span>
                                    </div>
                                    <span className="font-bold text-lg text-violet-600">{stats?.learningHours || 0}h</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Skills hoàn thành</span>
                                    </div>
                                    <span className="font-bold text-lg text-teal-600">{stats?.skillsCompleted || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                            <Flame className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Streak days</span>
                                    </div>
                                    <span className="font-bold text-lg text-orange-600">{stats?.streakDays || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Bài viết forum</span>
                                    </div>
                                    <span className="font-bold text-lg text-blue-600">{stats?.forumPosts || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <h3 className="text-lg font-bold mb-4">Số dư tài khoản</h3>
                            <div className="text-center py-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Wallet className="w-8 h-8 text-violet-600" />
                                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                                        {formatCurrency(displayProfile.balance)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Số dư hiện tại</p>
                                <button
                                    onClick={() => navigate('/purchase')}
                                    className="w-full bg-gradient-to-r from-violet-600 to-teal-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Wallet className="w-5 h-5" />
                                    Nạp tiền
                                </button>
                            </div>
                        </div>

                        {/* Activity History */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <h3 className="text-lg font-bold mb-4">Lịch sử hoạt động</h3>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {activities.map((activity) => {
                                    const Icon = ACTIVITY_ICONS[activity.type] || CheckCircle;
                                    const colorClass = ACTIVITY_COLORS[activity.type] || 'text-gray-500 bg-gray-50';

                                    return (
                                        <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground truncate">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">{formatDateTime(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
