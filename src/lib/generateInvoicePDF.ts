import { jsPDF } from 'jspdf';
import { Order } from '@/hooks/useOrders';

// Helper for currency formatting
const formatPrice = (priceInPaise: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(priceInPaise / 100);
};

// Format date
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export function generateInvoicePDF(order: Order): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Colors
    const primaryColor: [number, number, number] = [185, 28, 28]; // Red theme
    const darkText: [number, number, number] = [31, 41, 55];
    const mutedText: [number, number, number] = [107, 114, 128];

    // ========== HEADER ==========
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AOneTop', margin, 25);

    // Invoice label
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('TAX INVOICE', pageWidth - margin, 25, { align: 'right' });

    yPos = 55;

    // ========== INVOICE DETAILS ==========
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS', margin, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    doc.text('Order Number:', margin, yPos);
    doc.setTextColor(...darkText);
    doc.text(order.order_number || order.id.slice(0, 8).toUpperCase(), margin + 35, yPos);

    yPos += 6;
    doc.setTextColor(...mutedText);
    doc.text('Date:', margin, yPos);
    doc.setTextColor(...darkText);
    doc.text(formatDate(order.created_at), margin + 35, yPos);

    yPos += 6;
    doc.setTextColor(...mutedText);
    doc.text('Status:', margin, yPos);
    doc.setTextColor(...darkText);
    doc.text(order.status.charAt(0).toUpperCase() + order.status.slice(1), margin + 35, yPos);

    // ========== BILLING/SHIPPING ADDRESS ==========
    const addressX = pageWidth - margin - 70;
    let addressY = 55;

    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO / SHIP TO', addressX, addressY);

    addressY += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(order.shipping_name || 'N/A', addressX, addressY);

    addressY += 5;
    doc.setFontSize(9);
    doc.setTextColor(...mutedText);

    const addressLines = [
        order.shipping_address,
        `${order.shipping_city}, ${order.shipping_state}`,
        order.shipping_pincode,
        `Phone: ${order.shipping_phone}`,
        order.shipping_email,
    ].filter(Boolean);

    addressLines.forEach((line) => {
        doc.text(line || '', addressX, addressY);
        addressY += 5;
    });

    yPos = Math.max(yPos, addressY) + 15;

    // ========== ITEMS TABLE ==========
    doc.setFontSize(10);
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER ITEMS', margin, yPos);

    yPos += 8;

    // Table header
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...mutedText);
    doc.text('ITEM', margin + 3, yPos);
    doc.text('QTY', pageWidth - margin - 60, yPos, { align: 'center' });
    doc.text('PRICE', pageWidth - margin - 35, yPos, { align: 'right' });
    doc.text('TOTAL', pageWidth - margin - 3, yPos, { align: 'right' });

    yPos += 10;

    // Table rows
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');

    order.items?.forEach((item) => {
        const itemTotal = item.price * item.quantity;

        // Truncate product name if too long
        let productName = item.product_name;
        if (productName.length > 40) {
            productName = productName.substring(0, 37) + '...';
        }

        doc.text(productName, margin + 3, yPos);
        doc.text(item.quantity.toString(), pageWidth - margin - 60, yPos, { align: 'center' });
        doc.text(formatPrice(item.price), pageWidth - margin - 35, yPos, { align: 'right' });
        doc.text(formatPrice(itemTotal), pageWidth - margin - 3, yPos, { align: 'right' });

        yPos += 8;

        // Check for page break
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
    });

    yPos += 5;

    // ========== DIVIDER ==========
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // ========== SUMMARY ==========
    const summaryX = pageWidth - margin - 60;

    doc.setTextColor(...mutedText);
    doc.text('Subtotal:', summaryX, yPos);
    doc.setTextColor(...darkText);
    doc.text(formatPrice(order.subtotal), pageWidth - margin - 3, yPos, { align: 'right' });

    yPos += 7;
    doc.setTextColor(...mutedText);
    doc.text('Shipping:', summaryX, yPos);
    doc.setTextColor(...darkText);
    const shippingText = order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost);
    doc.text(shippingText, pageWidth - margin - 3, yPos, { align: 'right' });

    if (order.discount_amount > 0) {
        yPos += 7;
        doc.setTextColor(22, 163, 74); // Green for discount
        doc.text('Discount:', summaryX, yPos);
        doc.text(`-${formatPrice(order.discount_amount)}`, pageWidth - margin - 3, yPos, { align: 'right' });
    }

    yPos += 10;
    doc.setDrawColor(229, 231, 235);
    doc.line(summaryX, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('TOTAL:', summaryX, yPos);
    doc.text(formatPrice(order.total), pageWidth - margin - 3, yPos, { align: 'right' });

    // ========== FOOTER ==========
    const footerY = doc.internal.pageSize.getHeight() - 30;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    doc.text('Thank you for your order!', pageWidth / 2, footerY, { align: 'center' });
    doc.text('For any queries, please contact support@aonetop.com', pageWidth / 2, footerY + 5, { align: 'center' });

    // Subtle footer line
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

    // ========== SAVE ==========
    const fileName = `Invoice-${order.order_number || order.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
}
