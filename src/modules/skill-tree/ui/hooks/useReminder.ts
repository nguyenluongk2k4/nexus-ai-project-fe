import { useEffect, useState, useCallback, useRef } from 'react';
import { TimelineItem } from '@/modules/skill-tree/domain/types/learning';
import { toast } from 'sonner';

interface ReminderNotification {
    id: string;
    item: TimelineItem;
    minutesUntil: number;
}

export function useReminder(timelineItems: TimelineItem[], enabled: boolean = true) {
    const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    
    // Store IDs of items that have already been notified in this session to prevent spam
    const notifiedItemsRef = useRef<Set<string>>(new Set());

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
        if (!enabled) return;

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

            // Notify 15 minutes before (range 14-15 mins) to catch it once
            if (diffMinutes > 0 && diffMinutes <= 15 && diffMinutes >= 14) {
                // Check if already notified
                if (notifiedItemsRef.current.has(item.id)) return;
                
                // Add to notified set
                notifiedItemsRef.current.add(item.id);

                reminders.push({
                    id: item.id,
                    item,
                    minutesUntil: diffMinutes,
                });

                // 1. In-App Toast Notification (Sonner)
                toast.info(`Sắp đến giờ học: ${item.resourceName}`, {
                    description: `Bắt đầu lúc ${item.scheduledTime} (Còn ${diffMinutes} phút)`,
                    action: {
                        label: 'Chi tiết',
                        onClick: () => console.log('View details', item.id),
                    },
                    duration: 10000, // Show for 10 seconds
                });

                // 2. Browser Notification (Background)
                if (permission === 'granted') {
                    new Notification('🔔 Thời gian học sắp tới!', {
                        body: `${item.resourceName} - ${item.scheduledTime}\nCòn ${diffMinutes} phút nữa`,
                        icon: '/favicon.ico',
                        tag: item.id,
                        requireInteraction: true,
                    });
                }
            }
        });

        if (reminders.length > 0) {
            setNotifications(prev => [...prev, ...reminders]);
        }
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
