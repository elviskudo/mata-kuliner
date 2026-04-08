'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RestockRequestPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [items, setItems] = useState([{ name: '', qty: 1, unit: 'kg', estimatedPrice: 0 }]);

    const handleAddItem = () => {
        setItems([...items, { name: '', qty: 1, unit: 'kg', estimatedPrice: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Filter out empty items
        const validItems = items.filter(item => item.name.trim() !== '' && item.qty > 0);
        if (validItems.length === 0) {
            alert('Tambahkan minimal 1 bahan yang ingin di-restock.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:3001/restock-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    items: validItems,
                    requestedBy: 'Dapur' // In a real app, this would come from auth context
                }),
            });

            if (!res.ok) throw new Error('Failed to submit request');
            
            alert('Pengajuan Restock Berhasil Dikirim ke Owner!');
            router.push('/kitchen');
        } catch (error) {
            console.error('Error submitting restock request:', error);
            alert('Terjadi kesalahan saat mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalEstimated = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.estimatedPrice)), 0);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Pengajuan Beli Bahan</h1>
                        <p className="text-sm text-gray-500">Minta Owner untuk restock bahan dapur</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-orange-50 border-b border-orange-100">
                        <h2 className="text-orange-800 font-semibold mb-1">Penting!</h2>
                        <p className="text-sm text-orange-700">Pastikan estimasi harga diisi dengan benar untuk mempermudah Owner menyetujui anggaran belanja.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            placeholder="Contoh: Beras, Es Batu..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>
                                    <div className="w-full md:w-24">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                                            min="0.1"
                                            step="0.1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>
                                    <div className="w-full md:w-24">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                                        <select
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="gram">gram</option>
                                            <option value="liter">liter</option>
                                            <option value="ml">ml</option>
                                            <option value="pcs">pcs</option>
                                            <option value="ikat">ikat</option>
                                        </select>
                                    </div>
                                    <div className="w-full md:w-40">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Harga/Satuan</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                                            <input
                                                type="number"
                                                value={item.estimatedPrice}
                                                onChange={(e) => handleItemChange(index, 'estimatedPrice', Number(e.target.value))}
                                                min="0"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-red-500 hover:text-red-700 p-2 md:mt-6 bg-red-50 rounded-lg md:bg-transparent"
                                        >
                                            <Trash2 className="w-5 h-5 mx-auto" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="mt-4 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium py-2 px-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors w-full md:w-auto justify-center"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Bahan Lain
                        </button>

                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Estimasi Anggaran</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        Rp {totalEstimated.toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto px-8 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan ke Owner'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
