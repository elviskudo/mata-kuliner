import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ORDERS, MENU_ITEMS } from '@/lib/data';

function getMenuImage(name: string) {
    const item = MENU_ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase());
    // Fallback if exact match fails
    const fuzzyItem = MENU_ITEMS.find(i => name.toLowerCase().includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(name.toLowerCase()));
    return item?.image || fuzzyItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
}

export default function RecentOrdersTable() {
    // Filter out some orders to match "Recent Order" - maybe just take all from data for now
    // The design image shows Order IDs 1024, 1023, 1022
    // My data.ts has 1024, 1023, 1022. Perfect.

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-300 text-blue-800'; // Light blue in design
            case 'cooking': return 'bg-orange-300 text-orange-800'; // Light orange
            case 'done': return 'bg-teal-300 text-teal-800'; // Teal/Greenish
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    // Actually the design buttons look like solid buttons with white text or specific colors.
    // New: Blue background, White text? Or Light Blue?
    // Image 1: "New" is Blue Background, White Text. "Cooking" is Orange Background, White Text. "Done" is Teal Background, White Text. "Delivery" is Light Teal background. "Here" is Light Green... wait.
    // Let's look closely at Image 1.
    // Status Buttons:
    // New: Light Blue BG, Blue Text? No, looks like Solid Blue-ish.
    // Cooking: Solid Orange.
    // Done: Solid Teal.
    // Type Buttons:
    // Delivery: Light Greenish/Blueish?
    // Here: Solid Green.

    // Let's refine based on "tampilannya sama persis" (look exactly the same).
    // Status:
    // New: bg-[#8ab4f8] text-white? or bg-blue-400
    // Cooking: bg-orange-400 text-white
    // Done: bg-[#62C2C6] (Teal) text-white

    // Type:
    // Delivery: bg-[#C3EED4] text-[#1E5D38] ? (Looks like light mint)
    // Here: bg-[#6FCF97] text-white ? (Looks like solid green)

    // I will try to match colors closely with Tailwind classes.

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Order</h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 font-medium">
                            <th className="py-3 px-4 rounded-l-lg">Order ID</th>
                            <th className="py-3 px-4">Menu</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center rounded-r-lg">Type</th>
                        </tr>
                    </thead>
                    <tbody className="space-y-4">
                        {/* Spacer row for spacing like in design? No, usually margin on tr doesn't work well without border-collapse separate. */}
                        {/* I'll use simple rows. */}
                        {ORDERS.map((order) => (
                            <tr key={order.id} className="border-b border-gray-50 last:border-none">
                                <td className="py-4 px-4 text-gray-500">#{order.id}</td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                                            <img src={getMenuImage(order.menu)} alt={order.menu} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{order.menu}</p>
                                            {order.notes && <p className="text-xs text-gray-400">({order.notes})</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center font-bold text-gray-900">{order.qty}</td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`px-6 py-1.5 rounded-lg text-white font-medium text-sm inline-block w-24
                                        ${order.status === 'New' ? 'bg-[#81Bcf8]' : ''}
                                        ${order.status === 'Cooking' ? 'bg-[#FDBA74]' : ''}
                                        ${order.status === 'Cooking' ? 'bg-orange-300' : '' /* Wait, FDBA74 is orange-300 */}
                                        ${order.status === 'Cooking' ? 'bg-orange-300' : ''} 
                                        ${/* Let's use standard tailwind for now and adjust */ ''}
                                        ${order.status === 'New' ? 'bg-blue-400' :
                                            order.status === 'Cooking' ? 'bg-orange-300' :
                                                order.status === 'Done' ? 'bg-teal-400' : 'bg-gray-400'}
                                    `}>
                                        {/* Correction on colors: 
                                            New: Looks Blue-400ish 
                                            Cooking: Looks Orange-300ish 
                                            Done: Looks Teal-400ish
                                        */}
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`px-6 py-1.5 rounded-lg font-medium text-sm inline-block w-24
                                        ${order.type === 'Delivery' ? 'bg-teal-100 text-teal-800' :
                                            order.type === 'Dine In' ? 'bg-green-400 text-white' :
                                                order.type === 'Away' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}
                                    `}>
                                        {order.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-4">
                <Link href="/kitchen/orders" className="flex items-center text-blue-500 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    View All <ChevronRight size={16} className="ml-1" />
                </Link>
            </div>
        </div>
    );
}
