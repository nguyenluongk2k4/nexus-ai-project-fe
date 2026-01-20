// Purchase Gateway Port (Interface)

import { PurchaseHistory, QRPaymentInfo } from '../entities/PurchaseEntities';

export interface PurchaseGateway {
    createPaymentQR(amount: number): Promise<QRPaymentInfo>;
    getPurchaseHistory(): Promise<PurchaseHistory[]>;
    checkPaymentStatus(transactionCode: string): Promise<'pending' | 'completed' | 'failed' | 'expired'>;
    getBalance(): Promise<number>;
    resumePendingTransaction(transactionCode: string): Promise<QRPaymentInfo>;
}
