"use client";

import { useState, useEffect, useMemo } from "react";
import { Wallet, TrendingUp, CreditCard, Banknote, Search } from "lucide-react";
import { transactionsService, Transaction } from "@/services/transactions.service";
import { startOfMonth, endOfMonth } from "date-fns";

export default function IncomePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const start = startOfMonth(new Date()).toISOString().split("T")[0];
        const end = endOfMonth(new Date()).toISOString().split("T")[0];

        transactionsService
            .getFinancialReport(start, end)
            .then((report) => setTransactions(report.transactions || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
        const cash = transactions.filter((t) => t.paymentMethod === "Cash").reduce((s, t) => s + Number(t.amount), 0);
        const qris = transactions.filter((t) => t.paymentMethod === "QRIS").reduce((s, t) => s + Number(t.amount), 0);
        return { total, cash, qris, count: transactions.length };
    }, [transactions]);

    const filtered = transactions.filter(
        (t) =>
            t.id.toString().includes(search) ||
            t.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
            t.orderType.toLowerCase().includes(search.toLowerCase())
    );

    const summaryCards = [
        {
            label: "Total Pemasukan",
            value: `Rp ${stats.total.toLocaleString("id-ID")}`,
            icon: Wallet,
            bg: "from-emerald-500 to-emerald-600",
        },
        {
            label: "Total Transaksi",
            value: stats.count.toString(),
            icon: TrendingUp,
            bg: "from-blue-500 to-blue-600",
        },
        {
            label: "Pemasukan Cash",
            value: `Rp ${stats.cash.toLocaleString("id-ID")}`,
            icon: Banknote,
            bg: "from-amber-500 to-amber-600",
        },
        {
            label: "Pemasukan QRIS",
            value: `Rp ${stats.qris.toLocaleString("id-ID")}`,
            icon: CreditCard,
            bg: "from-violet-500 to-violet-600",
        },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Wallet className="text-emerald-600" size={28} />
                    Laporan Keuangan
                </h1>
                <p className="text-gray-400 mt-1 text-sm">Ringkasan pemasukan dari transaksi POS — bulan ini</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className={`bg-gradient-to-br ${card.bg} rounded-2xl p-6 text-white shadow-lg`}>
                            <Icon size={24} className="mb-3 opacity-80" />
                            <p className="text-white/70 text-xs font-medium mb-1">{card.label}</p>
                            <p className="text-xl font-black leading-tight">{loading ? "..." : card.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Search */}
            <div className="flex justify-end">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari transaksi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Detail Transaksi</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {["#ID", "Tanggal", "Order Type", "Pembayaran", "Sub Total", "Pajak (11%)", "Total"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        Tidak ada transaksi di bulan ini
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">#{t.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(t.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-lg text-xs font-bold ${t.orderType === "Dine In"
                                                        ? "bg-orange-100 text-orange-600"
                                                        : "bg-blue-100 text-blue-600"
                                                    }`}
                                            >
                                                {t.orderType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-lg text-xs font-bold ${t.paymentMethod === "Cash"
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-purple-100 text-purple-600"
                                                    }`}
                                            >
                                                {t.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            Rp {Number(t.subtotal || 0).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            Rp {Number(t.tax || 0).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-900">
                                            Rp {Number(t.amount).toLocaleString("id-ID")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <span className="text-sm text-gray-400 font-medium">
                            {filtered.length} transaksi ditampilkan
                        </span>
                        <span className="text-sm font-black text-emerald-600">
                            Total: Rp {filtered.reduce((s, t) => s + Number(t.amount), 0).toLocaleString("id-ID")}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
