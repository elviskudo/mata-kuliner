import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend: string;
    trendLabel: string;
    trendColor?: string;
}

export function StatsCard({ label, value, icon: Icon, trend, trendLabel, trendColor = "text-blue-500" }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 font-medium">{label}</h3>
                <Icon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
                <div className="text-sm text-gray-400">
                    <span className={`font-semibold ${trendColor}`}>{trend}</span> {trendLabel}
                </div>
            </div>
        </div>
    );
}
