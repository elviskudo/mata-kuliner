"use client";
import { useState, useMemo, useEffect } from "react";
import { Users, Search, UserPlus, Mail, Phone, Calendar, Clock, Edit2, Trash2 } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import MemberModal from "@/components/pos/MemberModal";
import { membersService, Member as ServiceMember } from "@/services/members.service";

interface Member extends Omit<ServiceMember, 'status'> {
    status: "Active" | "Inactive";
}


// Mock Purchases Data for History
import { API_BASE_URL } from "@/lib/config";
import { Loader2 } from "lucide-react";

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

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>;

    if (history.length === 0) return <div className="text-center text-gray-500 p-8">No purchase history found.</div>;

    return (
        <div className="space-y-6">
            {history.map((tx) => (
                <div key={tx.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-gray-200">#{tx.id}</span>
                    </div>
                    <div className="space-y-2">
                        {tx.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-900 font-medium">{item.quantity || item.qty}x {item.name}</span>
                                <span className="text-gray-600">Rp {Number(item.price).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-black text-blue-600">Rp {Number(tx.amount).toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function MemberPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchMembers();
    }, []);

    // Search Effect - Debounced
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchMembers(searchQuery);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const fetchMembers = async (query?: string) => {
        try {
            const data = await membersService.findAll(query);
            // Map service member to component member (handling status type)
            const mappedData: Member[] = data.map(m => ({
                ...m,
                status: m.status as "Active" | "Inactive" // simplified casting for now, ideally backend validation ensures this
            }));
            setMembers(mappedData);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    // Date Range State
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    // Status Logic Helper
    const getStatus = (joinDate: string) => {
        const diffTime = Math.abs(new Date().getTime() - new Date(joinDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 ? 'New' : 'Active';
    };

    // Filter Logic mainly for Date Range now, Search handled by API for better init load
    const filteredMembers = members;

    const handleSaveMember = async (memberData: Omit<Member, 'id'>) => {
        try {
            if (editingMember) {
                await membersService.update(editingMember.id, memberData);
            } else {
                await membersService.create(memberData);
            }
            fetchMembers();
            setIsModalOpen(false);
            setEditingMember(null);
        } catch (error) {
            console.error("Failed to save member:", error);
            alert("Failed to save member");
        }
    };

    const handleDeleteMember = async (id: number) => {
        if (confirm('Are you sure you want to delete this member?')) {
            try {
                await membersService.remove(id);
                fetchMembers();
            } catch (error) {
                console.error("Failed to delete member:", error);
                alert("Failed to delete member");
            }
        }
    };

    const handleEditClick = (member: Member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingMember(null);
        setIsModalOpen(true);
    };

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            // For now defaults to current year/month range or similar
            // The API expects startDate/endDate. 
            // We can use the dateRange state.
            try {
                const start = dateRange.from.toISOString().split('T')[0];
                const end = dateRange.to.toISOString().split('T')[0];
                const data = await membersService.getDashboardStats(start, end);
                if (data && data.length > 0) {
                    setChartData(data);
                }
            } catch (e) {
                console.error("Failed to fetch member stats", e);
            }
        };
        fetchStats();
    }, [dateRange]);

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto">
            {/* Header */}
            <header className="px-8 py-6 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Members</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola data member pelanggan</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <UserPlus size={20} />
                        Add Member
                    </button>
                </div>
            </header>

            <div className="p-8 space-y-8">
                {/* Stats Cards & Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats Column */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Users size={24} />
                                </div>
                            </div>
                            <p className="text-sm font-bold opacity-80 mb-1">Total Members</p>
                            <h3 className="text-3xl font-black">{members.length}</h3>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                    <Calendar size={24} />
                                </div>
                            </div>
                            <p className="text-sm font-bold text-gray-500 mb-1">New This Month</p>
                            <h3 className="text-2xl font-black text-gray-900">
                                {members.filter(m => getStatus(m.joinDate) === 'New').length}
                            </h3>
                        </div>
                    </div>

                    {/* Chart Column */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-lg font-black text-gray-900">Member Transactions</h2>
                            {/* Date Picker Moved Here */}
                            <div className="bg-gray-50 p-1 rounded-xl shadow-sm border border-gray-100 relative z-20">
                                <DateRangePicker
                                    dateRange={dateRange}
                                    ondateRangeChange={setDateRange}
                                />
                            </div>
                        </div>
                        <div className="h-[250px] flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="orders" name="Orders" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search members by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-blue-300 text-sm transition duration-150 ease-in-out"
                        />
                    </div>
                </div>

                {/* Members Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">All Members</h2>
                            <p className="text-sm text-gray-500 mt-1">{filteredMembers.length} members found</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Poin</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Total Belanja</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Join Date</th>
                                    <th className="px-8 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-gray-400">
                                            <p className="text-sm font-bold">No members found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-4 text-sm font-bold text-gray-900">#{member.id}</td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="space-y-1">
                                                    {member.email ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail size={14} />
                                                            {member.email}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone size={14} />
                                                            {member.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-black text-gray-900">{Number(member.points || 0).toLocaleString('id-ID')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="font-bold text-gray-700">Rp {Number(member.totalSpent || 0).toLocaleString('id-ID')}</span>
                                            </td>
                                            <td className="px-8 py-4 text-sm text-gray-600">
                                                {new Date(member.joinDate).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block
                                                    ${getStatus(member.joinDate) === 'New'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-green-100 text-green-600'}
                                                `}>
                                                    {getStatus(member.joinDate)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setSelectedMember(member); setShowHistory(true); }}
                                                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all font-bold text-xs flex items-center gap-1"
                                                        title="View History"
                                                    >
                                                        <Clock size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(member)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                                                        title="Edit Member"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMember(member.id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                                        title="Delete Member"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            {selectedMember && showHistory && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Purchase History</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedMember.name}</p>
                            </div>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-8 py-6 overflow-y-auto max-h-[60vh]">
                            <HistoryList memberId={selectedMember.id} />
                        </div>
                    </div>
                </div>
            )}


            {/* Member Modal (Add/Edit) */}
            <MemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMember}
                member={editingMember}
            />
        </div >
    );
}
