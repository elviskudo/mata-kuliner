import { AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface DeleteStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    state: 'confirm' | 'success';
}

export default function DeleteStockModal({ isOpen, onClose, onConfirm, state }: DeleteStockModalProps) {
    if (!isOpen) return null;

    if (state === 'success') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center text-center">
                    {/* The image shows a Trash icon in Green? Or a Basket? Image 4 shows a trash bin outline, green lines. 
                        Wait, Image 4 center icon looks like a trash bin or bag. Let's use Trash2 for now, styled green. 
                    */}
                    <div className="w-32 h-32 mb-6 flex items-center justify-center bg-green-50 rounded-full">
                        <Trash2 size={80} className="text-green-500 stroke-1" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Anda berhasil menghapus product dari stock!
                    </h3>

                    <button
                        onClick={onClose}
                        className="mt-6 w-full bg-[#60A5FA] text-white py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
                    >
                        Oke
                    </button>
                </div>
            </div>
        );
    }

    // Default: Confirm (Warning) State (Image 3)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center text-center">
                <div className="mb-6">
                    <AlertTriangle size={80} className="text-orange-300 fill-orange-100" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                    Apakah anda yakin ingin menghapus product dari stock?
                </h3>

                <button
                    onClick={onConfirm}
                    className="w-full bg-[#60A5FA] text-white py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
                >
                    Oke
                </button>
            </div>
        </div>
    );
}
