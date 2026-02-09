import { STOCK_ALERTS } from "@/lib/data";
import { AlertTriangle, ChevronRight } from "lucide-react";

export function StockList() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Stock Alert</h3>
            </div>

            <div className="space-y-4">
                {STOCK_ALERTS.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-2">
                        <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=100&auto=format&fit=crop&q=60" className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Minimum stock: {item.min}</span>
                            </div>
                        </div>
                        <div className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg">
                            {item.amount} {item.unit}
                        </div>
                    </div>
                ))}
                {/* Duplicate for demo */}
                <div className="flex items-center gap-4 py-2 border-t border-gray-50 pt-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                        <img src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=100&auto=format&fit=crop&q=60" className="w-full h-full object-cover" alt="Telur" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">Telur</h4>
                        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Minimum stock: 10</span>
                        </div>
                    </div>
                    <div className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg">
                        5 pcs
                    </div>
                </div>
            </div>

            <button className="w-full mt-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                View All <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
