interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    onAddToCart: () => void;
}

export function ProductCard({ name, price, image, onAddToCart }: ProductCardProps) {
    const API_BASE_URL = 'http://localhost:3001';
    const imageUrl = image && (image.startsWith('http') || image.startsWith('data')) ? image : `${API_BASE_URL}${image}`;

    return (
        <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 flex flex-col h-full group transition-all hover:shadow-md">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-gray-50">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            <div className="flex-1 flex flex-col justify-between px-2">
                <div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-10 text-sm leading-tight">{name}</h3>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto pb-2">
                    <p className="text-gray-900 font-extrabold text-sm">Rp {price.toLocaleString()}</p>
                    <button
                        onClick={onAddToCart}
                        className="px-4 py-2 bg-blue-100/50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
