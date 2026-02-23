// Referral Module - Domain Ports

import { ApplyReferralResult, ReferralStats } from '../entities/Referral';

export interface ReferralGateway {
    /** Gửi mã giới thiệu để nhận thưởng */
    applyCode(code: string): Promise<ApplyReferralResult>;

    /** Lấy thông tin thống kê giới thiệu của bản thân */
    getStats(): Promise<ReferralStats>;

    /** Lấy nhanh mã giới thiệu của mình */
    getMyCode(): Promise<string>;
}
