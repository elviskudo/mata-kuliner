import { API_BASE_URL } from "@/lib/config";

export interface Member {
    id: number;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    lastVisit: string;
    totalSpent: number;
    points: number;
    status: string;
}

export const membersService = {
    async findAll(search?: string): Promise<Member[]> {
        const url = new URL(`${API_BASE_URL}/members`);
        if (search) url.searchParams.append('search', search);

        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch members');
        return res.json();
    },

    async create(member: Partial<Member>): Promise<Member> {
        const res = await fetch(`${API_BASE_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
        });
        if (!res.ok) throw new Error('Failed to create member');
        return res.json();
    },

    async update(id: number, member: Partial<Member>): Promise<Member> {
        const res = await fetch(`${API_BASE_URL}/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
        });
        if (!res.ok) throw new Error('Failed to update member');
        return res.json();
    },

    async remove(id: number): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/members/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete member');
    },

    async getDashboardStats(startDate: string, endDate: string) {
        // Since backend doesn't have an explicit endpoint for this yet, 
        // we can fetch transactions/report to get some data or just calculate from members list for now
        // For chart data (orders per month), we might need a new endpoint or calculate client-side
        // Let's implement a simple calculation on the component side for now, OR fetch all members and process.
        // BUT user asked for REAL data for charts. 
        // We will add a simple endpoint in members controller backend or reuse existing.
        // Let's assume we update backend to return stats.
        const res = await fetch(`${API_BASE_URL}/members/stats?startDate=${startDate}&endDate=${endDate}`, { cache: 'no-store' });
        if (!res.ok) {
            // Fallback: return empty stats if endpoint invalid or error
            console.warn("Stats endpoint not ready, returning empty");
            return [];
        }
        return res.json();
    }
};
