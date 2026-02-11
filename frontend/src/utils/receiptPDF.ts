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
}

export async function generateReceiptPDF(receiptData: ReceiptData) {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF({
        format: [80, 200], // Receipt size in mm (thermal printer width)
        unit: 'mm'
    });

    // Set font to Courier (monospace)
    doc.setFont('courier');

    let yPos = 10;
    const leftMargin = 5;
    const pageWidth = 80;

    // Header
    doc.setFontSize(12);
    doc.setFont('courier', 'bold');
    doc.text('RM. MATA RESTO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text('Jl. borgol No.32 Kota malang', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Separator
    doc.text('========================================', leftMargin, yPos);
    yPos += 5;

    // Transaction Info
    doc.setFontSize(8);
    doc.text(`ID: ${receiptData.id}`, leftMargin, yPos);
    yPos += 4;
    doc.text(`Date: ${receiptData.date}`, leftMargin, yPos);
    yPos += 4;
    doc.text(`Cashier: Muhammad syarif`, leftMargin, yPos);
    yPos += 6;

    // Separator
    doc.text('========================================', leftMargin, yPos);
    yPos += 5;

    // Items
    doc.setFont('courier', 'bold');
    doc.text('ITEM', leftMargin, yPos);
    doc.text('QTY', 50, yPos);
    doc.text('PRICE', 60, yPos, { align: 'right' });
    yPos += 4;

    doc.setFont('courier', 'normal');
    doc.text('----------------------------------------', leftMargin, yPos);
    yPos += 4;

    receiptData.items.forEach(item => {
        // Item name (wrap if too long)
        const itemName = item.name.length > 20 ? item.name.substring(0, 20) : item.name;
        doc.text(itemName, leftMargin, yPos);
        doc.text(item.qty.toString(), 50, yPos);
        doc.text(`Rp ${(item.price * item.qty).toLocaleString('id-ID')}`, 75, yPos, { align: 'right' });
        yPos += 4;
    });

    yPos += 2;
    doc.text('========================================', leftMargin, yPos);
    yPos += 5;

    // Totals
    doc.text('Subtotal:', leftMargin, yPos);
    doc.text(`Rp ${receiptData.subtotal.toLocaleString('id-ID')}`, 75, yPos, { align: 'right' });
    yPos += 4;

    doc.text('Pajak (5%):', leftMargin, yPos);
    doc.text(`Rp ${receiptData.tax.toLocaleString('id-ID')}`, 75, yPos, { align: 'right' });
    yPos += 4;

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL:', leftMargin, yPos);
    doc.text(`Rp ${receiptData.total.toLocaleString('id-ID')}`, 75, yPos, { align: 'right' });
    yPos += 6;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('========================================', leftMargin, yPos);
    yPos += 5;

    // Payment Info
    doc.text(`Type order: ${receiptData.orderType || 'Take away'}`, leftMargin, yPos);
    yPos += 4;
    doc.text(`Type pay: ${receiptData.paymentMethod || 'Cash'}`, leftMargin, yPos);
    yPos += 6;

    doc.text('========================================', leftMargin, yPos);
    yPos += 5;

    // Footer
    doc.setFontSize(7);
    const footerText = 'Terima kasih atas kunjungan Anda,\nkami berharap dapat melayani Anda kembali';
    doc.text(footerText, pageWidth / 2, yPos, { align: 'center' });

    // Save PDF
    doc.save(`receipt-${receiptData.id}.pdf`);
}
