import { X, Clock, Printer } from 'lucide-react';
import { MENU_ITEMS, ORDERS } from '@/lib/data';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId?: string | null;
}

// Helper to get image
function getMenuImage(name: string) {
    const item = MENU_ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase());
    const fuzzyItem = MENU_ITEMS.find(i => name.toLowerCase().includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(name.toLowerCase()));
    return item?.image || fuzzyItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
}

// Helper to find order
function linkOrderData(id: string | null | undefined) {
    if (!id) return null;
    const order = ORDERS.find(o => o.id === id);
    if (!order) return null;

    return {
        id: order.id,
        time: order.timestamp,
        name: 'Dimas', // Default to Dimas for now roughly matching mocks
        type: order.type,
        items: [
            { name: order.menu, qty: order.qty, image: getMenuImage(order.menu) }
        ],
        notes: order.notes
    };
}

export default function OrderDetailModal({ isOpen, onClose, orderId }: OrderDetailModalProps) {
    if (!isOpen) return null;

    // Find the actual order from DATA
    const selectedOrder = linkOrderData(orderId);

    // If order not found, keep fallback for safety
    const orderData = selectedOrder || {
        id: orderId || '???',
        time: '??:??',
        name: 'Unknown',
        type: 'Unknown',
        items: [],
        notes: ''
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Order #{orderData.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Meta Info */}
                    <div className="space-y-1">
                        <div className="flex items-center text-gray-500 mb-2">
                            <Clock size={18} className="mr-2" />
                            <span className="text-sm font-medium">{orderData.time}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{orderData.name}</h3>
                        <div className="mt-2">
                            <span className={`px-6 py-1 rounded text-sm font-medium inline-block text-white
                                ${orderData.type === 'Dine In' ? 'bg-green-500' :
                                    orderData.type === 'Away' ? 'bg-purple-500' : 'bg-gray-500'}
                             `}>
                                {orderData.type}
                            </span>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <div className="flex justify-between text-gray-400 text-lg font-medium mb-4">
                            <span>Item</span>
                            <span>Qty</span>
                        </div>
                        <div className="space-y-4">
                            {orderData.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-gray-900 font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">{item.qty}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-bold text-gray-900 mb-1">Notes</h4>
                        <p className="text-gray-500 text-sm">{orderData.notes}</p>
                    </div>

                    {/* Footer / Print */}
                    <div className="pt-2">
                        <button className="w-full bg-[#60A5FA] text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-blue-500 transition-colors">
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
