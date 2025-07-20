// backend/services/reportService.js
const PDFDocument = require('pdfkit');
const Medicine = require('../models/Inventory');
const moment = require('moment');

class ReportService {
  async generateInventoryReport(filters = {}) {
    const medicines = await Medicine.findAll({
      order: [['name', 'ASC']]
    });
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        
        // Header
        doc.fontSize(20).text('Pharmacy Inventory Report', { align: 'center' });
        doc.fontSize(12).text(`Generated on: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, { align: 'center' });
        doc.moveDown();
        
        // Table headers
        const startY = doc.y;
        const tableTop = startY + 10;
        
        doc.fontSize(10)
           .text('Medicine Name', 50, tableTop)
           .text('Quantity', 200, tableTop)
           .text('Location', 280, tableTop)
           .text('Expiry Date', 380, tableTop)
           .text('Status', 480, tableTop);
        
        // Draw line under headers
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
        
        let currentY = tableTop + 25;
        
        medicines.forEach((medicine, index) => {
          const expiryDate = moment(medicine.expirationDate);
          const isExpiring = expiryDate.diff(moment(), 'days') <= 30;
          const isLowStock = medicine.quantity < 10;
          
          let status = 'Normal';
          if (isExpiring) status = 'Expiring';
          if (isLowStock) status = 'Low Stock';
          if (isExpiring && isLowStock) status = 'Critical';
          
          doc.fontSize(8)
             .text(medicine.name, 50, currentY)
             .text(medicine.quantity.toString(), 200, currentY)
             .text(medicine.location || 'N/A', 280, currentY)
             .text(expiryDate.format('YYYY-MM-DD'), 380, currentY)
             .text(status, 480, currentY);
          
          currentY += 20;
          
          // Add new page if needed
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
        });
        
        // Summary
        doc.addPage();
        doc.fontSize(14).text('Summary', { align: 'center' });
        doc.moveDown();
        
        const lowStockCount = medicines.filter(m => m.quantity < 10).length;
        const expiringCount = medicines.filter(m => moment(m.expirationDate).diff(moment(), 'days') <= 30).length;
        
        doc.fontSize(12)
           .text(`Total Medicines: ${medicines.length}`)
           .text(`Low Stock Items: ${lowStockCount}`)
           .text(`Expiring Soon: ${expiringCount}`);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
module.exports = new ReportService();