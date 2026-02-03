export interface CoinsBalance {
    current_coins: number;
    lifetime_earned: number;
    lifetime_spent: number;
}

export interface Transaction {
    id: string;
    amount: number;
    balance_after: number;
    transaction_type: string;
    service_type?: string;
    description?: string;
    created_at: string;
}

export enum MissionType {
    PURCHASE_PLAN = 'purchase_plan',
    AI_CHAT = 'ai_chat',
    UPDATE_PROFILE = 'update_profile',
    WELCOME = 'welcome',
    REFERRAL = 'referral'
}

export interface Mission {
    id: string;
    name: string;
    description?: string;
    mission_type: string;
    coin_reward: number;
    is_repeatable: boolean;
    icon?: string;
    requirements?: any;
}

export interface UserMission {
    mission_id: string;
    status: string;
    progress: any;
    completed_at?: string;
    coins_earned: number;
}
