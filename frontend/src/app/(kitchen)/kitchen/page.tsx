"use client";

import KitchenStats from '@/components/kitchen/KitchenStats';
import OrderStatusChart from '@/components/kitchen/OrderStatusChart';
import StockAlertList from '@/components/kitchen/StockAlertList';
import RecentOrdersTable from '@/components/kitchen/RecentOrdersTable';

export default function KitchenDashboard() {
    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <KitchenStats />

            {/* Charts & Stock Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[400px]">
                    <OrderStatusChart />
                </div>
                <div className="lg:col-span-1 h-[400px]">
                    <StockAlertList />
                </div>
            </div>

            {/* Recent Orders Row */}
            <RecentOrdersTable />
        </div>
    );
}
