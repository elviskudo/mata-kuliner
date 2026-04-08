"use client";

import { useState, useEffect } from "react";
import { Package, Search } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Product {
    id: number;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    unit: string;
    image: string | null;
}

function getStatus(p: Product) {
    if (p.stock === 0) return { label: "Habis", cls: "bg-red-50 text-red-600" };
    if (p.stock <= p.minStock) return { label: "Stok Rendah", cls: "bg-orange-50 text-orange-600" };
    return { label: "Tersedia", cls: "bg-green-50 text-green-600" };
}

export default function StockPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch(`${API_BASE_URL}/products`)
            .then((r) => r.json())
            .then(setProducts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.category || "").toLowerCase().includes(search.toLowerCase())
    );

    const lowStock = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Package className="text-violet-500" size={28} />
                        Stok Bahan
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">Pantau persediaan bahan dari dapur</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari bahan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                </div>
            </div>

            {/* Stats bar */}
            <div className="flex gap-4 flex-wrap">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
                    <span className="text-2xl font-black text-violet-600">{products.length}</span>
                    <span className="text-sm font-medium text-gray-500">Total Bahan</span>
                </div>
                {lowStock > 0 && (
                    <div className="bg-orange-50 rounded-xl border border-orange-100 shadow-sm px-6 py-4 flex items-center gap-3">
                        <span className="text-2xl font-black text-orange-600">{lowStock}</span>
                        <span className="text-sm font-medium text-orange-500">Stok Rendah</span>
                    </div>
                )}
                {outOfStock > 0 && (
                    <div className="bg-red-50 rounded-xl border border-red-100 shadow-sm px-6 py-4 flex items-center gap-3">
                        <span className="text-2xl font-black text-red-600">{outOfStock}</span>
                        <span className="text-sm font-medium text-red-500">Stok Habis</span>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Gambar", "Nama Bahan", "Kategori", "Stok Saat Ini", "Min. Stok", "Satuan", "Status"].map((h) => (
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
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        Tidak ada bahan ditemukan
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => {
                                    const status = getStatus(p);
                                    const imageUrl = p.image
                                        ? p.image.startsWith("http")
                                            ? p.image
                                            : `${API_BASE_URL}${p.image}`
                                        : null;
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                                    {imageUrl ? (
                                                        <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold">
                                                    {p.category || "Umum"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-gray-900">{p.stock}</td>
                                            <td className="px-6 py-4 text-gray-400 font-medium">{p.minStock}</td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{p.unit}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${status.cls}`}>
                                                    {status.label}
                                                </span>
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
                        Menampilkan {filtered.length} dari {products.length} bahan
                    </div>
                )}
            </div>
        </div>
    );
}
