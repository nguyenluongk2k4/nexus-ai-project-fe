import React, { useEffect, useState } from 'react';
import { Copy, Share2, Users, Trophy, Gift, CheckCircle, XCircle, Loader2, Link } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '@/shared/infrastructure/HttpClient';

interface ReferralStats {
    my_code: string;
    total_invited: number;
    total_earned: number;
    history: { referee_id: string; status: string; date: string }[];
}

export const ReferralPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [inputCode, setInputCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyResult, setApplyResult] = useState<{ success: boolean; message: string } | null>(null);

    // Auto-fill từ URL ?ref=CODE
    useEffect(() => {
        const refFromUrl = searchParams.get('ref');
        if (refFromUrl) {
            setInputCode(refFromUrl.toUpperCase());
            toast.info(`Đã điền mã giới thiệu từ liên kết: ${refFromUrl.toUpperCase()}`);
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
        toast.success('Đã sao chép mã giới thiệu!');
    };

    const copyLink = () => {
        if (!stats?.my_code) return;
        const link = `${window.location.origin}/register?ref=${stats.my_code}`;
        navigator.clipboard.writeText(link);
        toast.success('Đã sao chép link mời!');
    };

    const handleApplyCode = async () => {
        const code = inputCode.trim().toUpperCase();
        if (!code || code.length < 6) {
            toast.error('Mã giới thiệu phải có ít nhất 6 ký tự.');
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
            } else {
                toast.error(result.message);
            }
        } catch (err: any) {
            const msg = err.message || 'Có lỗi xảy ra.';
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Giới thiệu bạn bè</h1>
                <p className="text-gray-500 mt-2">Chia sẻ NexusAI với bạn bè và nhận phần thưởng xu hấp dẫn.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* CỘT TRÁI */}
                <div className="space-y-6">
                    {/* Mã giới thiệu của bạn */}
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Mã giới thiệu của bạn</h2>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-mono text-2xl tracking-widest text-yellow-600 text-center uppercase font-bold">
                                {referralCode || '••••••••'}
                            </div>
                            <button
                                onClick={copyCode}
                                className="p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-600"
                                title="Sao chép mã"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={copyLink}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 rounded-xl text-sm transition-colors font-medium"
                        >
                            <Link className="w-4 h-4" />
                            Sao chép link mời
                        </button>
                    </div>

                    {/* Nhập mã của người khác */}
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-2 text-gray-700">Nhập mã của bạn bè</h2>
                        <p className="text-xs text-gray-400 mb-4">Nhập mã giới thiệu để cả hai nhận xu thưởng.</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                placeholder="VD: NEX8VXQK"
                                maxLength={10}
                                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl font-mono tracking-widest text-sm focus:outline-none focus:border-violet-400 placeholder-gray-300"
                            />
                            <button
                                onClick={handleApplyCode}
                                disabled={isApplying || !inputCode.trim()}
                                className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                            >
                                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                                Áp dụng
                            </button>
                        </div>
                        {applyResult && (
                            <div className={`flex items-center gap-2 mt-3 text-sm ${applyResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                {applyResult.success
                                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                    : <XCircle className="w-4 h-4 flex-shrink-0" />}
                                {applyResult.message}
                            </div>
                        )}
                    </div>

                    {/* Cách thức hoạt động */}
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Cách thức hoạt động</h2>
                        <div className="space-y-4">
                            {[
                                { step: 1, text: 'Chia sẻ mã hoặc link mời cho bạn bè.' },
                                { step: 2, text: 'Bạn bè đăng ký và nhập mã của bạn.' },
                                { step: 3, text: 'Cả hai nhận xu thưởng ngay lập tức!' },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                                        {item.step}
                                    </div>
                                    <p className="text-gray-500 text-sm leading-6">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI */}
                <div className="space-y-6">
                    {/* Thống kê */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl text-center shadow-sm">
                            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{stats?.total_invited ?? 0}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Bạn bè</div>
                        </div>
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl text-center shadow-sm">
                            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-yellow-500">+{stats?.total_earned ?? 0}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Xu nhận được</div>
                        </div>
                    </div>

                    {/* Bảng phần thưởng */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl">
                        <h2 className="text-xl font-bold mb-2 text-white">Phần thưởng giới thiệu</h2>
                        <ul className="space-y-3 mt-4">
                            <li className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                <span>Người giới thiệu</span>
                                <span className="font-bold">+500 Xu</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span>Người được mời</span>
                                <span className="font-bold">+500 Xu</span>
                            </li>
                        </ul>
                        <button
                            onClick={copyLink}
                            className="w-full mt-6 py-3 bg-white text-violet-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                        >
                            <Share2 className="w-5 h-5" /> Chia sẻ ngay
                        </button>
                    </div>

                    {/* Lịch sử mời */}
                    {stats?.history && stats.history.length > 0 && (
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 text-gray-700">Lịch sử giới thiệu</h2>
                            <div className="space-y-3">
                                {stats.history.slice(0, 5).map((h, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-400 font-mono text-xs truncate w-40">{h.referee_id.slice(0, 12)}…</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${h.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {h.status === 'completed' ? 'Hoàn thành' : 'Đang chờ'}
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
