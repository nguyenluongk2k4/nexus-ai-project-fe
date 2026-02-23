// Referral Module - Application Use Cases

import { ReferralGateway } from '../domain/ports/ReferralGateway';
import { ReferralService } from '../domain/services/ReferralService';
import { ApplyReferralResult, ReferralStats } from '../domain/entities/Referral';

export class ApplyReferralUseCase {
    constructor(private gateway: ReferralGateway) { }

    async execute(code: string): Promise<ApplyReferralResult> {
        // 1. Client-side Validation (Business rules via Domain Service)
        const errorMsg = ReferralService.validateCode(code);
        if (errorMsg) {
            return { success: false, message: errorMsg, coins_awarded: 0 };
        }

        // 2. Call API Gateway
        return await this.gateway.applyCode(code.trim().toUpperCase());
    }
}

export class GetReferralStatsUseCase {
    constructor(private gateway: ReferralGateway) { }

    async execute(): Promise<ReferralStats> {
        return await this.gateway.getStats();
    }
}

// Export singleton instance mapped with specific gateway
import { referralGateway } from '../infrastructure/ReferralHttpGateway';
export const applyReferralUseCase = new ApplyReferralUseCase(referralGateway);
export const getReferralStatsUseCase = new GetReferralStatsUseCase(referralGateway);
