import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import OrderDetailModal from './OrderDetailModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export default function RecentOrdersTable() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/orders`);
                const data: Order[] = await response.json();

                // Sort by newest first
                data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                // Filter for Kitchen Dashboard: Only Dine In and Take away
                const kitchenOrders = data.filter(order =>
                    order.orderType === 'Dine In' || order.orderType === 'Take away'
                );

                // Take top 5
                setOrders(kitchenOrders.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch recent orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <>
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
            <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Order</h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-600 font-medium">
                                <th className="py-3 px-4 rounded-l-lg">Order ID</th>
                                <th className="py-3 px-4">Date & Time</th>
                                <th className="py-3 px-4 text-center">Type</th>
                                <th className="py-3 px-4 text-center rounded-r-lg">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">Loading recent orders...</td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.id} className="border-b border-gray-50 last:border-none">
                                    <td className="py-4 px-4 text-gray-900 font-bold">#{order.id}</td>
                                    <td className="py-4 px-4 text-gray-600 text-sm">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`px-4 py-1.5 rounded-lg font-medium text-sm inline-block
                                            ${order.orderType === 'Take away' ? 'bg-purple-100 text-purple-800' :
                                                order.orderType === 'Dine In' || order.orderType === 'Here' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100'}
                                        `}>
                                            {order.orderType}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => handleViewOrder(order)}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition-all"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && orders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">No recent orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-4">
                    <Link href="/kitchen/orders" className="flex items-center text-blue-500 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                        View All <ChevronRight size={16} className="ml-1" />
                    </Link>
                </div>
            </div>
        </>
    );
}

