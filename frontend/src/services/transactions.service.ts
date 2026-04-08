import { API_BASE_URL } from "@/lib/config";

export interface Transaction {
    id: number;
    amount: number;
    paymentMethod: string;
    orderType: string;
    items: any[];
    subtotal: number;
    tax: number;
    cashierName?: string;
    createdAt: string;
    member?: {
        name: string;
    };
}

export const transactionsService = {
    async findAll(): Promise<Transaction[]> {
        const res = await fetch(`${API_BASE_URL}/transactions`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },

    async getRecent(limit: number = 10): Promise<Transaction[]> {
        const res = await fetch(`${API_BASE_URL}/transactions/recent?limit=${limit}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch recent transactions');
        return res.json();
    },

    async getFinancialReport(startDate: string, endDate: string) {
        const res = await fetch(`${API_BASE_URL}/transactions/report?startDate=${startDate}&endDate=${endDate}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch financial report');
        return res.json();
    },

    async getStats() {
        const res = await fetch(`${API_BASE_URL}/transactions/stats`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    async checkout(checkoutData: any) {
        const res = await fetch(`${API_BASE_URL}/transactions/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Checkout failed');
        }
        return res.json();
    },

    async confirmCheckout(orderId: number) {
        const res = await fetch(`${API_BASE_URL}/transactions/checkout/${orderId}/confirm`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Payment confirmation failed');
        }
        return res.json();
    }
};
