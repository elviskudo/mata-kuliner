"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Package, CalendarCheck, BookOpen, UserCog, LogOut, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const mainMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingCart, label: "Riwayat Order", href: "/dashboard/history" },
    { icon: UserCog, label: "Karyawan", href: "/dashboard/employees" },
    { icon: Package, label: "Bahan & Inventori", href: "/dashboard/stock" },
    { icon: TrendingUp, label: "Laporan Keuangan", href: "/dashboard/income" },
    { icon: CalendarCheck, label: "Laporan Harian", href: "/dashboard/closing" },
    { icon: Users, label: "Member & Poin", href: "/dashboard/members" },
];

const bottomItems: { icon: any; label: string; href: string }[] = [];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
            <div className="p-8">
                <h1 className="text-2xl font-bold text-blue-600">MATA Kuliner</h1>
            </div>

            <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
                {mainMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-2">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-sm font-medium"
                        >
                            <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 text-sm font-medium mt-4">
                    <LogOut className="w-5 h-5" />
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
}
