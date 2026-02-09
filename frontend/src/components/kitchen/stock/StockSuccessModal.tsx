import { Check } from 'lucide-react';

interface StockSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function StockSuccessModal({ isOpen, onClose }: StockSuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden p-12 flex flex-col items-center text-center">
                {/* Success Icon */}
                <div className="w-36 h-36 bg-[#4ADE80] rounded-full flex items-center justify-center mb-10 shadow-lg shadow-green-100">
                    <Check size={80} className="text-white" strokeWidth={4} />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-10 leading-tight px-4">
                    Anda berhasil menambahkan/update product!
                </h2>

                <button
                    onClick={onClose}
                    className="group relative w-56 py-4 bg-[#60A5FA] text-white rounded-xl font-bold text-xl hover:bg-blue-500 transition-all duration-200 active:scale-95 shadow-lg shadow-blue-200"
                >
                    Oke
                </button>
            </div>
        </div>
    );
}
