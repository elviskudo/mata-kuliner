"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, AlertTriangle, Box, Coffee } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { WasteLogModal } from "@/components/kitchen/WasteLogModal";

interface WasteLog {
    id: number;
    type: 'MENU' | 'INGREDIENT';
    itemId: number;
    itemName: string;
    quantity: number;
    action: 'DISCARDED' | 'STORED' | 'RETURNED';
    reason: string;
    createdAt: string;
}

export default function WasteLogPage() {
    const [logs, setLogs] = useState<WasteLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/waste-logs`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Waste Log (Bahan Rusak)</h1>
                    <p className="text-gray-500 mt-1 text-sm">Catat bahan baku atau menu yang terbuang/rusak</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <AlertTriangle size={20} />
                    <span>Lapor Item Rusak</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Riwayat Laporan</h2>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari item / alasan..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
                            <Loader2 size={32} className="animate-spin text-red-600" />
                            <p className="font-medium">Memuat data...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
                                <Search size={28} className="text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-600">Tidak ada laporan kerusakan</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">Tanggal</th>
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">Tipe</th>
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">Nama Item</th>
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">Qty</th>
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">Aksi / Alasan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {new Date(log.createdAt).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${log.type === 'INGREDIENT' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                {log.type === 'INGREDIENT' ? <Box size={14} /> : <Coffee size={14} />}
                                                {log.type === 'INGREDIENT' ? 'BAHAN' : 'MENU'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-900">{log.itemName}</td>
                                        <td className="py-4 px-6 text-sm font-bold text-red-600">-{log.quantity}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900">{log.action}</span>
                                                <span className="text-sm text-gray-500 mt-0.5">{log.reason}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <WasteLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchLogs}
            />
        </div>
    );
}
