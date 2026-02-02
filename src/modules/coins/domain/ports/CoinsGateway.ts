import { CoinsBalance, Transaction, Mission, UserMission } from '../entities/Coins';

export interface CoinsGateway {
    getBalance(): Promise<CoinsBalance>;
    getTransactions(limit?: number, offset?: number): Promise<Transaction[]>;
    getAvailableMissions(): Promise<Mission[]>;
    getUserMissions(): Promise<UserMission[]>;
    getReferralCode(): Promise<string>;
    getReferralStats(): Promise<{ total_referrals: number; total_earned: number }>;
    claimMissionReward(missionId: string): Promise<any>;
}
