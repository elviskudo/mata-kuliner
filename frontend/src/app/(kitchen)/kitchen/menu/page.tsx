"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Utensils, CheckCircle, AlertTriangle, Edit3, Trash2 } from "lucide-react";
import AddMenuModal from "@/components/kitchen/AddMenuModal";
import MenuSuccessModal from "@/components/kitchen/menu/MenuSuccessModal";

interface Menu {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    isAvailable: boolean;
    availableQuantity?: number;
    ingredients?: any[];
}

export default function MenuPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [successModal, setSuccessModal] = useState<{ open: boolean; mode: 'add' | 'update' }>({ open: false, mode: 'add' });

    const API_BASE_URL = 'http://localhost:3001';

    const fetchMenus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/menus`);
            const data = await response.json();
            setMenus(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching menus:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleOpenAddModal = () => {
        setSelectedMenu(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (menu: Menu) => {
        setSelectedMenu(menu);
        setIsAddModalOpen(true);
    };

    const handleSuccess = (mode: 'add' | 'update') => {
        fetchMenus();
        setSuccessModal({ open: true, mode });
    };

    const handleDeleteMenu = async (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchMenus();
                } else {
                    alert('Failed to delete menu');
                }
            } catch (error) {
                console.error("Error deleting menu:", error);
                alert('Error deleting menu');
            }
        }
    };

    const filteredMenus = menus.filter((menu) => {
        const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || menu.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        total: menus.length,
        available: menus.filter(m => m.isAvailable).length,
        unavailable: menus.filter(m => !m.isAvailable).length
    };

    return (
        <div className="space-y-8">
            <AddMenuModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleSuccess}
                item={selectedMenu}
            />

            <MenuSuccessModal
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ ...successModal, open: false })}
                mode={successModal.mode}
            />

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform hover:scale-[1.02]"
                >
                    <Plus size={20} />
                    <span>Tambah Menu</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Utensils className="text-blue-600 w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total menu</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
                        <CheckCircle className="text-green-600 w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Available</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.available}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="text-red-600 w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Unavailable</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.unavailable}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
                    {["All", "Makanan", "Minuman"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeCategory === cat
                                ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search menu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* Menu Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
                    {filteredMenus.map((menu) => (
                        <div
                            key={menu.id}
                            className={`group relative bg-white rounded-[2rem] overflow-hidden transition-all duration-300 transform hover:-translate-y-2 border-2 ${!menu.isAvailable ? "border-red-200 bg-red-50/30" : "border-gray-50 shadow-xl hover:shadow-2xl hover:shadow-blue-100"
                                }`}
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={menu.image}
                                    alt={menu.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {!menu.isAvailable && (
                                    <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[2px] flex items-center justify-center">
                                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                            Out of Ingredients
                                        </span>
                                    </div>
                                )}
                                {menu.isAvailable && menu.availableQuantity !== undefined && (
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                            Tersedia: {menu.availableQuantity} porsi
                                        </span>
                                    </div>
                                )}
                                {/* Overlay Update Button */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="flex flex-col gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                        <button
                                            onClick={() => handleOpenEditModal(menu)}
                                            className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold shadow-xl flex items-center gap-2 hover:bg-blue-50"
                                        >
                                            <Edit3 size={18} />
                                            Update
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMenu(menu.id, menu.name)}
                                            className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl flex items-center gap-2 hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                        {menu.name}
                                    </h3>
                                </div>
                                <div className="mb-4">
                                    <p className="text-blue-600 font-black">Rp {parseFloat(menu.price as any || 0).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-bold">{menu.category}</span>
                                    <button
                                        onClick={() => handleDeleteMenu(menu.id, menu.name)}
                                        className="sm:hidden text-red-600 font-bold text-sm"
                                    >
                                        Hapus
                                    </button>
                                    <button
                                        onClick={() => handleOpenEditModal(menu)}
                                        className="sm:hidden text-blue-600 font-bold text-sm"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredMenus.length === 0 && !loading && (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Utensils className="mx-auto w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-xl font-bold text-gray-500">No menus found</p>
                    <p className="text-gray-400 mt-2">Try adjusting your search or category filter</p>
                </div>
            )}
        </div>
    );
}
