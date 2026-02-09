"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Search, Upload, Check } from 'lucide-react';

interface Ingredient {
    productId: number;
    name: string;
    quantity: number;
    unit: string;
}

interface Product {
    id: number;
    name: string;
    unit: string;
}

interface AddRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function AddRecipeModal({ isOpen, onClose, onSuccess, initialData }: AddRecipeModalProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [yieldValue, setYieldValue] = useState(1);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE_URL = 'http://localhost:3001';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category || '');
            setImagePreview(initialData.image || null);
            setIngredients(initialData.ingredients.map((ing: any) => ({
                productId: ing.product.id,
                name: ing.product.name,
                quantity: parseFloat(ing.quantity),
                unit: ing.product.unit
            })));
            setYieldValue(initialData.yield ? parseFloat(initialData.yield) : 1);
        } else {
            setName('');
            setCategory('');
            setImagePreview(null);
            setImageFile(null);
            setIngredients([]);
            setYieldValue(1);
            setSearchTerm('');
        }
    }, [initialData, isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const addIngredient = (product: Product) => {
        if (ingredients.some(ing => ing.productId === product.id)) {
            setSearchTerm('');
            return;
        }
        setIngredients([...ingredients, {
            productId: product.id,
            name: product.name,
            quantity: 1,
            unit: product.unit
        }]);
        setSearchTerm('');
    };

    const removeIngredient = (productId: number) => {
        setIngredients(ingredients.filter(ing => ing.productId !== productId));
    };

    const updateQuantity = (productId: number, quantity: string) => {
        const val = parseFloat(quantity) || 0;
        setIngredients(ingredients.map(ing =>
            ing.productId === productId ? { ...ing, quantity: val } : ing
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('yield', yieldValue.toString());
        formData.append('ingredients', JSON.stringify(ingredients.map(ing => ({
            productId: ing.productId,
            quantity: ing.quantity
        }))));

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const url = initialData ? `${API_BASE_URL}/recipes/${initialData.id}` : `${API_BASE_URL}/recipes`;
            const method = initialData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formData
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Gagal menyimpan resep: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ingredients.some(ing => ing.productId === p.id)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Resep' : 'Buat Resep Baru'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Upload Section */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700">Foto Resep</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#F3F4F6] border-2 border-dashed border-gray-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-blue-400 transition-all group relative min-h-[160px]"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {imagePreview ? (
                                <div className="relative w-full h-40">
                                    <img
                                        src={imagePreview.startsWith('blob') || imagePreview.startsWith('data') ? imagePreview : (imagePreview.startsWith('http') ? imagePreview : `${API_BASE_URL}${imagePreview}`)}
                                        alt="Preview"
                                        className="w-full h-full object-contain rounded-xl"
                                    />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                        <Check size={16} />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                        <Upload className="text-white w-8 h-8" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                                        <Upload className="text-gray-400 group-hover:text-blue-600 transition-colors" size={32} />
                                    </div>
                                    <p className="text-gray-500 font-bold">
                                        <span className="text-blue-600">Pilih Foto</span> untuk Resep
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 uppercase font-black tracking-widest">JPG, PNG, WEBP (MAX. 5MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nama Resep</label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-300"
                                placeholder="Contoh: Nasi Goreng Spesial"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Kategori</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-900 bg-white"
                            >
                                <option value="">Pilih Kategori</option>
                                <option value="Makanan">Makanan</option>
                                <option value="Minuman">Minuman</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Porsi yang Dihasilkan (Yield)</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 p-1 flex items-center">
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={yieldValue}
                                    onChange={(e) => setYieldValue(parseFloat(e.target.value) || 1)}
                                    className="flex-1 bg-transparent px-5 py-3 focus:outline-none text-gray-900 font-bold"
                                    placeholder="1"
                                />
                                <span className="px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-widest bg-white rounded-xl shadow-sm">Porsi</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100">
                            <label className="text-sm font-bold text-gray-700 ml-2">Pilih Bahan Baku</label>
                            <div className="relative w-72 group">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari & tambah bahan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3 text-sm rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                {searchTerm && (
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-20 max-h-64 overflow-y-auto p-2 scrollbar-none animate-in fade-in slide-in-from-top-2">
                                        <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                                            Hasil Pencarian
                                        </div>
                                        {filteredProducts.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-400 text-sm italic">
                                                Tidak ada bahan ditemukan
                                            </div>
                                        ) : (
                                            filteredProducts.map(product => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => addIngredient(product)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 rounded-xl flex justify-between items-center group transition-colors"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{product.name}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{product.unit}</span>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                                                        <Plus size={14} className="text-blue-600 group-hover:text-white" />
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {ingredients.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Belum ada bahan ditambahkan</p>
                                </div>
                            ) : (
                                ingredients.map((ing) => (
                                    <div key={ing.productId} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50 group hover:border-blue-100 transition-all">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">{ing.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{ing.unit}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={ing.quantity}
                                                onChange={(e) => updateQuantity(ing.productId, e.target.value)}
                                                className="w-24 px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-100 outline-none text-right font-black text-blue-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeIngredient(ing.productId)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-gray-100 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-200 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name || ingredients.length === 0}
                        className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all transform active:scale-[0.98]"
                    >
                        {loading ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Buat Resep'}
                    </button>
                </div>
            </div>
        </div>
    );
}
