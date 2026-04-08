import { useState, useEffect } from "react";
import { X, Search, Loader2, AlertTriangle, Hash, MessageSquare } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Item {
    id: number;
    name: string;
    stock: number;
}

interface WasteLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function WasteLogModal({ isOpen, onClose, onSuccess }: WasteLogModalProps) {
    const [type, setType] = useState<'MENU' | 'INGREDIENT'>('INGREDIENT');
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [action, setAction] = useState('DISCARDED');
    const [reason, setReason] = useState("");

    const [loadingItems, setLoadingItems] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchItems = async () => {
            setLoadingItems(true);
            try {
                const endpoint = type === 'MENU' ? '/menus' : '/products';
                const res = await fetch(`${API_BASE_URL}${endpoint}`);
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } catch (error) {
                console.error("Failed to fetch items", error);
            } finally {
                setLoadingItems(false);
            }
        };

        fetchItems();
        setSelectedItemId('');
    }, [isOpen, type]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSubmit(true);

        try {
            const response = await fetch(`${API_BASE_URL}/waste-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    itemId: Number(selectedItemId),
                    quantity: Number(quantity),
                    action,
                    reason
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Gagal menyimpan laporan');
            }

            onSuccess();
            onClose();

            // Reset form
            setSelectedItemId('');
            setQuantity('');
            setReason('');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    const selectedItem = items.find(i => i.id === Number(selectedItemId));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="text-red-500 w-5 h-5" />
                        Lapor Item Rusak
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Type Selection */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setType('INGREDIENT')}
                                className={`py-2.5 rounded-xl font-bold text-sm transition-colors border-2 ${type === 'INGREDIENT' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                            >
                                Bahan Baku
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('MENU')}
                                className={`py-2.5 rounded-xl font-bold text-sm transition-colors border-2 ${type === 'MENU' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                            >
                                Menu Siap Saji
                            </button>
                        </div>

                        {/* Item Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Pilih Item</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {loadingItems ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Search className="w-5 h-5 text-gray-400" />}
                                </div>
                                <select
                                    required
                                    value={selectedItemId}
                                    onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : '')}
                                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors appearance-none"
                                >
                                    <option value="" disabled>Pilih {type === 'INGREDIENT' ? 'bahan' : 'menu'}...</option>
                                    {items.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (Stok: {item.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Quantity & Action */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Jumlah Rusak</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                                        className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
                                        placeholder="0"
                                    />
                                </div>
                                {selectedItem && quantity && Number(quantity) > selectedItem.stock && (
                                    <p className="text-xs text-red-500 font-bold mt-1">Stok tidak cukup</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Tindakan</label>
                                <select
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
                                >
                                    <option value="DISCARDED">Dibuang</option>
                                    <option value="STORED">Disimpan</option>
                                    <option value="RETURNED">Dikembalikan</option>
                                </select>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Alasan / Keterangan</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <MessageSquare className="w-5 h-5 text-gray-400" />
                                </div>
                                <textarea
                                    required
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors resize-none"
                                    placeholder="Contoh: Jatuh ke lantai saat dipindahkan..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loadingSubmit || !selectedItem || Number(quantity) > selectedItem?.stock}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loadingSubmit ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Laporkan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
