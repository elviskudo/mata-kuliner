"use client";

import { useState, useEffect, useMemo } from "react";
import { DollarSign, TrendingUp, CreditCard, Wallet, Calendar, FileText, Eye } from "lucide-react";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { transactionsService, Transaction } from "@/services/transactions.service";

export default function FinancialPage() {
    // State for Date Range
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [graphData, setGraphData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalCount: 0,
        cashIncome: 0,
        qrisIncome: 0
    });

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const start = dateRange.from.toISOString().split('T')[0];
            const end = dateRange.to.toISOString().split('T')[0];

            const report = await transactionsService.getFinancialReport(start, end);
            setTransactions(report.transactions);

            // Transform graph data for Recharts
            // report.graphData is array of { date, count, amount }
            if (report.graphData) {
                setGraphData(report.graphData.map((d: any) => ({
                    date: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                    revenue: d.amount,
                    orders: d.count
                })));
            }

            // Stats are normally calculated by backend or derived here
            // If the report endpoint calculates it, use it. Otherwise derived from transactions list
            // Assuming report.transactions contains all transactions for the period
            const totalIncome = report.transactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
            const totalCount = report.transactions.length;
            const cashIncome = report.transactions
                .filter((t: Transaction) => t.paymentMethod === 'Cash')
                .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
            const qrisIncome = report.transactions
                .filter((t: Transaction) => t.paymentMethod === 'QRIS')
                .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

            setStats({
                totalIncome,
                totalCount,
                cashIncome,
                qrisIncome
            });

        } catch (error) {
            console.error("Failed to fetch financial data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Stats for Display
    const displayStats = useMemo(() => {
        const averageValue = stats.totalCount > 0 ? stats.totalIncome / stats.totalCount : 0;
        return [
            { label: "Total Transaksi", value: stats.totalCount.toString(), icon: FileText, color: "bg-blue-100 text-blue-600" },
            { label: "Total Pemasukan", value: `Rp ${stats.totalIncome.toLocaleString('id-ID')}`, icon: Wallet, color: "bg-green-100 text-green-600" },
            { label: "Rata-rata Transaksi", value: `Rp ${Math.round(averageValue).toLocaleString('id-ID')}`, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
        ];
    }, [stats]);

    return (
        <div className="p-8 space-y-8 overflow-y-auto h-full pb-32">
            <h1 className="text-3xl font-bold text-gray-800">Financial Report</h1>

            {/* Date Filter & Stats */}
            <div className="flex flex-col md:flex-row gap-6 items-start justify-end">
                {/* Custom Date Range Picker */}
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <DateRangePicker
                        dateRange={dateRange}
                        ondateRangeChange={setDateRange}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayStats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-gray-400 text-sm font-medium">This Range</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-gray-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction Count Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Transaction Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                                    cursor={{ fill: '#F3F4F6' }}
                                />
                                <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Income Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Income Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                                    formatter={(value: any) => [`Rp ${value.toLocaleString()}`, "Income"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
                    <button className="text-blue-600 text-sm font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                        Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Payment</th>
                                <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-8 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length > 0 ? transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-8 py-4 text-sm font-bold text-gray-900">#{t.id}</td>
                                    <td className="px-8 py-4 text-sm text-gray-600 font-medium">
                                        {new Date(t.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1
                                            ${t.orderType === 'Dine In' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}
                                        `}>
                                            {t.orderType}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-gray-600 font-bold">{t.paymentMethod}</td>
                                    <td className="px-8 py-4 text-sm font-black text-gray-900 text-right">
                                        Rp {Number(t.amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedTransaction(t);
                                                setShowReceipt(true);
                                            }}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition-all"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-medium">
                                        No transactions found in this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Receipt Modal for Viewing */}
            {selectedTransaction && (
                <ReceiptModal
                    isOpen={showReceipt}
                    onClose={() => setShowReceipt(false)}
                    data={{
                        id: selectedTransaction.id.toString(),
                        date: selectedTransaction.createdAt,
                        items: selectedTransaction.items?.map((item: any, idx: number) => ({ ...item, id: idx.toString() })) || [],
                        subtotal: selectedTransaction.subtotal || 0,
                        tax: selectedTransaction.tax || 0,
                        total: selectedTransaction.amount,
                        paymentMethod: selectedTransaction.paymentMethod,
                        orderType: selectedTransaction.orderType,
                        cashierName: selectedTransaction.cashierName || "Admin"
                    }}
                />
            )}
        </div>
    );
}
