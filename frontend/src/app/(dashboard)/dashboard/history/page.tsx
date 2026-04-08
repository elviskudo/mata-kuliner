"use client";

import { useState, useEffect, useMemo } from "react";
import { ClipboardList, Search, X, BarChart2, Eye, Calendar } from "lucide-react";
import { transactionsService, Transaction } from "@/services/transactions.service";

const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#14b8a6",
    "#6366f1", "#d946ef", "#0ea5e9", "#a3e635", "#fb923c",
    "#34d399", "#f472b6", "#60a5fa", "#facc15", "#a78bfa",
];

// ── Line Chart: top 3 menu per tanggal ──────────────────────────────────────
interface LineMenuData {
    menu: string;
    color: string;
    points: { date: string; qty: number }[];
}

function MenuLineChart({ data, dates }: { data: LineMenuData[]; dates: string[] }) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const W = 800, H = 180, padL = 40, padR = 16, padT = 12, padB = 36;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const allQty = data.flatMap(m => m.points.map(p => p.qty));
    const maxVal = Math.max(...allQty, 1);
    const ticks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));

    const xPos = (i: number) => padL + (dates.length <= 1 ? chartW / 2 : (i / (dates.length - 1)) * chartW);
    const yPos = (v: number) => padT + chartH - (v / maxVal) * chartH;

    if (data.length === 0 || dates.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
                Tidak ada data pada rentang tanggal ini
            </div>
        );
    }

    // Tooltip: all menu values for hovered date index
    const tooltipItems = hoveredIdx !== null
        ? data.map(m => ({ menu: m.menu, color: m.color, qty: m.points[hoveredIdx]?.qty ?? 0 }))
        : [];
    const tipX = hoveredIdx !== null
        ? Math.min(xPos(hoveredIdx) + 12, W - padR - 160)
        : 0;
    const tipY = padT;

    return (
        <div className="relative w-full">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-auto"
            >
                {/* Grid lines */}
                {ticks.map((tick, ti) => (
                    <g key={ti}>
                        <line x1={padL} x2={W - padR} y1={yPos(tick)} y2={yPos(tick)}
                            stroke={ti === 0 ? "#e5e7eb" : "#f3f4f6"} strokeWidth="1.2" />
                        <text x={padL - 8} y={yPos(tick)} textAnchor="end" dominantBaseline="middle"
                            fontSize="10" fill="#9ca3af" fontWeight="500">{tick}</text>
                    </g>
                ))}

                {/* X-axis labels */}
                {dates.map((d, i) => {
                    // Show label only if not too crowded
                    const showLabel = dates.length <= 14 || i % Math.ceil(dates.length / 14) === 0;
                    const label = d.slice(5); // MM-DD
                    return showLabel ? (
                        <text key={d} x={xPos(i)} y={padT + chartH + 16}
                            textAnchor="middle" fontSize="9" fill="#9ca3af">{label}</text>
                    ) : null;
                })}

                {/* Hover column region */}
                {dates.map((d, i) => (
                    <rect
                        key={`hit-${d}`}
                        x={xPos(i) - (dates.length > 1 ? chartW / (dates.length - 1) / 2 : chartW / 2)}
                        y={padT}
                        width={dates.length > 1 ? chartW / (dates.length - 1) : chartW}
                        height={chartH}
                        fill="transparent"
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        style={{ cursor: "crosshair" }}
                    />
                ))}

                {/* Vertical hover line */}
                {hoveredIdx !== null && (
                    <line
                        x1={xPos(hoveredIdx)} x2={xPos(hoveredIdx)}
                        y1={padT} y2={padT + chartH}
                        stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3"
                    />
                )}

                {/* Lines per menu */}
                {data.map((m) => {
                    const pts = m.points.map((p, i) => `${xPos(i)},${yPos(p.qty)}`).join(" ");
                    // Area fill
                    const areaFirst = `${xPos(0)},${padT + chartH}`;
                    const areaLast = `${xPos(dates.length - 1)},${padT + chartH}`;
                    const areaPath = `${areaFirst} ${pts} ${areaLast}`;
                    return (
                        <g key={m.menu}>
                            <polygon points={areaPath} fill={m.color} opacity="0.06" />
                            <polyline points={pts} fill="none" stroke={m.color}
                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    );
                })}

                {/* Dots on hover */}
                {hoveredIdx !== null && data.map((m) => {
                    const qty = m.points[hoveredIdx]?.qty ?? 0;
                    if (qty === 0) return null;
                    return (
                        <circle key={m.menu}
                            cx={xPos(hoveredIdx)} cy={yPos(qty)}
                            r="5" fill={m.color} stroke="white" strokeWidth="2"
                        />
                    );
                })}

                {/* Dots on all data points (small) */}
                {data.map((m) =>
                    m.points.map((p, i) =>
                        p.qty > 0 ? (
                            <circle key={`${m.menu}-${i}`}
                                cx={xPos(i)} cy={yPos(p.qty)}
                                r="2.5" fill={m.color} opacity="0.7"
                            />
                        ) : null
                    )
                )}

                {/* Tooltip */}
                {hoveredIdx !== null && tooltipItems.length > 0 && (
                    <g>
                        <rect x={tipX} y={tipY}
                            width={155} height={16 + data.length * 20}
                            rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1"
                            filter="drop-shadow(0 2px 10px rgba(0,0,0,0.10))" />
                        <text x={tipX + 10} y={tipY + 13} fontSize="9" fill="#9ca3af" fontWeight="600">
                            {dates[hoveredIdx]}
                        </text>
                        {tooltipItems.map((t, ti) => (
                            <g key={t.menu}>
                                <circle cx={tipX + 14} cy={tipY + 26 + ti * 20} r="4" fill={t.color} />
                                <text x={tipX + 24} y={tipY + 30 + ti * 20} fontSize="10" fill="#374151" fontWeight="600">
                                    {t.menu.length > 14 ? t.menu.slice(0, 13) + "…" : t.menu}:
                                </text>
                                <text x={tipX + 142} y={tipY + 30 + ti * 20} textAnchor="end"
                                    fontSize="10" fill={t.color} fontWeight="700">{t.qty}x</text>
                            </g>
                        ))}
                    </g>
                )}
            </svg>
        </div>
    );
}


// ── Helper: format tanggal ke YYYY-MM-DD ────────────────────────────────────
function toYMD(date: Date) {
    return date.toLocaleDateString("fr-CA"); // YYYY-MM-DD
}

function todayYMD() { return toYMD(new Date()); }
function daysAgoYMD(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toYMD(d);
}

// ── Preset filter ─────────────────────────────────────────────────────────
const PRESETS = [
    { label: "7 Hari", from: () => daysAgoYMD(6), to: todayYMD },
    { label: "30 Hari", from: () => daysAgoYMD(29), to: todayYMD },
    { label: "3 Bulan", from: () => daysAgoYMD(89), to: todayYMD },
    { label: "Semua", from: () => "2000-01-01", to: todayYMD },
];

// ── Page ────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    // Date filter state
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        setDateFrom(daysAgoYMD(29));
        setDateTo(todayYMD());
    }, []);

    useEffect(() => {
        transactionsService
            .findAll()
            .then(setTransactions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Filter transaksi berdasarkan tanggal range
    const dateFiltered = useMemo(() => {
        if (!dateFrom || !dateTo) return [];
        return transactions.filter((t) => {
            const d = toYMD(new Date(t.createdAt));
            return d >= dateFrom && d <= dateTo;
        });
    }, [transactions, dateFrom, dateTo]);

    // Build line chart data: top 3 menu, setiap menu punya array qty per tanggal
    const lineChartData = useMemo(() => {
        if (!dateFrom || !dateTo) return { dateRange: [], top3: [] };

        // Build all dates in range
        const dateRange: string[] = [];
        const cur = new Date(dateFrom);
        const end = new Date(dateTo);
        while (cur <= end) {
            dateRange.push(toYMD(new Date(cur)));
            cur.setDate(cur.getDate() + 1);
        }

        // Hitung total per menu di seluruh periode untuk ranking
        const totalMap: Record<string, number> = {};
        dateFiltered.forEach((t) => {
            (t.items || []).forEach((item: any) => {
                const name = item.name || "Unknown";
                totalMap[name] = (totalMap[name] || 0) + (item.qty || item.quantity || 1);
            });
        });

        // Ambil semua menu yang pernah muncul di transaksi periode ini
        const allMenuNames = Object.entries(totalMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);

        // Untuk setiap tanggal, hitung qty tiap menu
        const dateQtyMap: Record<string, Record<string, number>> = {};
        dateFiltered.forEach((t) => {
            const d = toYMD(new Date(t.createdAt));
            if (!dateQtyMap[d]) dateQtyMap[d] = {};
            (t.items || []).forEach((item: any) => {
                const name = item.name || "Unknown";
                if (allMenuNames.includes(name)) {
                    dateQtyMap[d][name] = (dateQtyMap[d][name] || 0) + (item.qty || item.quantity || 1);
                }
            });
        });

        const allMenus: LineMenuData[] = allMenuNames.map((name, idx) => ({
            menu: name,
            color: COLORS[idx % COLORS.length],
            points: dateRange.map((d) => ({ date: d, qty: dateQtyMap[d]?.[name] ?? 0 })),
        }));

        return { dateRange, allMenus };
    }, [dateFiltered, dateFrom, dateTo]);

    const menuTotals = useMemo(() =>
        lineChartData.allMenus?.map(m => ({ ...m, total: m.points.reduce((s, p) => s + p.qty, 0) })) ?? [],
        [lineChartData]
    );

    // Filter tabel berdasarkan search + dateFiltered
    const filtered = dateFiltered.filter((t) =>
        t.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
        t.orderType?.toLowerCase().includes(search.toLowerCase()) ||
        (t.items || []).some((item: any) => item.name?.toLowerCase().includes(search.toLowerCase()))
    );

    // Label periode tampil
    const periodLabel = useMemo(() => {
        if (!dateFrom || !dateTo) return "Memuat...";
        return dateFrom === "2000-01-01"
            ? "Semua data"
            : `${new Date(dateFrom).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} – ${new Date(dateTo).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
    }, [dateFrom, dateTo]);

    return (
        <div className="space-y-6 pb-12">
            {/* Detail Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedTx(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Detail Transaksi</h3>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {new Date(selectedTx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X size={22} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-2 flex-wrap">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedTx.orderType === "Dine In" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>{selectedTx.orderType}</span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedTx.paymentMethod === "Cash" ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>{selectedTx.paymentMethod}</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Item yang Dibeli</p>
                                <div className="space-y-2">
                                    {(selectedTx.items || []).length === 0 ? (
                                        <p className="text-sm text-gray-400">Tidak ada item</p>
                                    ) : (
                                        (selectedTx.items as any[]).map((item: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                                    {item.notes && <p className="text-xs text-gray-400 italic">{item.notes}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-700 text-sm">{item.qty || item.quantity}x</p>
                                                    {item.price > 0 && <p className="text-xs text-gray-400">Rp {Number(item.price * (item.qty || item.quantity)).toLocaleString("id-ID")}</p>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="font-medium text-gray-500">Total</span>
                                <span className="text-xl font-black text-gray-900">Rp {Number(selectedTx.amount).toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ClipboardList className="text-blue-600" size={28} />
                        History Transaksi
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">Semua riwayat transaksi dari kasir</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari transaksi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {/* ── Date Filter ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Calendar size={18} className="text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-700">Filter Tanggal</span>

                    {/* Preset buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {PRESETS.map((p) => {
                            const isActive = dateFrom === p.from() && dateTo === p.to();
                            return (
                                <button
                                    key={p.label}
                                    onClick={() => { setDateFrom(p.from()); setDateTo(p.to()); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="h-5 w-px bg-gray-200 hidden sm:block" />

                    {/* Custom range */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs text-gray-400 font-medium">Dari</label>
                            <input
                                type="date"
                                value={dateFrom}
                                max={dateTo}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700"
                            />
                        </div>
                        <span className="text-gray-300 text-sm">–</span>
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs text-gray-400 font-medium">Sampai</label>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom}
                                max={todayYMD()}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Period label */}
                    <span className="ml-auto text-xs text-gray-400 font-medium hidden sm:block">
                        📅 {periodLabel}
                    </span>
                </div>
            </div>

            {/* ── Line Chart ── */}
            {!loading && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-0.5">
                        <BarChart2 className="text-blue-500" size={18} />
                        <h2 className="text-base font-bold text-gray-900">Tren Penjualan Semua Menu</h2>
                        <span className="text-xs text-gray-400 font-medium ml-1">({periodLabel})</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Qty terjual per tanggal — hover untuk detail tiap hari</p>

                    <MenuLineChart data={lineChartData.allMenus ?? []} dates={lineChartData.dateRange} />

                    {menuTotals.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-gray-50 pt-3">
                            {menuTotals.map((m) => (
                                <div key={m.menu} className="flex items-center gap-1.5">
                                    <span className="inline-block w-3 h-1.5 rounded-full" style={{ background: m.color }} />
                                    <span className="text-xs text-gray-600 font-semibold">{m.menu}</span>
                                    <span className="text-xs font-bold" style={{ color: m.color }}>{m.total}x</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tabel Transaksi */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Tanggal", "Order Type", "Pembayaran", "Items", "Total", "Aksi"].map((h) => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Memuat data...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Tidak ada transaksi pada periode ini</td></tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${t.orderType === "Dine In" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>{t.orderType}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${t.paymentMethod === "Cash" ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>{t.paymentMethod}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{t.items?.length ?? 0} item</td>
                                        <td className="px-6 py-4 font-black text-gray-900">Rp {Number(t.amount).toLocaleString("id-ID")}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setSelectedTx(t)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                                                <Eye size={13} />Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 text-sm text-gray-400 font-medium">
                        Total {filtered.length} transaksi
                    </div>
                )}
            </div>
        </div>
    );
}
