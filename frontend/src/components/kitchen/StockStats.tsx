"use client";

import { ClipboardList, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const icons = {
    list: ClipboardList,
    check: CheckCircle,
    alert: AlertTriangle,
    error: XCircle,
};

const colors = {
    blue: 'bg-blue-100 text-blue-500',
    green: 'bg-emerald-100 text-emerald-500',
    orange: 'bg-orange-100 text-orange-500',
    red: 'bg-red-100 text-red-500',
};

interface Stat {
    label: string;
    value: number;
    icon: string;
    color: string;
}

export default function StockStats() {
    const [stats, setStats] = useState<Stat[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3001/products/stats');
                const data = await response.json();
                setStats(data.summary || []);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
        // Refresh stats periodically or based on an event system could be better, 
        // but for now, we'll fetch on mount.
    }, []);

    if (stats.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
                const Icon = icons[stat.icon as keyof typeof icons];
                return (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                        <div className={`p-4 rounded-xl ${colors[stat.color as keyof typeof colors]}`}>
                            <Icon size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
