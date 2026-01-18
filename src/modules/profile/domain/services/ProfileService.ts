// Profile Domain Service

import { ProfileGateway } from '../ports/ProfileGateway';
import { UserProfile, ProfileStats, ActivityItem, UpdateProfileRequest } from '../entities/ProfileEntities';

export class ProfileService {
    constructor(private gateway: ProfileGateway) { }

    async getProfile(): Promise<UserProfile> {
        return this.gateway.getProfile();
    }

    async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
        // Validate before sending
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error('Email không hợp lệ');
        }
        if (data.fullName && data.fullName.trim().length < 2) {
            throw new Error('Tên đầy đủ phải có ít nhất 2 ký tự');
        }
        return this.gateway.updateProfile(data);
    }

    async getStats(): Promise<ProfileStats> {
        return this.gateway.getStats();
    }

    async getActivityHistory(): Promise<ActivityItem[]> {
        return this.gateway.getActivityHistory();
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
