import { coinsStore } from '@/modules/coins/domain/services/CoinsStore';

export class NotificationGateway {
    private socket: WebSocket | null = null;
    private userId: string | null = null;

    connect(userId: string) {
        if (this.socket) return;
        this.userId = userId;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiHost = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
        // Use port 8001/8002 depending on local vs container, for now let's assume 8002 as per design
        const host = apiHost.split(':')[0] + ':8002';
        const token = localStorage.getItem('token');

        this.socket = new WebSocket(`${protocol}//${host}/ws/notifications?token=${token}`);

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
            setTimeout(() => this.connect(userId), 5000);
        };

        this.socket.onerror = (error) => {
            console.error('❌ [Notification] socket error:', error);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const notificationGateway = new NotificationGateway();
