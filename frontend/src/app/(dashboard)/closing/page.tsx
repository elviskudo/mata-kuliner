"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Save, AlertTriangle, Archive, Trash2, CheckCircle, Eye, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { Loader2 } from "lucide-react";

interface MenuStock {
    id: number;
    name: string;
    stock: number;
    image: string;
    // Client state
    storedQty: number;
    storedReason: string;
    discardedQty: number;
    discardedReason: string;
}

export default function ClosingPage() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [menus, setMenus] = useState<MenuStock[]>([]);
    const [date, setDate] = useState("");

    useEffect(() => {
        setDate(new Date().toISOString().split('T')[0]);
    }, []);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Modal State
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    useEffect(() => {
        if (date) {
            fetchData();
        }
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Summary
            const sumRes = await fetch(`${API_BASE_URL}/operational/closing-summary?date=${date}`);
            const sumData = await sumRes.json();
            setSummary(sumData);

            // Fetch Menus for Stock Opname
            // We only need menus if the day is NOT closed yet, or if we want to show what was closed?
            // If closed, we should show the report.
            // For now, let's assume we are doing closing for TODAY.
            if (!sumData.isClosed) {
                const menuRes = await fetch(`${API_BASE_URL}/menus`);
                const menuData = await menuRes.json();
                setMenus(menuData.map((m: any) => ({
                    ...m,
                    stock: Number(m.stock), // System stock
                    storedQty: Number(m.stock), // Default carry over = system stock
                    storedReason: "Sisa Layak", // Default reason
                    discardedQty: 0,
                    discardedReason: ""
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id: number, field: keyof MenuStock, value: any) => {
        setMenus(prev => prev.map(m => {
            if (m.id === id) {
                return { ...m, [field]: value };
            }
            return m;
        }));
    };

    const handleSubmit = async () => {
        // Validate
        const invalidReason = menus.find(m =>
            (m.discardedQty > 0 && !m.discardedReason) ||
            (m.storedQty > 0 && !m.storedReason)
        );

        if (invalidReason) {
            alert(`Harap isi alasan untuk menu "${invalidReason.name}"!`);
            return;
        }

        const mismatchedStock = menus.find(m => (m.storedQty + m.discardedQty) !== m.stock);
        if (mismatchedStock) {
            alert(`Total (Simpan: ${mismatchedStock.storedQty} + Dibuang: ${mismatchedStock.discardedQty}) untuk menu "${mismatchedStock.name}" tidak sesuai dengan stok sistem (${mismatchedStock.stock})!`);
            return;
        }

        if (!confirm("Apakah Anda yakin ingin menutup hari ini? Data stok akan diperbarui.")) return;

        setSubmitting(true);
        try {
            const wasteLogs = [];

            for (const m of menus) {
                if (m.storedQty > 0) {
                    wasteLogs.push({
                        itemId: m.id,
                        type: 'MENU',
                        quantity: m.storedQty,
                        action: 'STORED',
                        reason: m.storedReason
                    });
                }
                if (m.discardedQty > 0) {
                    wasteLogs.push({
                        itemId: m.id,
                        type: 'MENU',
                        quantity: m.discardedQty,
                        action: 'DISCARDED',
                        reason: m.discardedReason
                    });
                }
            }

            const res = await fetch(`${API_BASE_URL}/operational/close-day`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date,
                    cashierName: "Owner", // Should come from auth
                    wasteLogs
                })
            });

            if (res.ok) {
                setSuccess(true);
                fetchData(); // Refresh to see "Closed" state
            } else {
                alert("Gagal menutup hari. Cek konsol.");
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    if (summary?.isClosed) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-green-900 mb-2">Laporan Harian Ditutup</h1>
                    <p className="text-green-700 mb-6">Data untuk tanggal {date} sudah difinalisasi.</p>
                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-gray-500 text-sm">Total Penjualan</p>
                            <p className="text-xl font-bold">${Number(summary.closingData.totalSales).toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-gray-500 text-sm">Total Transaksi</p>
                            <p className="text-xl font-bold">{summary.closingData.totalTransactions}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Closing</h1>
                    <p className="text-gray-500">Finalisasi data penjualan dan stok harian</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                    <span className="text-gray-500 text-sm">Tanggal:</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="font-semibold text-gray-900 focus:outline-none"
                    />
                </div>
            </header>

            {/* Hourly Analysis Button - Hidden in detail as requested */}
            <div className="flex justify-start">
                <button
                    onClick={() => setDetailModalOpen(true)}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                >
                    <Eye size={20} />
                    Lihat Detail Transaksi per Jam
                </button>
            </div>

            {/* Hourly Analysis Modal */}
            {detailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDetailModalOpen(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Analisis Penjualan Per Jam</h3>
                            <button onClick={() => setDetailModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sales List */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-700 mb-2">Penjualan</h4>
                                    {summary?.hourlyAnalysis?.sales && Object.keys(summary.hourlyAnalysis.sales).length > 0 ? (
                                        Object.entries(summary.hourlyAnalysis.sales).map(([hour, data]: [string, any]) => (
                                            data.count > 0 && (
                                                <div key={hour} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600 font-bold text-sm">
                                                            {hour.split(':')[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{hour}</p>
                                                            <p className="text-xs text-gray-500">{data.count} Transaksi</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-gray-900">${Number(data.total).toLocaleString()}</p>
                                                </div>
                                            )
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">Belum ada data penjualan.</p>
                                    )}
                                </div>

                                {/* Returns List */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-red-500" /> Komplain & Return
                                    </h4>
                                    {summary?.hourlyAnalysis?.returns && Object.keys(summary.hourlyAnalysis.returns).length > 0 ? (
                                        Object.entries(summary.hourlyAnalysis.returns).map(([hour, data]: [string, any]) => (
                                            data.count > 0 && (
                                                <div key={hour} className="p-3 bg-red-50 rounded-xl border border-red-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-red-700">{hour}</span>
                                                            <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">{data.count} Item</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.items.map((item: string, idx: number) => (
                                                            <span key={idx} className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">Tidak ada komplain / return.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sales Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 mb-1">Total Penjualan</p>
                    <p className="text-3xl font-bold text-gray-900">${summary?.totalSales?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 mb-1">Total Transaksi</p>
                    <p className="text-3xl font-bold text-gray-900">{summary?.totalTransactions}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                    <p className="text-blue-600 mb-1">Status</p>
                    <p className="text-3xl font-bold text-blue-900">OPEN</p>
                </div>
            </div>

            {/* Stock Management */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Archive className="w-5 h-5 text-gray-400" />
                        Manajemen Sisa & Waste
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Masukkan jumlah stok yang disimpan (carry over) dan yang dibuang. Total harus sesuai dengan fisik.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 w-[250px]">Menu</th>
                                <th className="px-6 py-4 w-[120px]">Stok Sistem</th>
                                <th className="px-6 py-4 bg-green-50/50 w-[300px]">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <Archive size={16} /> Disimpan (Besok)
                                    </div>
                                </th>
                                <th className="px-6 py-4 bg-red-50/50 w-[300px]">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <Trash2 size={16} /> Dibuang (Waste)
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {menus.map((menu) => (
                                <tr key={menu.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {menu.image && (
                                                <img src={menu.image.startsWith('http') ? menu.image : `${API_BASE_URL}${menu.image}`} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            )}
                                            <span className="font-semibold text-gray-900">{menu.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-600">
                                        {menu.stock}
                                    </td>
                                    {/* Stored Input */}
                                    <td className="px-6 py-4 bg-green-50/20">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 w-12">Qty:</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={menu.storedQty}
                                                    onChange={(e) => handleInputChange(menu.id, 'storedQty', Number(e.target.value))}
                                                    className="w-20 p-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 w-12">Alasan:</span>
                                                <input
                                                    type="text"
                                                    placeholder="Contoh: Sisa Layak"
                                                    value={menu.storedReason}
                                                    onChange={(e) => handleInputChange(menu.id, 'storedReason', e.target.value)}
                                                    className="flex-1 p-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    {/* Discarded Input */}
                                    <td className="px-6 py-4 bg-red-50/20">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 w-12">Qty:</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={menu.discardedQty}
                                                    onChange={(e) => handleInputChange(menu.id, 'discardedQty', Number(e.target.value))}
                                                    className="w-20 p-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 w-12">Alasan:</span>
                                                <input
                                                    type="text"
                                                    placeholder="Contoh: Basi, Jatuh"
                                                    value={menu.discardedReason}
                                                    onChange={(e) => handleInputChange(menu.id, 'discardedReason', e.target.value)}
                                                    className={`flex-1 p-2 rounded-lg border focus:ring-2 outline-none text-sm ${menu.discardedQty > 0 && !menu.discardedReason ? 'border-red-300 bg-red-50 ring-2 ring-red-100' : 'border-gray-200 focus:border-red-500 focus:ring-red-200'}`}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-end items-center gap-4 shadow-lg z-40">
                <div className="text-sm text-gray-500 mr-auto pl-8">
                    Pastikan semua data sudah benar sebelum menutup hari.
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Tutup Hari (Close Day)
                </button>
            </div>
        </div>
    );
}
