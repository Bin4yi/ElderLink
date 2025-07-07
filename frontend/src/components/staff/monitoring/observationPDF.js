import jsPDF from "jspdf";

export function generateObservationPDF(activity) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Daily Observation Report", 14, 20);
  doc.setFontSize(12);
  doc.text(`Elder: ${activity.elder}`, 14, 40);
  doc.text(`Task: ${activity.task}`, 14, 50);
  doc.text(`Time: ${activity.time}`, 14, 60);
  doc.text(`Status: ${activity.status}`, 14, 70);
  if (activity.vitals) {
    doc.text(`Heart Rate: ${activity.vitals.heartRate || 'N/A'}`, 14, 80);
    doc.text(`Blood Pressure: ${activity.vitals.bloodPressure || 'N/A'}`, 14, 90);
  }
  doc.save(`daily-observation-${activity.elder.replace(/\s+/g, "_")}.pdf`);
}
