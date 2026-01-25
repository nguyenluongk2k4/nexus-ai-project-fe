// Purchase API Gateway (Infrastructure Adapter)
// Connects to real Backend API with SePay integration

import { PurchaseGateway } from '../domain/ports/PurchaseGateway';
import { PurchaseHistory, QRPaymentInfo } from '../domain/entities/PurchaseEntities';

import { API_BASE_URL } from "@/config/api";

const API_BASE = API_BASE_URL;

export class PurchaseApiGateway implements PurchaseGateway {
    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async createPaymentQR(amount: number): Promise<QRPaymentInfo> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_BASE}/api/purchase/create`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Không thể tạo giao dịch');
        }

        const data = await response.json();

        return {
            qrDataUrl: data.qr_url,
            bankName: data.bank_name,
            accountNumber: data.account_number,
            accountName: data.account_name,
            transferContent: data.transaction_code,
            amount: data.amount,
            expiresAt: data.expires_at,
        };
    }

    async getPurchaseHistory(): Promise<PurchaseHistory[]> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_BASE}/api/purchase/history`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể tải lịch sử giao dịch');
        }

        const data = await response.json();

        return data.map((item: any) => ({
            id: item.id,
            amount: item.amount,
            status: item.status,
            transactionCode: item.transaction_code,
            createdAt: item.created_at,
            completedAt: item.completed_at,
        }));
    }

    async checkPaymentStatus(transactionCode: string): Promise<'pending' | 'completed' | 'failed' | 'expired'> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_BASE}/api/purchase/status/${transactionCode}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể kiểm tra trạng thái');
        }

        const data = await response.json();
        return data.status;
    }

    async getBalance(): Promise<number> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_BASE}/api/purchase/balance`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể tải số dư');
        }

        const data = await response.json();
        return data.balance;
    }

    async resumePendingTransaction(transactionCode: string): Promise<QRPaymentInfo> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_BASE}/api/purchase/resume/${transactionCode}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Không thể tiếp tục giao dịch');
        }

        const data = await response.json();

        return {
            qrDataUrl: data.qr_url,
            bankName: data.bank_name,
            accountNumber: data.account_number,
            accountName: data.account_name,
            transferContent: data.transaction_code,
            amount: data.amount,
            expiresAt: data.expires_at,
        };
    }
}
