import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MENU_ITEMS } from '@/lib/data';
import { useEffect, useState } from 'react';

function getMenuImage(name: string) {
    const item = MENU_ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase());
    // Fallback if exact match fails
    const fuzzyItem = MENU_ITEMS.find(i => name.toLowerCase().includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(name.toLowerCase()));
    return item?.image || fuzzyItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
}

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

interface FlattenedOrder {
    id: number;
    originalOrder: Order;
    menu: string;
    qty: number;
    notes?: string;
    type: string;
    status: string;
}

export default function RecentOrdersTable() {
    const [orders, setOrders] = useState<FlattenedOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/orders`);
                const data: Order[] = await response.json();

                const flattened: FlattenedOrder[] = [];
                // Take only recent 5 orders (or top 5)
                const recentData = data.slice(0, 5);

                recentData.forEach(order => {
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            flattened.push({
                                id: order.id,
                                originalOrder: order,
                                menu: item.name,
                                qty: item.qty,
                                notes: item.notes,
                                type: order.orderType || 'Dine In',
                                status: order.status,
                            });
                        });
                    }
                });

                // Set only first 5 flattened items to keep the list short
                setOrders(flattened.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch recent orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-300 text-blue-800'; // Light blue in design
            case 'cooking': return 'bg-orange-300 text-orange-800'; // Light orange
            case 'done': return 'bg-teal-300 text-teal-800'; // Teal/Greenish
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Order</h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 font-medium">
                            <th className="py-3 px-4 rounded-l-lg">Order ID</th>
                            <th className="py-3 px-4">Menu</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center rounded-r-lg">Type</th>
                        </tr>
                    </thead>
                    <tbody className="space-y-4">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">Loading recent orders...</td>
                            </tr>
                        ) : orders.map((order, index) => (
                            <tr key={`${order.id}-${index}`} className="border-b border-gray-50 last:border-none">
                                <td className="py-4 px-4 text-gray-500">#{order.id}</td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                                            <img src={getMenuImage(order.menu)} alt={order.menu} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{order.menu}</p>
                                            {order.notes && <p className="text-xs text-gray-400">({order.notes})</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center font-bold text-gray-900">{order.qty}</td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`px-6 py-1.5 rounded-lg text-white font-medium text-sm inline-block w-24
                                        ${order.status === 'New' || order.status === 'pending' ? 'bg-[#81Bcf8]' : ''}
                                        ${order.status === 'Cooking' ? 'bg-[#FDBA74]' : ''}
                                        ${order.status === 'Done' ? 'bg-[#4FD1C5]' : '' /* Manual Teal */}
                                        ${order.status !== 'New' && order.status !== 'pending' && order.status !== 'Cooking' && order.status !== 'Done' ? 'bg-gray-400' : ''}
                                    `}>
                                        {/* Normalize status display */}
                                        {order.status === 'pending' ? 'New' : order.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`px-6 py-1.5 rounded-lg font-medium text-sm inline-block w-24
                                        ${order.type === 'Take away' ? 'bg-purple-100 text-purple-800' :
                                            order.type === 'Dine In' ? 'bg-green-400 text-white' :
                                                'bg-gray-100'}
                                    `}>
                                        {order.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!loading && orders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">No recent orders found</td>
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
    );
}

