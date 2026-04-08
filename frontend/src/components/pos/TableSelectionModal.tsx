import { useEffect, useState } from 'react';
import { X, Users } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

export interface Table {
    id: number;
    tableNumber: string;
    capacity: number;
    status: 'Empty' | 'Occupied' | 'Reserved';
}

interface TableSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTable: (table: Table) => void;
    selectedTableId?: number | null;
}

export function TableSelectionModal({ isOpen, onClose, onSelectTable, selectedTableId }: TableSelectionModalProps) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchTables();
        }
    }, [isOpen]);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/tables`);
            if (response.ok) {
                const data = await response.json();
                setTables(data);
            }
        } catch (error) {
            console.error('Failed to fetch tables:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Pilih Meja (Dine In)</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Status dan kapasitas meja saat ini</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : tables.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 font-medium">
                            Belum ada meja yang dikonfigurasi.
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {tables.map(table => {
                                const isSelected = selectedTableId === table.id;
                                const isEmpty = table.status === 'Empty';
                                const isOccupied = table.status === 'Occupied';
                                const isReserved = table.status === 'Reserved';

                                return (
                                    <button
                                        key={table.id}
                                        onClick={() => onSelectTable(table)}
                                        disabled={isOccupied || isReserved}
                                        className={`
                                            relative aspect-square rounded-[1.5rem] p-4 flex flex-col items-center justify-center transition-all duration-300 shadow-sm border-2
                                            ${isEmpty && !isSelected ? 'bg-white border-green-100 hover:border-green-400 hover:shadow-md cursor-pointer group' : ''}
                                            ${isSelected ? 'bg-blue-600 border-blue-600 shadow-blue-200 shadow-lg text-white scale-[1.02]' : ''}
                                            ${isOccupied ? 'bg-orange-50 border-orange-200 cursor-not-allowed opacity-90' : ''}
                                            ${isReserved ? 'bg-purple-50 border-purple-200 cursor-not-allowed opacity-90' : ''}
                                        `}
                                    >
                                        <div className={`
                                            w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors
                                            ${isEmpty && !isSelected ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : ''}
                                            ${isSelected ? 'bg-white/20 text-white' : ''}
                                            ${isOccupied ? 'bg-orange-100 text-orange-500' : ''}
                                            ${isReserved ? 'bg-purple-100 text-purple-500' : ''}
                                        `}>
                                            <span className="text-xl font-black">{table.tableNumber}</span>
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                            <Users size={14} />
                                            <span>Kapasitas {table.capacity}</span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`
                                            absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-sm border
                                            ${isEmpty ? 'bg-green-500 text-white border-green-600' : ''}
                                            ${isOccupied ? 'bg-orange-500 text-white border-orange-600' : ''}
                                            ${isReserved ? 'bg-purple-500 text-white border-purple-600' : ''}
                                        `}>
                                            {table.status}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
