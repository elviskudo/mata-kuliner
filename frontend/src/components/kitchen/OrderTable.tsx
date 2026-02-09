"use client";

import { useState } from "react";
import { ORDERS } from "@/lib/data";

const STATUS_COLORS = {
    New: "bg-blue-100 text-blue-600",
    Cooking: "bg-orange-100 text-orange-600",
    Done: "bg-teal-100 text-teal-600",
    Ready: "bg-purple-100 text-purple-600",
} as const;

export function OrderTable() {
    const [orders, setOrders] = useState(ORDERS);

    const nextStatus = (current: string) => {
        if (current === 'New') return 'Cooking';
        if (current === 'Cooking') return 'Done';
        return 'Done';
    };

    const handleStatusChange = (id: string, currentStatus: string) => {
        const next = nextStatus(currentStatus);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Order</h3>
                <button className="text-blue-600 font-semibold text-sm hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Order ID</th>
                            <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Menu</th>
                            <th className="py-4 px-6 text-center text-sm font-medium text-gray-500">Qty</th>
                            <th className="py-4 px-6 text-center text-sm font-medium text-gray-500">Status</th>
                            <th className="py-4 px-6 text-center text-sm font-medium text-gray-500">Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-gray-500 font-medium">#{order.id}</td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                            {/* Placeholder for menu image - using a generic food image */}
                                            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60" alt={order.menu} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{order.menu}</div>
                                            <div className="text-xs text-gray-400">(jangan kasih cabai)</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-center font-bold text-gray-900">{order.qty}</td>
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => handleStatusChange(order.id, order.status)}
                                        // @ts-ignore
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold w-24 transition-all hover:opacity-80 ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}
                                    >
                                        {order.status}
                                    </button>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-lg text-sm font-medium ${order.type === 'Delivery' ? 'bg-teal-100 text-teal-700' : 'bg-green-100 text-green-700'}`}>
                                        {order.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
