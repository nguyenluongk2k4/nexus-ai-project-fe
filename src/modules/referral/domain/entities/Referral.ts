// Referral Module - Domain Entities

export interface ReferralHistoryItem {
    referee_id: string;
    status: string;
    date: string;
}

export interface ReferralStats {
    my_code: string;
    total_invited: number;
    total_earned: number;
    referred_by_code?: string;
    history: ReferralHistoryItem[];
}

export interface ApplyReferralResult {
    success: boolean;
    message: string;
    coins_awarded: number;
}
