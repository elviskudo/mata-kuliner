"use client";

import { X, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UpdateStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    item: {
        id: string;
        name: string;
        image: string | null;
        stock: number;
        unit: string;
    } | null;
}

export default function UpdateStockModal({ isOpen, onClose, onUpdate, item }: UpdateStockModalProps) {
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if (isOpen && item) {
            setAmount(item.stock);
        }
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:3001/products/${item.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stock: amount,
                }),
            });

            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-gray-50">
                    <h2 className="text-2xl font-bold text-gray-900">Update Stock</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={28} />
                    </button>
                </div>

                <div className="p-8">
                    {/* Item Info */}
                    <div className="flex items-center mb-10">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 mr-5 flex-shrink-0 shadow-inner">
                            <img
                                src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:3001${item.image}`) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-gray-500 text-lg">Current stock: <span className="font-bold text-gray-900">{item.stock} {item.unit}</span></p>
                        </div>
                    </div>

                    {/* Add Stock Control */}
                    <div className="mb-10">
                        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wider">
                            <Plus size={16} className="text-blue-500 mr-2" /> Add stock
                        </label>
                        <div className="flex items-center border-2 border-gray-100 rounded-2xl p-2 bg-gray-50">
                            <button
                                onClick={() => setAmount(Math.max(0, amount - 1))}
                                className="p-3 text-gray-400 hover:text-gray-600 bg-white rounded-xl shadow-sm transition-all"
                            >
                                <Minus size={20} />
                            </button>
                            <div className="flex-1 text-center font-bold text-2xl text-gray-900">
                                {amount} <span className="text-gray-400 font-medium text-lg ml-1">{item.unit.toLowerCase()}</span>
                            </div>
                            <button
                                onClick={() => setAmount(amount + 1)}
                                className="p-3 text-gray-400 hover:text-gray-600 bg-white rounded-xl shadow-sm transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="w-full py-4 rounded-xl font-bold text-white bg-[#60A5FA] hover:bg-blue-500 transition-all shadow-lg shadow-blue-100"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
