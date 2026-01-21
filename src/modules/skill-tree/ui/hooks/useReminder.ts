import { useEffect, useState, useCallback } from 'react';
import { TimelineItem } from '@/modules/skill-tree/domain/types/learning';

interface ReminderNotification {
    id: string;
    item: TimelineItem;
    minutesUntil: number;
}

export function useReminder(timelineItems: TimelineItem[], enabled: boolean = true) {
    const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);

            if (Notification.permission === 'default') {
                Notification.requestPermission().then(setPermission);
            }
        }
    }, []);

    // Check for upcoming items
    const checkUpcomingItems = useCallback(() => {
        if (!enabled || permission !== 'granted') return;

        const now = new Date();
        const reminders: ReminderNotification[] = [];

        timelineItems.forEach(item => {
            if (item.status === 'completed' || !item.scheduledDate || !item.scheduledTime) return;

            // Parse scheduled datetime
            const [hours, minutes] = item.scheduledTime.split(':').map(Number);
            const scheduledDateTime = new Date(item.scheduledDate);
            scheduledDateTime.setHours(hours, minutes, 0, 0);

            // Calculate minutes until scheduled time
            const diffMs = scheduledDateTime.getTime() - now.getTime();
            const diffMinutes = Math.floor(diffMs / 60000);

            // Notify 15 minutes before
            if (diffMinutes > 0 && diffMinutes <= 15 && diffMinutes >= 14) {
                reminders.push({
                    id: item.id,
                    item,
                    minutesUntil: diffMinutes,
                });

                // Show browser notification
                new Notification('🔔 Thời gian học sắp tới!', {
                    body: `${item.resourceName} - ${item.scheduledTime}\nCòn ${diffMinutes} phút nữa`,
                    icon: '/favicon.ico',
                    tag: item.id,
                    requireInteraction: true,
                });
            }
        });

        setNotifications(reminders);
    }, [timelineItems, enabled, permission]);

    // Check every minute
    useEffect(() => {
        if (!enabled) return;

        checkUpcomingItems();
        const interval = setInterval(checkUpcomingItems, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [checkUpcomingItems, enabled]);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            return perm === 'granted';
        }
        return false;
    };

    return {
        notifications,
        permission,
        requestPermission,
    };
}
