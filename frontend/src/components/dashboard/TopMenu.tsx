import { MENU_ITEMS } from "@/lib/data";

export function TopMenu() {
    // Sort by mock 'stock' as a proxy for sold or just take start
    const topItems = [...MENU_ITEMS].sort((a, b) => b.price - a.price).slice(0, 3);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top selling menu</h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-teal-50/50 text-left">
                            <th className="py-3 px-4 text-sm font-medium text-gray-600 rounded-l-lg">Menu image</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-600">Menu Name</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-600">Units sold</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-600 rounded-r-lg">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {topItems.map((item, idx) => (
                            <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="py-4 px-4 font-medium text-gray-800">{item.name}</td>
                                <td className="py-4 px-4 text-gray-600">{100 - item.stock * idx + 15}</td>
                                <td className="py-4 px-4 font-semibold text-gray-900">Rp {item.price.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
