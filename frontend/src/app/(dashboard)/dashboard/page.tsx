"use client";

import { useState, useEffect, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { startOfMonth, endOfMonth } from "date-fns";
import { API_BASE_URL } from "@/lib/config";
import { transactionsService, Transaction } from "@/services/transactions.service";

/* ─── Icon SVGs matching screenshot ─── */
function IconCashier() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function IconKitchen() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function IconMenu() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
    );
}
function IconRevenue() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}

const CATEGORY_COLORS: Record<string, string> = {
    Makanan: "#f87171",
    Minuman: "#60a5fa",
    Snack: "#34d399",
    Food: "#f87171",
    Drink: "#60a5fa",
};
const FALLBACK_COLORS = ["#60a5fa", "#f87171", "#34d399", "#a78bfa", "#fb923c"];

export default function DashboardPage() {
    const [menuCount, setMenuCount] = useState<number | null>(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
    const [graphData, setGraphData] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [cashierCount, setCashierCount] = useState<number | null>(null);
    const [kitchenCount, setKitchenCount] = useState<number | null>(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [menusRes, reportData, employeesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/recipes`).then((r) => r.json()),
                transactionsService.getFinancialReport(
                    startOfMonth(new Date()).toISOString().split("T")[0],
                    endOfMonth(new Date()).toISOString().split("T")[0]
                ),
                fetch(`${API_BASE_URL}/employees`).then((r) => r.json()),
            ]);

            setMenuCount(Array.isArray(menusRes) ? menusRes.length : 0);

            // Count employees by role
            if (Array.isArray(employeesRes)) {
                setCashierCount(employeesRes.filter((e: any) => e.role === 'Cashier').length);
                setKitchenCount(employeesRes.filter((e: any) => e.role === 'Kitchen').length);
            }

            const txns: Transaction[] = reportData.transactions || [];
            setTransactions(txns);

            const totalRevenue = txns.reduce((sum, t) => sum + Number(t.amount), 0);
            setMonthlyRevenue(totalRevenue);

            if (reportData.graphData) {
                setGraphData(
                    reportData.graphData.map((d: any) => ({
                        date: new Date(d.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                        }),
                        revenue: d.amount,
                        orders: d.count,
                    }))
                );
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Top Selling Menu
    const topMenus = useMemo(() => {
        const map: Record<string, { name: string; image: string; qty: number; revenue: number }> = {};
        transactions.forEach((t) => {
            (t.items || []).forEach((item: any) => {
                const key = item.name || item.id;
                if (!map[key]) map[key] = { name: item.name, image: item.image || "", qty: 0, revenue: 0 };
                map[key].qty += Number(item.qty || 1);
                map[key].revenue += Number(item.price || 0) * Number(item.qty || 1);
            });
        });
        return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
    }, [transactions]);

    // Category Pie
    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.forEach((t) => {
            (t.items || []).forEach((item: any) => {
                const cat = item.category || "Lainnya";
                map[cat] = (map[cat] || 0) + Number(item.qty || 1);
            });
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    const statsCards = [
        {
            label: "Cashier Staff",
            value: loading ? "..." : (cashierCount ?? 0).toString(),
            icon: <IconCashier />,
            iconBg: "bg-blue-100 text-blue-500",
            trend: "",
            trendLabel: "Karyawan kasir aktif",
        },
        {
            label: "Kitchen Staff",
            value: loading ? "..." : (kitchenCount ?? 0).toString(),
            icon: <IconKitchen />,
            iconBg: "bg-blue-100 text-blue-500",
            trend: "",
            trendLabel: "Karyawan dapur aktif",
        },
        {
            label: "Menu",
            value: loading ? "..." : (menuCount ?? 0).toString(),
            icon: <IconMenu />,
            iconBg: "bg-blue-100 text-blue-500",
            trend: "",
            trendLabel: "Total menu aktif",
        },
        {
            label: "Monthly Revenue",
            value: loading
                ? "..."
                : `Rp ${(monthlyRevenue ?? 0).toLocaleString("id-ID")}`,
            icon: <IconRevenue />,
            iconBg: "bg-blue-100 text-blue-500",
            trend: "",
            trendLabel: "Bulan ini",
        },
    ];

    // Compute chart content before JSX return to avoid IIFE issues
    const paddedGraph = graphData.length < 2
        ? [{ date: '', revenue: 0, orders: 0 }, ...graphData, { date: '', revenue: 0, orders: 0 }]
        : graphData;
    const maxRevenue = Math.max(...paddedGraph.map(d => d.revenue));
    const chartContent = (
        <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paddedGraph} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAreaDash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#67e8f9" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        padding={{ left: 30, right: 30 }}
                    />
                    <YAxis
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, maxRevenue > 0 ? Math.ceil(maxRevenue * 1.3 / 1000) * 1000 : 10000]}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                        formatter={(val: any) => val > 0 ? [`Rp ${Number(val).toLocaleString("id-ID")}`, "Revenue"] : [null, null]}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#22d3ee"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorAreaDash)"
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                                    {card.label}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                                {card.icon}
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900 mb-3">{card.value}</p>
                        <p className="text-xs text-blue-500 font-semibold">{card.trendLabel}</p>
                    </div>
                ))}
            </div>

            {/* ── Purchase Amount Chart ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Purchase amount</h3>
                    <button className="text-sm font-semibold text-gray-500 border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        This year
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                </div>
                {loading ? (
                    <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                        Memuat data grafik...
                    </div>
                ) : graphData.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                        Belum ada data transaksi bulan ini
                    </div>
                ) : chartContent}
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Selling Menu */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900">Top selling menu</h3>
                    </div>
                    {loading ? (
                        <div className="px-6 pb-12 text-center text-gray-400 text-sm">Memuat...</div>
                    ) : topMenus.length === 0 ? (
                        <div className="px-6 pb-12 text-center text-gray-400 text-sm">
                            Belum ada data penjualan
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-teal-50/80">
                                    {["Menu image", "Menu Name", "Units sold", "Revenue"].map((h) => (
                                        <th
                                            key={h}
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-500"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topMenus.map((menu, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                                {menu.image ? (
                                                    <img
                                                        src={
                                                            menu.image.startsWith("http") || menu.image.startsWith("data")
                                                                ? menu.image
                                                                : `${API_BASE_URL}${menu.image}`
                                                        }
                                                        alt={menu.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                            {menu.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {menu.qty}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                            Rp {menu.revenue.toLocaleString("id-ID")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Category Pie */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Kategori</h3>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                            Memuat...
                        </div>
                    ) : categoryData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center">
                            Belum ada data
                        </div>
                    ) : (
                        <div className="flex-1" style={{ minHeight: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    CATEGORY_COLORS[entry.name] ||
                                                    FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Legend
                                        layout="vertical"
                                        align="right"
                                        verticalAlign="middle"
                                        iconType="circle"
                                        iconSize={10}
                                        formatter={(value) => (
                                            <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                    <Tooltip
                                        formatter={(val: any, name: any) => [`${val} item`, name]}
                                        contentStyle={{
                                            borderRadius: "10px",
                                            border: "none",
                                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                            fontSize: 12,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
