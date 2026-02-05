import { coinsStore } from '@/modules/coins/domain/services/CoinsStore';
import { BehaviorSubject, Observable } from 'rxjs';
import { apiConfig } from '@/shared/config/api.config';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export class NotificationGateway {
    private socket: WebSocket | null = null;
    private userId: string | null = null;
    private statusSubject = new BehaviorSubject<ConnectionStatus>('disconnected');

    get status$(): Observable<ConnectionStatus> {
        return this.statusSubject.asObservable();
    }

    connect(userId: string) {
        if (this.socket || this.statusSubject.value === 'connecting') return;
        this.userId = userId;
        this.statusSubject.next('connecting');

        // TEMPORARY: Connect directly to notification service on port 8002
        // TODO: Route through nginx in production
        const wsUrl = window.location.hostname === 'localhost'
            ? 'ws://localhost:8002/ws/notifications'
            : apiConfig.getWsUrl('/ws/notifications');
        const token = localStorage.getItem('token');

        try {
            this.socket = new WebSocket(`${wsUrl}?token=${token}`);

            this.socket.onopen = () => {
                console.log('✅ [Notification] connected');
                this.statusSubject.next('connected');
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('🔔 [Notification] received:', data);

                    if (data.type === 'balance_update') {
                        coinsStore.setBalance(data.current_coins);
                    }
                } catch (error) {
                    console.error('❌ Failed to parse notification:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('🔌 [Notification] socket closed. Reconnecting in 5s...');
                this.socket = null;
                this.statusSubject.next('disconnected');
                setTimeout(() => {
                    if (this.userId) this.connect(this.userId);
                }, 5000);
            };

            this.socket.onerror = (error) => {
                console.error('❌ [Notification] socket error:', error);
                this.statusSubject.next('disconnected');
            };
        } catch (error) {
            console.error('❌ Failed to create WebSocket:', error);
            this.statusSubject.next('disconnected');
        }
    }

    disconnect() {
        this.userId = null;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.statusSubject.next('disconnected');
    }
}

export const notificationGateway = new NotificationGateway();
