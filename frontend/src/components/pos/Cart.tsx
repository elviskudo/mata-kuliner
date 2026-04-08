"use client";

import { useState, useEffect, useRef } from "react";
import { Minus, Plus, Receipt, Settings, ShoppingCart, Trash2, QrCode, User, Search, X } from "lucide-react";
import { type Role } from "@/lib/data";
import { membersService, Member } from "@/services/members.service";

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
    onClear: (paymentMethod: 'Cash' | 'QRIS' | 'Points', orderType: 'Take away' | 'Dine In', memberId?: number, tableId?: number) => Promise<{ orderId?: number } | void>;
    onConfirmPayment: (orderId: number) => Promise<void>;
    selectedMember: Member | null;
    onMemberSelect: (member: Member | null) => void;
    onHoldOrder: () => void;
    heldOrders: { id: string, name: string, items: CartItem[], time: string }[];
    onRestoreHoldOrder: (id: string) => void;
}

import { TableSelectionModal, Table } from "./TableSelectionModal";

export function Cart({ items, onUpdateQty, onRemove, onClear, onConfirmPayment, selectedMember, onMemberSelect, onHoldOrder, heldOrders, onRestoreHoldOrder }: CartProps) {
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Points'>('Cash');
    const [orderType, setOrderType] = useState<'Take away' | 'Dine In'>('Take away');
    const [timeLeft, setTimeLeft] = useState(105);
    const [mounted, setMounted] = useState(false);
    const [showHeldOrders, setShowHeldOrders] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    // Member Search State
    const [memberQuery, setMemberQuery] = useState("");
    const [memberResults, setMemberResults] = useState<Member[]>([]);
    const [isSearchingMember, setIsSearchingMember] = useState(false);
    const [showMemberResults, setShowMemberResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        // Click outside to close results
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowMemberResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Member Search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (memberQuery.trim().length > 0) {
                setIsSearchingMember(true);
                try {
                    const results = await membersService.findAll(memberQuery);
                    setMemberResults(results);
                    setShowMemberResults(true);
                } catch (err) {
                    console.error("Member search failed", err);
                    setMemberResults([]);
                } finally {
                    setIsSearchingMember(false);
                }
            } else {
                setMemberResults([]);
                setShowMemberResults(false);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [memberQuery]);

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
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    let totalPointsCost = 0;
    items.forEach(item => {
        let itemPointCost = 0;
        if (item.price < 10000) itemPointCost = 3;
        else if (item.price == 10000) itemPointCost = 5;
        else itemPointCost = 7;
        totalPointsCost += (itemPointCost * item.qty);
    });

    const [isPendingPayment, setIsPendingPayment] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

    const handleTransaction = async () => {
        // Here we changed it so that onClear returns the created order ID if it's QRIS, 
        // passing it up so POS page can create the pending order.
        const result = await onClear(paymentMethod, orderType, selectedMember?.id, selectedTable?.id);

        if (paymentMethod === 'QRIS' && result?.orderId) {
            setPendingOrderId(result.orderId);
            setIsPendingPayment(true);
            setTimeLeft(105);
        } else {
            // For cash it handled in pos/page.tsx to clear everything
            setPaymentMethod('Cash');
            setOrderType('Take away');
            onMemberSelect(null);
            setMemberQuery("");
        }
    };


    const handleConfirmQris = async () => {
        if (!pendingOrderId) return;
        try {
            await onConfirmPayment(pendingOrderId);

            // Go back to normal state
            setIsPendingPayment(false);
            setPendingOrderId(null);
            setPaymentMethod('Cash');
            setOrderType('Take away');
            onMemberSelect(null);
            setMemberQuery("");
        } catch (error) {
            alert('Gagal konfirmasi pembayaran QRIS');
        }
    };

    const handleCancelQris = () => {
        // Optionally cancel backend order here
        setIsPendingPayment(false);
        setPendingOrderId(null);
        setPaymentMethod('Cash');
        setTimeLeft(105);
    };

    if (!mounted) return null; // Prevent hydration mismatch

    return (
        <div className="w-full bg-white border-l border-gray-100 h-full flex flex-col shadow-xl">
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8 relative">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Order detail</h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Date: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {heldOrders.length > 0 && (
                            <button
                                onClick={() => setShowHeldOrders(!showHeldOrders)}
                                className="relative p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                title="Lihat Pesanan Tertahan"
                            >
                                <ShoppingCart size={20} />
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center justify-center border-2 border-white">
                                    {heldOrders.length}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={onHoldOrder}
                            disabled={items.length === 0}
                            className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Tahan Pesanan (Hold)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="16" x="4" y="4" rx="2" /><rect width="8" height="16" x="12" y="4" rx="2" /></svg>
                        </button>
                    </div>

                    {showHeldOrders && heldOrders.length > 0 && (
                        <div className="absolute top-14 right-0 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 overflow-hidden flex flex-col">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h4 className="font-bold text-gray-800 text-sm">Pesanan Tertahan</h4>
                                <button onClick={() => setShowHeldOrders(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-2">
                                {heldOrders.map((hold) => (
                                    <div key={hold.id} className="p-3 bg-white border border-gray-100 rounded-xl mb-2 hover:border-blue-200 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{hold.name}</p>
                                                <p className="text-xs text-gray-500">{hold.items.length} items • {hold.time}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onRestoreHoldOrder(hold.id);
                                                    setShowHeldOrders(false);
                                                }}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Lanjut
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Member Selection */}
                    <div className="space-y-2 relative" ref={searchRef}>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Customer / Member</label>

                        {!selectedMember ? (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Cari member..."
                                    value={memberQuery}
                                    onChange={(e) => setMemberQuery(e.target.value)}
                                    onFocus={() => {
                                        if (memberResults.length > 0) setShowMemberResults(true);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {isSearchingMember && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                {/* Search Results Dropdown */}
                                {showMemberResults && memberResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                                        {memberResults.map(member => (
                                            <button
                                                key={member.id}
                                                onClick={() => {
                                                    onMemberSelect(member);
                                                    setMemberQuery("");
                                                    setShowMemberResults(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                                            >
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{member.name}</p>
                                                    <p className="text-xs text-gray-500">{member.phone}</p>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${member.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {member.status}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-blue-50 p-2 rounded-xl border border-blue-100 shadow-sm">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-600">
                                    <User size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{selectedMember.name}</p>
                                    <p className="text-xs text-blue-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                        {selectedMember.phone || selectedMember.email} • 🌟 {selectedMember.points || 0} Poin
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        onMemberSelect(null);
                                        if (paymentMethod === 'Points') setPaymentMethod('Cash');
                                    }}
                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Type Toggle */}
                <div className="flex gap-6 mt-8">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="radio"
                                name="orderType"
                                checked={orderType === 'Take away'}
                                onChange={() => {
                                    setOrderType('Take away');
                                    setSelectedTable(null);
                                }}
                                className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-200 checked:border-blue-600 transition-all"
                            />
                            <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Take away</span>
                    </label>
                    <div className="flex flex-col items-start gap-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="radio"
                                    name="orderType"
                                    checked={orderType === 'Dine In'}
                                    onChange={() => {
                                        setOrderType('Dine In');
                                        if (!selectedTable) setShowTableModal(true);
                                    }}
                                    className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-200 checked:border-blue-600 transition-all"
                                />
                                <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">Dine In</span>
                        </label>
                        {orderType === 'Dine In' && (
                            <button
                                onClick={() => setShowTableModal(true)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${selectedTable
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                    : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                                    }`}
                            >
                                {selectedTable ? `Meja ${selectedTable.tableNumber}` : 'Pilih Meja'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-px bg-gray-50 mx-8 my-4" />

            {/* Cart Items / QRIS View */}
            <div className="flex-1 overflow-y-auto px-8 space-y-6 scrollbar-none">
                {paymentMethod === 'QRIS' ? (
                    <div className="h-full flex flex-col items-center justify-center py-4">
                        {/* Back Button */}
                        <button
                            onClick={() => setPaymentMethod('Cash')}
                            className="absolute top-24 right-8 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 border border-gray-100"
                            title="Kembali ke detail order"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <h3 className="text-3xl font-black text-blue-600 mb-8">Rp {total.toLocaleString()}.00</h3>

                        {timeLeft > 0 ? (
                            <>
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
                                    <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                                        {isPendingPayment ? 'Menunggu Pembayaran...' : 'Scan QRIS untuk membayar'}
                                    </p>
                                </div>

                                <div className="mt-8 flex justify-between w-full items-center">
                                    <div className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                                        <span className="text-xs font-bold uppercase tracking-wider">Sisa waktu:</span>
                                        <span className="text-lg font-black">{formatTime(timeLeft)}</span>
                                    </div>

                                    {isPendingPayment && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCancelQris}
                                                className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all shadow-sm active:scale-95"
                                            >
                                                Batalkan
                                            </button>
                                            <button
                                                onClick={handleConfirmQris}
                                                className="px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center gap-2"
                                            >
                                                <span>✅</span> Selesai
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="relative p-12 bg-red-50 rounded-[2.5rem] shadow-2xl shadow-red-100 border border-red-100 flex flex-col items-center">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-2xl font-black text-red-600 mb-2">Waktu Telah Habis</h4>
                                <p className="text-sm font-bold text-red-400 text-center mb-6">Silakan kembali dan pilih metode pembayaran lagi</p>
                                <button
                                    onClick={() => {
                                        setPaymentMethod('Cash');
                                        setTimeLeft(105);
                                    }}
                                    className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    Kembali
                                </button>
                            </div>
                        )}
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
                {paymentMethod === 'Points' ? (
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-end">
                            <span className="text-gray-900 font-black text-lg">Total Pembayaran Poin</span>
                            <span className="text-2xl font-black text-blue-600">🌟 {totalPointsCost} Poin</span>
                        </div>
                        {selectedMember && selectedMember.points < totalPointsCost && (
                            <p className="text-red-500 text-sm font-bold text-right mt-1">Poin Tidak Mencukupi!</p>
                        )}
                    </div>
                ) : (
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
                )}

                <div className="flex gap-4">
                    {/* Payment Method Tabs */}
                    <div className="flex-1 bg-gray-50 rounded-2xl p-1.5 flex gap-1.5 overflow-x-auto scrollbar-none">
                        <button
                            onClick={() => {
                                setPaymentMethod('Cash');
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'Cash'
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            💵 Cash
                        </button>
                        <button
                            onClick={() => {
                                setPaymentMethod('QRIS');
                                if (paymentMethod === 'Cash') setTimeLeft(105);
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'QRIS'
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            📱 QRIS
                        </button>
                        {selectedMember && (
                            <button
                                onClick={() => {
                                    setPaymentMethod('Points');
                                }}
                                className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 ${paymentMethod === 'Points'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                🌟 Poin
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={handleTransaction}
                        disabled={items.length === 0 || isPendingPayment || (paymentMethod === 'Points' && (!selectedMember || selectedMember.points < totalPointsCost))}
                        className="w-full py-4 bg-blue-600 text-white font-black text-xl rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100/50 flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Receipt className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        {paymentMethod === 'QRIS' && !isPendingPayment ? 'Generate QRIS' : 'Pay'}
                    </button>
                </div>



                <TableSelectionModal
                    isOpen={showTableModal}
                    onClose={() => setShowTableModal(false)}
                    selectedTableId={selectedTable?.id}
                    onSelectTable={(table) => {
                        setSelectedTable(table);
                        setShowTableModal(false);
                    }}
                />
            </div>
        </div>
    );
}
