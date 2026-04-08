"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import OrderDetailModal from '@/components/kitchen/OrderDetailModal';

interface OrderItem {
    id: string | number;
    name: string;
    qty: number;
    price: number;
    notes?: string;
}

interface Order {
    id: number;
    customerName: string;
    totalAmount: number;
    status: string;
    items: OrderItem[];
    orderType: string;
    paymentMethod: string;
    createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OrdersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All Type');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchOrders();
        // Auto-refresh every 10 seconds so new orders appear automatically
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`);
            const data: Order[] = await response.json();

            const completedStatuses = ['COMPLETED', 'Done', 'DONE', 'completed'];

            // Sort: pending first (newest first), completed last (oldest first)
            data.sort((a, b) => {
                const aCompleted = completedStatuses.includes(a.status);
                const bCompleted = completedStatuses.includes(b.status);

                // If one is completed and other isn't → pending group first
                if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;

                if (!aCompleted) {
                    // Both pending: newest (highest ID) first
                    return b.id - a.id;
                } else {
                    // Both completed: oldest first
                    return a.id - b.id;
                }
            });

            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCompleteOrder = async (id: number) => {
        if (!confirm('Apakah pesanan ini sudah selesai?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' })
            });

            if (res.ok) {
                fetchOrders(); // Refresh to re-sort
            }
        } catch (err) {
            console.error('Failed to complete order', err);
        }
    };

    // Filter orders based on search query (ID or Type) AND filter type
    const filteredOrders = orders.filter(order => {
        // STRICT FILTER: Only show Dine In and Take away
        if (order.orderType !== 'Dine In' && order.orderType !== 'Take away') return false;

        const matchesSearch = order.id.toString().includes(searchQuery) ||
            order.orderType?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All Type' ? true : order.orderType === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    {/* Date Picker Placeholder */}
                    <div className="relative">
                        <div className="flex items-center border rounded-lg px-3 py-2 bg-white text-gray-600">
                            <Calendar size={18} className="mr-2" />
                            <span>{mounted ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Loading..."}</span>
                        </div>
                    </div>

                    {/* Type Dropdown Interactive */}
                    <div className="relative">
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="appearance-none flex items-center border rounded-lg px-3 py-2 bg-white text-gray-600 min-w-[120px] focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                            >
                                <option value="All Type">All Type</option>
                                <option value="Dine In">Dine In</option>
                                <option value="Take away">Take away</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                                <Filter size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring-blue-300 sm:text-sm transition duration-150 ease-in-out"
                    />
                </div>
            </div>

            {/* Orders Table - Financial Report Style */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Order Type</th>
                                <th className="px-8 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-10 text-center text-gray-500">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => {
                                    // SLA Calculation
                                    const createdAt = new Date(order.createdAt);
                                    const elapsedMinutes = Math.floor((new Date().getTime() - createdAt.getTime()) / 60000);
                                    const isPending = order.status !== 'COMPLETED' && order.status !== 'Done';

                                    let slaColor = '';
                                    let slaText = '';
                                    if (isPending) {
                                        if (elapsedMinutes > 20) {
                                            slaColor = 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500';
                                            slaText = 'text-red-700 font-bold';
                                        } else if (elapsedMinutes >= 10) {
                                            slaColor = 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-500';
                                            slaText = 'text-yellow-700 font-bold';
                                        } else {
                                            slaColor = 'bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500';
                                            slaText = 'text-green-700 font-bold';
                                        }
                                    } else {
                                        slaColor = 'bg-gray-50/50 opacity-60 border-l-4 border-l-gray-300';
                                        slaText = 'text-gray-500';
                                    }

                                    return (
                                        <tr key={order.id} className={`transition-colors ${slaColor}`}>
                                            <td className="px-8 py-4 text-sm font-bold text-gray-900">#{order.id}</td>
                                            <td className="px-8 py-4 text-sm text-gray-600">
                                                <div>{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {createdAt.toLocaleDateString()}</div>
                                                {isPending && (
                                                    <div className={`text-xs mt-1 ${slaText}`}>
                                                        ⏳ Menunggu: {elapsedMinutes} mnt
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md
                                                     ${order.orderType === 'Take away' ? 'bg-purple-100 text-purple-800' :
                                                        order.orderType === 'Dine In' ? 'bg-indigo-100 text-indigo-800' :
                                                            'bg-gray-100'}
                                                 `}>
                                                    {order.orderType || 'Dine In'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-center flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all"
                                                >
                                                    Detail
                                                </button>
                                                {isPending && (
                                                    <button
                                                        onClick={() => handleCompleteOrder(order.id)}
                                                        className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-xs hover:bg-green-100 transition-all border border-green-200"
                                                    >
                                                        Selesai
                                                    </button>
                                                )}
                                                {!isPending && (
                                                    <span className="px-3 py-2 text-xs font-bold text-gray-400 bg-gray-100 rounded-xl border border-gray-200">
                                                        Selesai
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-gray-500">
                                        No orders found matching "{searchQuery}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>


                {/* Pagination (Static) */}
                <div className="bg-white px-4 py-3 flex items-center justify-center border-t border-gray-200 sm:px-6">
                    <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-400 disabled:opacity-50">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-blue-600 font-medium">1/1</span>
                        <button className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

