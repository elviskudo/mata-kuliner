'use client';

import { ORDER_STATUS_DATA } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function OrderStatusChart() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Order Status</h2>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={ORDER_STATUS_DATA}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 0,
                            bottom: 5,
                        }}
                        barSize={60}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            domain={[0, 15]}
                            ticks={[0, 5, 10, 15]}
                        />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {ORDER_STATUS_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList dataKey="count" position="top" fill="white" dy={25} fontSize={20} fontWeight="bold" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
