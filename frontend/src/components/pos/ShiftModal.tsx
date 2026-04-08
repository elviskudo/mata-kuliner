import { useState, useEffect } from 'react';
import { DollarSign, LogOut, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface ShiftModalProps {
    isOpen: boolean;
    type: 'start' | 'end';
    onClose?: () => void;
    onSuccess: () => void;
}

export function ShiftModal({ isOpen, type, onClose, onSuccess }: ShiftModalProps) {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset amount when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        setIsSubmitting(true);
        const endpoint = type === 'start' ? '/shift-sessions/start' : '/shift-sessions/end';

        // Mock cashier name for now. In a real app, from auth state.
        const payload = type === 'start'
            ? { cashierName: 'Muhammad syarif', startingCash: parseFloat(amount) }
            : { endingCash: parseFloat(amount) };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Gagal menyimpan shift');
            }

            onSuccess();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className={`px-8 py-8 flex flex-col items-center justify-center border-b border-gray-100 ${type === 'start' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${type === 'start' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                        {type === 'start' ? <DollarSign size={32} /> : <LogOut size={32} />}
                    </div>
                    <h2 className={`text-2xl font-black ${type === 'start' ? 'text-blue-900' : 'text-orange-900'}`}>
                        {type === 'start' ? 'Buka Kasir (Modal Awal)' : 'Tutup Kasir (Setor Uang)'}
                    </h2>
                    <p className={`text-sm font-medium mt-2 text-center ${type === 'start' ? 'text-blue-600/70' : 'text-orange-600/70'}`}>
                        {type === 'start'
                            ? 'Masukkan jumlah uang tunai di laci sebelum memulai shift.'
                            : 'Masukkan total uang tunai yang ada di laci saat ini.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-center block">
                            Jumlah Uang Tunai (Rp)
                        </label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">Rp</span>
                            <input
                                type="number"
                                required
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-16 pr-6 py-6 bg-gray-50 border-2 border-gray-100 rounded-2xl text-3xl font-black text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-center"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {type === 'end' && onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting || !amount}
                            className={`flex flex-[2] items-center justify-center gap-2 py-4 text-white font-black rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${type === 'start'
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                    : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                                }`}
                        >
                            {isSubmitting ? 'Memproses...' : (
                                <>
                                    <CheckCircle2 size={20} />
                                    {type === 'start' ? 'Mulai Shift' : 'Tutup Shift'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
