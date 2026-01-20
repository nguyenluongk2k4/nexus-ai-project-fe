// Purchase Domain Entities

export interface PurchaseRequest {
    amount: number;
    transactionCode: string;
}

export interface PurchaseHistory {
    id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    transactionCode: string;
    createdAt: string;
    completedAt: string | null;
}

export interface QRPaymentInfo {
    qrDataUrl: string; // Base64 QR image or URL
    bankName: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
    amount: number;
    expiresAt: string;
}

export type PresetAmount = 50000 | 100000 | 200000 | 500000 | 1000000;

export const PRESET_AMOUNTS: PresetAmount[] = [50000, 100000, 200000, 500000, 1000000];
