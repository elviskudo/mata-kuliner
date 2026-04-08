"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface ReceiptItem {
    id: string;
    name: string;
    qty: number;
    price: number;
}

interface ReceiptData {
    id: string;
    date: string;
    items: ReceiptItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    orderType: string;
    cashierName?: string;
}

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ReceiptData | null;
    showPrintProgress?: boolean;
}

export function ReceiptModal({ isOpen, onClose, data, showPrintProgress = false }: ReceiptModalProps) {
    const [printProgress, setPrintProgress] = useState(0);

    // Print animation effect
    useEffect(() => {
        if (isOpen && showPrintProgress && printProgress < 100) {
            setPrintProgress(0); // Reset on open
            const timer = setInterval(() => {
                setPrintProgress(prev => {
                    const next = prev + 1.5;
                    return next > 100 ? 100 : next;
                });
            }, 30);
            return () => clearInterval(timer);
        } else if (!isOpen) {
            setPrintProgress(0);
        }
    }, [isOpen, showPrintProgress]); // Removed printProgress from dependency to avoid infinite loop reset, but need logic to run once. 
    // Actually, the original logic had `printProgress < 100` check. 

    // Better logic for animation:
    useEffect(() => {
        if (isOpen && showPrintProgress) {
            setPrintProgress(0);
            const interval = setInterval(() => {
                setPrintProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1.5;
                });
            }, 30);
            return () => clearInterval(interval);
        }
    }, [isOpen, showPrintProgress]);


    if (!isOpen || !data) return null;

    const handleDownload = async () => {
        const { generateReceiptPDF } = await import('@/utils/receiptPDF');
        generateReceiptPDF(data);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-blue-50/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="absolute top-8 left-8 flex gap-4">
                <button
                    onClick={onClose}
                    className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95"
                >
                    <ArrowLeft size={24} />
                </button>
                <button
                    onClick={handleDownload}
                    className="px-6 h-12 rounded-full bg-green-500 flex items-center justify-center gap-2 text-white hover:bg-green-600 transition-all shadow-lg active:scale-95 font-bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download PDF
                </button>
            </div>

            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col items-center p-8 relative" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                <div className="w-full space-y-6">
                    {/* Logo and Header */}
                    <div className="flex flex-col items-center gap-3 pb-4 border-b border-blue-100">
                        <img src="/logo.png" alt="Mata Kuliner" className="w-16 h-16 object-contain" />
                        <h3 className="text-lg font-black text-blue-600 tracking-tight">MATA KULINER</h3>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                        <span>{data.cashierName || 'Muhammad syarif'} - cashier</span>
                    </div>

                    <div className="space-y-4 py-8">
                        {data.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm font-bold text-gray-700">
                                <span>{item.name}</span>
                                <span className="text-gray-900">{item.qty}</span>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-blue-100 w-full" />

                    <div className="space-y-4 text-xs font-bold text-gray-400 text-right">
                        <p>{data.id}</p>
                        <div className="flex justify-between items-center">
                            <span>Tanggal</span>
                            <span>{data.date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Subtotal</span>
                            <span className="text-gray-900">RP {data.subtotal?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Pajak</span>
                            <span className="text-gray-900">RP {data.tax?.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="h-px bg-blue-100 w-full" />

                    <div className="space-y-3 text-sm font-extrabold">
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Type order</span>
                            <span className="text-gray-900">{data.orderType}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Type pay</span>
                            <span className="text-gray-900">{data.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-600 pt-2">
                            <span>Total</span>
                            <span className="text-xl">RP {data.total?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Tunai</span>
                            {/* Assumed static for now as per original code */}
                            <span className="text-gray-900">RP {(data.total * 1.05).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    <div className="h-px bg-blue-100 w-full" />

                    <div className="flex justify-between items-end pt-4">
                        <div className="text-xs">
                            <h4 className="text-blue-600 font-black tracking-tight">RM. <span className="text-blue-500">MATA RESTO</span></h4>
                        </div>
                        <span className="text-[8px] font-bold text-gray-400">Jl. borgol No.32 Kota malang</span>
                    </div>

                    <div className="pt-12 text-center text-[10px] font-bold text-blue-600/80 leading-relaxed px-8">
                        Terima kasih atas kunjungan Anda,<br />kami berharap dapat melayani Anda kembali
                    </div>
                </div>
            </div>

            {/* Progress Bar Container - Only if showPrintProgress is true */}
            {showPrintProgress && (
                <div className="mt-16 w-full max-w-4xl px-8">
                    <div className="flex justify-end mb-2">
                        <span className="text-blue-600 font-black text-xl italic">{Math.round(printProgress)}%</span>
                    </div>
                    <div className="h-6 w-full bg-white/50 rounded-full overflow-hidden border border-white/50 p-1 shadow-inner">
                        <div
                            className="h-full bg-blue-400 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-400/50"
                            style={{ width: `${printProgress}% ` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
