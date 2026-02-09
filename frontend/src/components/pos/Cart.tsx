"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, Receipt, Settings, ShoppingCart, Trash2, QrCode } from "lucide-react";
import { type Role } from "@/lib/data";

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    qty: number;
}

interface CartProps {
    items: CartItem[];
    onUpdateQty: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
    onClear: () => void;
}

export function Cart({ items, onUpdateQty, onRemove, onClear }: CartProps) {
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('Cash');
    const [timeLeft, setTimeLeft] = useState(105); // 1:45 as in image

    useEffect(() => {
        if (paymentMethod === 'QRIS' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [paymentMethod, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const tax = subtotal * 0.05; // 5% tax example
    const total = subtotal + tax;

    const handleTransaction = () => {
        onClear();
        setPaymentMethod('Cash');
        setTimeLeft(105);
    };

    return (
        <div className="w-full bg-white border-l border-gray-100 h-full flex flex-col shadow-xl">
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900">Order detail</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Cashier name</label>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
                            <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=60" alt="Cashier" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Muhammad syarif hambal</span>
                    </div>
                </div>

                {/* Order Type Toggle */}
                <div className="flex gap-6 mt-8">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input type="radio" name="orderType" className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-200 checked:border-blue-600 transition-all" defaultChecked />
                            <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Take away</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input type="radio" name="orderType" className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-200 checked:border-blue-600 transition-all" />
                            <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Here</span>
                    </label>
                </div>
            </div>

            <div className="h-px bg-gray-50 mx-8 my-4" />

            {/* Cart Items / QRIS View */}
            <div className="flex-1 overflow-y-auto px-8 space-y-6 scrollbar-none">
                {paymentMethod === 'QRIS' ? (
                    <div className="h-full flex flex-col items-center justify-center py-4">
                        <h3 className="text-3xl font-black text-blue-600 mb-8">Rp {total.toLocaleString()}.00</h3>

                        <div className="relative p-8 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-gray-50 flex flex-col items-center group">
                            <div className="w-64 h-64 bg-white relative">
                                <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=MataKulinerOrder"
                                    alt="QRIS QR Code"
                                    className="w-full h-full object-contain"
                                />
                                {/* QR Frame Decoration */}
                                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-600 rounded-tl-xl" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-blue-600 rounded-tr-xl" />
                                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-blue-600 rounded-bl-xl" />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-blue-600 rounded-br-xl" />
                            </div>
                            <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Scan QRIS untuk membayar</p>
                        </div>

                        <div className="mt-12 flex justify-end w-full">
                            <div className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider">Sisa waktu:</span>
                                <span className="text-lg font-black">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                        <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm font-medium">Your cart is empty</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm">
                                <img
                                    src={item.image && (item.image.startsWith('http') || item.image.startsWith('data')) ? item.image : `http://localhost:3001${item.image}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-extrabold text-gray-900 text-sm truncate">{item.name}</h4>
                                <p className="text-gray-500 text-xs font-bold mt-1">Rp {item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center bg-gray-50 p-1.5 rounded-full gap-3 border border-gray-100 shadow-inner">
                                <button
                                    onClick={() => onUpdateQty(item.id, -1)}
                                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-black text-gray-900 w-4 text-center">{item.qty}</span>
                                <button
                                    onClick={() => onUpdateQty(item.id, 1)}
                                    className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 text-white shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold text-sm">Sub Total</span>
                        <span className="text-gray-400 font-bold text-sm underline decoration-dotted underline-offset-4 decoration-gray-200">Rp {subtotal.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold text-sm">Pajak</span>
                        <span className="text-gray-400 font-bold text-sm">Rp {tax.toLocaleString()}.00</span>
                    </div>
                    <div className="h-px bg-gray-100 my-4" />
                    <div className="flex justify-between items-end">
                        <span className="text-gray-900 font-black text-lg">Total Payment</span>
                        <span className="text-2xl font-black text-gray-900">Rp {total.toLocaleString()}.00</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 flex items-center justify-between bg-blue-50/50 px-6 py-4 rounded-2xl border border-blue-100/50 group">
                        <span className="text-blue-600 font-black text-lg">Rp {total.toLocaleString()}.00</span>
                        <button
                            onClick={() => {
                                setPaymentMethod(prev => prev === 'Cash' ? 'QRIS' : 'Cash');
                                if (paymentMethod === 'Cash') setTimeLeft(105);
                            }}
                            className="text-xs font-black bg-white text-blue-600 px-4 py-2 rounded-xl border border-blue-200 shadow-sm active:scale-95 transition-all hover:bg-blue-600 hover:text-white"
                        >
                            Ganti
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleTransaction}
                    className="w-full mt-6 py-6 bg-blue-100 text-blue-600 font-black text-xl rounded-[2rem] hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-100/50 flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                    <Receipt className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Transaction
                </button>
            </div>
        </div>
    );
}
