// Referral Module - Infrastructure Gateway

import { httpClient } from '@/shared/infrastructure/HttpClient';
import { ReferralGateway } from '../domain/ports/ReferralGateway';
import { ApplyReferralResult, ReferralStats } from '../domain/entities/Referral';

export class ReferralHttpGateway implements ReferralGateway {
    async applyCode(code: string): Promise<ApplyReferralResult> {
        try {
            // Note: The backend application logic returns { success, message, coins_awarded } natively.
            // If it succeeds with a 200 OK, it returns ApplyReferralResult.
            const response = await httpClient.post<ApplyReferralResult>('/referral/apply', { code });
            return response;
        } catch (error: any) {
            // Bắt lỗi HTTP từ httpClient (thường throw Error với message bên trong)
            return {
                success: false,
                message: error.message || 'Có lỗi xảy ra khi áp dụng mã.',
                coins_awarded: 0
            };
        }
    }

    async getStats(): Promise<ReferralStats> {
        return await httpClient.get<ReferralStats>('/referral/stats');
    }

    async getMyCode(): Promise<string> {
        const response = await httpClient.get<{ code: string }>('/referral/my-code');
        return response.code;
    }
}

// Export singleton instance
export const referralGateway = new ReferralHttpGateway();
