import jsPDF from "jspdf";

export function generateEmergencyPDF(alert) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Emergency Details Report", 14, 20);
  doc.setFontSize(12);
  doc.text(`Elder: ${alert.elder}`, 14, 40);
  doc.text(`Message: ${alert.message}`, 14, 50);
  doc.text(`Severity: ${alert.severity}`, 14, 60);
  doc.text(`Time: ${alert.time}`, 14, 70);
  doc.text(`Status: ${alert.status}`, 14, 80);
  doc.save(`emergency-details-${alert.elder.replace(/\s+/g, "_")}.pdf`);
}
