"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Loader2, Settings, AlertTriangle } from "lucide-react";
import { ProductCard } from "@/components/pos/ProductCard";
import { Cart } from "@/components/pos/Cart";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { ComplaintModal } from "@/components/pos/ComplaintModal";
import { API_BASE_URL } from "@/lib/config";
import HeaderProfileBadge from "@/components/shared/HeaderProfileBadge";
import { ShiftModal } from "@/components/pos/ShiftModal";

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    qty: number;
}

export default function PosPage() {
    const [menus, setMenus] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showComplaint, setShowComplaint] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [selectedMember, setSelectedMember] = useState<any>(null); // Member type
    const [time, setTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    const [heldOrders, setHeldOrders] = useState<{ id: string, name: string, items: CartItem[], time: string }[]>([]);

    const [showStartShift, setShowStartShift] = useState(false);
    const [showEndShift, setShowEndShift] = useState(false);
    const [activeShift, setActiveShift] = useState<any>(null);

    const checkActiveShift = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/shift-sessions/active`);
            if (res.ok) {
                const data = await res.text();
                if (data) {
                    setActiveShift(JSON.parse(data));
                    setShowStartShift(false);
                } else {
                    setActiveShift(null);
                    setShowStartShift(true);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);
        checkActiveShift();

        // Load held orders from local storage
        try {
            const stored = localStorage.getItem('mata_kuliner_held_orders');
            if (stored) {
                setHeldOrders(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load held orders', e);
        }

        return () => clearInterval(timer);
    }, []);

    const saveHoldOrder = () => {
        if (cartItems.length === 0) return;

        const customerName = selectedMember?.name || `Customer ${heldOrders.length + 1}`;
        const newHold = {
            id: Date.now().toString(),
            name: customerName,
            items: [...cartItems],
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };

        const updated = [...heldOrders, newHold];
        setHeldOrders(updated);
        localStorage.setItem('mata_kuliner_held_orders', JSON.stringify(updated));

        // Reset current cart
        setCartItems([]);
        setSelectedMember(null);
        alert(`Pesanan untuk ${customerName} berhasil disimpan.`);
    };

    const restoreHoldOrder = (holdId: string) => {
        const orderToRestore = heldOrders.find(h => h.id === holdId);
        if (orderToRestore) {
            if (cartItems.length > 0) {
                if (!confirm("Cart saat ini tidak kosong. Ganti dengan pesanan yang disimpan?")) {
                    return;
                }
            }
            setCartItems(orderToRestore.items);
            // Optionally try to find member by name or just leave empty
            setSelectedMember(null);

            // Remove from hold list
            const updated = heldOrders.filter(h => h.id !== holdId);
            setHeldOrders(updated);
            localStorage.setItem('mata_kuliner_held_orders', JSON.stringify(updated));
        }
    };


    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/menus`);
                const data = await response.json();
                setMenus(data);
            } catch (error) {
                console.error('Error fetching menus:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenus();
    }, []);

    const categories = ["Semua", ...Array.from(new Set(menus.map(m => m.category))).filter(Boolean)];

    const categoryCounts = categories.reduce((acc, cat) => {
        if (cat === "Semua") {
            acc[cat] = menus.length;
        } else {
            acc[cat] = menus.filter(m => m.category === cat).length;
        }
        return acc;
    }, {} as Record<string, number>);

    const filteredItems = menus.filter(item => {
        const matchesCategory = activeCategory === "Semua" || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = (item: any) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id.toString());
            if (existing) {
                return prev.map(i => i.id === item.id.toString() ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, {
                id: item.id.toString(),
                name: item.name,
                price: parseFloat(item.price),
                image: item.image && (item.image.startsWith('http') || item.image.startsWith('data')) ? item.image : `${API_BASE_URL}${item.image}`,
                qty: 1
            }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const clearCart = async (paymentMethod: 'Cash' | 'QRIS', orderType: 'Take away' | 'Dine In', memberId?: number, tableId?: number) => {
        const itemsToCheckout = cartItems;
        if (itemsToCheckout.length === 0) return;

        // Capture EXACT time of transaction from POS
        const now = new Date();
        const createdAt = now.toISOString();

        const subtotal = itemsToCheckout.reduce((acc, i) => acc + i.price * i.qty, 0);
        const tax = Math.round(subtotal * 0.11);
        const total = subtotal + tax;

        // Save transaction to backend using new unified endpoint
        try {
            const checkoutData = {
                items: itemsToCheckout,
                paymentMethod,
                orderType,
                cashierName: 'Muhammad syarif',
                memberId: memberId,
                tableId: tableId,
                createdAt
            };

            const response = await fetch(`${API_BASE_URL}/transactions/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checkoutData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Checkout failed: ${errorData.message}`);
                return;
            }

            const data = await response.json();

            // Prepare receipt data
            const receiptInfo = {
                items: [...itemsToCheckout],
                subtotal,
                tax,
                total,
                date: now.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
                id: data.transaction?.id?.toString() || Math.random().toString().slice(2, 14),
                paymentMethod,
                orderType,
                member: selectedMember
            };

            setReceiptData(receiptInfo);

            setCartItems([]);

            // Only show receipt immediately if it's cash. If it's QRIS, it should wait for payment.
            // But we will handle that mostly in Cart component flow. 
            // For now, let's keep it here or handle QRIS flow properly later.
            if (paymentMethod === 'Cash') {
                setShowReceipt(true);
            }

            return { orderId: data.transaction?.id };

        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Terjadi kesalahan saat checkout.');
        }
    };

    return (
        <div className="flex flex-1 min-w-0 bg-gray-50 overflow-hidden relative">
            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                data={receiptData}
                showPrintProgress={true}
            />

            <ComplaintModal
                isOpen={showComplaint}
                onClose={() => setShowComplaint(false)}
            />

            <ShiftModal
                isOpen={showStartShift}
                type="start"
                onSuccess={() => checkActiveShift()}
            />

            <ShiftModal
                isOpen={showEndShift}
                type="end"
                onClose={() => setShowEndShift(false)}
                onSuccess={() => {
                    setShowEndShift(false);
                    checkActiveShift();
                }}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="px-8 py-6 flex items-center justify-between bg-white border-b border-gray-100">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Check Out Order</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {mounted && new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            {mounted && (
                                <>
                                    {" • "}
                                    <span className="font-bold text-blue-600 ml-1">
                                        {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {activeShift && (
                            <button
                                onClick={() => setShowEndShift(true)}
                                className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-xl hover:bg-orange-100 transition-colors border border-orange-200 shadow-sm"
                            >
                                Tutup Shift
                            </button>
                        )}
                        <HeaderProfileBadge role="Cashier" />
                        <button
                            onClick={() => setShowComplaint(true)}
                            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100 relative group"
                            title="Lapor Komplain / Insiden"
                        >
                            <AlertTriangle size={20} />
                        </button>
                        <button className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors border border-gray-100 relative">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <a href="/pos/profile" className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors border border-gray-100 block">
                            <Settings size={20} />
                        </a>
                    </div>
                </header>

                <div className="p-8 space-y-8 overflow-y-auto scrollbar-none">
                    {/* Categories & Search */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-3 ${activeCategory === cat
                                        ? "bg-white text-gray-900 shadow-md border border-gray-100"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {cat}
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${activeCategory === cat ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                                        }`}>
                                        {categoryCounts[cat] || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 text-gray-400">
                            <Search size={20} />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="relative min-h-[400px]">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4">
                                    <Search size={32} />
                                </div>
                                <p className="text-lg font-bold text-gray-900">No menu found</p>
                                <p className="text-sm">Try another category or search term</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                                {filteredItems.map(item => (
                                    <ProductCard
                                        key={item.id}
                                        id={item.id.toString()}
                                        name={item.name}
                                        price={parseFloat(item.price)}
                                        image={item.image}
                                        stock={item.availableQuantity || 0}
                                        isAvailable={item.isAvailable !== false}
                                        outOfStockIngredient={item.outOfStockIngredient || null}
                                        onAddToCart={() => addToCart(item)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Cart */}
            <div className="w-[450px] flex-shrink-0">
                <Cart
                    items={cartItems}
                    onUpdateQty={updateQty}
                    onRemove={(id) => updateQty(id, -100)}
                    onClear={clearCart}
                    onConfirmPayment={async (orderId) => {
                        try {
                            await fetch(`${API_BASE_URL}/transactions/checkout/${orderId}/confirm`, {
                                method: 'PATCH',
                            });
                            setShowReceipt(true);
                        } catch (e) {
                            throw e;
                        }
                    }}
                    selectedMember={selectedMember}
                    onMemberSelect={setSelectedMember}
                    onHoldOrder={saveHoldOrder}
                    heldOrders={heldOrders}
                    onRestoreHoldOrder={restoreHoldOrder}
                />
            </div>
        </div>
    );
}
