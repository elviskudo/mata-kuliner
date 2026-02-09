"use client";

import { DASHBOARD_STATS } from "@/lib/data";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopMenu } from "@/components/dashboard/TopMenu";
import { Users, Package, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const PIE_DATA = [
    { name: 'Drink', value: 400, color: '#60a5fa' },
    { name: 'Food', value: 300, color: '#f87171' },
    { name: 'Snack', value: 300, color: '#34d399' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    label="Cashier Staff"
                    value={DASHBOARD_STATS.cashierUsers}
                    icon={Users}
                    trend="+12%"
                    trendLabel="As of year-end"
                />
                <StatsCard
                    label="Kitchen Staff"
                    value={DASHBOARD_STATS.kitchenUsers}
                    icon={Users}
                    trend="+4%"
                    trendLabel="As of year-end"
                />
                <StatsCard
                    label="Product"
                    value={DASHBOARD_STATS.products}
                    icon={Package}
                    trend="+8%"
                    trendLabel="As of year-end"
                />
                <StatsCard
                    label="Monthly Revenue"
                    value={`$${DASHBOARD_STATS.monthlyRevenue}`}
                    icon={DollarSign}
                    trend="+2%"
                    trendLabel="As of year-end"
                />
            </div>

            {/* Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <RevenueChart />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TopMenu />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
                    <h3 className="text-lg font-bold text-gray-900 w-full mb-4">Categories</h3>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={PIE_DATA}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {PIE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        {PIE_DATA.map(d => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-gray-600">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
