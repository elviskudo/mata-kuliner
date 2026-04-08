"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Mail, Lock, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

export default function OwnerRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Tahap 1
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    // Tahap 2
    const [otp, setOtp] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRequestRegisterOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/owner/register/request-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Gagal mengirim OTP untuk registrasi.");
            }

            setOtpSent(true);
            alert("Kode registrasi (OTP) telah dikirim ke email Anda!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/owner/register/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, username, password }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Gagal mendaftarkan akun Owner.");
            }

            alert("Pendaftaran Owner berhasil! Anda sekarang dapat masuk ke dashboard.");
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
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                        <KeyRound className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Buat Akun Owner</h2>
                    <p className="text-gray-500 text-sm text-center mt-2">Daftarkan diri Anda sebagai pemilik resto</p>
                </div>

                {!otpSent ? (
                    <form onSubmit={handleRequestRegisterOtp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Tahap 1: Verifikasi Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 focus:bg-white transition-colors"
                                    placeholder="Masukkan alamat email aktif"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sedang memproses...</> : "Minta OTP Registrasi"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterVerify} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        <div className="p-4 bg-gray-50 text-gray-700 rounded-xl text-sm border border-gray-100 flex flex-col items-center text-center">
                            Masukkan 6 digit kode dari email <strong>{email}</strong>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Kode Registrasi OTP</label>
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
                                    className="pl-10 w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-xl tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 focus:bg-white transition-colors"
                                    placeholder="------"
                                />
                            </div>
                        </div>

                        <div className="w-full border-t border-gray-100 my-4"></div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Username Owner Baru</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 focus:bg-white transition-colors"
                                placeholder="Username untuk login berikutnya"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Password Baru</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 focus:bg-white transition-colors"
                                placeholder="Masukkan password kuat"
                            />
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
                                disabled={loading || otp.length < 6 || !username || !password}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Mendaftar...</> : "Selesaikan Registrasi"}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
                    <p className="text-sm text-gray-500">
                        Sudah punya akun?{" "}
                        <Link href="/owner/login" className="text-blue-600 font-bold hover:underline">
                            Login Owner
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
