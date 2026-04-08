"use client";

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface OpnameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Product {
    id: number;
    name: string;
    stock: number;
    unit: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OpnameModal({ isOpen, onClose, onSuccess }: OpnameModalProps) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        physicalStock: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            resetForm();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/products`); // Fetching ingredients
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const resetForm = () => {
        setFormData({ physicalStock: '', notes: '' });
        setSelectedProduct(null);
        setSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct) {
            alert('Pilih bahan terlebih dahulu');
            return;
        }

        if (!formData.physicalStock || isNaN(Number(formData.physicalStock))) {
            alert('Masukkan stok fisik yang valid');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                itemId: selectedProduct.id,
                itemName: selectedProduct.name,
                systemStock: Number(selectedProduct.stock),
                physicalStock: Number(formData.physicalStock),
                notes: formData.notes,
                reportedBy: 'Kitchen Staff' // Should come from auth state later
            };

            const res = await fetch(`${API_BASE_URL}/stock-opname`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Gagal menyimpan opname');
            }

            alert('Data Stock Opname berhasil dikirim (Menunggu approval Admin)');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Submit error:', error);
            alert(error.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">Lapor Stock Opname</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Item Selection */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Pilih Bahan / Produk</label>

                            {!selectedProduct ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center">
                                        <Search size={16} className="text-gray-400 mr-2" />
                                        <input
                                            type="text"
                                            placeholder="Cari bahan..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-transparent text-sm focus:outline-none"
                                        />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto bg-white p-1">
                                        {filteredProducts.map(product => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => setSelectedProduct(product)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors flex justify-between items-center"
                                            >
                                                <span>{product.name}</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Stok: {product.stock} {product.unit}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 text-blue-800 rounded-xl">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{selectedProduct.name}</span>
                                        <span className="text-xs text-blue-600/80">Stok Sistem: {selectedProduct.stock} {selectedProduct.unit}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProduct(null)}
                                        className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 font-bold hover:bg-blue-100"
                                    >
                                        Ganti
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedProduct && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-5">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Stok Fisik Aktual</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            value={formData.physicalStock}
                                            onChange={(e) => setFormData({ ...formData, physicalStock: e.target.value })}
                                            className="w-full border-gray-300 border focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 shadow-sm outline-none"
                                            placeholder="0"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm font-medium">{selectedProduct.unit}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Masukkan jumlah barang yang sebenarnya ada di dapur.</p>
                                </div>

                                {/* Preview Selisih */}
                                {formData.physicalStock && (
                                    <div className={`p-4 rounded-xl border ${Number(formData.physicalStock) < selectedProduct.stock ? 'bg-red-50 border-red-100 text-red-800' : Number(formData.physicalStock) > selectedProduct.stock ? 'bg-green-50 border-green-100 text-green-800' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                Selisih:
                                            </span>
                                            <span className="font-bold text-lg">
                                                {Number(formData.physicalStock) - selectedProduct.stock} {selectedProduct.unit}
                                            </span>
                                        </div>
                                        <p className="text-xs mt-1 opacity-80">
                                            {Number(formData.physicalStock) < selectedProduct.stock ? 'Stok fisik lebih sedikit dari sistem (Kehilangan/Rusak)' : Number(formData.physicalStock) > selectedProduct.stock ? 'Stok fisik lebih banyak dari sistem (Kelebihan/Bonus)' : 'Stok sesuai dengan sistem'}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Catatan/Alasan (Opsional)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full border-gray-300 border focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 shadow-sm outline-none min-h-[100px]"
                                        placeholder="Contoh: Ada 5 telur yang pecah tidak terlaporkan..."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedProduct || !formData.physicalStock}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors shadow-sm disabled:shadow-none min-w-[120px]"
                            >
                                {loading ? 'Menyimpan...' : 'Kirim Laporan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
