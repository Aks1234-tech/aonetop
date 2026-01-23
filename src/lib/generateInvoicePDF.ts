import { jsPDF } from 'jspdf';
import { Order } from '@/hooks/useOrders';

/**
 * Enhanced Invoice PDF Generator for AOneTop
 * Generates professional invoices with:
 * - Improved header with company branding
 * - Customer information (billing & shipping)
 * - Order items with weights/variants
 * - Tax summary (CGST/SGST breakdown)
 * - Coupon/discount information
 * - Payment details (method, status, transaction ID)
 * - Professional styling and layout
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatPrice = (priceInPaise: number): string => {
    const amount = (priceInPaise / 100).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `Rs. ${amount}`;
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// GST Rate (18% split into CGST 9% + SGST 9%)
const GST_RATE = 0.18;
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;

// ============================================
// COLOR SCHEME
// ============================================

interface ColorScheme {
    primary: [number, number, number];
    secondary: [number, number, number];
    darkText: [number, number, number];
    mutedText: [number, number, number];
    success: [number, number, number];
    warning: [number, number, number];
    error: [number, number, number];
    lightBg: [number, number, number];
    borderLight: [number, number, number];
}

const colors: ColorScheme = {
    primary: [185, 28, 28],     // Red (#B91C1C)
    secondary: [107, 114, 128],  // Gray (#6B7280)
    darkText: [31, 41, 55],      // Dark Gray (#1F2937)
    mutedText: [107, 114, 128],  // Muted Gray (#6B7280)
    success: [22, 163, 74],      // Green (#16A34A)
    warning: [234, 179, 8],      // Amber (#EAB308)
    error: [220, 38, 38],        // Red (#DC2626)
    lightBg: [249, 250, 251],    // Light Gray (#F9FAFB)
    borderLight: [229, 231, 235],// Border Gray (#E5E7EB)
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function drawSectionTitle(
    doc: jsPDF,
    title: string,
    yPos: number,
    margin: number,
    width: number = 60
): number {
    doc.setTextColor(...colors.darkText);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);

    // Draw a subtle line under section title
    doc.setDrawColor(...colors.borderLight);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 2, margin + width, yPos + 2);

    return yPos + 8;
}

function drawDivider(
    doc: jsPDF,
    yPos: number,
    margin: number,
    pageWidth: number
): number {
    doc.setDrawColor(...colors.borderLight);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    return yPos + 8;
}

function checkPageBreak(
    doc: jsPDF,
    currentY: number,
    requiredSpace: number,
    pageHeight: number,
    margin: number
): number {
    if (currentY + requiredSpace > pageHeight - margin) {
        doc.addPage();
        return margin;
    }
    return currentY;
}

export function generateInvoicePDF(order: Order): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Calculate tax amounts
    const subtotalWithGST = order.subtotal;
    const baseAmount = Math.round(subtotalWithGST / (1 + GST_RATE));
    const cgstAmount = Math.round(baseAmount * CGST_RATE);
    const sgstAmount = Math.round(baseAmount * SGST_RATE);
    const totalGST = cgstAmount + sgstAmount;

    // ============================================
    // 1. HEADER SECTION - Company branding
    // ============================================

    // Red background banner
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('AOneTop', margin, 22);

    // Invoice label in top right
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('TAX INVOICE', pageWidth - margin, 18, { align: 'right' });

    yPos = 50;

    // ============================================
    // 2. INVOICE DETAILS & SHIPPING ADDRESS (Two Column)
    // ============================================

    yPos = drawSectionTitle(doc, 'INVOICE DETAILS', yPos, margin, 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Left column - Invoice Details
    let col1X = margin;
    let col1Y = yPos;

    doc.setTextColor(...colors.mutedText);
    doc.text('Order Number:', col1X, col1Y);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(order.order_number || order.id.slice(0, 8).toUpperCase(), col1X + 35, col1Y);

    col1Y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedText);
    doc.text('Date:', col1X, col1Y);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(order.created_at), col1X + 35, col1Y);

    col1Y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedText);
    doc.text('Time:', col1X, col1Y);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(formatTime(order.created_at), col1X + 35, col1Y);

    col1Y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedText);
    doc.text('Status:', col1X, col1Y);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
    doc.text(statusText, col1X + 35, col1Y);

    // Right column - Shipping Address
    const col2X = pageWidth / 2 + 10;
    let col2Y = yPos;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.darkText);
    doc.text('SHIPPING ADDRESS', col2X, col2Y);

    col2Y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.darkText);

    doc.text(order.shipping_name || 'N/A', col2X, col2Y);

    col2Y += 4;
    doc.setTextColor(...colors.mutedText);
    doc.setFontSize(7);

    const shippingLines = [
        order.shipping_address,
        order.shipping_city + ', ' + order.shipping_state,
        'PIN: ' + order.shipping_pincode,
        'Phone: ' + order.shipping_phone,
        'Email: ' + order.shipping_email,
    ].filter((line) => line && line !== 'undefined');

    const rightColWidth = pageWidth - col2X - margin;
    shippingLines.forEach((line) => {
        doc.text(line, col2X, col2Y, { maxWidth: rightColWidth });
        col2Y += 4;
    });

    yPos = Math.max(col1Y, col2Y) + 8;



    // ============================================
    // 4. ORDER ITEMS TABLE
    // ============================================

    yPos = checkPageBreak(doc, yPos, 40, pageHeight, margin);

    yPos = drawSectionTitle(doc, 'ORDER ITEMS', yPos, margin, 70);

    yPos += 4;

    // Table header with background
    doc.setFillColor(...colors.lightBg);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');

    // Column positions and widths (optimized for alignment)
    const descCol = margin + 2;         // Item description
    const descColWidth = 90;            // Width for description column
    const qtyCol = margin + 95;         // Quantity column
    const qtyColWidth = 15;             // Width for qty
    const priceCol = margin + 115;      // Price column
    const priceColWidth = 25;           // Width for price
    const totalCol = pageWidth - margin - 2; // Total column (right-aligned)

    doc.setFontSize(9);
    doc.setTextColor(...colors.mutedText);
    doc.setFont('helvetica', 'bold');

    doc.text('ITEM DESCRIPTION', descCol, yPos);
    doc.text('QTY', qtyCol, yPos, { align: 'center' });
    doc.text('PRICE', priceCol, yPos, { align: 'right' });
    doc.text('TOTAL', totalCol, yPos, { align: 'right' });

    // Divider line under header
    doc.setDrawColor(...colors.borderLight);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 6, pageWidth - margin, yPos + 6);

    yPos += 10;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.darkText);

    order.items?.forEach((item) => {
        yPos = checkPageBreak(doc, yPos, 10, pageHeight, margin);

        const itemTotal = item.price * item.quantity;

        // Item name and weight variant
        let itemDescription = item.product_name;
        if (item.weight_value) {
            itemDescription += ` (${item.weight_value})`;
        }

        // Truncate if too long
        if (itemDescription.length > 45) {
            itemDescription = itemDescription.substring(0, 42) + '...';
        }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(itemDescription, descCol, yPos);

        doc.text(item.quantity.toString(), qtyCol, yPos, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.text(formatPrice(item.price), priceCol, yPos, { align: 'right' });
        
        doc.setFont('helvetica', 'bold');
        doc.text(formatPrice(itemTotal), totalCol, yPos, { align: 'right' });

        yPos += 7;
    });

    yPos += 5;

    // ============================================
    // 5. TAX SUMMARY SECTION
    // ============================================

    yPos = checkPageBreak(doc, yPos, 50, pageHeight, margin);

    yPos = drawSectionTitle(doc, 'TAX SUMMARY', yPos, margin, 60);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Improved column positioning for summary sections
    const labelCol = margin + 120;      // Where labels start
    const valueCol = pageWidth - margin - 2; // Where values end (right-aligned)

    doc.setTextColor(...colors.mutedText);
    doc.text('Taxable Amount:', labelCol, yPos);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPrice(baseAmount), valueCol, yPos, { align: 'right' });

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedText);
    doc.text('CGST (9%):', labelCol, yPos);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPrice(cgstAmount), valueCol, yPos, { align: 'right' });

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedText);
    doc.text('SGST (9%):', labelCol, yPos);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPrice(sgstAmount), valueCol, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedText);
    doc.text('Total GST (18%):', labelCol, yPos);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPrice(cgstAmount + sgstAmount), valueCol, yPos, { align: 'right' });

    yPos += 8;

    // ============================================
    // 6. DISCOUNT SECTION (if applicable)
    // ============================================

    if (order.discount_amount > 0) {
        yPos = drawSectionTitle(doc, 'DISCOUNT APPLIED', yPos, margin, 60);

        doc.setFontSize(9);
        doc.setTextColor(...colors.success);
        doc.setFont('helvetica', 'bold');
        doc.text('Discount Amount:', labelCol, yPos);
        doc.text(formatPrice(order.discount_amount), valueCol, yPos, { align: 'right' });

        yPos += 8;
    }

    // ============================================
    // 7. ORDER SUMMARY & FINAL TOTAL
    // ============================================

    yPos = checkPageBreak(doc, yPos, 50, pageHeight, margin);

    yPos = drawSectionTitle(doc, 'ORDER SUMMARY', yPos, margin, 60);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(...colors.mutedText);
    doc.text('Subtotal (with GST):', labelCol, yPos);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPrice(order.subtotal), valueCol, yPos, { align: 'right' });

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedText);
    doc.text('Shipping Charges:', labelCol, yPos);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    const shippingText = order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost);
    doc.text(shippingText, valueCol, yPos, { align: 'right' });

    if (order.discount_amount > 0) {
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.success);
        doc.text('Discount:', labelCol, yPos);
        doc.setTextColor(...colors.success);
        doc.setFont('helvetica', 'bold');
        doc.text(`-${formatPrice(order.discount_amount)}`, valueCol, yPos, { align: 'right' });
    }

    yPos += 10;

    // Grand Total Box
    doc.setFillColor(...colors.primary);
    doc.rect(margin, yPos - 8, contentWidth, 14, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const grandTotalLabel = 'GRAND TOTAL';
    const grandTotalAmount = formatPrice(order.total);
    doc.text(grandTotalLabel + ':', margin + 5, yPos);
    doc.text(grandTotalAmount, valueCol, yPos, { align: 'right' });

    yPos += 22;

    // ============================================
    // 8. PAYMENT DETAILS SECTION
    // ============================================

    yPos = checkPageBreak(doc, yPos, 50, pageHeight, margin);

    yPos = drawSectionTitle(doc, 'PAYMENT DETAILS', yPos, margin, 60);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const paymentLabelCol = margin + 5;
    const paymentValueCol = margin + 50;

    // Payment Method
    doc.setTextColor(...colors.mutedText);
    doc.text('Payment Method:', paymentLabelCol, yPos);
    doc.setTextColor(...colors.darkText);
    doc.setFont('helvetica', 'bold');
    const paymentMethodText =
        order.payment_gateway === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery';
    doc.text(paymentMethodText, paymentValueCol, yPos);

    yPos += 6;

    // Payment Status
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedText);
    doc.text('Payment Status:', paymentLabelCol, yPos);
    const paymentStatusText = (order.payment_status || 'pending').toUpperCase();
    const paymentStatusColorVal =
        paymentStatusText === 'COMPLETED' ? colors.success : 
        paymentStatusText === 'FAILED' ? colors.error : 
        colors.warning;
    doc.setTextColor(...paymentStatusColorVal);
    doc.setFont('helvetica', 'bold');
    doc.text(paymentStatusText, paymentValueCol, yPos);

    yPos += 8;

    if (order.payment_gateway === 'razorpay') {
        doc.setFont('helvetica', 'normal');
        if (order.razorpay_order_id) {
            doc.setTextColor(...colors.mutedText);
            doc.text('Order ID:', paymentLabelCol, yPos);
            doc.setTextColor(...colors.darkText);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(order.razorpay_order_id, paymentValueCol, yPos);
            yPos += 5;
        }

        if (order.razorpay_payment_id) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.mutedText);
            doc.text('Payment ID:', paymentLabelCol, yPos);
            doc.setTextColor(...colors.darkText);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(order.razorpay_payment_id, paymentValueCol, yPos);
            yPos += 5;
        }

        if (order.paid_at) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.mutedText);
            doc.text('Paid On:', paymentLabelCol, yPos);
            doc.setTextColor(...colors.darkText);
            doc.setFont('helvetica', 'bold');
            doc.text(formatDate(order.paid_at), paymentValueCol, yPos);
            yPos += 6;
        }
    } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.warning);
        doc.text('⚠ Payment pending at delivery', paymentLabelCol, yPos);
        yPos += 6;
    }

    yPos += 8;

    // ============================================
    // 9. FOOTER SECTION
    // ============================================

    const footerStartY = pageHeight - 35;

    doc.setDrawColor(...colors.borderLight);
    doc.setLineWidth(0.5);
    doc.line(margin, footerStartY, pageWidth - margin, footerStartY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.darkText);
    doc.text('Thank you for your order!', pageWidth / 2, footerStartY + 8, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...colors.mutedText);
    doc.text(
        'For any queries or issues, please contact us at support@aonetop.com',
        pageWidth / 2,
        footerStartY + 13,
        { align: 'center' }
    );

    doc.setFontSize(7);
    doc.text(
        'This is a computer-generated invoice. No signature is required.',
        pageWidth / 2,
        footerStartY + 18,
        { align: 'center' }
    );

    // ============================================
    // SAVE PDF
    // ============================================

    const fileName = `Invoice-${order.order_number || order.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
}
