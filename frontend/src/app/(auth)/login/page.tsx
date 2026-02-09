"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChefHat, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // Will create this next
import { cn } from "@/lib/utils";

const roles = [
    {
        id: "owner",
        title: "Owner",
        icon: Store,
        description: "Full access to dashboard & management",
        color: "bg-blue-500",
        redirect: "/dashboard",
    },
    {
        id: "cashier",
        title: "Cashier",
        icon: Users, // Using Users as a proxy for Cashier/POS interaction
        description: "Process orders & payments",
        color: "bg-emerald-500",
        redirect: "/pos",
    },
    {
        id: "kitchen",
        title: "Kitchen",
        icon: ChefHat,
        description: "Manage orders & stock",
        color: "bg-orange-500",
        redirect: "/kitchen",
    },
];

export default function LoginPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        if (!selectedRole) return;
        setLoading(true);
        const role = roles.find((r) => r.id === selectedRole);
        if (role) {
            // Simulate login delay
            setTimeout(() => {
                router.push(role.redirect);
            }, 800);
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
                            One platform for Owner, Cashier, and Kitchen staff. Streamline your operations today.
                        </p>
                    </div>
                    <div className="relative z-10 mt-12 text-sm text-blue-200">
                        &copy; 2026 Mata Kuliner System
                    </div>
                </div>

                {/* Right Side: Role Selection */}
                <div className="p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
                        <p className="text-gray-500">Please select your role to continue</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;

                            return (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group relative overflow-hidden",
                                        isSelected
                                            ? `border-${role.color.replace("bg-", "")} bg-gray-50 ring-1 ring-${role.color.replace("bg-", "")}`
                                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                                            isSelected ? role.color : "bg-gray-100 group-hover:bg-gray-200"
                                        )}
                                    >
                                        <Icon className={cn("w-6 h-6", isSelected && "text-white")} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{role.title}</h4>
                                        <p className="text-sm text-gray-500">{role.description}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute right-4 text-blue-600 animate-in fade-in zoom-in">
                                            <div className={`w-4 h-4 rounded-full ${role.color}`} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={!selectedRole || loading}
                        className={cn(
                            "w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                            selectedRole ? "bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl translate-y-0" : "bg-gray-300"
                        )}
                    >
                        {loading ? (
                            "Accessing System..."
                        ) : (
                            <>
                                Continue to System <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
