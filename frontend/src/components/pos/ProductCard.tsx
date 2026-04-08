import { API_BASE_URL } from "@/lib/config";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    isAvailable?: boolean;
    outOfStockIngredient?: string | null;
    onAddToCart: () => void;
}

export function ProductCard({ name, price, image, stock, isAvailable = true, outOfStockIngredient, onAddToCart }: ProductCardProps) {
    const imageUrl = image && (image.startsWith('http') || image.startsWith('data')) ? image : `${API_BASE_URL}${image}`;
    const isOutOfStock = !isAvailable;
    const itemPointCost = price < 10000 ? 3 : price === 10000 ? 5 : 7;

    return (
        <div className={`bg-white rounded-[2.5rem] p-4 shadow-sm border flex flex-col h-full group transition-all ${isOutOfStock ? 'border-red-200 opacity-80' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-gray-50">
                <img
                    src={imageUrl}
                    alt={name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${!isOutOfStock && 'group-hover:scale-105'}`}
                />
                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-red-600/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                        <span className="text-white text-2xl">🚫</span>
                        <span className="bg-red-700 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                            Stok Kosong
                        </span>
                        {outOfStockIngredient && (
                            <span className="text-red-100 text-[10px] font-medium text-center px-2">
                                Bahan habis: {outOfStockIngredient}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between px-2">
                <div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-10 text-sm leading-tight">{name}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOutOfStock ? 'bg-red-100 text-red-600' : stock < 3 ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                            Stok: {stock}
                        </span>
                        {!isOutOfStock && stock < 3 && (
                            <span className="text-[10px] font-bold text-orange-500">Menipis!</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto pb-2">
                    <div className="flex flex-col">
                        <p className="text-gray-900 font-extrabold text-sm">Rp {price.toLocaleString()}</p>
                        <p className="text-blue-500 font-bold text-xs" title="Harga Poin">🌟 {itemPointCost} Poin</p>
                    </div>
                    <button
                        onClick={onAddToCart}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 whitespace-nowrap ${isOutOfStock
                            ? 'bg-red-100 text-red-400 cursor-not-allowed'
                            : 'bg-blue-100/50 text-blue-600 hover:bg-blue-600 hover:text-white'
                            }`}
                    >
                        {isOutOfStock ? 'Habis' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}
