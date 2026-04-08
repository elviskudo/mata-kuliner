"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Search, Star, Phone, Mail, Crown, TrendingUp, Edit2, X, Check, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

// --- HistoryList Component ---
function HistoryList({ memberId }: { memberId: number }) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/members/${memberId}/transactions`);
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [memberId]);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-600" /></div>;

    if (history.length === 0) return <div className="text-center text-gray-500 p-8">Belum ada riwayat pembelian.</div>;

    return (
        <div className="space-y-6">
            {history.map((tx) => (
                <div key={tx.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-gray-200">#{tx.id}</span>
                    </div>
                    <div className="space-y-2">
                        {tx.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-900 font-medium">{item.quantity || item.qty}x {item.name}</span>
                                <span className="text-gray-600">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-black text-purple-600">Rp {Number(tx.amount).toLocaleString('id-ID')}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
// ----------------------------

interface Member {
    id: number;
    name: string;
    phone: string;
    email: string;
    points: number;
    totalSpent: number;
    status: 'Active' | 'Inactive';
    joinDate: string;
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, totalPoints: 0, totalSpent: 0 });

    // Form state
    const [form, setForm] = useState({ name: "", phone: "", email: "", points: 0, status: "Active" });

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/members${search ? `?search=${encodeURIComponent(search)}` : ""}`);
            const data = await res.json();
            setMembers(data);

            // Compute stats from data
            setStats({
                totalMembers: data.length,
                activeMembers: data.filter((m: Member) => getStatus(m.joinDate) === 'Aktif').length,
                totalPoints: data.reduce((sum: number, m: Member) => sum + Number(m.points || 0), 0),
                totalSpent: data.reduce((sum: number, m: Member) => sum + Number(m.totalSpent || 0), 0),
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [search]);

    const getStatus = (joinDate: string) => {
        if (!joinDate) return 'Aktif';
        const diffTime = Math.abs(new Date().getTime() - new Date(joinDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 ? 'New' : 'Aktif';
    };

    const handleSave = async () => {
        const url = editingMember
            ? `${API_BASE_URL}/members/${editingMember.id}`
            : `${API_BASE_URL}/members`;
        const method = editingMember ? "PUT" : "POST";

        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setShowAddModal(false);
            setEditingMember(null);
            setForm({ name: "", phone: "", email: "", points: 0, status: "Active" });
            fetchMembers();
        } catch (err) {
            alert("Gagal menyimpan member");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus member ini?")) return;
        try {
            await fetch(`${API_BASE_URL}/members/${id}`, { method: "DELETE" });
            fetchMembers();
        } catch {
            alert("Gagal menghapus member");
        }
    };

    const openEdit = (member: Member) => {
        setEditingMember(member);
        setForm({ name: member.name, phone: member.phone, email: member.email, points: member.points, status: member.status });
        setShowAddModal(true);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Member & Poin</h1>
                    <p className="text-gray-500 mt-1 font-medium">Kelola pelanggan setia dan program poin</p>
                </div>
                <button
                    onClick={() => { setEditingMember(null); setForm({ name: "", phone: "", email: "", points: 0, status: "Active" }); setShowAddModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                    <Plus size={18} />
                    Tambah Member
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "Total Member", value: stats.totalMembers, icon: Users, color: "bg-blue-50 text-blue-600", iconBg: "bg-blue-100" },
                    { label: "Member Aktif", value: stats.activeMembers, icon: Crown, color: "bg-green-50 text-green-600", iconBg: "bg-green-100" },
                    { label: "Total Poin Beredar", value: Number(stats.totalPoints).toLocaleString('id-ID'), icon: Star, color: "bg-yellow-50 text-yellow-600", iconBg: "bg-yellow-100" },
                    { label: "Total Belanja Member", value: `Rp ${Number(stats.totalSpent || 0).toLocaleString('id-ID')}`, icon: TrendingUp, color: "bg-purple-50 text-purple-600", iconBg: "bg-purple-100" },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.color} rounded-2xl p-5 flex items-center gap-4`}>
                        <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Cari member berdasarkan nama atau nomor HP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
            </div>

            {/* Member Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Kontak</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Poin</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Total Belanja</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Bergabung</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400 font-medium">Memuat data...</td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400 font-medium">Belum ada member terdaftar</td></tr>
                        ) : members.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                            {member.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{member.name}</p>
                                            <p className="text-xs text-gray-400">ID #{member.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Phone size={12} />{member.phone || '-'}</p>
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5"><Mail size={12} />{member.email || '-'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                                        <span className="font-black text-gray-900">{Number(member.points || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => { setSelectedMember(member); setShowHistory(true); }}
                                        className="font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-purple-100"
                                    >
                                        Rp {Number(member.totalSpent || 0).toLocaleString('id-ID')}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black inline-block ${getStatus(member.joinDate) === 'New' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                        {getStatus(member.joinDate)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-700">{member.joinDate ? new Date(member.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEdit(member)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-black text-gray-900">{editingMember ? "Edit Member" : "Tambah Member Baru"}</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Masukkan nama member..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">No. Handphone</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Poin Awal</label>
                                    <input
                                        type="number"
                                        value={form.points}
                                        onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="Active">Aktif</option>
                                        <option value="Inactive">Nonaktif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!form.name}
                                className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Check size={18} />
                                {editingMember ? "Simpan Perubahan" : "Tambah Member"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {selectedMember && showHistory && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Riwayat Pembelian</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedMember.name}</p>
                            </div>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all border border-gray-200"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                            <HistoryList memberId={selectedMember.id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
