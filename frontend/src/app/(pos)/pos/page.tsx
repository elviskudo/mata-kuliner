"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Loader2, Settings, ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/pos/ProductCard";
import { Cart } from "@/components/pos/Cart";

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
    const [receiptData, setReceiptData] = useState<any>(null);
    const [printProgress, setPrintProgress] = useState(0);

    const API_BASE_URL = 'http://localhost:3001';

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

    // Print animation effect
    useEffect(() => {
        if (showReceipt && printProgress < 100) {
            const timer = setInterval(() => {
                setPrintProgress(prev => {
                    const next = prev + 1.5;
                    return next > 100 ? 100 : next;
                });
            }, 30);
            return () => clearInterval(timer);
        }
    }, [showReceipt, printProgress]);

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

    const clearCart = () => {
        if (cartItems.length === 0) return;

        const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        setReceiptData({
            items: [...cartItems],
            subtotal,
            tax,
            total,
            date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
            id: Math.random().toString().slice(2, 14)
        });

        setCartItems([]);
        setPrintProgress(0);
        setShowReceipt(true);
    };

    return (
        <div className="flex flex-1 min-w-0 bg-gray-50 overflow-hidden relative">
            {/* Receipt Modal */}
            {showReceipt && (
                <div className="fixed inset-0 z-[100] bg-blue-50/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
                    <button
                        onClick={() => setShowReceipt(false)}
                        className="absolute top-8 left-8 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col items-center p-8 relative">
                        <div className="w-full space-y-6">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                                <span>Muhammad syarif - cashier</span>
                            </div>

                            <div className="space-y-4 py-8">
                                {receiptData.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm font-bold text-gray-700">
                                        <span>{item.name}</span>
                                        <span className="text-gray-900">{item.qty}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-blue-100 w-full" />

                            <div className="space-y-4 text-xs font-bold text-gray-400 text-right">
                                <p>{receiptData.id}</p>
                                <div className="flex justify-between items-center">
                                    <span>Tanggal</span>
                                    <span>{receiptData.date}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900">RP {receiptData.subtotal.toLocaleString()}.000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Pajak</span>
                                    <span className="text-gray-900">RP {receiptData.tax.toLocaleString()}.000</span>
                                </div>
                            </div>

                            <div className="h-px bg-blue-100 w-full" />

                            <div className="space-y-3 text-sm font-extrabold">
                                <div className="flex justify-between items-center text-gray-400">
                                    <span>Type order</span>
                                    <span className="text-gray-900">Take away</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-400">
                                    <span>Type pay</span>
                                    <span className="text-gray-900">Cash</span>
                                </div>
                                <div className="flex justify-between items-center text-blue-600 pt-2">
                                    <span>Total</span>
                                    <span className="text-xl">RP {receiptData.total.toLocaleString()}.000</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-400">
                                    <span>Tunai</span>
                                    <span className="text-gray-900">RP 300.000</span>
                                </div>
                            </div>

                            <div className="h-px bg-blue-100 w-full" />

                            <div className="flex justify-between items-end pt-4">
                                <div className="text-xs">
                                    <h4 className="text-blue-600 font-black tracking-tight">RM. <span className="text-blue-500">MATA RESTO</span></h4>
                                </div>
                                <span className="text-[8px] font-bold text-gray-400">Jl. borgol No.32 Kota malang</span>
                            </div>

                            <div className="pt-12 text-center text-[10px] font-bold text-blue-600/80 leading-relaxed px-8">
                                Terima kasih atas kunjungan Anda,<br />kami berharap dapat melayani Anda kembali
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="mt-16 w-full max-w-4xl px-8">
                        <div className="flex justify-end mb-2">
                            <span className="text-blue-600 font-black text-xl italic">{Math.round(printProgress)}%</span>
                        </div>
                        <div className="h-6 w-full bg-white/50 rounded-full overflow-hidden border border-white/50 p-1 shadow-inner">
                            <div
                                className="h-full bg-blue-400 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-400/50"
                                style={{ width: `${printProgress}% ` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="px-8 py-6 flex items-center justify-between bg-white border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900">Check Out Order</h1>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors border border-gray-100 relative">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=60" alt="Admin" className="w-full h-full object-cover" />
                        </div>
                        <button className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors border border-gray-100">
                            <Settings size={20} />
                        </button>
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
                />
            </div>
        </div>
    );
}
