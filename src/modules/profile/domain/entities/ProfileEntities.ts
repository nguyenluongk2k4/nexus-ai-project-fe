// Profile Domain Entities

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
    isActive: boolean;
    balance: number; // VND
}

export interface ProfileStats {
    learningHours: number;
    skillsCompleted: number;
    streakDays: number;
    forumPosts: number;
}

export interface ActivityItem {
    id: string;
    type: 'login' | 'skill_complete' | 'purchase' | 'forum_post' | 'learning';
    description: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface UpdateProfileRequest {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
}
