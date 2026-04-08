"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowRight, Phone, Key, Loader2 } from "lucide-react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Employee State
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleEmployeeLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login/employee`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password }),
            });
            if (!res.ok) throw new Error("Login gagal. Periksa nomor telepon dan password.");

            const data = await res.json();
            if (data.role?.toLowerCase() === "kitchen") {
                router.push("/kitchen");
            } else {
                router.push("/pos");
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Left Side: Branding */}
                <div className="bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">MATA Kuliner</h1>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Manage Your Restaurant Efficiently</h2>
                        <p className="text-blue-100 text-lg">
                            Login Karyawan untuk mengelola operasional harian.
                        </p>
                    </div>
                    <div className="relative z-10 mt-12 text-sm text-blue-200">
                        &copy; 2026 Mata Kuliner System
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Karyawan</h3>
                        <p className="text-gray-500">Silakan login untuk memulai shift Anda</p>
                    </div>

                    <form onSubmit={handleEmployeeLogin} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Email / No. HP / Nama</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 focus:bg-white transition-colors"
                                    placeholder="Masukkan Email / No. HP / Nama"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Password / PIN Akses</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 focus:bg-white transition-colors"
                                    placeholder="Masukkan kata sandi..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !identifier || !password}
                            className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Masuk...</> : <><ArrowRight className="w-5 h-5" /> Masuk ke Sistem</>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Anda Pemilik Resto?{" "}
                            <Link href="/owner/login" className="text-blue-600 font-semibold hover:underline">
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
