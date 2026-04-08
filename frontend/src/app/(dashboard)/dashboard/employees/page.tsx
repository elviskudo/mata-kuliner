"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Edit2, Trash2, UtensilsCrossed, Monitor } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { EmployeeModal } from "@/components/dashboard/EmployeeModal";

interface Employee {
    id: number;
    name: string;
    role: string;
    employeeCode: string;
    phone?: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah anda yakin ingin menghapus karyawan ini?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchEmployees();
            } else {
                alert('Gagal menghapus karyawan');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat menghapus data.');
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/employees`);
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const cashierCount = employees.filter(e => e.role?.toLowerCase() === 'cashier').length;
    const kitchenCount = employees.filter(e => e.role?.toLowerCase() === 'kitchen').length;

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Karyawan</h1>
                    <p className="text-gray-500 mt-1 text-sm">Kelola data karyawan Kasir dan Dapur</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} />
                    <span>Tambah Karyawan</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Monitor size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Kasir</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{cashierCount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                        <UtensilsCrossed size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Dapur</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{kitchenCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Daftar Karyawan</h2>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama / kode..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                            <p className="font-medium">Memuat data...</p>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
                                <Search size={28} className="text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-600">Tidak ada data ditemukan</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">Kode</th>
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">Nama Lengkap</th>
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">Role</th>
                                    <th className="font-bold py-4 px-6 border-b border-gray-100">No. HP</th>
                                    <th className="font-bold py-4 px-6 border-b border-gray-100 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 group">
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-600">
                                                {emp.employeeCode}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-900">{emp.name}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${emp.role?.toLowerCase() === 'cashier' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">{emp.phone || '-'}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 bg-white border border-gray-200 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 bg-white border border-gray-200 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchEmployees}
            />
        </div>
    );
}
