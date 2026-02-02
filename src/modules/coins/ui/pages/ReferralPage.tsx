import React, { useEffect, useState } from 'react';
import { Copy, Share2, Users, Trophy } from 'lucide-react';
import { CoinsApiGateway } from '../../infrastructure/CoinsApiGateway';
import { toast } from 'sonner';

const gateway = new CoinsApiGateway();

export const ReferralPage: React.FC = () => {
    const [referralCode, setReferralCode] = useState<string>('');
    const [stats, setStats] = useState({ total_referrals: 0, total_earned: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [code, referralStats] = await Promise.all([
                    gateway.getReferralCode(),
                    gateway.getReferralStats()
                ]);
                setReferralCode(code);
                setStats(referralStats);
            } catch (error) {
                console.error('Failed to fetch referral data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        toast.success('Đã sao chép mã giới thiệu!');
    };

    if (isLoading) return <div className="p-8 text-center">Loading referral data...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Giới thiệu bạn bè</h1>
                <p className="text-gray-400 mt-2">Chia sẻ NexusAI với bạn bè và nhận phần thưởng xu hấp dẫn.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <h2 className="text-lg font-semibold mb-4 text-gray-300">Mã giới thiệu của bạn</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/50 border border-slate-700 px-4 py-3 rounded-xl font-mono text-2xl tracking-wider text-yellow-500 text-center uppercase">
                                {referralCode || 'NEXUS-XXXX'}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <Copy className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <h2 className="text-lg font-semibold mb-6 text-gray-300">Cách thức hoạt động</h2>
                        <div className="space-y-4">
                            {[
                                { step: 1, text: "Gửi mã giới thiệu cho bạn bè." },
                                { step: 2, text: "Bạn bè nhập mã khi đăng ký tài khoản." },
                                { step: 3, text: "Cả hai đều nhận được phần thưởng xu ngay lập tức!" }
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold flex-shrink-0">
                                        {item.step}
                                    </div>
                                    <p className="text-gray-400 text-sm leading-6">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
                            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.total_referrals}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Bạn bè</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
                            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-yellow-500">+{stats.total_earned}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Xu nhận được</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl">
                        <h2 className="text-xl font-bold mb-2 text-white">Phần thưởng giới thiệu</h2>
                        <ul className="space-y-3 mt-4">
                            <li className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                <span>Bạn bè đăng ký mới</span>
                                <span className="font-bold">+50 Xu</span>
                            </li>
                            <li className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                <span>Bạn bè mua gói lần đầu</span>
                                <span className="font-bold">+100 Xu</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span>Bạn bè nhận được</span>
                                <span className="font-bold">+10 Xu</span>
                            </li>
                        </ul>
                        <button className="w-full mt-6 py-3 bg-white text-violet-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                            <Share2 className="w-5 h-5" /> Chia sẻ ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
