const { HealthMonitoring, Elder, User } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate daily health report
const generateDailyReport = async (req, res) => {
  try {
    const { date, elderId } = req.query;
    
    console.log('📊 Generating daily report for:', { date, elderId });
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Parse the date and create date range
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Next day
    
    console.log('📅 Date range:', { startDate, endDate });
    
    // Build where clause
    const whereClause = {
      monitoringDate: {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      }
    };
    
    // Add elder filter if provided
    if (elderId) {
      whereClause.elderId = elderId;
    }
    
    console.log('🔍 Where clause:', whereClause);
    
    // ✅ Fixed: Use correct association names
    const records = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder', // ✅ Make sure this matches your model association
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender'],
          required: false
        },
        {
          model: User,
          as: 'staff', // ✅ Make sure this matches your model association
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });
    
    console.log('📋 Found records:', records.length);
    
    // Calculate statistics
    const statistics = calculateVitalStatistics(records);
    
    // Generate summary
    const summary = {
      totalRecords: records.length,
      totalElders: new Set(records.map(r => r.elderId)).size,
      criticalAlerts: records.filter(r => r.alertLevel === 'critical').length,
      warningAlerts: records.filter(r => r.alertLevel === 'warning').length,
      normalAlerts: records.filter(r => r.alertLevel === 'normal').length,
      date: date
    };
    
    console.log('📊 Summary:', summary);
    
    res.json({
      success: true,
      data: {
        summary,
        statistics,
        records: records.map(record => ({
          id: record.id,
          elderId: record.elderId,
          elderName: record.elder ? `${record.elder.firstName} ${record.elder.lastName}` : 'Unknown',
          staffName: record.staff ? `${record.staff.firstName} ${record.staff.lastName}` : 'Unknown',
          monitoringDate: record.monitoringDate,
          heartRate: record.heartRate,
          bloodPressureSystolic: record.bloodPressureSystolic,
          bloodPressureDiastolic: record.bloodPressureDiastolic,
          temperature: record.temperature,
          weight: record.weight,
          oxygenSaturation: record.oxygenSaturation,
          sleepHours: record.sleepHours,
          alertLevel: record.alertLevel,
          notes: record.notes
        }))
      },
      message: 'Daily report generated successfully'
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

// Generate weekly health report
const generateWeeklyReport = async (req, res) => {
  try {
    const { startDate, endDate, elderId } = req.query;
    
    console.log('📊 Generating weekly report for:', { startDate, endDate, elderId });
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Include end date
    
    // Build where clause
    const whereClause = {
      monitoringDate: {
        [Op.gte]: start,
        [Op.lt]: end
      }
    };
    
    if (elderId) {
      whereClause.elderId = elderId;
    }
    
    // ✅ Fixed: Use correct association names
    const records = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender'],
          required: false
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });
    
    console.log('📋 Found records:', records.length);
    
    // Calculate statistics
    const statistics = calculateVitalStatistics(records);
    
    // Generate daily breakdown
    const dailyBreakdown = generateDailyBreakdown(records, start, end);
    
    // Generate elder trends
    const trends = generateElderTrends(records);
    
    // Generate summary
    const summary = {
      totalRecords: records.length,
      totalElders: new Set(records.map(r => r.elderId)).size,
      criticalAlerts: records.filter(r => r.alertLevel === 'critical').length,
      warningAlerts: records.filter(r => r.alertLevel === 'warning').length,
      normalAlerts: records.filter(r => r.alertLevel === 'normal').length,
      period: `${startDate} to ${endDate}`
    };
    
    res.json({
      success: true,
      data: {
        summary,
        statistics,
        dailyBreakdown,
        trends
      },
      message: 'Weekly report generated successfully'
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

// Generate monthly health report
const generateMonthlyReport = async (req, res) => {
  try {
    const { year, month, elderId } = req.query;
    
    console.log('📊 Generating monthly report for:', { year, month, elderId });
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    
    // Build where clause
    const whereClause = {
      monitoringDate: {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      }
    };
    
    if (elderId) {
      whereClause.elderId = elderId;
    }
    
    // ✅ Fixed: Use correct association names
    const records = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender'],
          required: false
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });
    
    console.log('📋 Found records:', records.length);
    
    // Calculate statistics
    const statistics = calculateVitalStatistics(records);
    
    // Generate weekly breakdown
    const weeklyBreakdown = generateWeeklyBreakdown(records, startDate, endDate);
    
    // Generate elder trends
    const trends = generateElderTrends(records);
    
    // Generate summary
    const summary = {
      totalRecords: records.length,
      totalElders: new Set(records.map(r => r.elderId)).size,
      criticalAlerts: records.filter(r => r.alertLevel === 'critical').length,
      warningAlerts: records.filter(r => r.alertLevel === 'warning').length,
      normalAlerts: records.filter(r => r.alertLevel === 'normal').length,
      period: `${getMonthName(month)} ${year}`
    };
    
    res.json({
      success: true,
      data: {
        summary,
        statistics,
        weeklyBreakdown,
        trends
      },
      message: 'Monthly report generated successfully'
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

// ✅ Helper function to get report data for PDF generation
const generateDailyReportData = async (date, elderId = null) => {
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  
  const whereClause = {
    monitoringDate: {
      [Op.gte]: startDate,
      [Op.lt]: endDate
    }
  };
  
  if (elderId) {
    whereClause.elderId = elderId;
  }
  
  const records = await HealthMonitoring.findAll({
    where: whereClause,
    include: [
      {
        model: Elder,
        as: 'elder',
        attributes: ['id', 'firstName', 'lastName'],
        required: false
      },
      {
        model: User,
        as: 'staff',
        attributes: ['id', 'firstName', 'lastName'],
        required: false
      }
    ],
    order: [['monitoringDate', 'DESC']]
  });
  
  const summary = {
    totalRecords: records.length,
    totalElders: new Set(records.map(r => r.elderId)).size,
    criticalAlerts: records.filter(r => r.alertLevel === 'critical').length,
    warningAlerts: records.filter(r => r.alertLevel === 'warning').length,
    normalAlerts: records.filter(r => r.alertLevel === 'normal').length,
    date: date
  };
  
  return {
    summary,
    statistics: calculateVitalStatistics(records),
    records: records.map(record => ({
      id: record.id,
      elderName: record.elder ? `${record.elder.firstName} ${record.elder.lastName}` : 'Unknown',
      staffName: record.staff ? `${record.staff.firstName} ${record.staff.lastName}` : 'Unknown',
      monitoringDate: record.monitoringDate,
      heartRate: record.heartRate,
      bloodPressureSystolic: record.bloodPressureSystolic,
      bloodPressureDiastolic: record.bloodPressureDiastolic,
      temperature: record.temperature,
      weight: record.weight,
      oxygenSaturation: record.oxygenSaturation,
      sleepHours: record.sleepHours,
      alertLevel: record.alertLevel,
      notes: record.notes
    }))
  };
};

// ✅ Helper function to get weekly report data
const generateWeeklyReportData = async (startDate, endDate, elderId = null) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);
  
  const whereClause = {
    monitoringDate: {
      [Op.gte]: start,
      [Op.lt]: end
    }
  };
  
  if (elderId) {
    whereClause.elderId = elderId;
  }
  
  const records = await HealthMonitoring.findAll({
    where: whereClause,
    include: [
      {
        model: Elder,
        as: 'elder',
        attributes: ['id', 'firstName', 'lastName'],
        required: false
      },
      {
        model: User,
        as: 'staff',
        attributes: ['id', 'firstName', 'lastName'],
        required: false
      }
    ],
    order: [['monitoringDate', 'DESC']]
  });
  
  const summary = {
    totalRecords: records.length,
    totalElders: new Set(records.map(r => r.elderId)).size,
    criticalAlerts: records.filter(r => r.alertLevel === 'critical').length,
    warningAlerts: records.filter(r => r.alertLevel === 'warning').length,
    normalAlerts: records.filter(r => r.alertLevel === 'normal').length,
    period: `${startDate} to ${endDate}`
  };
  
  return {
    summary,
    statistics: calculateVitalStatistics(records),
    dailyBreakdown: generateDailyBreakdown(records, start, end),
    trends: generateElderTrends(records),
    records: records.map(record => ({
      id: record.id,
      elderName: record.elder ? `${record.elder.firstName} ${record.elder.lastName}` : 'Unknown',
      staffName: record.staff ? `${record.staff.firstName} ${record.staff.lastName}` : 'Unknown',
      monitoringDate: record.monitoringDate,
      heartRate: record.heartRate,
      bloodPressureSystolic: record.bloodPressureSystolic,
      bloodPressureDiastolic: record.bloodPressureDiastolic,
      temperature: record.temperature,
      weight: record.weight,
      oxygenSaturation: record.oxygenSaturation,
      sleepHours: record.sleepHours,
      alertLevel: record.alertLevel,
      notes: record.notes
    }))
  };
};

// ✅ Helper function to get monthly report data
const generateMonthlyReportData = async (year, month, elderId = null) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  
  const whereClause = {
    monitoringDate: {
      [Op.gte]: startDate,
      [Op.lt]: endDate
    }
  };
  
  if (elderId) {
    whereClause.elderId = elderId;
  }
  
  const records = await HealthMonitoring.findAll({
    where: whereClause,
    include: [
      {
        model: Elder,
        as: 'elder',
        attributes: ['id', 'firstName', 'lastName'],
        required: false
      },
      {
        model: User,
        as: 'staff',
        attributes: ['id', 'firstName', 'lastName'],
        required: false
      }
    ],
    order: [['monitoringDate', 'DESC']]
  });
  
  const summary = {
    totalRecords: records.length,
    totalElders: new Set(records.map(r => r.elderId)).size,
    criticalAlerts: records.filter(r => r.alertLevel === 'critical').length,
    warningAlerts: records.filter(r => r.alertLevel === 'warning').length,
    normalAlerts: records.filter(r => r.alertLevel === 'normal').length,
    period: `${getMonthName(month)} ${year}`
  };
  
  return {
    summary,
    statistics: calculateVitalStatistics(records),
    weeklyBreakdown: generateWeeklyBreakdown(records, startDate, endDate),
    trends: generateElderTrends(records),
    records: records.map(record => ({
      id: record.id,
      elderName: record.elder ? `${record.elder.firstName} ${record.elder.lastName}` : 'Unknown',
      staffName: record.staff ? `${record.staff.firstName} ${record.staff.lastName}` : 'Unknown',
      monitoringDate: record.monitoringDate,
      heartRate: record.heartRate,
      bloodPressureSystolic: record.bloodPressureSystolic,
      bloodPressureDiastolic: record.bloodPressureDiastolic,
      temperature: record.temperature,
      weight: record.weight,
      oxygenSaturation: record.oxygenSaturation,
      sleepHours: record.sleepHours,
      alertLevel: record.alertLevel,
      notes: record.notes
    }))
  };
};

// ✅ PDF generation for daily report
const generateDailyReportPDF = async (req, res) => {
  try {
    const { date, elderId } = req.query;
    
    console.log('📄 Generating daily PDF report for:', date, elderId);
    
    // Get the report data
    const reportData = await generateDailyReportData(date, elderId);
    
    if (!reportData || !reportData.summary) {
      return res.status(404).json({
        success: false,
        message: 'No data found for PDF generation'
      });
    }
    
    // ✅ Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="health-report-daily-${date}.pdf"`);
    
    // ✅ Create PDF document
    const doc = new PDFDocument();
    doc.pipe(res);
    
    // ✅ Add title
    doc.fontSize(20).text('Daily Health Report', { align: 'center' });
    doc.fontSize(14).text(`Date: ${date}`, { align: 'center' });
    doc.moveDown();
    
    // ✅ Add summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Records: ${reportData.summary.totalRecords}`);
    doc.text(`Total Elders: ${reportData.summary.totalElders}`);
    doc.text(`Critical Alerts: ${reportData.summary.criticalAlerts}`);
    doc.text(`Warning Alerts: ${reportData.summary.warningAlerts}`);
    doc.text(`Normal Alerts: ${reportData.summary.normalAlerts}`);
    doc.moveDown();
    
    // ✅ Add vital statistics
    if (reportData.statistics && Object.keys(reportData.statistics).length > 0) {
      doc.fontSize(16).text('Vital Statistics', { underline: true });
      doc.fontSize(12);
      
      Object.entries(reportData.statistics).forEach(([key, stats]) => {
        if (stats && stats.average) {
          doc.text(`${key}: Avg ${stats.average}, Min ${stats.min}, Max ${stats.max} (${stats.count} records)`);
        }
      });
      doc.moveDown();
    }
    
    // ✅ Add records details
    if (reportData.records && reportData.records.length > 0) {
      doc.fontSize(16).text('Health Records', { underline: true });
      doc.fontSize(10);
      
      reportData.records.forEach((record, index) => {
        const vitals = [];
        if (record.heartRate) vitals.push(`HR: ${record.heartRate} bpm`);
        if (record.bloodPressureSystolic && record.bloodPressureDiastolic) {
          vitals.push(`BP: ${record.bloodPressureSystolic}/${record.bloodPressureDiastolic} mmHg`);
        }
        if (record.temperature) vitals.push(`Temp: ${record.temperature}°C`);
        if (record.weight) vitals.push(`Weight: ${record.weight} kg`);
        if (record.oxygenSaturation) vitals.push(`O2: ${record.oxygenSaturation}%`);
        if (record.sleepHours) vitals.push(`Sleep: ${record.sleepHours} hrs`);
        
        doc.text(`${index + 1}. ${record.elderName} (${record.alertLevel})`);
        doc.text(`   Vitals: ${vitals.join(', ')}`);
        doc.text(`   Time: ${new Date(record.monitoringDate).toLocaleString()}`);
        if (record.notes) {
          doc.text(`   Notes: ${record.notes}`);
        }
        doc.moveDown(0.5);
      });
    }
    
    // ✅ Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
};

// ✅ PDF generation for weekly report
const generateWeeklyReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, elderId } = req.query;
    
    console.log('📄 Generating weekly PDF report for:', startDate, 'to', endDate);
    
    // Get the report data
    const reportData = await generateWeeklyReportData(startDate, endDate, elderId);
    
    if (!reportData || !reportData.summary) {
      return res.status(404).json({
        success: false,
        message: 'No data found for PDF generation'
      });
    }
    
    // ✅ Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="health-report-weekly-${startDate}-to-${endDate}.pdf"`);
    
    // ✅ Create PDF document
    const doc = new PDFDocument();
    doc.pipe(res);
    
    // ✅ Add title
    doc.fontSize(20).text('Weekly Health Report', { align: 'center' });
    doc.fontSize(14).text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
    doc.moveDown();
    
    // ✅ Add summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Records: ${reportData.summary.totalRecords}`);
    doc.text(`Total Elders: ${reportData.summary.totalElders}`);
    doc.text(`Critical Alerts: ${reportData.summary.criticalAlerts}`);
    doc.text(`Warning Alerts: ${reportData.summary.warningAlerts}`);
    doc.text(`Normal Alerts: ${reportData.summary.normalAlerts}`);
    doc.moveDown();
    
    // ✅ Add daily breakdown
    if (reportData.dailyBreakdown && reportData.dailyBreakdown.length > 0) {
      doc.fontSize(16).text('Daily Breakdown', { underline: true });
      doc.fontSize(12);
      
      reportData.dailyBreakdown.forEach(day => {
        doc.text(`${day.date}: ${day.recordCount} records, ${day.criticalAlerts} critical, ${day.warningAlerts} warning`);
      });
      doc.moveDown();
    }
    
    // ✅ Add trends
    if (reportData.trends && Object.keys(reportData.trends).length > 0) {
      doc.fontSize(16).text('Elder Trends', { underline: true });
      doc.fontSize(12);
      
      Object.values(reportData.trends).forEach(trend => {
        doc.text(`${trend.elderName}: ${trend.recordCount} records, ${trend.alertDistribution.critical} critical alerts`);
      });
    }
    
    // ✅ Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('❌ Weekly PDF generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly PDF report',
      error: error.message
    });
  }
};

// ✅ PDF generation for monthly report
const generateMonthlyReportPDF = async (req, res) => {
  try {
    const { year, month, elderId } = req.query;
    
    console.log('📄 Generating monthly PDF report for:', year, month);
    
    // Get the report data
    const reportData = await generateMonthlyReportData(year, month, elderId);
    
    if (!reportData || !reportData.summary) {
      return res.status(404).json({
        success: false,
        message: 'No data found for PDF generation'
      });
    }
    
    // ✅ Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="health-report-monthly-${year}-${month}.pdf"`);
    
    // ✅ Create PDF document
    const doc = new PDFDocument();
    doc.pipe(res);
    
    // ✅ Add title
    doc.fontSize(20).text('Monthly Health Report', { align: 'center' });
    doc.fontSize(14).text(`Month: ${month}/${year}`, { align: 'center' });
    doc.moveDown();
    
    // ✅ Add summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Records: ${reportData.summary.totalRecords}`);
    doc.text(`Total Elders: ${reportData.summary.totalElders}`);
    doc.text(`Critical Alerts: ${reportData.summary.criticalAlerts}`);
    doc.text(`Warning Alerts: ${reportData.summary.warningAlerts}`);
    doc.text(`Normal Alerts: ${reportData.summary.normalAlerts}`);
    doc.moveDown();
    
    // ✅ Add weekly breakdown
    if (reportData.weeklyBreakdown && reportData.weeklyBreakdown.length > 0) {
      doc.fontSize(16).text('Weekly Breakdown', { underline: true });
      doc.fontSize(12);
      
      reportData.weeklyBreakdown.forEach(week => {
        doc.text(`${week.week} (${week.period}): ${week.recordCount} records, ${week.criticalAlerts} critical`);
      });
      doc.moveDown();
    }
    
    // ✅ Add trends
    if (reportData.trends && Object.keys(reportData.trends).length > 0) {
      doc.fontSize(16).text('Elder Trends', { underline: true });
      doc.fontSize(12);
      
      Object.values(reportData.trends).forEach(trend => {
        doc.text(`${trend.elderName}: ${trend.recordCount} records, ${trend.alertDistribution.critical} critical alerts`);
      });
    }
    
    // ✅ Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('❌ Monthly PDF generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly PDF report',
      error: error.message
    });
  }
};

// Helper function to calculate vital statistics
const calculateVitalStatistics = (records) => {
  const stats = {};
  
  // Heart Rate
  const heartRateRecords = records.filter(r => r.heartRate).map(r => parseFloat(r.heartRate));
  if (heartRateRecords.length > 0) {
    stats.heartRate = {
      average: (heartRateRecords.reduce((a, b) => a + b, 0) / heartRateRecords.length).toFixed(1),
      min: Math.min(...heartRateRecords),
      max: Math.max(...heartRateRecords),
      count: heartRateRecords.length
    };
  }
  
  // Temperature
  const tempRecords = records.filter(r => r.temperature).map(r => parseFloat(r.temperature));
  if (tempRecords.length > 0) {
    stats.temperature = {
      average: (tempRecords.reduce((a, b) => a + b, 0) / tempRecords.length).toFixed(1),
      min: Math.min(...tempRecords),
      max: Math.max(...tempRecords),
      count: tempRecords.length
    };
  }
  
  // Blood Pressure Systolic
  const bpSystolicRecords = records.filter(r => r.bloodPressureSystolic).map(r => parseFloat(r.bloodPressureSystolic));
  if (bpSystolicRecords.length > 0) {
    stats.bloodPressureSystolic = {
      average: (bpSystolicRecords.reduce((a, b) => a + b, 0) / bpSystolicRecords.length).toFixed(1),
      min: Math.min(...bpSystolicRecords),
      max: Math.max(...bpSystolicRecords),
      count: bpSystolicRecords.length
    };
  }
  
  // Blood Pressure Diastolic
  const bpDiastolicRecords = records.filter(r => r.bloodPressureDiastolic).map(r => parseFloat(r.bloodPressureDiastolic));
  if (bpDiastolicRecords.length > 0) {
    stats.bloodPressureDiastolic = {
      average: (bpDiastolicRecords.reduce((a, b) => a + b, 0) / bpDiastolicRecords.length).toFixed(1),
      min: Math.min(...bpDiastolicRecords),
      max: Math.max(...bpDiastolicRecords),
      count: bpDiastolicRecords.length
    };
  }
  
  // Weight
  const weightRecords = records.filter(r => r.weight).map(r => parseFloat(r.weight));
  if (weightRecords.length > 0) {
    stats.weight = {
      average: (weightRecords.reduce((a, b) => a + b, 0) / weightRecords.length).toFixed(1),
      min: Math.min(...weightRecords),
      max: Math.max(...weightRecords),
      count: weightRecords.length
    };
  }
  
  // Oxygen Saturation
  const oxygenRecords = records.filter(r => r.oxygenSaturation).map(r => parseFloat(r.oxygenSaturation));
  if (oxygenRecords.length > 0) {
    stats.oxygenSaturation = {
      average: (oxygenRecords.reduce((a, b) => a + b, 0) / oxygenRecords.length).toFixed(1),
      min: Math.min(...oxygenRecords),
      max: Math.max(...oxygenRecords),
      count: oxygenRecords.length
    };
  }
  
  return stats;
};

// Helper function to generate daily breakdown
const generateDailyBreakdown = (records, startDate, endDate) => {
  const breakdown = [];
  const currentDate = new Date(startDate);
  
  while (currentDate < endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayRecords = records.filter(r => 
      r.monitoringDate.toISOString().split('T')[0] === dateStr
    );
    
    breakdown.push({
      date: dateStr,
      recordCount: dayRecords.length,
      criticalAlerts: dayRecords.filter(r => r.alertLevel === 'critical').length,
      warningAlerts: dayRecords.filter(r => r.alertLevel === 'warning').length,
      normalAlerts: dayRecords.filter(r => r.alertLevel === 'normal').length
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return breakdown;
};

// Helper function to generate weekly breakdown
const generateWeeklyBreakdown = (records, startDate, endDate) => {
  const breakdown = [];
  const currentDate = new Date(startDate);
  let weekNumber = 1;
  
  while (currentDate < endDate) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    if (weekEnd > endDate) {
      weekEnd.setTime(endDate.getTime());
    }
    
    const weekRecords = records.filter(r => 
      r.monitoringDate >= weekStart && r.monitoringDate < weekEnd
    );
    
    breakdown.push({
      week: `Week ${weekNumber}`,
      period: `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`,
      recordCount: weekRecords.length,
      criticalAlerts: weekRecords.filter(r => r.alertLevel === 'critical').length,
      warningAlerts: weekRecords.filter(r => r.alertLevel === 'warning').length,
      normalAlerts: weekRecords.filter(r => r.alertLevel === 'normal').length
    });
    
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }
  
  return breakdown;
};

// Helper function to generate elder trends
const generateElderTrends = (records) => {
  const trends = {};
  
  records.forEach(record => {
    if (!trends[record.elderId]) {
      trends[record.elderId] = {
        elderName: record.elder ? `${record.elder.firstName} ${record.elder.lastName}` : 'Unknown',
        recordCount: 0,
        alertDistribution: {
          critical: 0,
          warning: 0,
          normal: 0
        }
      };
    }
    
    trends[record.elderId].recordCount++;
    trends[record.elderId].alertDistribution[record.alertLevel || 'normal']++;
  });
  
  return trends;
};

// Helper function to get month name
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

module.exports = {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  generateDailyReportPDF,
  generateWeeklyReportPDF,
  generateMonthlyReportPDF
};