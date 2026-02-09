"use client";

import { X, Upload, Check } from 'lucide-react';
import { useState, useRef } from 'react';

interface AddStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddStockModal({ isOpen, onClose, onSuccess }: AddStockModalProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Bumbu');
    const [stock, setStock] = useState('0');
    const [minStock, setMinStock] = useState('3');
    const [unit, setUnit] = useState('Pcs');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!name || isSubmitting) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('price', '0'); // Default price for now
        formData.append('stock', stock);
        formData.append('minStock', minStock);
        formData.append('unit', unit);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await fetch('http://localhost:3001/products', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                onSuccess();
                // Reset form
                setName('');
                setCategory('Bumbu');
                setStock('0');
                setMinStock('3');
                setUnit('Pcs');
                setImage(null);
                setPreviewUrl(null);
                onClose();
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || 'Gagal menambahkan bahan baku');
            }
        } catch (error) {
            console.error('Error adding product:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add Items</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={28} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#F3F4F6] border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors relative min-h-[160px]"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        {previewUrl ? (
                            <div className="relative w-full h-32">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full">
                                    <Check size={16} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-[#9CA3AF] text-lg font-semibold mb-2">Pilih atau Drag Gambar!</p>
                                <div className="text-[#D1D5DB]">
                                    <Upload size={48} strokeWidth={1.5} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Item Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 text-[15px]">Item Name</label>
                        <input
                            type="text"
                            placeholder="Telur"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 text-[15px]">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900"
                            >
                                <option>Bumbu</option>
                                <option>Bahan Baku</option>
                                <option>Sayuran</option>
                                <option>Buah</option>
                                <option>Daging</option>
                                <option>Minuman</option>
                            </select>
                        </div>
                        {/* Unit */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 text-[15px]">Unit</label>
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900"
                            >
                                <option>Pcs</option>
                                <option>Kg</option>
                                <option>Gram</option>
                                <option>Liter</option>
                                <option>Bungkus</option>
                            </select>
                        </div>
                    </div>

                    {/* Stock Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 text-[15px]">Initial Stock</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 text-[15px]">Minimum Stock</label>
                            <input
                                type="number"
                                placeholder="3"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-[#E5E7EB] text-gray-600 rounded-xl font-bold text-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !name}
                            className={`flex-1 py-4 bg-[#60A5FA] text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition-colors shadow-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Saving...' : 'Tambah item'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
