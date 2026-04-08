import { X, Clock, Printer } from 'lucide-react';
import { generateKitchenOrderPDF } from '@/utils/kitchenOrderPDF';

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
    amount?: number;
}

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

async function handlePrint(order: Order) {
    await generateKitchenOrderPDF({
        id: order.id,
        orderType: order.orderType,
        createdAt: order.createdAt,
        customerName: order.customerName,
        items: order.items,
    });
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
    if (!isOpen || !order) return null;

    const total = order.amount ?? order.totalAmount ?? 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Meta Info */}
                    <div className="space-y-2">
                        <div className="flex items-center text-gray-500">
                            <Clock size={18} className="mr-2" />
                            <span className="text-sm font-medium">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{order.customerName || 'Customer'}</h3>
                        <div className="mt-2 text-sm text-gray-500">
                            Payment: <span className="font-semibold">{order.paymentMethod}</span>
                        </div>
                        <div className="mt-2">
                            <span className={`px-6 py-1 rounded-lg text-sm font-bold inline-block text-white uppercase tracking-wider
                                ${order.orderType === 'Dine In' ? 'bg-green-500' :
                                    order.orderType === 'Take away' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                                {order.orderType}
                            </span>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <div className="flex justify-between text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                            <span>Item Details</span>
                            <span>Qty</span>
                        </div>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 mr-3 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-500">
                                            {item.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="text-gray-900 font-bold block">{item.name}</span>
                                            {item.notes && <span className="text-xs text-gray-500 italic block mt-0.5">Note: {item.notes}</span>}
                                        </div>
                                    </div>
                                    <span className="font-black text-gray-900 text-lg bg-gray-50 w-10 h-10 flex items-center justify-center rounded-lg">{item.qty}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-500 font-medium">Total</span>
                        <span className="text-xl font-black text-gray-900">Rp {Number(total).toLocaleString('id-ID')}</span>
                    </div>

                    {/* Footer / Print */}
                    <div className="pt-2 border-t border-gray-100 mt-4">
                        <button
                            onClick={() => handlePrint(order)}
                            className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
                        >
                            <Printer className="mr-2" size={20} />
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
