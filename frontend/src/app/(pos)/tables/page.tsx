"use client";

import { useState, useEffect } from "react";
import { Plus, X, Users, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import HeaderProfileBadge from "@/components/shared/HeaderProfileBadge";

interface Table {
    id: number;
    tableNumber: string;
    capacity: number;
    status: 'Empty' | 'Occupied' | 'Reserved';
}

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Add Table Form State
    const [newTableNumber, setNewTableNumber] = useState('');
    const [newTableCapacity, setNewTableCapacity] = useState('4');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/tables`);
            if (response.ok) {
                const data = await response.json();
                setTables(data);
            }
        } catch (error) {
            console.error('Failed to fetch tables:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleAddTable = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/tables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableNumber: newTableNumber,
                    capacity: parseInt(newTableCapacity),
                    status: 'Empty'
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Gagal menambah meja');
            }

            setNewTableNumber('');
            setNewTableCapacity('4');
            setShowAddModal(false);
            fetchTables();
            alert('Meja berhasil ditambahkan!');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id: number, currentStatus: string) => {
        // Toggle status simple implementation
        const nextStatus = currentStatus === 'Empty' ? 'Occupied' : 'Empty';

        if (!confirm(`Konfirmasi ubah status meja menjadi ${nextStatus}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/tables/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });

            if (response.ok) {
                fetchTables();
            } else {
                alert('Gagal mengubah status meja');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat mengubah status meja');
        }
    };

    const handleDeleteTable = async (id: number, tableNumber: string) => {
        if (!confirm(`Hapus meja ${tableNumber}? Data tidak dapat dikembalikan.`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchTables();
            } else {
                alert('Gagal menghapus meja');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat menghapus meja');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 h-[100dvh]">
            <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-10 w-full shrink-0">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manajemen Meja</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Kelola ketersediaan dan kapasitas meja restoran</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchTables}
                        className="px-4 py-2 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-200"
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        <Plus size={20} /> Tambah Meja
                    </button>
                    <HeaderProfileBadge role="Cashier" />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto w-full relative">
                <div className="p-8 max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Memuat data meja...</p>
                        </div>
                    ) : tables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-300">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada meja</h3>
                            <p className="text-gray-500 max-w-sm text-center mb-6">Mulai tambahkan meja untuk mengatur posisi Dine In pelanggan Anda.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                + Tambah Meja Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {tables.map((table) => {
                                const isEmpty = table.status === 'Empty';
                                const isOccupied = table.status === 'Occupied';
                                const isReserved = table.status === 'Reserved';

                                return (
                                    <div key={table.id} className="relative group perspective-1000">
                                        <div className={`
                                            relative bg-white rounded-[2rem] p-6 flex flex-col items-center transition-all duration-300 border-2 shadow-sm
                                            hover:shadow-xl hover:-translate-y-1 group-hover:border-gray-300
                                            ${isEmpty ? 'border-green-100' : ''}
                                            ${isOccupied ? 'border-orange-100 bg-orange-50/30' : ''}
                                            ${isReserved ? 'border-purple-100 bg-purple-50/30' : ''}
                                        `}>
                                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteTable(table.id, table.tableNumber)}
                                                    className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Hapus Meja"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>

                                            <div className={`
                                                w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors relative
                                                ${isEmpty ? 'bg-green-50 text-green-600' : ''}
                                                ${isOccupied ? 'bg-orange-100 text-orange-600' : ''}
                                                ${isReserved ? 'bg-purple-100 text-purple-600' : ''}
                                            `}>
                                                <span className="text-3xl font-black">{table.tableNumber}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-500 mb-6">
                                                <Users size={16} />
                                                <span>Kapasitas {table.capacity}</span>
                                            </div>

                                            <button
                                                onClick={() => handleUpdateStatus(table.id, table.status)}
                                                className={`
                                                    w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 border
                                                    ${isEmpty ? 'bg-green-500 hover:bg-green-600 text-white border-green-600' : ''}
                                                    ${isOccupied ? 'bg-white hover:bg-orange-100 text-orange-600 border-orange-200' : ''}
                                                    ${isReserved ? 'bg-white hover:bg-purple-100 text-purple-600 border-purple-200' : ''}
                                                `}
                                            >
                                                {isEmpty ? 'Set Occupied' : isEmpty ? 'Kosong' : 'Set Empty'}
                                            </button>

                                            <div className="mt-3 text-xs font-black uppercase tracking-widest text-gray-400">
                                                Status: <span className={`
                                                    ${isEmpty ? 'text-green-500' : ''}
                                                    ${isOccupied ? 'text-orange-500' : ''}
                                                    ${isReserved ? 'text-purple-500' : ''}
                                                `}>{table.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Table Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Tambah Meja Baru</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">Masukkan informasi detail meja</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTable} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nomor / Nama Meja</label>
                                <input
                                    type="text"
                                    required
                                    value={newTableNumber}
                                    onChange={(e) => setNewTableNumber(e.target.value)}
                                    placeholder="Contoh: 12, VIP-1, Teras A"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Kapasitas Orang</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={newTableCapacity}
                                    onChange={(e) => setNewTableCapacity(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Meja'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
