// Referral Module - Domain Service

export class ReferralService {
    /**
     * Validate mã giới thiệu ngay tại Client (Tiết kiệm gọi API)
     */
    static validateCode(code: string): string | null {
        const trimmed = code.trim();
        if (!trimmed) {
            return "Vui lòng nhập mã giới thiệu.";
        }

        // Yêu cầu Backend là 6-8 ký tự alphanumeric
        if (trimmed.length < 6 || trimmed.length > 8) {
            return "Mã giới thiệu phải có từ 6 đến 8 ký tự.";
        }

        // Nếu pass hết
        return null;
    }
}
