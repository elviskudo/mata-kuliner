"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Package, UtensilsCrossed, Settings, HelpCircle, LogOut, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const mainMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/kitchen" },
    { icon: ClipboardList, label: "Orders", href: "/kitchen/orders" },
    { icon: Package, label: "Bahan", href: "/kitchen/product" },
    { icon: BookOpen, label: "Resep", href: "/kitchen/recipe" },
    { icon: UtensilsCrossed, label: "Menu", href: "/kitchen/menu" },
];

const bottomMenuItems = [
    { icon: Settings, label: "Setting", href: "/kitchen/settings" },
    { icon: HelpCircle, label: "Help", href: "/kitchen/help" },
];

export function KitchenSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
            <div className="p-8 flex items-center gap-3">
                <img src="/logo.png" alt="Mata Kuliner Logo" className="w-10 h-10 object-contain" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">MATA Kuliner</h1>
            </div>

            <div className="flex-1 px-4 py-2 space-y-2">
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
                {bottomMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                isActive ? "bg-gray-50 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
                <Link href="/login" className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 text-sm font-medium">
                    <LogOut className="w-5 h-5" />
                    <span>Log out</span>
                </Link>
            </div>
        </aside>
    );
}
