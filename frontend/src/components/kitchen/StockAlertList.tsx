"use client";

import { useState, useEffect } from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface LowStockItem {
    id: number;
    name: string;
    stock: number;
    minStock: number;
    unit: string;
    image: string | null;
}

export default function StockAlertList() {
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = 'http://localhost:3001';

    useEffect(() => {
        const fetchStockAlerts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/stats`);
                const data = await response.json();
                setLowStockItems(data.lowStockItems || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stock alerts:", error);
                setLoading(false);
            }
        };

        fetchStockAlerts();
    }, []);

    const getImageUrl = (item: LowStockItem) => {
        if (!item.image) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
        if (item.image.startsWith('http')) return item.image;
        return `${API_BASE_URL}${item.image}`;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Stock Alert</h2>

            <div className="flex-1 space-y-4 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : lowStockItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>Tidak ada stok menipis</p>
                    </div>
                ) : (
                    lowStockItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center p-3 border rounded-lg shadow-sm">
                            <div className="w-12 h-12 relative rounded-full overflow-hidden mr-4 flex-shrink-0 bg-gray-100">
                                <img
                                    src={getImageUrl(item)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                                    <span className="text-blue-500 font-medium">{item.stock} {item.unit}</span>
                                </div>
                                <div className="flex items-center text-red-500 text-xs mt-1">
                                    <AlertTriangle size={12} className="mr-1" />
                                    <span>Minimum stock: {item.minStock}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4">
                <Link href="/kitchen/product">
                    <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-medium hover:bg-blue-100 transition-colors">
                        View All <ChevronRight size={16} className="ml-1" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
