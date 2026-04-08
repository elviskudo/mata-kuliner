"use client";

import { useState, useEffect } from "react";
import { UtensilsCrossed, Search, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Recipe {
    id: number;
    name: string;
    category: string;
    image: string | null;
    ingredients: any[];
}

interface ActiveMenu {
    id: number;
    name: string;
    stock: number;
}

export default function MenuPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [activeMenus, setActiveMenus] = useState<ActiveMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        setError(false);
        Promise.all([
            fetch(`${API_BASE_URL}/recipes`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
            fetch(`${API_BASE_URL}/menus`).then(r => r.ok ? r.json() : []).catch(() => []),
        ])
            .then(([recipesData, menusData]) => {
                setRecipes(recipesData);
                setActiveMenus(menusData);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    // Join recipes with active menu stock by name (case-insensitive)
    const getStock = (recipeName: string): number | null => {
        const match = activeMenus.find(m => m.name.toLowerCase() === recipeName.toLowerCase());
        return match ? match.stock : null;
    };

    const filtered = recipes.filter(
        (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            (r.category || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <UtensilsCrossed className="text-emerald-500" size={28} />
                        Daftar Menu
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">Menu yang telah dibuat oleh dapur</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari menu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
                    <span className="text-2xl font-black text-emerald-600">{recipes.length}</span>
                    <span className="text-sm font-medium text-gray-500">Total Menu</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
                    <span className="text-2xl font-black text-blue-600">
                        {[...new Set(recipes.map((r) => r.category).filter(Boolean))].length}
                    </span>
                    <span className="text-sm font-medium text-gray-500">Kategori</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
                    <span className="text-2xl font-black text-orange-500">{activeMenus.length}</span>
                    <span className="text-sm font-medium text-gray-500">Menu Aktif Hari Ini</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Gambar", "Nama Menu", "Kategori", "Jumlah Bahan", "Stok Hari Ini"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-gray-400 mb-3">Gagal memuat data menu. Backend mungkin belum siap.</p>
                                        <button
                                            onClick={loadData}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
                                        >
                                            <RefreshCw size={15} />
                                            Coba Lagi
                                        </button>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Tidak ada menu ditemukan
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((recipe) => {
                                    const stock = getStock(recipe.name);
                                    return (
                                        <tr key={recipe.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                                                    {recipe.image ? (
                                                        <img
                                                            src={
                                                                recipe.image.startsWith("http") || recipe.image.startsWith("data")
                                                                    ? recipe.image
                                                                    : `${API_BASE_URL}${recipe.image}`
                                                            }
                                                            alt={recipe.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <img
                                                            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60"
                                                            alt={recipe.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{recipe.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                                                    {recipe.category || "Umum"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                                    {recipe.ingredients?.length ?? 0} bahan
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {stock !== null ? (
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${stock > 10 ? "bg-green-100 text-green-700" : stock > 0 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-500"}`}>
                                                        {stock} porsi
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium">
                                                        Tidak aktif
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 text-sm text-gray-400 font-medium">
                        Menampilkan {filtered.length} dari {recipes.length} menu
                    </div>
                )}
            </div>
        </div>
    );
}
