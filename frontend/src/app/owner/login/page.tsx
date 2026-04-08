"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

export default function OwnerLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login/owner/request-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Gagal mengirim OTP.");
            }

            setOtpSent(true);
            alert("Kode OTP telah dikirim ke email Anda!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login/owner/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "OTP tidak valid atau kadaluarsa.");
            }

            router.push("/dashboard");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
                        <Store className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Login Owner</h2>
                    <p className="text-gray-500 text-sm text-center mt-2">Masuk ke dashboard manajemen Mata Kuliner</p>
                </div>

                {!otpSent ? (
                    <form onSubmit={handleRequestOtp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Email Terdaftar</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 focus:bg-white transition-colors"
                                    placeholder="Alamat Email (Akun Utama)"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-4 mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sedang memproses...</> : "Minta Kode OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm mb-4 border border-green-100 flex flex-col items-center text-center">
                            Kode OTP telah dikirim ke <strong>{email}</strong>.
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Masukkan 6 Digit OTP</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="pl-10 w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-xl tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 focus:bg-white transition-colors"
                                    placeholder="------"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setOtpSent(false)}
                                className="px-4 py-4 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Kembali
                            </button>
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Validasi...</> : "Verifikasi"}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
                    <p className="text-sm text-gray-500">
                        Belum punya akun Owner?{" "}
                        <Link href="/owner/register" className="text-gray-900 font-bold hover:underline">
                            Daftar di sini
                        </Link>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        <Link href="/login" className="hover:text-gray-600 transition-colors">
                            &larr; Kembali ke Login Karyawan
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
