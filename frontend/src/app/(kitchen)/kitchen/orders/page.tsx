"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, Eye, Printer } from 'lucide-react';
import OrderDetailModal from '@/components/kitchen/OrderDetailModal';
import { MENU_ITEMS } from '@/lib/data';

// Helper for images (reused/shared)
function getMenuImage(name: string) {
    const item = MENU_ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase());
    const fuzzyItem = MENU_ITEMS.find(i => name.toLowerCase().includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(name.toLowerCase()));
    return item?.image || fuzzyItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
}

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

// Interface for flattened order item for table display
interface FlattenedOrder {
    id: number;
    originalOrder: Order;
    menu: string;
    qty: number;
    notes?: string;
    type: string;
    status: string;
    timestamp: string;
    customerName: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OrdersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All Type');
    const [orders, setOrders] = useState<FlattenedOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`);
            const data: Order[] = await response.json();

            // Flatten orders for table display: one row per item
            const flattened: FlattenedOrder[] = [];
            data.forEach(order => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        flattened.push({
                            id: order.id,
                            originalOrder: order,
                            menu: item.name,
                            qty: item.qty,
                            notes: item.notes,
                            type: order.orderType || 'Dine In', // Default if missing
                            status: order.status,
                            timestamp: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            customerName: order.customerName || 'Customer'
                        });
                    });
                }
            });

            setOrders(flattened);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (id: string) => {
        setSelectedOrderId(id);
        setIsModalOpen(true);
    };

    // Filter orders based on search query AND filter type
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.menu.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All Type' ? true : order.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                orderId={selectedOrderId}
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
                            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring-blue-300 sm:text-sm transition duration-150 ease-in-out"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                                <tr key={`${order.id}-${order.menu}-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">#{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.timestamp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Table 45</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order.customerName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                                    <img src={getMenuImage(order.menu)} alt={order.menu} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900">{order.menu}</span>
                                                        <span className="text-gray-500">x{order.qty}</span>
                                                    </div>
                                                    {order.notes && <div className="text-xs text-gray-400">{order.notes}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md
                                             ${order.type === 'Take away' ? 'bg-purple-100 text-purple-800' :
                                                order.type === 'Dine In' ? 'bg-green-500 text-white' :
                                                    'bg-gray-100'}
                                         `}>
                                            {order.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleViewOrder(order.id.toString())}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                <Printer size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        No orders found matching "{searchQuery}" {(filterType !== 'All Type') && `with type "${filterType}"`}
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
const item = MENU_ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase());
const fuzzyItem = MENU_ITEMS.find(i => name.toLowerCase().includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(name.toLowerCase()));
return item?.image || fuzzyItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
}

export default function OrdersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All Type'); // New State

    const handleViewOrder = (id: string) => {
        setSelectedOrderId(id);
        setIsModalOpen(true);
    };

    // Filter orders based on search query AND filter type
    const filteredOrders = ORDERS.filter(order => {
        const matchesSearch = order.menu.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All Type' ? true : order.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                orderId={selectedOrderId}
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
                            <span>Apr 20, 2025</span>
                        </div>
                    </div>

                    {/* Type Dropdown Interactive */}
                    <div className="relative">
                        {/* Simple Select for function "bisa di pencet" */}
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="appearance-none flex items-center border rounded-lg px-3 py-2 bg-white text-gray-600 min-w-[120px] focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                            >
                                <option value="All Type">All Type</option>
                                <option value="Dine In">Dine In</option>
                                <option value="Away">Away</option>
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
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring-blue-300 sm:text-sm transition duration-150 ease-in-out"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">#{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.timestamp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Table 45</td>
                                    {/* Table & Name are not in ORDERS currently. I'll mock them or add to data if needed. For now hardcode or random for demo consistency */}
                                    {/* Actually, user didn't ask to change Table/Name. I'll just use static "Table 45" / "Dimas" unless I update data structure more deep.
                                         Wait, 'menu' field is being used. 'notes' is distinct.
                                     */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">Dimas</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                                    <img src={getMenuImage(order.menu)} alt={order.menu} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900">{order.menu}</span>
                                                        <span className="text-gray-500">x{order.qty}</span>
                                                    </div>
                                                    {order.notes && <div className="text-xs text-gray-400">{order.notes}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md
                                             ${order.type === 'Delivery' ? 'bg-teal-100 text-teal-800' :
                                                order.type === 'Dine In' ? 'bg-green-500 text-white' :
                                                    order.type === 'Away' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}
                                         `}>
                                            {/* Add Icons? Design had simple text, but Type 'Here' had an icon-like look?
                                                    The Green box for 'Here' (now Dine In) in previous design was solid green with white text.
                                                    The request says "kotak hijau bertulisan here itu tulisan nya di ganti dengan dine in".
                                                    And "type away bebas warna kotak nya apa".
                                                */}
                                            {order.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleViewOrder(order.id)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                <Printer size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        No orders found matching "{searchQuery}" {(filterType !== 'All Type') && `with type "${filterType}"`}
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
