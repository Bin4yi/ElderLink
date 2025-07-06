import { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import jsPDF from 'jspdf';

const Report = () => {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    elderName: '',
    date: '',
    careManagement: '',
    healthMonitoring: '',
  });

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new activity
  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.elderName || !form.date || !form.careManagement || !form.healthMonitoring) return;
    setActivities([...activities, { ...form }]);
    setForm({ elderName: '', date: '', careManagement: '', healthMonitoring: '' });
  };

  // Delete all activities for a given elder and week
  const handleDeleteWeek = (elderName, weekKey) => {
    setActivities(
      activities.filter((a) => {
        const weekStart = getWeekStart(a.date);
        const currentWeekKey = `${weekStart} to ${getWeekEnd(weekStart)}`;
        return !(a.elderName === elderName && currentWeekKey === weekKey);
      })
    );
  };

  // Group activities by elder and week
  const groupByElderAndWeek = () => {
    const grouped = {};
    activities.forEach((a) => {
      const weekStart = getWeekStart(a.date);
      const weekKey = `${weekStart} to ${getWeekEnd(weekStart)}`;
      if (!grouped[a.elderName]) grouped[a.elderName] = {};
      if (!grouped[a.elderName][weekKey]) grouped[a.elderName][weekKey] = [];
      grouped[a.elderName][weekKey].push(a);
    });
    return grouped;
  };

  // Helper to get week start (Monday) from date
  function getWeekStart(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }

  // Helper to get week end (Sunday) from week start
  function getWeekEnd(weekStartStr) {
    const d = new Date(weekStartStr);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }

  // Generate care report as PDF
  const handleGenerateReportPDF = () => {
    const grouped = groupByElderAndWeek();
    const doc = new jsPDF();
    let y = 10;
    let page = 1;

    Object.entries(grouped).forEach(([elderName, weeks]) => {
      Object.entries(weeks).forEach(([week, acts]) => {
        doc.setFontSize(14);
        doc.text(`Elder: ${elderName}`, 10, y);
        y += 8;
        doc.setFontSize(12);
        doc.text(`Week: ${week}`, 10, y);
        y += 8;
        acts.forEach((activity) => {
          doc.text(`  ${activity.date}`, 12, y);
          y += 7;
          doc.text(`    Care Management: ${activity.careManagement}`, 14, y);
          y += 7;
          doc.text(`    Health Monitoring: ${activity.healthMonitoring}`, 14, y);
          y += 10;
          if (y > 270) {
            doc.addPage();
            y = 10;
            page += 1;
          }
        });
        y += 5;
      });
    });

    if (activities.length === 0) {
      doc.text('No care activities to report.', 10, y);
    }

    doc.save('care_report.pdf');
  };

  const grouped = groupByElderAndWeek();

  return (
    <RoleLayout title="Care Activity Reports">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Care Activity</h2>
        <form onSubmit={handleAdd} className="mb-8 flex flex-col gap-2">
          <input
            name="elderName"
            value={form.elderName}
            onChange={handleChange}
            placeholder="Elder Name"
            className="border p-2 rounded"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="careManagement"
            value={form.careManagement}
            onChange={handleChange}
            placeholder="Care Management"
            className="border p-2 rounded"
            required
          />
          <input
            name="healthMonitoring"
            value={form.healthMonitoring}
            onChange={handleChange}
            placeholder="Health Monitoring"
            className="border p-2 rounded"
            required
          />
          <div className="flex justify-start">
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Add Activity
            </button>
          </div>
        </form>

        <div className="mb-6">
          <button
            onClick={handleGenerateReportPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Generate Care Report PDF
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Weekly Care Activity Report</h2>
        {Object.entries(grouped).map(([elderName, weeks]) =>
          Object.entries(weeks).map(([week, acts]) => (
            <div key={elderName + week} className="mb-6 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{elderName}</h3>
                  <p className="text-sm text-gray-600 mb-2">Week: {week}</p>
                </div>
                <button
                  onClick={() => handleDeleteWeek(elderName, week)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete Week
                </button>
              </div>
              <ul className="list-disc ml-6">
                {acts.map((activity, i) => (
                  <li key={i}>
                    <span className="font-medium">{activity.date}:</span>
                    <div>
                      <span className="font-medium">Care Management:</span> {activity.careManagement}
                    </div>
                    <div>
                      <span className="font-medium">Health Monitoring:</span> {activity.healthMonitoring}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        {activities.length === 0 && <p>No care activities added yet.</p>}
      </div>
    </RoleLayout>
  );
};

export default Report;