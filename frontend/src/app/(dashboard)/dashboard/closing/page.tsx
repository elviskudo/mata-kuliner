"use client";

import { useState, useEffect, useMemo } from "react";
import { Package, Search, Eye, X, ChevronLeft, ChevronRight, TrendingUp, Trash2, Archive, Clock } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface ClosingDay {
    id: number;
    date: string;
    totalSales: number;
    totalTransactions: number;
    totalWasteValue: number;
    cashierName: string;
    notes?: string;
    createdAt: string;
    closedAt?: string;
}

interface WasteDetail {
    id: number;
    itemName: string;
    quantity: number;
    action: string; // DISCARDED | STORED | RETURNED
    reason: string;
    type: string;
    time: string;
}

// Simple SVG line chart
function SalesLineChart({ data }: { data: { date: string; sales: number }[] }) {
    const W = 600, H = 120, padX = 40, padY = 16;
    const maxSales = Math.max(...data.map(d => d.sales), 1);
    const nonZero = data.filter(d => d.sales > 0);
    if (nonZero.length === 0) {
        return (
            <div className="flex items-center justify-center h-24 text-gray-300 text-sm">
                Belum ada data penjualan
            </div>
        );
    }
    const pts = data.map((d, i) => {
        const x = padX + (i / Math.max(data.length - 1, 1)) * (W - 2 * padX);
        const y = padY + (1 - d.sales / maxSales) * (H - 2 * padY);
        return { x, y, ...d };
    });
    const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
    const area = `${pts[0].x},${H} ` + pts.map(p => `${p.x},${p.y}`).join(" ") + ` ${pts[pts.length - 1].x},${H}`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
            <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={area} fill="url(#salesGrad)" />
            <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.filter(p => p.sales > 0).map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" />
                    <title>Rp {Number(p.sales).toLocaleString("id-ID")} ({p.date})</title>
                </g>
            ))}
            <text x={padX - 4} y={padY + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                {(maxSales / 1000).toFixed(0)}K
            </text>
            <text x={padX - 4} y={H - padY + 4} textAnchor="end" fontSize="9" fill="#9ca3af">0</text>
            {[0, Math.floor(data.length / 2), data.length - 1].map(idx => (
                <text key={idx} x={pts[idx]?.x ?? 0} y={H - 2} textAnchor="middle" fontSize="9" fill="#9ca3af">
                    {data[idx]?.date.slice(5) ?? ""}
                </text>
            ))}
        </svg>
    );
}

export default function StockOpnamePage() {
    const [closings, setClosings] = useState<ClosingDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        const today = new Date().toLocaleDateString("fr-CA");
        const d = new Date();
        d.setDate(d.getDate() - 29);
        const defaultFrom = d.toLocaleDateString("fr-CA");
        setFromDate(defaultFrom);
        setToDate(today);
    }, []);

    // Detail modal
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [detail, setDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchClosings();
        }
    }, [fromDate, toDate]);

    const fetchClosings = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE_URL}/operational/closings?from=${fromDate}&to=${toDate}`
            );
            const data = await res.json();
            const results: ClosingDay[] = (data || []).map((item: any) => ({
                id: item.id,
                date: item.date,
                totalSales: Number(item.totalSales ?? 0),
                totalTransactions: Number(item.totalTransactions ?? 0),
                totalWasteValue: Number(item.totalWasteValue ?? 0),
                cashierName: item.cashierName || "Dapur",
                notes: item.notes,
                createdAt: item.closedAt,
                closedAt: (() => {
                    if (!item.closedAt) return undefined;
                    const wib = new Date(new Date(item.closedAt).getTime() + 7 * 60 * 60 * 1000);
                    return `${wib.getUTCHours().toString().padStart(2, '0')}:${wib.getUTCMinutes().toString().padStart(2, '0')} WIB`;
                })(),
            }));
            results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setClosings(results);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (dateStr: string) => {
        setSelectedDate(dateStr);
        setLoadingDetail(true);
        try {
            const summaryRes = await fetch(`${API_BASE_URL}/operational/closing-summary?date=${dateStr}`).then(r => r.json());
            setDetail(summaryRes);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Build chart data for the selected range
    const chartData = useMemo(() => {
        if (!fromDate || !toDate) return [];
        const start = new Date(fromDate);
        const end = new Date(toDate);
        const days: string[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d).toLocaleDateString("fr-CA"));
        }
        const closingMap: Record<string, number> = {};
        closings.forEach(c => { closingMap[c.date] = c.totalSales; });
        return days.map(date => ({ date, sales: closingMap[date] || 0 }));
    }, [closings, fromDate, toDate]);

    const filtered = closings.filter(
        (c) =>
            c.date.includes(search) ||
            (c.cashierName || "").toLowerCase().includes(search.toLowerCase())
    );

    const PAGE_SIZE = 10;
    const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const totalRevenue = closings.reduce((s, c) => s + Number(c.totalSales), 0);
    const totalWasteLoss = closings.reduce((s, c) => s + Number(c.totalWasteValue), 0);

    // --- Waste log details grouped ---
    // TIDAK LAYAK = action DISCARDED with reason starting with [TIDAK LAYAK]
    const tidakLayakLogs: WasteDetail[] = detail?.wasteLogDetails?.filter((w: WasteDetail) =>
        w.action === "DISCARDED" && w.reason?.startsWith("[TIDAK LAYAK]")
    ) ?? [];
    // LAYAK tapi bukan disimpan (Sedekah, Konsumsi Karyawan, dll)
    // LAYAK tapi disalurkan (Sedekah, Konsumsi, dll) — reason [LAYAK] dan bukan Masuk Kulkas
    // Filter dari semua waste log, tidak hanya DISCARDED, supaya data lama yang salah action juga tertangkap
    const layakDisalurkanLogs: WasteDetail[] = detail?.wasteLogDetails?.filter((w: WasteDetail) =>
        w.reason?.startsWith("[LAYAK]") && !w.reason?.includes("Masuk Kulkas")
    ) ?? [];
    // STORED = benar-benar masuk kulkas (sisa stock layak yang disimpan)
    const storedLogs: WasteDetail[] = detail?.wasteLogDetails?.filter((w: WasteDetail) =>
        w.action === "STORED" && w.reason?.includes("Masuk Kulkas")
    ) ?? [];

    return (
        <div className="space-y-6 pb-12">
            {/* Detail Modal */}
            {selectedDate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setSelectedDate(null)}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Detail Stock Opname</h3>
                                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-2">
                                    {new Date(selectedDate).toLocaleDateString("id-ID", {
                                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                                    })}
                                    {detail?.closedAt && (
                                        <span className="flex items-center gap-1 text-blue-500 font-semibold">
                                            <Clock size={13} /> Finalisasi: {detail.closedAt}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                                <X size={22} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-5">
                            {loadingDetail ? (
                                <div className="py-16 text-center text-gray-400">Memuat detail...</div>
                            ) : (
                                <>
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-emerald-50 rounded-2xl p-4">
                                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Total Stock Sisa Layak</p>
                                            <p className="text-2xl font-black text-emerald-700">
                                                {detail?.totalStoredQty ?? 0} porsi
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 rounded-2xl p-4">
                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Total Transaksi</p>
                                            <p className="text-2xl font-black text-blue-700">
                                                {detail?.totalTransactions ?? 0} transaksi
                                            </p>
                                        </div>
                                        <div className="bg-red-50 rounded-2xl p-4">
                                            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Total Tidak Layak</p>
                                            <p className="text-2xl font-black text-red-700">
                                                {detail?.totalDiscardedQty ?? 0} porsi
                                            </p>
                                        </div>
                                        <div className="bg-rose-50 rounded-2xl p-4">
                                            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">Estimasi Kerugian</p>
                                            <p className="text-2xl font-black text-rose-700">
                                                Rp {Number(detail?.totalWasteValue ?? 0).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tidak Layak Items - hanya yang [TIDAK LAYAK] */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                            <Trash2 size={15} className="text-red-500" /> Menu Tidak Layak (Dibuang)
                                        </h4>
                                        {tidakLayakLogs.length === 0 ? (
                                            <div className="text-center py-5 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                Tidak ada menu tidak layak
                                            </div>
                                        ) : (
                                            <div className="overflow-hidden rounded-xl border border-red-100">
                                                <table className="w-full">
                                                    <thead className="bg-red-50">
                                                        <tr>
                                                            {["Menu", "Qty", "Alasan", "Jam"].map(h => (
                                                                <th key={h} className="px-4 py-2.5 text-left text-xs font-black text-red-400 uppercase">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-red-50">
                                                        {tidakLayakLogs.map(w => (
                                                            <tr key={w.id} className="hover:bg-red-50/40">
                                                                <td className="px-4 py-2.5 font-semibold text-gray-900 text-sm">{w.itemName}</td>
                                                                <td className="px-4 py-2.5 font-bold text-red-700">{w.quantity}</td>
                                                                <td className="px-4 py-2.5 text-gray-500 text-sm">{w.reason.replace("[TIDAK LAYAK] ", "")}</td>
                                                                <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{w.time}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Layak tapi disalurkan (Sedekah, Konsumsi Karyawan, dll) */}
                                    {layakDisalurkanLogs.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                                <span className="text-orange-500">🤝</span> Menu Layak – Disalurkan
                                            </h4>
                                            <div className="overflow-hidden rounded-xl border border-orange-100">
                                                <table className="w-full">
                                                    <thead className="bg-orange-50">
                                                        <tr>
                                                            {["Menu", "Qty", "Alasan", "Jam"].map(h => (
                                                                <th key={h} className="px-4 py-2.5 text-left text-xs font-black text-orange-400 uppercase">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-orange-50">
                                                        {layakDisalurkanLogs.map(w => (
                                                            <tr key={w.id} className="hover:bg-orange-50/40">
                                                                <td className="px-4 py-2.5 font-semibold text-gray-900 text-sm">{w.itemName}</td>
                                                                <td className="px-4 py-2.5 font-bold text-orange-600">{w.quantity}</td>
                                                                <td className="px-4 py-2.5 text-gray-500 text-sm">{w.reason.replace("[LAYAK] ", "")}</td>
                                                                <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{w.time}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stored Items - masuk kulkas */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                            <Archive size={15} className="text-emerald-500" /> Stock Sisa Layak (Disimpan)
                                        </h4>
                                        {storedLogs.length === 0 ? (
                                            <div className="text-center py-5 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                Tidak ada stok yang disimpan
                                            </div>
                                        ) : (
                                            <div className="overflow-hidden rounded-xl border border-emerald-100">
                                                <table className="w-full">
                                                    <thead className="bg-emerald-50">
                                                        <tr>
                                                            {["Menu", "Qty Sisa", "Alasan", "Jam"].map(h => (
                                                                <th key={h} className="px-4 py-2.5 text-left text-xs font-black text-emerald-500 uppercase">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-emerald-50">
                                                        {storedLogs.map(w => (
                                                            <tr key={w.id} className="hover:bg-emerald-50/40">
                                                                <td className="px-4 py-2.5 font-semibold text-gray-900 text-sm">{w.itemName}</td>
                                                                <td className="px-4 py-2.5 font-bold text-emerald-700">{w.quantity}</td>
                                                                <td className="px-4 py-2.5 text-gray-500 text-sm">{w.reason.replace("[LAYAK] ", "")}</td>
                                                                <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{w.time}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Package className="text-rose-500" size={28} />
                        Stock Opname
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">Data finalisasi stok harian dari dapur kitchen</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <span className="text-xs text-gray-400 font-medium">Dari:</span>
                        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(0); }}
                            className="text-sm font-semibold text-gray-900 focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <span className="text-xs text-gray-400 font-medium">Sampai:</span>
                        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(0); }}
                            className="text-sm font-semibold text-gray-900 focus:outline-none" />
                    </div>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari tanggal / staff..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
                        />
                    </div>
                </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-blue-500" size={20} />
                    <h2 className="text-base font-bold text-gray-900">Tren Penjualan Harian</h2>
                    <span className="text-xs text-gray-400 ml-1">
                        ({fromDate} s/d {toDate})
                    </span>
                </div>
                <SalesLineChart data={chartData} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                    <span className="text-2xl font-black text-rose-600">{closings.length}</span>
                    <span className="text-sm font-medium text-gray-500">Total Hari Closing</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                    <span className="text-lg font-black text-emerald-600">
                        Rp {totalRevenue.toLocaleString("id-ID")}
                    </span>
                    <span className="text-sm font-medium text-gray-500">Total Penjualan</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                    <span className="text-2xl font-black text-blue-600">
                        {closings.reduce((s, c) => s + Number(c.totalTransactions), 0)}
                    </span>
                    <span className="text-sm font-medium text-gray-500">Total Transaksi</span>
                </div>
                <div className="bg-white rounded-xl border border-red-100 shadow-sm px-5 py-4 flex items-center gap-3">
                    <div>
                        <div className="text-sm font-black text-red-600">
                            Rp {totalWasteLoss.toLocaleString("id-ID")}
                        </div>
                        <div className="text-xs font-medium text-red-400">Estimasi Kerugian Return</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Tanggal", "Jam Finalisasi", "Total Penjualan", "Total Transaksi", "Kerugian Return", "Dilakukan Oleh", "Aksi"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Memuat data stock opname...</td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Belum ada data stock opname yang ditemukan</td>
                                </tr>
                            ) : (
                                paged.map((c) => (
                                    <tr key={c.date} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-4 font-bold text-gray-900">
                                            {new Date(c.date).toLocaleDateString("id-ID", {
                                                weekday: "short", day: "numeric", month: "long", year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-blue-600 font-mono font-semibold">
                                            {c.closedAt ?? "—"}
                                        </td>
                                        <td className="px-5 py-4 font-black text-emerald-700">
                                            Rp {Number(c.totalSales).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-5 py-4 text-gray-700 font-semibold">
                                            {c.totalTransactions} transaksi
                                        </td>
                                        <td className="px-5 py-4 font-bold text-red-600">
                                            {Number(c.totalWasteValue) > 0
                                                ? `Rp ${Number(c.totalWasteValue).toLocaleString("id-ID")}`
                                                : <span className="text-gray-300 font-normal">—</span>
                                            }
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                                {c.cashierName || "Dapur"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => openDetail(c.date)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                                            >
                                                <Eye size={14} />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <span className="text-sm text-gray-400 font-medium">Halaman {page + 1} dari {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/30 text-xs text-gray-400 font-medium">
                        Menampilkan {filtered.length} data · {fromDate} s/d {toDate}
                    </div>
                )}
            </div>
        </div>
    );
}
