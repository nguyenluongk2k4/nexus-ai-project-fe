// Purchase Domain Service

import { PurchaseGateway } from '../ports/PurchaseGateway';
import { PurchaseHistory, QRPaymentInfo, PRESET_AMOUNTS } from '../entities/PurchaseEntities';

export class PurchaseService {
    constructor(private gateway: PurchaseGateway) { }

    async createPaymentQR(amount: number): Promise<QRPaymentInfo> {
        // Validate amount
        if (amount < 10000) {
            throw new Error('Số tiền nạp tối thiểu là 10,000 VNĐ');
        }
        if (amount > 10000000) {
            throw new Error('Số tiền nạp tối đa là 10,000,000 VNĐ');
        }
        return this.gateway.createPaymentQR(amount);
    }

    async getPurchaseHistory(): Promise<PurchaseHistory[]> {
        return this.gateway.getPurchaseHistory();
    }

    async checkPaymentStatus(transactionCode: string): Promise<'pending' | 'completed' | 'failed' | 'expired'> {
        return this.gateway.checkPaymentStatus(transactionCode);
    }

    getPresetAmounts() {
        return PRESET_AMOUNTS;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    async resumePendingTransaction(transactionCode: string): Promise<QRPaymentInfo> {
        return this.gateway.resumePendingTransaction(transactionCode);
    }
}
