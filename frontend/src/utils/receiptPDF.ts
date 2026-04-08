interface ReceiptItem {
    id: string;
    name: string;
    price: number;
    qty: number;
}

interface ReceiptData {
    items: ReceiptItem[];
    subtotal: number;
    tax: number;
    total: number;
    date: string;
    id: string;
    paymentMethod?: string;
    orderType?: string;
    cashierName?: string;
}

export async function generateReceiptPDF(receiptData: ReceiptData) {
    const jsPDF = (await import('jspdf')).default;

    // Calculate dynamic height based on items
    const baseHeight = 130;
    const itemHeight = receiptData.items.length * 12;
    const totalHeight = baseHeight + itemHeight;

    const doc = new jsPDF({
        format: [80, totalHeight],
        unit: 'mm'
    });

    doc.setFont('courier');

    let y = 8;
    const cx = 40; // center x
    const lm = 5; // left margin
    const rm = 75; // right margin

    // ── HEADER ──────────────────────────────────────────
    doc.setFontSize(14);
    doc.setFont('courier', 'bold');
    doc.text('MATA KULINER', cx, y, { align: 'center' });
    y += 5;

    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text('Jl. borgol No.32 Kota Malang', cx, y, { align: 'center' });
    y += 4;
    doc.text('Telp: (0341) 000-0000', cx, y, { align: 'center' });
    y += 3;

    // dashed separator
    doc.setFontSize(7);
    doc.text('--------------------------------', cx, y, { align: 'center' });
    y += 5;

    // ── TRANSACTION INFO ─────────────────────────────────
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text(`No. : ${receiptData.id}`, lm, y);
    y += 4;
    doc.text(`Tgl : ${receiptData.date}`, lm, y);
    y += 4;
    doc.text(`Kasir: ${receiptData.cashierName || 'Muhammad Syarif'}`, lm, y);
    y += 4;
    doc.text(`Tipe : ${receiptData.orderType || 'Dine In'}`, lm, y);
    y += 3;

    doc.text('--------------------------------', cx, y, { align: 'center' });
    y += 5;

    // ── ITEMS ─────────────────────────────────────────────
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    receiptData.items.forEach(item => {
        const itemTotal = item.price * item.qty;
        // Item name line
        const name = item.name.length > 22 ? item.name.substring(0, 22) : item.name;
        doc.text(name, lm, y);
        y += 4;
        // qty x price = total line (indented)
        const qtyStr = `  ${item.qty} x ${item.price.toLocaleString('id-ID')}`;
        const totalStr = `Rp ${itemTotal.toLocaleString('id-ID')}`;
        doc.setFont('courier', 'normal');
        doc.text(qtyStr, lm, y);
        doc.text(totalStr, rm, y, { align: 'right' });
        doc.setFont('courier', 'bold');
        y += 5;
    });

    doc.text('--------------------------------', cx, y, { align: 'center' });
    y += 5;

    // ── TOTALS ────────────────────────────────────────────
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('Subtotal', lm, y);
    doc.text(`Rp ${receiptData.subtotal.toLocaleString('id-ID')}`, rm, y, { align: 'right' });
    y += 4;

    doc.text('Pajak (11%)', lm, y);
    doc.text(`Rp ${receiptData.tax.toLocaleString('id-ID')}`, rm, y, { align: 'right' });
    y += 4;

    doc.text('--------------------------------', cx, y, { align: 'center' });
    y += 4;

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL', lm, y);
    doc.text(`Rp ${receiptData.total.toLocaleString('id-ID')}`, rm, y, { align: 'right' });
    y += 5;

    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text(`Bayar: ${receiptData.paymentMethod || 'Cash'}`, lm, y);
    y += 4;

    doc.text('================================', cx, y, { align: 'center' });
    y += 5;

    // ── FOOTER ────────────────────────────────────────────
    doc.setFontSize(7);
    doc.text('Terima kasih atas kunjungan Anda!', cx, y, { align: 'center' });
    y += 4;
    doc.text('Kami berharap dapat melayani Anda kembali', cx, y, { align: 'center' });
    y += 4;
    doc.text('-- Mata Kuliner --', cx, y, { align: 'center' });

    doc.save(`struk-${receiptData.id}.pdf`);
}
