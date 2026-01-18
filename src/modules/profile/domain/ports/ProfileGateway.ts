// Profile Gateway Port (Interface)

import { UserProfile, ProfileStats, ActivityItem, UpdateProfileRequest } from '../entities/ProfileEntities';

export interface ProfileGateway {
    getProfile(): Promise<UserProfile>;
    updateProfile(data: UpdateProfileRequest): Promise<UserProfile>;
    getStats(): Promise<ProfileStats>;
    getActivityHistory(): Promise<ActivityItem[]>;
}
