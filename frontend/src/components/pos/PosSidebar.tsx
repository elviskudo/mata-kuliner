"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, UtensilsCrossed, ShoppingCart, User, LogOut, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/pos" },
    { icon: DollarSign, label: "Financial", href: "/financial" },
    { icon: Users, label: "Member", href: "/member" },
    { icon: Receipt, label: "Transaction", href: "/pos/transactions" },
    { icon: UtensilsCrossed, label: "Menu", href: "/pos/menu" },
    { icon: ShoppingCart, label: "Cart", href: "/pos/cart" },
    { icon: User, label: "Profile", href: "/pos/profile" },
];

export function PosSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 bg-black flex flex-col items-center py-8 h-screen sticky top-0 z-50">
            {/* Logo */}
            <div className="mb-12">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col gap-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-400/50"
                                    : "text-blue-200 hover:bg-blue-600/20 hover:text-white"
                            )}
                        >
                            <Icon className="w-6 h-6" />
                            {/* Tooltip or Label could go here if needed, but the image shows just icons */}
                        </Link>
                    );
                })}
            </div>

            {/* Logout */}
            <Link
                href="/login"
                className="w-12 h-12 flex items-center justify-center rounded-xl text-blue-200 hover:bg-red-600/20 hover:text-red-500 transition-all duration-200"
            >
                <LogOut className="w-6 h-6" />
            </Link>
        </aside>
    );
}
