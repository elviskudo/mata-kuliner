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

export default function KitchenClosingPage() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [menus, setMenus] = useState<MenuStock[]>([]);
    const [date, setDate] = useState("");

    useEffect(() => {
        setDate(new Date().toLocaleDateString('fr-CA')); // YYYY-MM-DD Local
    }, []);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Detail Modal State
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState<string>("");

    useEffect(() => {
        if (date) {
            fetchData();
        }
    }, [date]);

    // ... (fetchData and other handlers remain same)

    const [isStoreOpen, setIsStoreOpen] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Store Status first
            const statusRes = await fetch(`${API_BASE_URL}/operational/store-status`);
            const statusData = await statusRes.json();
            setIsStoreOpen(statusData.isOpen);

            // Fetch Summary
            const sumRes = await fetch(`${API_BASE_URL}/operational/closing-summary?date=${date}`);
            const sumData = await sumRes.json();
            setSummary(sumData);

            // Fetch Menus for Stock Opname (ALWAYS fetch, regardless of closing status)
            // TRY 1: Fetch from Snapshot (Ideal case - manual close or finalized)
            const menuRes = await fetch(`${API_BASE_URL}/operational/closing-menus?date=${date}`);
            let menuData = await menuRes.json();

            // TRY 2: Fallback to Active Menus (Only if NOT closed yet and snapshots missing)
            if ((!menuData || menuData.length === 0) && !sumData.isClosed) {
                const activeRes = await fetch(`${API_BASE_URL}/menus`);
                const activeData = await activeRes.json();
                // Map active menus to snapshot-like structure
                menuData = activeData.map((m: any) => ({
                    originalMenuId: m.id,
                    name: m.name,
                    stock: Number(m.stock),
                    image: m.image,
                    price: m.price
                }));
            }

            setMenus(menuData.map((m: any) => ({
                id: m.originalMenuId || m.id, // Handle both snapshot and active menu structure
                name: m.name,
                stock: Number(m.stock),
                image: m.image,
                storedQty: Number(m.stock),
                storedReason: "",
                discardedQty: 0,
                discardedReason: ""
            })));
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
            alert(`Total (Layak: ${mismatchedStock.storedQty} + Tidak Layak: ${mismatchedStock.discardedQty}) untuk menu "${mismatchedStock.name}" tidak sesuai dengan stok sistem (${mismatchedStock.stock})!`);
            return;
        }

        if (!confirm("Apakah Anda yakin ingin menutup hari ini? Data stok akan diperbarui.")) return;

        setSubmitting(true);
        try {
            const wasteLogs = [];

            for (const m of menus) {
                // COLUMN: KONDISI LAYAK
                if (m.storedQty > 0) {
                    // Logic: Only "Masuk Kulkas" implies we keep the stock (STORED).
                    // Others like "Sedekah", "Konsumsi" imply stock is gone (DISCARDED).
                    const isKept = m.storedReason === 'Masuk Kulkas';

                    wasteLogs.push({
                        itemId: m.id,
                        type: 'MENU',
                        quantity: m.storedQty,
                        action: isKept ? 'STORED' : 'DISCARDED',
                        reason: `[LAYAK] ${m.storedReason}`
                    });
                }

                // COLUMN: KONDISI TIDAK LAYAK
                if (m.discardedQty > 0) {
                    wasteLogs.push({
                        itemId: m.id,
                        type: 'MENU',
                        quantity: m.discardedQty,
                        action: 'DISCARDED',
                        reason: `[TIDAK LAYAK] ${m.discardedReason}`
                    });
                }
            }

            const res = await fetch(`${API_BASE_URL}/operational/close-day`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date,
                    cashierName: "Kitchen Staff", // Assuming Kitchen closes
                    wasteLogs
                })
            });

            if (res.ok) {
                setSuccess(true);
                fetchData();
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

    const closeDetailModal = () => {
        setDetailModalOpen(false);
    };

    const handleViewDetail = (hour: string) => {
        setSelectedHour(hour);
        setDetailModalOpen(true);
    };


    const isFormValid = menus.every(m => {
        const storedValid = m.storedQty === 0 || (m.storedQty > 0 && m.storedReason.trim() !== "");
        const discardedValid = m.discardedQty === 0 || (m.discardedQty > 0 && m.discardedReason.trim() !== "");
        return storedValid && discardedValid;
    });

    return (
        <div className="space-y-8 pb-32">
            {/* Detail Modal */}
            {detailModalOpen && summary && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeDetailModal}>
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Detail Transaksi - Jam {selectedHour}</h3>
                            <button onClick={closeDetailModal} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* SALES COLUMN */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                    Penjualan
                                </h4>
                                <div className="space-y-4">
                                    {summary.hourlyAnalysis.sales[selectedHour]?.details?.length > 0 ? (
                                        summary.hourlyAnalysis.sales[selectedHour].details.map((tx: any, idx: number) => (
                                            <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-gray-900">{tx.time}</span>
                                                            <span className="text-xs font-bold text-gray-400">#{tx.id}</span>
                                                        </div>
                                                        <p className="text-xs text-blue-600 mt-1 font-medium">{tx.customer}</p>
                                                    </div>
                                                    <p className="font-black text-gray-900">
                                                        Rp {Number(tx.amount).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="space-y-2 pl-3 border-l-2 border-gray-100">
                                                    {tx.items?.map((item: any, i: number) => (
                                                        <div key={i} className="flex justify-between text-sm items-center">
                                                            <span className="text-gray-600 flex items-center gap-2">
                                                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.qty || item.quantity}x</span>
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            Tidak ada transaksi penjualan
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RETURNS / COMPLAINTS COLUMN */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-red-500 rounded-full"></span>
                                    Komplain & Return
                                </h4>
                                <div className="space-y-4">
                                    {summary.hourlyAnalysis.returns[selectedHour]?.details?.length > 0 ? (
                                        summary.hourlyAnalysis.returns[selectedHour].details.map((ret: any, idx: number) => (
                                            <div key={idx} className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-black text-red-600">{ret.time}</span>
                                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-lg">{ret.qty} Item</span>
                                                </div>
                                                <h5 className="font-bold text-gray-900 text-sm">{ret.item}</h5>
                                                {ret.reason && (
                                                    <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded-lg border border-red-100 italic">
                                                        "{ret.reason}"
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            Tidak ada komplain / return
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Closing Kitchen</h1>
                    <p className="text-gray-500">Stock Opname & Finalisasi Sisa Harian</p>
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



            {/* Stock Management */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Archive className="w-5 h-5 text-gray-400" />
                        Stock Opname Menu
                    </h2>
                </div>
                {isStoreOpen && !summary?.isClosed ? (
                    <div className="p-12 text-center bg-yellow-50/50">
                        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Toko Masih Buka</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Silakan tutup toko terlebih dahulu melalui menu Kitchen untuk memulai Stock Opname harian.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 w-[250px]">Menu</th>
                                    <th className="px-6 py-4 w-[100px]">System</th>
                                    <th className="px-6 py-4 bg-green-50/50 w-[350px]">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle size={16} /> Kondisi Layak
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 bg-red-50/50 w-[350px]">
                                        <div className="flex items-center gap-2 text-red-700">
                                            <Trash2 size={16} /> Kondisi Tidak Layak
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {menus.map((menu) => (
                                    <tr key={menu.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {menu.image ? (
                                                    <img
                                                        src={menu.image.startsWith('http') || menu.image.startsWith('data') ? menu.image : `${API_BASE_URL}${menu.image}`}
                                                        alt={menu.name}
                                                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(menu.name)}&background=random`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {menu.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-semibold text-gray-900">{menu.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600">
                                            {menu.stock}
                                        </td>
                                        <td className="px-6 py-4 bg-green-50/20">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400 w-8">Qty:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={menu.storedQty}
                                                        onChange={(e) => handleInputChange(menu.id, 'storedQty', Number(e.target.value))}
                                                        disabled={summary?.isClosed}
                                                        className="w-16 p-2 rounded-lg border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500"
                                                    />
                                                </div>
                                                <select
                                                    value={['Masuk Kulkas', 'Sedekah', 'Konsumsi Karyawan'].includes(menu.storedReason) ? menu.storedReason : (menu.storedReason ? 'Lain-lain' : '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val !== 'Lain-lain') {
                                                            handleInputChange(menu.id, 'storedReason', val);
                                                        } else {
                                                            handleInputChange(menu.id, 'storedReason', 'Lain-lain: ');
                                                        }
                                                    }}
                                                    disabled={summary?.isClosed || menu.storedQty === 0}
                                                    className="w-full p-2 rounded-lg border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Pilih Alasan...</option>
                                                    <option value="Masuk Kulkas">Masuk Kulkas</option>
                                                    <option value="Sedekah">Sedekah</option>
                                                    <option value="Konsumsi Karyawan">Konsumsi Karyawan</option>
                                                    <option value="Lain-lain">Lain-lain</option>
                                                </select>
                                                {(!['Masuk Kulkas', 'Sedekah', 'Konsumsi Karyawan', ''].includes(menu.storedReason) || menu.storedReason.startsWith('Lain-lain: ')) && (
                                                    <input
                                                        type="text"
                                                        placeholder="Ketik alasan..."
                                                        value={menu.storedReason === 'Lain-lain: ' ? '' : menu.storedReason.replace('Lain-lain: ', '')}
                                                        onChange={(e) => handleInputChange(menu.id, 'storedReason', `Lain-lain: ${e.target.value}`)}
                                                        disabled={summary?.isClosed || menu.storedQty === 0}
                                                        className="w-full p-2 rounded-lg border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 animate-in fade-in slide-in-from-top-1 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-red-50/20">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400 w-8">Qty:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={menu.discardedQty}
                                                        onChange={(e) => handleInputChange(menu.id, 'discardedQty', Number(e.target.value))}
                                                        disabled={summary?.isClosed}
                                                        className="w-16 p-2 rounded-lg border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 disabled:bg-gray-100 disabled:text-gray-500"
                                                    />
                                                </div>
                                                <select
                                                    value={['Basi', 'Jatuh / Rusak', 'Kadaluarsa'].includes(menu.discardedReason) ? menu.discardedReason : (menu.discardedReason ? 'Lain-lain' : '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val !== 'Lain-lain') {
                                                            handleInputChange(menu.id, 'discardedReason', val);
                                                        } else {
                                                            handleInputChange(menu.id, 'discardedReason', 'Lain-lain: ');
                                                        }
                                                    }}
                                                    disabled={summary?.isClosed || menu.discardedQty === 0}
                                                    className={`w-full p-2 rounded-lg border text-sm text-gray-900 outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${menu.discardedQty > 0 && !menu.discardedReason ? 'border-red-300 bg-red-50 ring-2 ring-red-100' : 'border-gray-200 focus:border-red-500 focus:ring-red-200'}`}
                                                >
                                                    <option value="">Pilih Alasan...</option>
                                                    <option value="Basi">Basi</option>
                                                    <option value="Jatuh / Rusak">Jatuh / Rusak</option>
                                                    <option value="Kadaluarsa">Kadaluarsa</option>
                                                    <option value="Lain-lain">Lain-lain</option>
                                                </select>
                                                {(!['Basi', 'Jatuh / Rusak', 'Kadaluarsa', ''].includes(menu.discardedReason) || menu.discardedReason.startsWith('Lain-lain: ')) && (
                                                    <input
                                                        type="text"
                                                        placeholder="Ketik alasan..."
                                                        value={menu.discardedReason === 'Lain-lain: ' ? '' : menu.discardedReason.replace('Lain-lain: ', '')}
                                                        onChange={(e) => handleInputChange(menu.id, 'discardedReason', `Lain-lain: ${e.target.value}`)}
                                                        disabled={summary?.isClosed || menu.discardedQty === 0}
                                                        className="w-full p-2 rounded-lg border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 animate-in fade-in slide-in-from-top-1 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-end items-center gap-4 shadow-lg z-40 lg:pl-72">
                {!isFormValid && !summary?.isClosed && (
                    <span className="text-red-500 text-sm font-bold animate-pulse mr-4">
                        Harap isi alasan untuk item dengan Qty {'>'} 0
                    </span>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !isFormValid || summary?.isClosed}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
                >
                    {summary?.isClosed ? (
                        <>
                            <CheckCircle size={20} />
                            Sudah Finalisasi
                        </>
                    ) : (
                        <>
                            {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Finalisasi Closing
                        </>
                    )}
                </button>

                {/* Reset Button (Only visible if closed) */}
                {summary?.isClosed && (
                    <button
                        onClick={async () => {
                            if (!confirm("Yakin ingin membatalkan closing hari ini? Data snapshot menu akan dihapus.")) return;
                            setSubmitting(true);
                            try {
                                const res = await fetch(`${API_BASE_URL}/operational/reset-closing`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ date })
                                });
                                if (res.ok) {
                                    alert("Berhasil reset closing. Halaman akan dimuat ulang.");
                                    window.location.reload();
                                } else {
                                    alert("Gagal reset closing.");
                                }
                            } catch (e) {
                                console.error(e);
                                alert("Terjadi kesalahan.");
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                        className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                        <Trash2 size={20} />
                        Buka Kembali
                    </button>
                )}
            </div>
        </div >
    );
}
