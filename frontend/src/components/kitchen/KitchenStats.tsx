"use client";

import { useState, useEffect } from 'react';
import { ClipboardList, CookingPot, CheckCircle, AlertTriangle } from 'lucide-react';
import { KITCHEN_STATS } from '@/lib/data';

export default function KitchenStats() {
    const [stockAlertCount, setStockAlertCount] = useState(0);
    const API_BASE_URL = 'http://localhost:3001';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/stats`);
                const data = await response.json();

                // Count both "Stok Menipis" and "Stok Habis" as alerts
                const lowStockCount = data.summary.find((s: any) => s.label === 'Stok Menipis')?.value || 0;
                const outOfStockCount = data.summary.find((s: any) => s.label === 'Stok Habis')?.value || 0;

                setStockAlertCount(lowStockCount + outOfStockCount);
            } catch (error) {
                console.error("Error fetching stats for KitchenStats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Orders Today */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center space-x-4">
                <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
                    <ClipboardList size={32} />
                </div>
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Orders Today</h3>
                    <p className="text-3xl font-black text-gray-900">{KITCHEN_STATS.ordersToday}</p>
                </div>
            </div>

            {/* Cooking */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center space-x-4">
                <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
                    <CookingPot size={32} />
                </div>
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cooking</h3>
                    <p className="text-3xl font-black text-gray-900">{KITCHEN_STATS.cooking}</p>
                </div>
            </div>

            {/* Completed */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center space-x-4">
                <div className="p-4 bg-green-50 text-green-500 rounded-2xl">
                    <CheckCircle size={32} />
                </div>
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Completed</h3>
                    <p className="text-3xl font-black text-gray-900">{KITCHEN_STATS.completed}</p>
                </div>
            </div>

            {/* Stock Alert */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center space-x-4">
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Stock Alert</h3>
                    <p className="text-3xl font-black text-gray-900">{stockAlertCount}</p>
                </div>
            </div>
        </div>
    );
}
