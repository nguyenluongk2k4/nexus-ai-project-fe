import { CoinsGateway } from '../domain/ports/CoinsGateway';
import { apiConfig } from '../../../shared/config/api.config';

export class CoinsApiGateway implements CoinsGateway {
    private async fetch(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        const url = apiConfig.getHttpUrl(endpoint);

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Coins API error: ${response.statusText}`);
        }

        return response.json();
    }

    async getBalance() {
        return this.fetch('/coins/balance');
    }

    async getTransactions(limit = 20, offset = 0) {
        return this.fetch(`/coins/transactions?limit=${limit}&offset=${offset}`);
    }

    async getAvailableMissions() {
        return this.fetch('/coins/missions');
    }

    async getUserMissions() {
        return this.fetch('/coins/missions/my-progress');
    }

    async getReferralCode() {
        const res = await this.fetch('/coins/referrals/my-code');
        return res.referral_code;
    }

    async getReferralStats() {
        return this.fetch('/coins/referrals/stats');
    }

    async claimMissionReward(missionId: string) {
        return this.fetch(`/coins/missions/${missionId}/claim`, {
            method: 'POST'
        });
    }
}
