"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import OpnameModal from '@/components/kitchen/OpnameModal';

interface StockOpname {
    id: number;
    itemId: number;
    itemName: string;
    systemStock: number;
    physicalStock: number;
    difference: number;
    notes: string;
    status: string;
    reportedBy: string;
    createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function StockOpnamePage() {
    const [opnames, setOpnames] = useState<StockOpname[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchOpnames = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/stock-opname`);
            if (response.ok) {
                const data = await response.json();
                setOpnames(data);
            }
        } catch (error) {
            console.error('Failed to fetch opnames:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpnames();
    }, []);

    const filteredOpnames = opnames.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reportedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <OpnameModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchOpnames}
            />

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Stock Opname</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm"
                >
                    <Plus size={20} />
                    <span>Lapor Opname</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama item atau pelapor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring-blue-300 sm:text-sm transition duration-150 ease-in-out"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bahan / Produk</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Stok Sistem</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Stok Fisik</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Selisih</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pelapor</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">Memuat data...</td>
                                </tr>
                            ) : filteredOpnames.length > 0 ? (
                                filteredOpnames.map((opname) => (
                                    <tr key={opname.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(opname.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {opname.itemName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                                            {Number(opname.systemStock).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                                            {Number(opname.physicalStock).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                            <span className={Number(opname.difference) < 0 ? 'text-red-600' : Number(opname.difference) > 0 ? 'text-green-600' : 'text-gray-500'}>
                                                {Number(opname.difference) > 0 ? '+' : ''}{Number(opname.difference).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {opname.notes || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {opname.reportedBy}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl border
                                                ${opname.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    opname.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'}
                                            `}>
                                                {opname.status === 'PENDING' ? 'Menunggu' : opname.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        Tidak ada data opname yang ditemukan {searchQuery && `untuk "${searchQuery}"`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
