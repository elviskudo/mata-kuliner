"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, CreditCard, Wallet, Calendar } from "lucide-react";

interface Transaction {
    id: number;
    amount: number;
    paymentMethod: string;
    orderType: string;
    createdAt: string;
    cashierName: string;
    items: any[];
    subtotal: number;
    tax: number;
}

interface Stats {
    totalIncome: number;
    totalCount: number;
    cashIncome: number;
    qrisIncome: number;
    cashCount: number;
    qrisCount: number;
}

export default function FinancialPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const API_BASE_URL = 'http://localhost:3001';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, transactionsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/transactions/stats`),
                fetch(`${API_BASE_URL}/transactions/recent`)
            ]);

            const statsData = await statsRes.json();
            const transactionsData = await transactionsRes.json();

            setStats(statsData);
            setTransactions(transactionsData);
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto">
            {/* Header */}
            <header className="px-8 py-6 bg-white border-b border-gray-100">
                <h1 className="text-2xl font-black text-gray-900">Financial Report</h1>
                <p className="text-sm text-gray-500 mt-1">Rekapitulasi keuangan dan transaksi</p>
            </header>

            <div className="p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Income */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <DollarSign size={24} />
                            </div>
                            <TrendingUp size={20} className="opacity-60" />
                        </div>
                        <p className="text-sm font-bold opacity-80 mb-1">Total Income</p>
                        <h3 className="text-3xl font-black">Rp {stats?.totalIncome.toLocaleString() || 0}</h3>
                        <p className="text-xs opacity-60 mt-2">{stats?.totalCount || 0} transactions</p>
                    </div>

                    {/* Cash Income */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                <Wallet size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Cash</p>
                        <h3 className="text-2xl font-black text-gray-900">Rp {stats?.cashIncome.toLocaleString() || 0}</h3>
                        <p className="text-xs text-gray-400 mt-2">{stats?.cashCount || 0} transactions</p>
                    </div>

                    {/* QRIS Income */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <CreditCard size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-500 mb-1">QRIS</p>
                        <h3 className="text-2xl font-black text-gray-900">Rp {stats?.qrisIncome.toLocaleString() || 0}</h3>
                        <p className="text-xs text-gray-400 mt-2">{stats?.qrisCount || 0} transactions</p>
                    </div>

                    {/* Today's Date */}
                    <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Calendar size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold opacity-80 mb-1">Report Date</p>
                        <h3 className="text-xl font-black">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                    </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900">Recent Transactions</h2>
                        <p className="text-sm text-gray-500 mt-1">10 transaksi terakhir</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Cashier</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Order Type</th>
                                    <th className="px-8 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-8 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-12 text-center text-gray-400">
                                            <p className="text-sm font-bold">Belum ada transaksi</p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-4 text-sm font-bold text-gray-900">#{transaction.id}</td>
                                            <td className="px-8 py-4 text-sm text-gray-600">
                                                {new Date(transaction.createdAt).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-8 py-4 text-sm text-gray-600">{transaction.cashierName}</td>
                                            <td className="px-8 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${transaction.paymentMethod === 'Cash'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {transaction.paymentMethod === 'Cash' ? '💵' : '📱'} {transaction.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-sm text-gray-600">{transaction.orderType}</td>
                                            <td className="px-8 py-4 text-right text-sm font-black text-gray-900">
                                                Rp {transaction.amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedTransaction(transaction)}
                                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedTransaction(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Transaction Detail</h2>
                                    <p className="text-sm text-gray-500 mt-1">ID: #{selectedTransaction.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-8 py-6 overflow-y-auto max-h-[60vh]">
                            {/* Transaction Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 mb-1">Cashier</p>
                                    <p className="text-sm font-black text-gray-900">{selectedTransaction.cashierName}</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 mb-1">Date & Time</p>
                                    <p className="text-sm font-black text-gray-900">
                                        {new Date(selectedTransaction.createdAt).toLocaleString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 mb-1">Payment Method</p>
                                    <p className="text-sm font-black text-gray-900">{selectedTransaction.paymentMethod}</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 mb-1">Order Type</p>
                                    <p className="text-sm font-black text-gray-900">{selectedTransaction.orderType}</p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="mb-6">
                                <h3 className="text-lg font-black text-gray-900 mb-4">Purchased Items</h3>
                                <div className="space-y-3">
                                    {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                                        selectedTransaction.items.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                                                    <img
                                                        src={item.image && (item.image.startsWith('http') || item.image.startsWith('data')) ? item.image : `http://localhost:3001${item.image}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">Rp {item.price?.toLocaleString()} x {item.qty}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900">Rp {(item.price * item.qty)?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center py-4">No items data</p>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="border-t border-gray-100 pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500">Subtotal</span>
                                    <span className="text-sm font-bold text-gray-900">Rp {selectedTransaction.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500">Tax (11%)</span>
                                    <span className="text-sm font-bold text-gray-900">Rp {selectedTransaction.tax?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <span className="text-lg font-black text-gray-900">Total</span>
                                    <span className="text-2xl font-black text-blue-600">Rp {selectedTransaction.amount?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
