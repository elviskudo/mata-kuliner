"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface ComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ComplaintModal({ isOpen, onClose }: ComplaintModalProps) {
    const [menus, setMenus] = useState<any[]>([]);
    const [selectedMenuId, setSelectedMenuId] = useState<number | "">("");
    const [reason, setReason] = useState("");
    const [action, setAction] = useState<"REPLACE" | "REFUND" | "LOG">("REPLACE");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMenus();
            setSuccess(false);
            setReason("");
            setSelectedMenuId("");
            setAction("REPLACE");
        }
    }, [isOpen]);

    const fetchMenus = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/menus`);
            const data = await res.json();
            setMenus(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMenuId || !reason) return;

        setLoading(true);
        try {
            const createdAt = new Date().toISOString(); // Capture POS time

            const res = await fetch(`${API_BASE_URL}/operational/complaint`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: Number(selectedMenuId),
                    reason,
                    replace: action === "REPLACE",
                    createdAt // Send POS time
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-[500px] shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                <div className="mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Catat Komplain / Insiden</h2>
                        <p className="text-sm text-gray-500">Laporkan masalah produk (e.g. basi, ada hewan)</p>
                    </div>
                </div>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center mb-6">
                        <p className="font-semibold">Laporan berhasil disimpan!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Produk Bermasalah</label>
                            <select
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-gray-900"
                                value={selectedMenuId}
                                onChange={(e) => setSelectedMenuId(Number(e.target.value))}
                                required
                            >
                                <option value="">Pilih Menu...</option>
                                {menus.map((menu) => (
                                    <option key={menu.id} value={menu.id}>
                                        {menu.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Alasan (Wajib)</label>
                            <textarea
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900"
                                placeholder="Contoh: Ada hewan, Rasa aneh, Basi..."
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tindakan</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAction("REPLACE")}
                                    className={`p-3 rounded-xl border text-sm font-semibold transition-all ${action === "REPLACE"
                                        ? "bg-red-50 border-red-200 text-red-700"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    Ganti Baru
                                    <span className="block text-xs font-normal opacity-70 mt-1">Stok berkurang 1</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAction("LOG")}
                                    className={`p-3 rounded-xl border text-sm font-semibold transition-all ${action === "LOG"
                                        ? "bg-gray-100 border-gray-300 text-gray-900"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    Hanya Catat
                                    <span className="block text-xs font-normal opacity-70 mt-1">Stok tetap</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? "Menyimpan..." : (
                                <>
                                    <Save size={18} />
                                    Simpan Laporan
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
