interface KitchenOrderItem {
    id: string | number;
    name: string;
    qty: number;
    notes?: string;
}

interface KitchenOrderData {
    id: number;
    orderType: string;
    createdAt: string;
    customerName?: string;
    items: KitchenOrderItem[];
}

export async function generateKitchenOrderPDF(order: KitchenOrderData) {
    const jsPDF = (await import('jspdf')).default;

    const baseHeight = 80;
    const itemHeight = order.items.reduce((acc, item) => acc + (item.notes ? 16 : 10), 0);
    const totalHeight = baseHeight + itemHeight;

    const doc = new jsPDF({
        format: [80, totalHeight],
        unit: 'mm'
    });

    doc.setFont('courier');

    let y = 8;
    const cx = 40;
    const lm = 5;

    const tanggal = new Date(order.createdAt).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // ── HEADER ──────────────────────────────────────────
    doc.setFontSize(13);
    doc.setFont('courier', 'bold');
    doc.text('** NOTA DAPUR **', cx, y, { align: 'center' });
    y += 5;

    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text('MATA KULINER', cx, y, { align: 'center' });
    y += 4;

    doc.text('--------------------------------', cx, y, { align: 'center' });
    y += 5;

    // ── ORDER INFO ───────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont('courier', 'bold');
    doc.text(`No. Order : #${order.id}`, lm, y);
    y += 4;
    doc.setFont('courier', 'normal');
    doc.text(`Waktu     : ${tanggal}`, lm, y);
    y += 4;
    doc.text(`Tipe      : ${order.orderType}`, lm, y);
    y += 4;
    if (order.customerName) {
        doc.text(`Pelanggan : ${order.customerName}`, lm, y);
        y += 4;
    }

    doc.text('--------------------------------', cx, y, { align: 'center' });
    y += 5;

    // ── ITEMS TO COOK ─────────────────────────────────────
    doc.setFontSize(9);
    doc.setFont('courier', 'bold');
    doc.text('>>> MENU YANG DIMASAK <<<', cx, y, { align: 'center' });
    y += 6;

    doc.setFontSize(10);
    order.items.forEach((item, index) => {
        const name = item.name.length > 19 ? item.name.substring(0, 19) + '..' : item.name;
        doc.setFont('courier', 'bold');
        // e.g.  1. Nasi Goreng          x2
        const numStr = `${index + 1}. ${name}`;
        const qtyStr = `x${item.qty}`;
        doc.text(numStr, lm, y);
        doc.text(qtyStr, 75, y, { align: 'right' });
        y += 5;

        if (item.notes) {
            doc.setFont('courier', 'normal');
            doc.setFontSize(8);
            const noteText = `   Catatan: ${item.notes}`;
            const wrapped = doc.splitTextToSize(noteText, 65);
            doc.text(wrapped, lm, y);
            y += wrapped.length * 4;
            doc.setFontSize(10);
        }
    });

    // ── FOOTER ────────────────────────────────────────────
    y += 2;
    doc.text('--------------------------------', cx, y, { align: 'center' });
    y += 5;
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text('Harap segera diproses. Terima kasih!', cx, y, { align: 'center' });

    doc.save(`nota-dapur-${order.id}.pdf`);
}
