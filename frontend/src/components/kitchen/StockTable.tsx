"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import DeleteStockModal from './stock/DeleteStockModal';
import UpdateStockModal from './stock/UpdateStockModal';
import AddStockModal from './stock/AddStockModal';
import StockSuccessModal from './stock/StockSuccessModal';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    minStock: number;
    unit: string;
    image: string | null;
}

export default function StockTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteStep, setDeleteStep] = useState<'confirm' | 'success'>('confirm');

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [selectedItemForUpdate, setSelectedItemForUpdate] = useState<Product | null>(null);

    const API_BASE_URL = 'http://localhost:3001';

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const data = await response.json();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const toggleSelection = (id: number) => {
        if (!isSelectionMode) return;
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handlePilihItems = () => {
        if (isSelectionMode) {
            setIsSelectionMode(false);
            setSelectedItems([]);
        } else {
            setIsSelectionMode(true);
        }
    };

    const handleDeleteClick = () => {
        if (selectedItems.length === 0) return;
        setDeleteStep('confirm');
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await Promise.all(
                selectedItems.map(id =>
                    fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' })
                )
            );
            setDeleteStep('success');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting products:', error);
        }
    };

    const handleCloseDelete = () => {
        setIsDeleteModalOpen(false);
        if (deleteStep === 'success') {
            setSelectedItems([]);
            setIsSelectionMode(false);
        }
    };

    const handleUpdateClick = (item: Product) => {
        setSelectedItemForUpdate(item);
        setIsUpdateModalOpen(true);
    };

    const handleActionSuccess = () => {
        setIsUpdateModalOpen(false);
        setIsAddModalOpen(false);
        setIsSuccessModalOpen(true);
        fetchProducts();
    };

    const getStatus = (product: Product) => {
        if (product.stock === 0) return 'Out of stock';
        if (product.stock <= product.minStock) return 'Low';
        return 'Available';
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedProducts = filteredProducts.reduce((acc: Record<string, Product[]>, product) => {
        const category = product.category || 'Lainnya';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    return (
        <div className="space-y-10">
            <DeleteStockModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                state={deleteStep}
            />

            <UpdateStockModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onUpdate={handleActionSuccess}
                item={selectedItemForUpdate ? { ...selectedItemForUpdate, id: selectedItemForUpdate.id.toString() } : null}
            />

            <AddStockModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleActionSuccess}
            />

            <StockSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
            />

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Persediaan Bahan</h1>
                    <p className="text-gray-500 mt-1">Kelola stok dan persediaan bahan baku dapur</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari bahan baku..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all bg-white shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform hover:scale-[1.02]"
                    >
                        <Plus size={20} />
                        <span>Tambah Bahan</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(groupedProducts).map(([category, items]) => (
                        <div key={category} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{category}</h2>
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                        {items.length} Item
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {items.map((item) => {
                                    const status = getStatus(item);
                                    const imageUrl = item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';

                                    return (
                                        <div
                                            key={item.id}
                                            className="group relative bg-white rounded-3xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                        {item.name}
                                                    </h3>
                                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                        ${status === 'Available' ? 'bg-green-50 text-green-600' :
                                                            status === 'Low' ? 'bg-orange-50 text-orange-600' :
                                                                'bg-red-50 text-red-600'}
                                                    `}>
                                                        {status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="bg-gray-50/50 p-3 rounded-2xl">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Stok Saat Ini</p>
                                                    <p className="text-lg font-black text-gray-900">
                                                        {item.stock} <span className="text-xs font-bold text-gray-400">{item.unit}</span>
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50/50 p-3 rounded-2xl">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Min. Stok</p>
                                                    <p className="text-lg font-black text-gray-900/40">
                                                        {item.minStock} <span className="text-xs font-bold text-gray-300">{item.unit}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateClick(item)}
                                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedItems([item.id]);
                                                        handleDeleteClick();
                                                    }}
                                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Hapus Bahan"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {Object.keys(groupedProducts).length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <Package className="mx-auto w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-xl font-bold text-gray-400">Tidak ada bahan ditemukan</p>
                </div>
            )}
        </div>
    );
}

// Helper icons/components
const Package = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
);
