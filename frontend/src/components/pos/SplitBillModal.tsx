import { useState, useEffect } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    qty: number;
}

interface SplitBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onConfirmSplitPayment: (splitItems: { id: string, name: string, price: number, splitQty: number }[], paymentMethod: 'Cash' | 'QRIS') => void;
}

export function SplitBillModal({ isOpen, onClose, items, onConfirmSplitPayment }: SplitBillModalProps) {
    const [splitItems, setSplitItems] = useState<{ id: string, name: string, price: number, maxQty: number, splitQty: number }[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('Cash');

    useEffect(() => {
        if (isOpen) {
            // Initialize split state to 0 for all items
            setSplitItems(items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                maxQty: item.qty,
                splitQty: 0
            })));
        }
    }, [isOpen, items]);

    if (!isOpen) return null;

    const handleUpdateSplitQty = (id: string, delta: number) => {
        setSplitItems(prev => prev.map(item => {
            if (item.id === id) {
                const newValue = Math.max(0, Math.min(item.maxQty, item.splitQty + delta));
                return { ...item, splitQty: newValue };
            }
            return item;
        }));
    };

    const handleSelectAll = (id: string) => {
        setSplitItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, splitQty: item.maxQty };
            }
            return item;
        }));
    };

    const selectedItems = splitItems.filter(item => item.splitQty > 0);
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.splitQty), 0);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    const handleConfirm = () => {
        if (selectedItems.length === 0) {
            alert("Pilih setidaknya satu menu untuk dibayar terpisah.");
            return;
        }

        // Pass only the items selected for this split
        onConfirmSplitPayment(selectedItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            splitQty: item.splitQty
        })), paymentMethod);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Split Bill</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Pilih menu yang ingin dibayar sekarang</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {splitItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                            <div className="flex-1 min-w-0 pr-4">
                                <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-blue-600 font-bold text-sm">Rp {item.price.toLocaleString()}</span>
                                    <span className="text-gray-400 text-xs font-medium">/ max {item.maxQty}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleSelectAll(item.id)}
                                    className="text-xs font-bold text-blue-600 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                    Semua
                                </button>

                                <div className="flex items-center bg-gray-50 p-1 rounded-xl gap-3 border border-gray-200">
                                    <button
                                        onClick={() => handleUpdateSplitQty(item.id, -1)}
                                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm disabled:opacity-50"
                                        disabled={item.splitQty === 0}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-black text-gray-900 w-6 text-center">{item.splitQty}</span>
                                    <button
                                        onClick={() => handleUpdateSplitQty(item.id, 1)}
                                        className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
                                        disabled={item.splitQty === item.maxQty}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Summary */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-gray-500 font-bold text-sm mb-1">Total Split Pembayaran</p>
                            <div className="text-sm font-bold text-gray-400">
                                Subtotal + Pajak (11%)
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-blue-600">Rp {total.toLocaleString()}</p>
                            <p className="text-sm font-bold text-gray-400 mt-1">{selectedItems.length} menu dipilih</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/3 bg-white rounded-xl p-1.5 flex gap-1.5 border border-gray-200">
                            <button
                                onClick={() => setPaymentMethod('Cash')}
                                className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm transition-all ${paymentMethod === 'Cash'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Cash
                            </button>
                            <button
                                onClick={() => setPaymentMethod('QRIS')}
                                className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm transition-all ${paymentMethod === 'QRIS'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                QRIS
                            </button>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={selectedItems.length === 0}
                            className="flex-1 bg-blue-600 text-white font-black text-lg rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                        >
                            Bayar Sekarang <Check className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
