import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  invoice_date: string;
  notes?: string;
  invoice_items: InvoiceItem[];
}

export const generateInvoicePDF = async (invoice: InvoiceData) => {
  const doc = new jsPDF();
  
  // Set up colors
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue
  const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
  const lightGray: [number, number, number] = [243, 244, 246]; // Gray-100
  
  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BEPAWAA', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Kasarani Bukoba', 20, 32);
  doc.text('Phone: +255 679 487 088', 20, 36);
  
  // Invoice title
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 25);
  
  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoice_number}`, 150, 32);
  doc.text(`Date: ${format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}`, 150, 36);
  
  // Customer information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer_name, 20, 62);
  if (invoice.customer_email) {
    doc.text(invoice.customer_email, 20, 67);
  }
  if (invoice.customer_phone) {
    doc.text(invoice.customer_phone, 20, 72);
  }
  
  // Items table
  const tableStartY = 85;
  
  const tableData = invoice.invoice_items.map(item => [
    item.product_name,
    item.quantity.toString(),
    `TZS ${item.unit_price.toLocaleString()}`,
    `TZS ${item.total_price.toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Product', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    }
  });
  
  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 40;
  
  // Totals section
  const totalsX = 130;
  let currentY = finalY + 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.text('Subtotal:', totalsX, currentY);
  doc.text(`TZS ${invoice.subtotal.toLocaleString()}`, 185, currentY, { align: 'right' });
  currentY += 7;
  
  // VAT
  doc.text('VAT (18%):', totalsX, currentY);
  doc.text(`TZS ${invoice.vat_amount.toLocaleString()}`, 185, currentY, { align: 'right' });
  currentY += 7;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Amount:', totalsX, currentY);
  doc.text(`TZS ${invoice.total_amount.toLocaleString()}`, 185, currentY, { align: 'right' });
  
  // Notes section
  if (invoice.notes) {
    currentY += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, currentY);
    
    doc.setFont('helvetica', 'normal');
    currentY += 7;
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, currentY);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', 105, pageHeight - 20, { align: 'center' });
  doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 105, pageHeight - 15, { align: 'center' });
  
  // Save the PDF
  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
};