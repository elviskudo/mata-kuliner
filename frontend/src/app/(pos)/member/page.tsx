"use client";

import { useState } from "react";
import { Users, Search, UserPlus, Mail, Phone, Calendar } from "lucide-react";

interface Member {
    id: number;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: number;
}

export default function MemberPage() {
    const [members] = useState<Member[]>([
        {
            id: 1,
            name: "Ahmad Rizki",
            email: "ahmad.rizki@email.com",
            phone: "081234567890",
            joinDate: "2026-01-15",
            totalOrders: 25,
            totalSpent: 1250000
        },
        {
            id: 2,
            name: "Siti Nurhaliza",
            email: "siti.nur@email.com",
            phone: "081234567891",
            joinDate: "2026-01-20",
            totalOrders: 18,
            totalSpent: 890000
        },
        {
            id: 3,
            name: "Budi Santoso",
            email: "budi.s@email.com",
            phone: "081234567892",
            joinDate: "2026-02-01",
            totalOrders: 12,
            totalSpent: 650000
        }
    ]);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto">
            {/* Header */}
            <header className="px-8 py-6 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Members</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola data member pelanggan</p>
                    </div>
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2">
                        <UserPlus size={20} />
                        Add Member
                    </button>
                </div>
            </header>

            <div className="p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <h3 className="text-2xl font-black text-gray-900">5</h3>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Active Members</p>
                        <h3 className="text-2xl font-black text-gray-900">{members.length}</h3>
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
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900">All Members</h2>
                        <p className="text-sm text-gray-500 mt-1">{filteredMembers.length} members found</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Join Date</th>
                                    <th className="px-8 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Orders</th>
                                    <th className="px-8 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Total Spent</th>
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
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} />
                                                        {member.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone size={14} />
                                                        {member.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-sm text-gray-600">
                                                {new Date(member.joinDate).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-8 py-4 text-right text-sm font-bold text-gray-900">
                                                {member.totalOrders}
                                            </td>
                                            <td className="px-8 py-4 text-right text-sm font-black text-gray-900">
                                                Rp {member.totalSpent.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
