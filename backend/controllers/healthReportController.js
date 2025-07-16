const { HealthMonitoring, Elder, User, HealthAlert } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate Daily Health Report
const generateDailyReport = async (req, res) => {
  try {
    const { date, elderId } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    const whereClause = {
      monitoringDate: {
        [Op.gte]: startOfDay,
        [Op.lt]: endOfDay
      }
    };

    if (elderId) {
      whereClause.elderId = elderId;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'photo']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: HealthAlert,
          as: 'alerts',
          attributes: ['id', 'alertType', 'severity', 'message', 'status']
        }
      ],
      order: [['monitoringDate', 'ASC']]
    });

    // Calculate daily statistics
    const stats = calculateDailyStats(healthRecords);

    res.json({
      success: true,
      data: {
        date: date,
        records: healthRecords,
        statistics: stats,
        summary: {
          totalRecords: healthRecords.length,
          totalElders: [...new Set(healthRecords.map(r => r.elderId))].length,
          criticalAlerts: healthRecords.filter(r => r.alertLevel === 'critical').length,
          warningAlerts: healthRecords.filter(r => r.alertLevel === 'warning').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error generating daily report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily report',
      error: error.message
    });
  }
};

// Generate Weekly Health Report
const generateWeeklyReport = async (req, res) => {
  try {
    const { startDate, endDate, elderId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date parameters are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const whereClause = {
      monitoringDate: {
        [Op.gte]: start,
        [Op.lte]: end
      }
    };

    if (elderId) {
      whereClause.elderId = elderId;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'photo'
          ]
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: HealthAlert,
          as: 'alerts',
          attributes: ['id', 'alertType', 'severity', 'message', 'status']
        }
      ],
      order: [['monitoringDate', 'ASC']]
    });

    // Group by elder and calculate weekly trends
    const elderGroups = groupRecordsByElder(healthRecords);
    const weeklyTrends = calculateWeeklyTrends(elderGroups);

    res.json({
      success: true,
      data: {
        period: `${startDate} to ${endDate}`,
        records: healthRecords,
        elderGroups: elderGroups,
        trends: weeklyTrends,
        summary: {
          totalRecords: healthRecords.length,
          totalElders: [...new Set(healthRecords.map(r => r.elderId))].length,
          avgRecordsPerDay: (healthRecords.length / 7).toFixed(1),
          criticalAlerts: healthRecords.filter(r => r.alertLevel === 'critical').length,
          warningAlerts: healthRecords.filter(r => r.alertLevel === 'warning').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error generating weekly report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly report',
      error: error.message
    });
  }
};

// Generate Monthly Health Report
const generateMonthlyReport = async (req, res) => {
  try {
    const { year, month, elderId } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month parameters are required'
      });
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const whereClause = {
      monitoringDate: {
        [Op.gte]: startOfMonth,
        [Op.lte]: endOfMonth
      }
    };

    if (elderId) {
      whereClause.elderId = elderId;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'photo']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: HealthAlert,
          as: 'alerts',
          attributes: ['id', 'alertType', 'severity', 'message', 'status']
        }
      ],
      order: [['monitoringDate', 'ASC']]
    });

    // Group by elder and calculate monthly trends
    const elderGroups = groupRecordsByElder(healthRecords);
    const monthlyTrends = calculateMonthlyTrends(elderGroups);
    const weeklyBreakdown = calculateWeeklyBreakdown(healthRecords, startOfMonth, endOfMonth);

    res.json({
      success: true,
      data: {
        period: `${getMonthName(month)} ${year}`,
        records: healthRecords,
        elderGroups: elderGroups,
        trends: monthlyTrends,
        weeklyBreakdown: weeklyBreakdown,
        summary: {
          totalRecords: healthRecords.length,
          totalElders: [...new Set(healthRecords.map(r => r.elderId))].length,
          avgRecordsPerDay: (healthRecords.length / new Date(year, month, 0).getDate()).toFixed(1),
          criticalAlerts: healthRecords.filter(r => r.alertLevel === 'critical').length,
          warningAlerts: healthRecords.filter(r => r.alertLevel === 'warning').length,
          normalRecords: healthRecords.filter(r => r.alertLevel === 'normal').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly report',
      error: error.message
    });
  }
};

// Helper Functions
const calculateDailyStats = (records) => {
  if (records.length === 0) return {};

  const vitals = {
    heartRate: records.filter(r => r.heartRate).map(r => r.heartRate),
    bloodPressureSystolic: records.filter(r => r.bloodPressureSystolic).map(r => r.bloodPressureSystolic),
    bloodPressureDiastolic: records.filter(r => r.bloodPressureDiastolic).map(r => r.bloodPressureDiastolic),
    temperature: records.filter(r => r.temperature).map(r => r.temperature),
    weight: records.filter(r => r.weight).map(r => r.weight),
    oxygenSaturation: records.filter(r => r.oxygenSaturation).map(r => r.oxygenSaturation)
  };

  const stats = {};
  Object.keys(vitals).forEach(vital => {
    if (vitals[vital].length > 0) {
      stats[vital] = {
        average: (vitals[vital].reduce((a, b) => a + b, 0) / vitals[vital].length).toFixed(1),
        min: Math.min(...vitals[vital]),
        max: Math.max(...vitals[vital]),
        count: vitals[vital].length
      };
    }
  });

  return stats;
};

const groupRecordsByElder = (records) => {
  const grouped = {};
  records.forEach(record => {
    const elderId = record.elderId;
    if (!grouped[elderId]) {
      grouped[elderId] = {
        elder: record.elder,
        records: []
      };
    }
    grouped[elderId].records.push(record);
  });
  return grouped;
};

const calculateWeeklyTrends = (elderGroups) => {
  const trends = {};
  
  Object.keys(elderGroups).forEach(elderId => {
    const records = elderGroups[elderId].records;
    trends[elderId] = {
      elderName: `${elderGroups[elderId].elder.firstName} ${elderGroups[elderId].elder.lastName}`,
      recordCount: records.length,
      alertDistribution: {
        critical: records.filter(r => r.alertLevel === 'critical').length,
        warning: records.filter(r => r.alertLevel === 'warning').length,
        normal: records.filter(r => r.alertLevel === 'normal').length
      },
      vitals: calculateDailyStats(records)
    };
  });
  
  return trends;
};

const calculateMonthlyTrends = (elderGroups) => {
  const trends = {};
  
  Object.keys(elderGroups).forEach(elderId => {
    const records = elderGroups[elderId].records;
    const elder = elderGroups[elderId].elder;
    
    trends[elderId] = {
      elderName: `${elder.firstName} ${elder.lastName}`,
      recordCount: records.length,
      alertDistribution: {
        critical: records.filter(r => r.alertLevel === 'critical').length,
        warning: records.filter(r => r.alertLevel === 'warning').length,
        normal: records.filter(r => r.alertLevel === 'normal').length
      },
      vitals: calculateDailyStats(records),
      weeklyAverage: (records.length / 4).toFixed(1)
    };
  });
  
  return trends;
};

const calculateWeeklyBreakdown = (records, startOfMonth, endOfMonth) => {
  const weeks = [];
  const current = new Date(startOfMonth);
  
  while (current <= endOfMonth) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekRecords = records.filter(record => {
      const recordDate = new Date(record.monitoringDate);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });
    
    weeks.push({
      week: `Week ${weeks.length + 1}`,
      period: `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`,
      recordCount: weekRecords.length,
      criticalAlerts: weekRecords.filter(r => r.alertLevel === 'critical').length,
      warningAlerts: weekRecords.filter(r => r.alertLevel === 'warning').length
    });
    
    current.setDate(current.getDate() + 7);
  }
  
  return weeks;
};

const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

// Generate PDF Report with Red/Pink Theme
const generatePDFContent = (doc, data, title) => {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;
  let y = margin;

  // Red/Pink Theme Colors
  const colors = {
    primary: '#DC2626',      // Red-600
    secondary: '#F87171',    // Red-400
    accent: '#FCA5A5',       // Red-300
    pink: '#EC4899',         // Pink-500
    lightPink: '#F9A8D4',    // Pink-300
    darkRed: '#991B1B',      // Red-800
    text: '#1F2937',         // Gray-800
    lightText: '#6B7280',    // Gray-500
    background: '#FEF2F2',   // Red-50
    border: '#FCA5A5'        // Red-300
  };

  // Company branding and header
  const drawHeader = () => {
    // Try to load and display logo
    const logoPath = path.join(__dirname, '..', 'uploads', 'assets', 'logo.png');
    
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, margin, y, { width: 60, height: 40 });
      } catch (error) {
        console.error('Error loading logo:', error);
        // Fallback to text logo
        doc.rect(margin, y, 60, 40).fillAndStroke(colors.primary, colors.primary);
        doc.fontSize(8).fillColor('#FFFFFF').text('LOGO', margin + 20, y + 15);
      }
    } else {
      // Logo placeholder with red background
      doc.rect(margin, y, 60, 40).fillAndStroke(colors.primary, colors.primary);
      doc.fontSize(8).fillColor('#FFFFFF').text('ELDERLINK', margin + 10, y + 15);
    }
    
    // Company name and title with red/pink theme
    doc.fontSize(24).fillColor(colors.primary).text('ElderLink Health System', margin + 80, y);
    doc.fontSize(16).fillColor(colors.darkRed).text(title, margin + 80, y + 25);
    
    // Date and time
    doc.fontSize(9).fillColor(colors.lightText).text(
      `Generated: ${new Date().toLocaleString()}`,
      pageWidth - 180,
      y + 5
    );
    
    // Horizontal line
    y += 60;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke(colors.border);
    y += 20;
  };

  // Add patient names to vital statistics
  const drawVitalStats = () => {
    if (!data.statistics || Object.keys(data.statistics).length === 0) {
      return;
    }

    // Add patient names if available
    let patientNames = '';
    if (data.elderGroups && Object.keys(data.elderGroups).length > 0) {
      const elderNames = Object.values(data.elderGroups).map(group => 
        `${group.elder.firstName} ${group.elder.lastName}`
      );
      patientNames = elderNames.length === 1 ? ` - ${elderNames[0]}` : ` (${elderNames.length} Patients)`;
    }

    doc.fontSize(16).fillColor(colors.darkRed).text(`Vital Statistics Overview${patientNames}`, margin, y);
    y += 25;

    const vitalStats = [
      { key: 'heartRate', label: 'Heart Rate', unit: 'bpm' },
      { key: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg' },
      { key: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg' },
      { key: 'temperature', label: 'Temperature', unit: '°F' },
      { key: 'weight', label: 'Weight', unit: 'lbs' },
      { key: 'oxygenSaturation', label: 'Oxygen Saturation', unit: '%' }
    ];

    vitalStats.forEach(vital => {
      if (data.statistics[vital.key]) {
        const stats = data.statistics[vital.key];
        
        // Draw background box with red/pink theme
        doc.rect(margin, y, pageWidth - 2 * margin, 30).fillAndStroke(colors.background, colors.border);
        
        // Title with red color
        doc.fontSize(12).fillColor(colors.primary).text(
          vital.label,
          margin + 10,
          y + 8
        );
        
        // Statistics with darker text
        doc.fontSize(10).fillColor(colors.text).text(
          `Average: ${stats.average} ${vital.unit} | Range: ${stats.min}-${stats.max} ${vital.unit} | Records: ${stats.count}`,
          margin + 10,
          y + 18
        );
        
        y += 35;
      }
    });

    y += 15;
  };

  // Summary section with red/pink styled boxes
  const drawSummary = () => {
    doc.fontSize(16).fillColor(colors.darkRed).text('Executive Summary', margin, y);
    y += 25;

    const summaryData = [
      { label: 'Total Records', value: data.summary.totalRecords, color: colors.primary },
      { label: 'Total Elders', value: data.summary.totalElders, color: colors.pink },
      { label: 'Critical Alerts', value: data.summary.criticalAlerts, color: colors.darkRed },
      { label: 'Warning Alerts', value: data.summary.warningAlerts, color: colors.secondary },
      { label: 'Normal Records', value: data.summary.normalRecords || 0, color: colors.accent }
    ];

    const boxWidth = 100;
    const boxHeight = 50;
    const spacing = 10;
    let x = margin;

    summaryData.forEach((item, index) => {
      if (index > 0 && index % 5 === 0) {
        y += boxHeight + spacing;
        x = margin;
      }

      // Draw colored box
      doc.rect(x, y, boxWidth, boxHeight).fillAndStroke(item.color, item.color);
      
      // Add white text
      doc.fontSize(18).fillColor('#FFFFFF').text(item.value.toString(), x + 10, y + 8);
      doc.fontSize(9).fillColor('#FFFFFF').text(item.label, x + 10, y + 28);
      
      x += boxWidth + spacing;
    });

    y += boxHeight + 25;
  };

  // Individual elder reports (without photos)
  const drawElderReports = () => {
    if (!data.elderGroups || Object.keys(data.elderGroups).length === 0) {
      return;
    }

    doc.fontSize(16).fillColor(colors.darkRed).text('Individual Elder Reports', margin, y);
    y += 25;

    Object.values(data.elderGroups).forEach(elderGroup => {
      const elder = elderGroup.elder;
      const records = elderGroup.records;

      // Check if we need a new page
      if (y > pageHeight - 150) {
        doc.addPage();
        y = margin;
      }

      // Elder header (no photo)
      doc.rect(margin, y, pageWidth - 2 * margin, 60).fillAndStroke(colors.background, colors.border);
      
      // Elder information
      doc.fontSize(14).fillColor(colors.primary).text(
        `${elder.firstName} ${elder.lastName}`,
        margin + 20,
        y + 15
      );
      
      if (elder.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear();
        doc.fontSize(10).fillColor(colors.text).text(
          `Age: ${age} years | DOB: ${new Date(elder.dateOfBirth).toLocaleDateString()}`,
          margin + 20,
          y + 30
        );
      }

      doc.fontSize(10).fillColor(colors.text).text(
        `Total Records: ${records.length}`,
        margin + 20,
        y + 45
      );

      y += 75;

      // Alert distribution
      const alertCounts = {
        critical: records.filter(r => r.alertLevel === 'critical').length,
        warning: records.filter(r => r.alertLevel === 'warning').length,
        normal: records.filter(r => r.alertLevel === 'normal').length
      };

      doc.fontSize(12).fillColor(colors.text).text('Alert Distribution:', margin + 10, y);
      y += 15;

      const alertData = [
        { type: 'Critical', count: alertCounts.critical, color: colors.darkRed },
        { type: 'Warning', count: alertCounts.warning, color: colors.secondary },
        { type: 'Normal', count: alertCounts.normal, color: colors.pink }
      ];

      alertData.forEach(alert => {
        doc.rect(margin + 10, y, 12, 12).fillAndStroke(alert.color, alert.color);
        doc.fontSize(10).fillColor(colors.text).text(
          `${alert.type}: ${alert.count} records`,
          margin + 30,
          y + 2
        );
        y += 18;
      });

      y += 10;

      // Recent records table (compact)
      if (records.length > 0) {
        doc.fontSize(12).fillColor(colors.text).text('Recent Health Records:', margin + 10, y);
        y += 15;

        // Table header
        doc.rect(margin + 10, y, pageWidth - 2 * margin - 20, 20).fillAndStroke(colors.accent, colors.border);
        
        const headers = ['Date', 'Heart Rate', 'BP', 'Temp', 'Weight', 'O2 Sat'];
        const columnWidths = [70, 60, 60, 50, 50, 50];
        let headerX = margin + 15;

        headers.forEach((header, index) => {
          doc.fontSize(9).fillColor(colors.darkRed).text(header, headerX, y + 6);
          headerX += columnWidths[index];
        });

        y += 20;

        // Table rows (show last 3 records to save space)
        const recentRecords = records.slice(-3).reverse();
        recentRecords.forEach((record, index) => {
          const rowColor = index % 2 === 0 ? '#FFFFFF' : colors.background;
          doc.rect(margin + 10, y, pageWidth - 2 * margin - 20, 18).fillAndStroke(rowColor, colors.border);

          let rowX = margin + 15;
          const rowData = [
            new Date(record.monitoringDate).toLocaleDateString(),
            record.heartRate ? `${record.heartRate}` : '-',
            record.bloodPressureSystolic && record.bloodPressureDiastolic 
              ? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}` 
              : '-',
            record.temperature ? `${record.temperature}°F` : '-',
            record.weight ? `${record.weight}` : '-',
            record.oxygenSaturation ? `${record.oxygenSaturation}%` : '-'
          ];

          rowData.forEach((data, colIndex) => {
            doc.fontSize(8).fillColor(colors.text).text(data, rowX, y + 5);
            rowX += columnWidths[colIndex];
          });

          y += 18;
        });

        y += 15;
      }

      // Notes section (compact)
      const notesRecords = records.filter(r => r.notes);
      if (notesRecords.length > 0) {
        doc.fontSize(12).fillColor(colors.text).text('Recent Notes:', margin + 10, y);
        y += 12;

        notesRecords.slice(-2).forEach(record => {
          doc.rect(margin + 10, y, pageWidth - 2 * margin - 20, 25).fillAndStroke(colors.background, colors.border);
          doc.fontSize(8).fillColor(colors.text).text(
            `${new Date(record.monitoringDate).toLocaleDateString()}: ${record.notes}`,
            margin + 15,
            y + 5,
            { width: pageWidth - 2 * margin - 30, height: 15 }
          );
          y += 30;
        });
      }

      y += 20;
    });
  };

  // Weekly breakdown (compact)
  const drawWeeklyBreakdown = () => {
    if (!data.weeklyBreakdown) return;

    if (y > pageHeight - 120) {
      doc.addPage();
      y = margin;
    }

    doc.fontSize(16).fillColor(colors.darkRed).text('Weekly Breakdown', margin, y);
    y += 20;

    const weeks = data.weeklyBreakdown;
    const weekWidth = Math.min(120, (pageWidth - 2 * margin) / weeks.length);

    weeks.forEach((week, index) => {
      const x = margin + (index * weekWidth);
      
      // Week box
      doc.rect(x, y, weekWidth - 5, 80).fillAndStroke(colors.background, colors.border);
      
      // Week title
      doc.fontSize(11).fillColor(colors.primary).text(week.week, x + 5, y + 8);
      doc.fontSize(7).fillColor(colors.lightText).text(week.period, x + 5, y + 20);
      
      // Statistics
      doc.fontSize(9).fillColor(colors.text).text(`Records: ${week.recordCount}`, x + 5, y + 35);
      doc.fontSize(8).fillColor(colors.darkRed).text(`Critical: ${week.criticalAlerts}`, x + 5, y + 48);
      doc.fontSize(8).fillColor(colors.secondary).text(`Warning: ${week.warningAlerts}`, x + 5, y + 60);
    });

    y += 90;
  };

  // Footer
  const drawFooter = () => {
    const footerY = pageHeight - 40;
    doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).stroke(colors.border);
    
    doc.fontSize(8).fillColor(colors.lightText).text(
      'ElderLink Health System - Confidential Health Report',
      margin,
      footerY + 8
    );
    
    doc.text(
      `Page ${doc.page.count}`,
      pageWidth - 80,
      footerY + 8
    );
    
    doc.text(
      'Generated by ElderLink Health Monitoring System',
      margin,
      footerY + 20
    );
  };

  // Generate the PDF content (more compact layout)
  drawHeader();
  drawSummary();
  drawVitalStats();
  drawElderReports();
  drawWeeklyBreakdown();
  
  // Only add footer to current page
  drawFooter();
};

// Enhanced PDF generation with better error handling and no blank pages
const generatePDFReport = async (req, res) => {
  try {
    const { type, date, startDate, endDate, year, month, elderId } = req.query;
    
    let reportData;
    let reportTitle;
    
    // Get report data based on type
    switch (type) {
      case 'daily':
        const dailyReq = { query: { date, elderId } };
        const dailyRes = { json: (data) => reportData = data };
        await generateDailyReport(dailyReq, dailyRes);
        reportTitle = `Daily Health Report - ${date}`;
        break;
        
      case 'weekly':
        const weeklyReq = { query: { startDate, endDate, elderId } };
        const weeklyRes = { json: (data) => reportData = data };
        await generateWeeklyReport(weeklyReq, weeklyRes);
        reportTitle = `Weekly Health Report - ${startDate} to ${endDate}`;
        break;
        
      case 'monthly':
        const monthlyReq = { query: { year, month, elderId } };
        const monthlyRes = { json: (data) => reportData = data };
        await generateMonthlyReport(monthlyReq, monthlyRes);
        reportTitle = `Monthly Health Report - ${getMonthName(month)} ${year}`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    if (!reportData || !reportData.success) {
      return res.status(400).json(reportData || { success: false, message: 'No data found' });
    }

    // Generate PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: reportTitle,
        Author: 'ElderLink Health System',
        Subject: 'Health Monitoring Report',
        Keywords: 'health, monitoring, elders, report'
      }
    });

    const filename = `health_report_${type}_${Date.now()}.pdf`;
    const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
    
    // Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filePath = path.join(reportsDir, filename);

    doc.pipe(fs.createWriteStream(filePath));

    // Add content to PDF
    generatePDFContent(doc, reportData.data, reportTitle);

    doc.end();

    // Wait for PDF to be written
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
          if (err) {
            console.error('Error downloading PDF:', err);
            res.status(500).json({
              success: false,
              message: 'Error downloading PDF'
            });
          }
          // Clean up file after download
          setTimeout(() => {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) console.error('Error deleting PDF file:', unlinkErr);
            });
          }, 10000);
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'PDF file not found'
        });
      }
    }, 2000);

  } catch (error) {
    console.error('❌ Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
};

module.exports = {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  generatePDFReport
};