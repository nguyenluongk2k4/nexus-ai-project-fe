/**
 * HTTP Gateway for Learning/Timeline - calls backend API
 */

import { LearningGateway } from '../../domain/ports/LearningGateway';
import {
    LearningProgress,
    LearningReminder,
    TimelineItem,
    StudySession,
    DailyGoal,
} from '../../domain/entities/LearningEntities';

import { apiConfig } from "@/shared/config/api.config";

const API_TIMELINE_URL = apiConfig.getHttpUrl('/timeline');

export class HttpLearningGateway implements LearningGateway {
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

    // Timeline - loaded from API
    async loadTimeline(): Promise<TimelineItem[]> {
        try {
            const response = await fetch(`${API_TIMELINE_URL}`, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.warn('Failed to load timeline from API, using empty array');
                return [];
            }

            const data = await response.json();

            // Transform API response to TimelineItem format
            return data.items.map((item: any) => ({
                id: item.id,
                resourceId: item.resourceId,
                resourceName: item.resourceName,
                nodeId: '', // Not tracked in DB
                nodeName: item.nodeName,
                scheduledDate: new Date(item.scheduledDate),
                scheduledTime: item.scheduledTime,
                deadline: item.deadline ? new Date(item.deadline) : undefined,
                status: item.status as 'not_started' | 'in_progress' | 'completed',
                priority: item.priority as 'low' | 'medium' | 'high',
                estimatedTime: item.estimatedTime ? `${item.estimatedTime} phút` : undefined,
            }));
        } catch (error) {
            console.error('Error loading timeline:', error);
            return [];
        }
    }

    async saveTimeline(_data: TimelineItem[]): Promise<void> {
        // Individual updates are handled via specific API calls
        // This method is called by context but we don't need bulk save
        console.log('Timeline auto-save disabled - using individual API calls');
    }

    // Progress - still use localStorage for now (can be migrated later)
    async loadProgress(): Promise<LearningProgress[]> {
        const stored = localStorage.getItem('learning_progress');
        if (!stored) return [];
        try {
            const parsed = JSON.parse(stored);
            return parsed.map((p: any) => ({
                ...p,
                startedAt: p.startedAt ? new Date(p.startedAt) : undefined,
                completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
                lastAccessedAt: p.lastAccessedAt ? new Date(p.lastAccessedAt) : undefined,
            }));
        } catch {
            return [];
        }
    }

    async saveProgress(data: LearningProgress[]): Promise<void> {
        localStorage.setItem('learning_progress', JSON.stringify(data));
    }

    // Reminders - localStorage for now
    async loadReminders(): Promise<LearningReminder[]> {
        const stored = localStorage.getItem('learning_reminders');
        if (!stored) return [];
        try {
            const parsed = JSON.parse(stored);
            return parsed.map((r: any) => ({
                ...r,
                scheduledTime: new Date(r.scheduledTime),
            }));
        } catch {
            return [];
        }
    }

    async saveReminders(data: LearningReminder[]): Promise<void> {
        localStorage.setItem('learning_reminders', JSON.stringify(data));
    }

    // Sessions - localStorage for now
    async loadSessions(): Promise<StudySession[]> {
        const stored = localStorage.getItem('study_sessions');
        if (!stored) return [];
        try {
            const parsed = JSON.parse(stored);
            return parsed.map((s: any) => ({
                ...s,
                startTime: new Date(s.startTime),
                endTime: s.endTime ? new Date(s.endTime) : undefined,
            }));
        } catch {
            return [];
        }
    }

    async saveSessions(data: StudySession[]): Promise<void> {
        localStorage.setItem('study_sessions', JSON.stringify(data));
    }

    // Goals - localStorage for now
    async loadGoals(): Promise<DailyGoal[]> {
        const stored = localStorage.getItem('daily_goals');
        if (!stored) return [];
        try {
            const parsed = JSON.parse(stored);
            return parsed.map((g: any) => ({
                ...g,
                date: new Date(g.date),
            }));
        } catch {
            return [];
        }
    }

    async saveGoals(data: DailyGoal[]): Promise<void> {
        localStorage.setItem('daily_goals', JSON.stringify(data));
    }

    // Additional API methods for timeline operations
    async addTimelineItem(item: {
        resourceId: string;
        scheduledDate: string;
        deadline?: string;
        priority: string;
    }): Promise<TimelineItem | null> {
        try {
            const response = await fetch(`${API_TIMELINE_URL}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(item),
            });

            if (!response.ok) {
                throw new Error('Failed to add timeline item');
            }

            const data = await response.json();
            return {
                id: data.id,
                resourceId: data.resourceId,
                resourceName: data.resourceName,
                nodeId: '',
                nodeName: data.nodeName,
                scheduledDate: new Date(data.scheduledDate),
                deadline: data.deadline ? new Date(data.deadline) : undefined,
                status: data.status,
                priority: data.priority,
                estimatedTime: data.estimatedTime ? `${data.estimatedTime} phút` : undefined,
            };
        } catch (error) {
            console.error('Error adding timeline item:', error);
            return null;
        }
    }

    async updateTimelineItem(
        itemId: string,
        updates: { scheduledDate?: string; deadline?: string; priority?: string; status?: string }
    ): Promise<boolean> {
        try {
            const response = await fetch(`${API_TIMELINE_URL}/${itemId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updates),
            });

            return response.ok;
        } catch (error) {
            console.error('Error updating timeline item:', error);
            return false;
        }
    }

    async deleteTimelineItem(itemId: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_TIMELINE_URL}/${itemId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            return response.ok;
        } catch (error) {
            console.error('Error deleting timeline item:', error);
            return false;
        }
    }

    async getAvailableResources(): Promise<any[]> {
        try {
            const response = await fetch(`${API_TIMELINE_URL}/resources`, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching resources:', error);
            return [];
        }
    }
}
