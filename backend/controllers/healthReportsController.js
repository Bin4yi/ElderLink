const { HealthMonitoring, Elder, User } = require('../models');
const { Op } = require('sequelize');

// Helper function to check if elder can access the data
const checkElderAccess = async (req, elderId) => {
  if (req.user.role === 'elder') {
    const elder = await Elder.findOne({ where: { userId: req.user.id } });
    if (!elder || elder.id !== elderId) {
      return false;
    }
  }
  return true;
};

// Generate daily health report
const generateDailyReport = async (req, res) => {
  try {
    const { elderId, date } = req.query;
    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(reportDate);
    nextDay.setDate(reportDate.getDate() + 1);

    let whereClause = {
      monitoringDate: {
        [Op.gte]: reportDate,
        [Op.lt]: nextDay
      }
    };

    // If user is an elder, only show their own data
    if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    } else if (elderId) {
      whereClause.elderId = elderId;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    // Calculate daily averages and summary
    const summary = {
      date: reportDate.toISOString().split('T')[0],
      totalRecords: healthRecords.length,
      averages: {},
      alerts: [],
      trends: {}
    };

    if (healthRecords.length > 0) {
      const totals = healthRecords.reduce((acc, record) => {
        if (record.bloodPressureSystolic) acc.systolic += record.bloodPressureSystolic;
        if (record.bloodPressureDiastolic) acc.diastolic += record.bloodPressureDiastolic;
        if (record.heartRate) acc.heartRate += record.heartRate;
        if (record.temperature) acc.temperature += record.temperature;
        if (record.weight) acc.weight += record.weight;
        if (record.bloodSugar) acc.bloodSugar += record.bloodSugar;
        if (record.oxygenSaturation) acc.oxygenSaturation += record.oxygenSaturation;
        
        // Check for alerts
        if (record.alertLevel && record.alertLevel !== 'normal') {
          acc.alerts.push({
            level: record.alertLevel,
            time: record.monitoringDate,
            notes: record.notes
          });
        }
        
        return acc;
      }, {
        systolic: 0,
        diastolic: 0,
        heartRate: 0,
        temperature: 0,
        weight: 0,
        bloodSugar: 0,
        oxygenSaturation: 0,
        alerts: []
      });

      const count = healthRecords.length;
      summary.averages = {
        bloodPressure: `${Math.round(totals.systolic / count)}/${Math.round(totals.diastolic / count)}`,
        heartRate: Math.round(totals.heartRate / count),
        temperature: (totals.temperature / count).toFixed(1),
        weight: (totals.weight / count).toFixed(1),
        bloodSugar: Math.round(totals.bloodSugar / count),
        oxygenSaturation: Math.round(totals.oxygenSaturation / count)
      };
      
      summary.alerts = totals.alerts;
    }

    res.json({
      success: true,
      data: {
        summary,
        records: healthRecords
      }
    });

  } catch (error) {
    console.error('❌ Generate daily report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily health report',
      error: error.message
    });
  }
};

// Generate weekly health report
const generateWeeklyReport = async (req, res) => {
  try {
    const { elderId, startDate } = req.query;
    const weekStart = startDate ? new Date(startDate) : new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    let whereClause = {
      monitoringDate: {
        [Op.gte]: weekStart,
        [Op.lt]: weekEnd
      }
    };

    // If user is an elder, only show their own data
    if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    } else if (elderId) {
      whereClause.elderId = elderId;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    // Group by day and calculate daily averages
    const dailyData = {};
    healthRecords.forEach(record => {
      const day = record.monitoringDate.toISOString().split('T')[0];
      if (!dailyData[day]) {
        dailyData[day] = [];
      }
      dailyData[day].push(record);
    });

    const weeklyReport = {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalRecords: healthRecords.length,
      dailyAverages: {},
      weeklyTrends: {},
      alerts: []
    };

    // Calculate daily averages
    Object.keys(dailyData).forEach(day => {
      const dayRecords = dailyData[day];
      if (dayRecords.length > 0) {
        const totals = dayRecords.reduce((acc, record) => {
          if (record.bloodPressureSystolic) acc.systolic += record.bloodPressureSystolic;
          if (record.bloodPressureDiastolic) acc.diastolic += record.bloodPressureDiastolic;
          if (record.heartRate) acc.heartRate += record.heartRate;
          if (record.temperature) acc.temperature += record.temperature;
          if (record.weight) acc.weight += record.weight;
          if (record.bloodSugar) acc.bloodSugar += record.bloodSugar;
          if (record.oxygenSaturation) acc.oxygenSaturation += record.oxygenSaturation;
          return acc;
        }, {
          systolic: 0,
          diastolic: 0,
          heartRate: 0,
          temperature: 0,
          weight: 0,
          bloodSugar: 0,
          oxygenSaturation: 0
        });

        const count = dayRecords.length;
        weeklyReport.dailyAverages[day] = {
          bloodPressure: `${Math.round(totals.systolic / count)}/${Math.round(totals.diastolic / count)}`,
          heartRate: Math.round(totals.heartRate / count),
          temperature: (totals.temperature / count).toFixed(1),
          weight: (totals.weight / count).toFixed(1),
          bloodSugar: Math.round(totals.bloodSugar / count),
          oxygenSaturation: Math.round(totals.oxygenSaturation / count),
          recordCount: count
        };
      }
    });

    res.json({
      success: true,
      data: weeklyReport
    });

  } catch (error) {
    console.error('❌ Generate weekly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly health report',
      error: error.message
    });
  }
};

// Generate monthly health report
const generateMonthlyReport = async (req, res) => {
  try {
    const { elderId, year, month } = req.query;
    const reportYear = year ? parseInt(year) : new Date().getFullYear();
    const reportMonth = month ? parseInt(month) - 1 : new Date().getMonth(); // Month is 0-based in Date

    const monthStart = new Date(reportYear, reportMonth, 1);
    const monthEnd = new Date(reportYear, reportMonth + 1, 1);

    let whereClause = {
      monitoringDate: {
        [Op.gte]: monthStart,
        [Op.lt]: monthEnd
      }
    };

    // If user is an elder, only show their own data
    if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    } else if (elderId) {
      whereClause.elderId = elderId;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    // Group by week and calculate weekly averages
    const weeklyData = {};
    healthRecords.forEach(record => {
      const weekStart = new Date(record.monitoringDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekKey = `${weekStart.toISOString().split('T')[0]}_${weekEnd.toISOString().split('T')[0]}`;
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekStart: weekStart,
          weekEnd: weekEnd,
          records: []
        };
      }
      weeklyData[weekKey].records.push(record);
    });

    const monthlyReport = {
      year: reportYear,
      month: reportMonth + 1, // Convert back to 1-based month
      totalRecords: healthRecords.length,
      weeklyAverages: {},
      alerts: []
    };

    // Calculate weekly averages
    Object.keys(weeklyData).forEach(week => {
      const weekRecords = weeklyData[week].records;
      if (weekRecords.length > 0) {
        const totals = weekRecords.reduce((acc, record) => {
          if (record.bloodPressureSystolic) acc.systolic += record.bloodPressureSystolic;
          if (record.bloodPressureDiastolic) acc.diastolic += record.bloodPressureDiastolic;
          if (record.heartRate) acc.heartRate += record.heartRate;
          if (record.temperature) acc.temperature += record.temperature;
          if (record.weight) acc.weight += record.weight;
          if (record.bloodSugar) acc.bloodSugar += record.bloodSugar;
          if (record.oxygenSaturation) acc.oxygenSaturation += record.oxygenSaturation;
          
          // Check for alerts
          if (record.alertLevel && record.alertLevel !== 'normal') {
            acc.alerts.push({
              level: record.alertLevel,
              time: record.monitoringDate,
              notes: record.notes
            });
          }
          
          return acc;
        }, {
          systolic: 0,
          diastolic: 0,
          heartRate: 0,
          temperature: 0,
          weight: 0,
          bloodSugar: 0,
          oxygenSaturation: 0,
          alerts: []
        });

        const count = weekRecords.length;
        monthlyReport.weeklyAverages[week] = {
          bloodPressure: `${Math.round(totals.systolic / count)}/${Math.round(totals.diastolic / count)}`,
          heartRate: Math.round(totals.heartRate / count),
          temperature: (totals.temperature / count).toFixed(1),
          weight: (totals.weight / count).toFixed(1),
          bloodSugar: Math.round(totals.bloodSugar / count),
          oxygenSaturation: Math.round(totals.oxygenSaturation / count),
          recordCount: count
        };
        
        monthlyReport.alerts = [...monthlyReport.alerts, ...totals.alerts];
      }
    });

    res.json({
      success: true,
      data: monthlyReport
    });

  } catch (error) {
    console.error('❌ Generate monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly health report',
      error: error.message
    });
  }
};

// Generate custom date range health report
const generateCustomReport = async (req, res) => {
  try {
    const { elderId, startDate, endDate } = req.query;
    const reportStartDate = startDate ? new Date(startDate) : new Date();
    const reportEndDate = endDate ? new Date(endDate) : new Date();
    reportStartDate.setHours(0, 0, 0, 0);
    reportEndDate.setHours(23, 59, 59, 999);

    let whereClause = {
      monitoringDate: {
        [Op.gte]: reportStartDate,
        [Op.lte]: reportEndDate
      }
    };

    // If user is an elder, only show their own data
    if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    } else if (elderId) {
      whereClause.elderId = elderId;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        totalRecords: healthRecords.length,
        records: healthRecords
      }
    });

  } catch (error) {
    console.error('❌ Generate custom report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate custom health report',
      error: error.message
    });
  }
};

// Get elder health summary
const getElderHealthSummary = async (req, res) => {
  try {
    const elderId = req.params.elderId;
    
    // Check access
    const hasAccess = await checkElderAccess(req, elderId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const healthRecords = await HealthMonitoring.findAll({
      where: { elderId },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    // Calculate summary
    const summary = {
      totalRecords: healthRecords.length,
      latestRecord: healthRecords[0] ? healthRecords[0].monitoringDate : null,
      alerts: []
    };

    if (healthRecords.length > 0) {
      const latest = healthRecords[0];
      summary.latestRecord = latest.monitoringDate;
      
      // Check for alerts
      if (latest.alertLevel && latest.alertLevel !== 'normal') {
        summary.alerts.push({
          level: latest.alertLevel,
          time: latest.monitoringDate,
          notes: latest.notes
        });
      }
    }

    res.json({
      success: true,
      data: {
        summary,
        records: healthRecords
      }
    });

  } catch (error) {
    console.error('❌ Get elder health summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get elder health summary',
      error: error.message
    });
  }
};

// Export health report to PDF
const exportHealthReportPDF = async (req, res) => {
  try {
    const { elderId, startDate, endDate } = req.query;
    
    // Generate report data
    const reportData = await generateCustomReportData(elderId, startDate, endDate);
    
    if (!reportData || reportData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found for PDF report'
      });
    }
    
    // PDF generation logic here...
    // Using a library like pdfkit or similar to create PDF document
    // Stream the PDF file as response
    
  } catch (error) {
    console.error('❌ Export health report to PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export health report to PDF',
      error: error.message
    });
  }
};

// Export health report to CSV
const exportHealthReportCSV = async (req, res) => {
  try {
    const { elderId, startDate, endDate } = req.query;
    
    // Generate report data
    const reportData = await generateCustomReportData(elderId, startDate, endDate);
    
    if (!reportData || reportData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found for CSV report'
      });
    }
    
    // CSV generation logic here...
    // Convert reportData to CSV format
    // Send CSV file as response
    
  } catch (error) {
    console.error('❌ Export health report to CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export health report to CSV',
      error: error.message
    });
  }
};

// Helper function to generate custom report data
const generateCustomReportData = async (elderId, startDate, endDate) => {
  const reportStartDate = startDate ? new Date(startDate) : new Date();
  const reportEndDate = endDate ? new Date(endDate) : new Date();
  reportStartDate.setHours(0, 0, 0, 0);
  reportEndDate.setHours(23, 59, 59, 999);

  let whereClause = {
    monitoringDate: {
      [Op.gte]: reportStartDate,
      [Op.lte]: reportEndDate
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
        attributes: ['id', 'firstName', 'lastName', 'userId'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email']
          }
        ]
      }
    ],
    order: [['monitoringDate', 'DESC']]
  });

  return healthRecords;
};

module.exports = {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  generateCustomReport,
  getElderHealthSummary,
  exportHealthReportPDF,
  exportHealthReportCSV
};