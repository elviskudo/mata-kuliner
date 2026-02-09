"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, BookOpen, Search, ChevronDown } from "lucide-react";

interface Product {
    id: number;
    name: string;
    unit: string;
    stock: number;
}

interface AddMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (mode: 'add' | 'update') => void;
    item?: any; // Data for editing
}

export default function AddMenuModal({ isOpen, onClose, onSuccess, item }: AddMenuModalProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Makanan");
    const [price, setPrice] = useState("0");
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedIngredients, setSelectedIngredients] = useState<{ productId: string; quantity: number }[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState("");
    const [recipeSearchTerm, setRecipeSearchTerm] = useState("");
    const [showRecipeDropdown, setShowRecipeDropdown] = useState(false);
    const [yieldValue, setYieldValue] = useState(1);
    const [productionQuantity, setProductionQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:3001';

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            fetchRecipes();
            if (item) {
                setName(item.name);
                setCategory(item.category);
                setPrice(item.price?.toString() || "0");
                setImagePreview(item.image);
                setSelectedRecipeId(item.recipeId?.toString() || "");
                setYieldValue(item.yield ? parseFloat(item.yield) : 1);
                // Load ingredients if available
                if (item.ingredients) {
                    setSelectedIngredients(item.ingredients.map((ing: any) => ({
                        productId: ing.product.id.toString(),
                        quantity: ing.quantity
                    })));
                }
            } else {
                // Reset for new item
                setName("");
                setCategory("Makanan");
                setPrice("0");
                setImagePreview(null);
                setSelectedIngredients([]);
                setSelectedRecipeId("");
                setRecipeSearchTerm("");
                setYieldValue(1);
                setProductionQuantity(1);
            }
        }
    }, [isOpen, item]);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchRecipes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/recipes`);
            const data = await response.json();
            setRecipes(data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    };

    const handleRecipeSelect = (recipe: any) => {
        setSelectedRecipeId(recipe.id.toString());
        setRecipeSearchTerm(recipe.name);
        setShowRecipeDropdown(false);

        if (recipe.ingredients) {
            setSelectedIngredients(recipe.ingredients.map((ing: any) => ({
                productId: ing.product.id.toString(),
                quantity: parseFloat(ing.quantity)
            })));
            setYieldValue(recipe.yield ? parseFloat(recipe.yield) : 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (selectedIngredients.some(ing => !ing.productId)) {
                alert("Semua bahan baku harus dipilih!");
                setLoading(false);
                return;
            }

            const url = item ? `${API_BASE_URL}/menus/${item.id}` : `${API_BASE_URL}/menus`;
            const method = item ? "PATCH" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    category,
                    price: typeof price === 'string' ? parseFloat(price.replace(/[,.]/g, '')) : (parseFloat(price) || 0),
                    image: imagePreview || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
                    recipeId: selectedRecipeId ? parseInt(selectedRecipeId) : undefined,
                    productionQuantity: item ? undefined : productionQuantity,
                    ingredients: selectedIngredients.map(ing => ({
                        productId: parseInt(ing.productId),
                        quantity: ing.quantity
                    })),
                }),
            });

            if (response.ok) {
                onSuccess(item ? 'update' : 'add');
                onClose();
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Gagal menyimpan menu: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Error saving menu:", error);
            alert("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(recipeSearchTerm.toLowerCase())
    );

    const currentRecipe = recipes.find(r => r.id.toString() === selectedRecipeId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{item ? 'Update Menu' : 'Tambah Menu Baru'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Resep (Opsional)</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Search size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={currentRecipe ? currentRecipe.name : "-- Gunakan Resep --"}
                                        value={recipeSearchTerm}
                                        onChange={(e) => {
                                            setRecipeSearchTerm(e.target.value);
                                            setShowRecipeDropdown(true);
                                        }}
                                        onFocus={() => setShowRecipeDropdown(true)}
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRecipeDropdown(!showRecipeDropdown)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <ChevronDown size={18} className={`transition-transform duration-200 ${showRecipeDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                                {showRecipeDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 max-h-60 overflow-y-auto p-2 scrollbar-none animate-in fade-in slide-in-from-top-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedRecipeId("");
                                                setRecipeSearchTerm("");
                                                setShowRecipeDropdown(false);
                                                setSelectedIngredients([]);
                                                setYieldValue(1);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors mb-1"
                                        >
                                            <Trash2 size={16} />
                                            Reset Resep
                                        </button>
                                        <div className="h-px bg-gray-50 my-1 mx-2" />
                                        {filteredRecipes.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-400 text-sm italic">
                                                Tidak ada resep ditemukan
                                            </div>
                                        ) : (
                                            filteredRecipes.map(recipe => (
                                                <button
                                                    key={recipe.id}
                                                    type="button"
                                                    onClick={() => handleRecipeSelect(recipe)}
                                                    className={`w-full px-4 py-3 text-left rounded-xl transition-all flex items-center justify-between group ${selectedRecipeId === recipe.id.toString()
                                                        ? 'bg-blue-600 text-white'
                                                        : 'hover:bg-blue-50 text-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{recipe.name}</span>
                                                        <span className={`text-[10px] uppercase font-black tracking-wider ${selectedRecipeId === recipe.id.toString() ? 'text-blue-100' : 'text-gray-400'
                                                            }`}>
                                                            {recipe.category || 'REGULER'} • {recipe.yield} PORSI
                                                        </span>
                                                    </div>
                                                    {selectedRecipeId === recipe.id.toString() && (
                                                        <Plus size={16} className="rotate-45" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Menu</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Steak Daging"
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-900 appearance-none bg-no-repeat bg-[right_1.25rem_center] bg-[length:1em_1em]"
                                >
                                    <option>Makanan</option>
                                    <option>Minuman</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Harga Jual (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Contoh: 35000"
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Porsi per Batch</label>
                                <div className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 font-bold">
                                    {yieldValue} porsi
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Otomatis dari resep yang dipilih</p>
                            </div>
                            {!item && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah Batch Produksi</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={productionQuantity}
                                        onChange={(e) => setProductionQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-300"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Total porsi: {productionQuantity * yieldValue} porsi</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Gambar</label>
                            <label className="relative group cursor-pointer block h-[145px]">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div className={`h-full w-full border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${imagePreview ? 'border-transparent' : 'border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50/30'
                                    }`}>
                                    {imagePreview ? (
                                        <div className="relative w-full h-full">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="text-white w-10 h-10" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                                                <Upload className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-600">
                                                <span className="text-blue-600">Upload a file</span>
                                            </p>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Bahan Baku Utama</h3>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Mata Kuliner Standard</span>
                        </div>

                        {selectedIngredients.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                    <BookOpen className="text-gray-300" size={32} />
                                </div>
                                <p className="text-gray-500 font-medium">Silakan pilih resep untuk mengisi bahan baku</p>
                                <p className="text-gray-400 text-xs mt-1">Menu saat ini hanya mendukung penambahan via Resep</p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Daftar Bahan dari Resep</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedIngredients.map((ing, index) => {
                                        const product = products.find(p => p.id.toString() === ing.productId);
                                        return (
                                            <div key={index} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                                                <div>
                                                    <p className="font-bold text-gray-900">{product?.name || "Bahan"}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{product?.stock} {product?.unit} tersedia</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-blue-600">{ing.quantity}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{product?.unit}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-200 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-8 py-4 rounded-2xl bg-blue-600 font-bold text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 transform active:scale-[0.98]"
                        >
                            {loading ? "Menyimpan..." : (item ? "Update Menu" : "Simpan Menu")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
