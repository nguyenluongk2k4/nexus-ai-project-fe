// Profile API Gateway (Infrastructure Adapter)
// Connects to real Backend API

import { ProfileGateway } from '../domain/ports/ProfileGateway';
import { UserProfile, ProfileStats, ActivityItem, UpdateProfileRequest } from '../domain/entities/ProfileEntities';

const API_BASE = 'http://localhost:8000';

export class ProfileApiGateway implements ProfileGateway {
    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async getProfile(): Promise<UserProfile> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_BASE}/api/profile/me`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể tải thông tin hồ sơ');
        }

        const data = await response.json();

        // Map backend response to frontend entity
        return {
            id: data.id,
            email: data.email,
            username: data.username,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            lastLoginAt: data.last_login_at,
            isActive: data.is_active,
            balance: data.balance || 0,
        };
    }

    async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
        const response = await fetch(`${API_BASE}/api/profile/me`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({
                full_name: data.fullName,
                email: data.email,
                avatar_url: data.avatarUrl,
            }),
        });

        if (!response.ok) {
            throw new Error('Không thể cập nhật hồ sơ');
        }

        return this.getProfile(); // Refetch to get updated data
    }

    async getStats(): Promise<ProfileStats> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_BASE}/api/profile/stats`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể tải thống kê');
        }

        const data = await response.json();

        // Map snake_case to camelCase
        return {
            learningHours: data.learning_hours || 0,
            skillsCompleted: data.skills_completed || 0,
            streakDays: data.streak_days || 0,
            forumPosts: data.forum_posts || 0,
        };
    }

    async getActivityHistory(): Promise<ActivityItem[]> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_BASE}/api/profile/activities`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể tải lịch sử hoạt động');
        }

        const data = await response.json();

        // Map backend response to frontend entities
        return data.map((item: any) => ({
            id: item.id,
            type: item.type,
            description: item.description,
            timestamp: item.timestamp,
        }));
    }
}
