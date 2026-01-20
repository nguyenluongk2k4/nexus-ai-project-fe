// useProfile hook

import { useState, useEffect, useCallback } from 'react';
import { getProfileService } from '../../providers';
import { UserProfile, ProfileStats, ActivityItem, UpdateProfileRequest } from '../../domain/entities/ProfileEntities';

interface UseProfileResult {
    profile: UserProfile | null;
    stats: ProfileStats | null;
    activities: ActivityItem[];
    loading: boolean;
    error: string | null;
    updateProfile: (data: UpdateProfileRequest) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const profileService = getProfileService();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [profileData, statsData, activitiesData] = await Promise.all([
                profileService.getProfile(),
                profileService.getStats(),
                profileService.getActivityHistory(),
            ]);

            setProfile(profileData);
            setStats(statsData);
            setActivities(activitiesData);
        } catch (err: any) {
            setError(err.message || 'Không thể tải dữ liệu hồ sơ');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateProfile = async (data: UpdateProfileRequest) => {
        try {
            setError(null);
            const updatedProfile = await profileService.updateProfile(data);
            setProfile(updatedProfile);
        } catch (err: any) {
            setError(err.message || 'Không thể cập nhật hồ sơ');
            throw err;
        }
    };

    return {
        profile,
        stats,
        activities,
        loading,
        error,
        updateProfile,
        refresh: loadData,
    };
}
