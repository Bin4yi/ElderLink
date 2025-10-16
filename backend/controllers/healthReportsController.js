const { HealthMonitoring, Elder, User, StaffAssignment } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

// Helper function to get assigned elder IDs for staff
const getAssignedElderIds = async (staffUserId) => {
  const assignments = await StaffAssignment.findAll({
    where: {
      staffId: staffUserId,
      isActive: true
    },
    attributes: ['elderId']
  });
  return assignments.map(a => a.elderId);
};

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

    // If user is staff, only show assigned elders' data
    if (req.user.role === 'staff') {
      const assignedElderIds = await getAssignedElderIds(req.user.id);
      if (assignedElderIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No assigned elders found',
          data: {
            date: reportDate.toISOString().split('T')[0],
            summary: {
              totalRecords: 0,
              totalElders: 0,
              criticalAlerts: 0,
              warningAlerts: 0
            },
            statistics: {},
            trends: {}
          }
        });
      }
      whereClause.elderId = { [Op.in]: assignedElderIds };
      
      // If specific elder requested, verify they're assigned
      if (elderId && !assignedElderIds.includes(elderId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this elder\'s data'
        });
      }
      if (elderId) {
        whereClause.elderId = elderId;
      }
    }
    // If user is an elder, only show their own data
    else if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    } 
    // Admin can see all, or filter by elderId
    else if (elderId) {
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

    // Get unique elder count
    const uniqueElders = [...new Set(healthRecords.map(r => r.elderId))];

    // Calculate statistics
    const statistics = {};
    const vitalTypes = [
      { field: 'heartRate', name: 'heartRate' },
      { field: 'temperature', name: 'temperature' },
      { field: 'bloodPressureSystolic', name: 'bloodPressureSystolic' },
      { field: 'bloodPressureDiastolic', name: 'bloodPressureDiastolic' },
      { field: 'weight', name: 'weight' },
      { field: 'oxygenSaturation', name: 'oxygenSaturation' }
    ];

    vitalTypes.forEach(vital => {
      const validRecords = healthRecords.filter(r => r[vital.field] != null);
      if (validRecords.length > 0) {
        const values = validRecords.map(r => parseFloat(r[vital.field]));
        statistics[vital.name] = {
          average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
          min: Math.min(...values).toFixed(1),
          max: Math.max(...values).toFixed(1),
          count: values.length
        };
      }
    });

    // Calculate trends per elder
    const trends = {};
    uniqueElders.forEach(elderId => {
      const elderRecords = healthRecords.filter(r => r.elderId === elderId);
      const elder = elderRecords[0]?.elder;
      
      if (elder) {
        const criticalAlerts = elderRecords.filter(r => r.alertLevel === 'critical').length;
        const warningAlerts = elderRecords.filter(r => r.alertLevel === 'high' || r.alertLevel === 'warning').length;
        
        trends[elderId] = {
          elderName: `${elder.firstName} ${elder.lastName}`,
          recordCount: elderRecords.length,
          alertDistribution: {
            critical: criticalAlerts,
            warning: warningAlerts,
            normal: elderRecords.length - criticalAlerts - warningAlerts
          }
        };
      }
    });

    // Calculate summary
    const criticalCount = healthRecords.filter(r => r.alertLevel === 'critical').length;
    const warningCount = healthRecords.filter(r => r.alertLevel === 'high' || r.alertLevel === 'warning').length;

    const summary = {
      totalRecords: healthRecords.length,
      totalElders: uniqueElders.length,
      criticalAlerts: criticalCount,
      warningAlerts: warningCount
    };

    res.json({
      success: true,
      data: {
        summary,
        statistics,
        trends
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
    const { elderId, startDate, endDate } = req.query;
    const weekStart = startDate ? new Date(startDate) : new Date();
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = endDate ? new Date(endDate) : new Date(weekStart);
    if (!endDate) {
      weekEnd.setDate(weekStart.getDate() + 7);
    }
    weekEnd.setHours(23, 59, 59, 999);

    let whereClause = {
      monitoringDate: {
        [Op.gte]: weekStart,
        [Op.lte]: weekEnd
      }
    };

    // If user is staff, only show assigned elders' data
    if (req.user.role === 'staff') {
      const assignedElderIds = await getAssignedElderIds(req.user.id);
      if (assignedElderIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No assigned elders found',
          data: {
            period: `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`,
            summary: {
              totalRecords: 0,
              totalElders: 0,
              criticalAlerts: 0,
              warningAlerts: 0
            },
            statistics: {},
            trends: {}
          }
        });
      }
      whereClause.elderId = { [Op.in]: assignedElderIds };
      
      // If specific elder requested, verify they're assigned
      if (elderId && !assignedElderIds.includes(elderId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this elder\'s data'
        });
      }
      if (elderId) {
        whereClause.elderId = elderId;
      }
    }
    // If user is an elder, only show their own data
    else if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    }
    // Admin can see all, or filter by elderId
    else if (elderId) {
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

    // Get unique elder count
    const uniqueElders = [...new Set(healthRecords.map(r => r.elderId))];

    // Calculate statistics
    const statistics = {};
    const vitalTypes = [
      { field: 'heartRate', name: 'heartRate' },
      { field: 'temperature', name: 'temperature' },
      { field: 'bloodPressureSystolic', name: 'bloodPressureSystolic' },
      { field: 'bloodPressureDiastolic', name: 'bloodPressureDiastolic' },
      { field: 'weight', name: 'weight' },
      { field: 'oxygenSaturation', name: 'oxygenSaturation' }
    ];

    vitalTypes.forEach(vital => {
      const validRecords = healthRecords.filter(r => r[vital.field] != null);
      if (validRecords.length > 0) {
        const values = validRecords.map(r => parseFloat(r[vital.field]));
        statistics[vital.name] = {
          average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
          min: Math.min(...values).toFixed(1),
          max: Math.max(...values).toFixed(1),
          count: values.length
        };
      }
    });

    // Calculate trends per elder (same as daily report)
    const trends = {};
    uniqueElders.forEach(elderId => {
      const elderRecords = healthRecords.filter(r => r.elderId === elderId);
      const elder = elderRecords[0]?.elder;
      
      if (elder) {
        const criticalAlerts = elderRecords.filter(r => r.alertLevel === 'critical').length;
        const warningAlerts = elderRecords.filter(r => r.alertLevel === 'high' || r.alertLevel === 'warning').length;
        
        trends[elderId] = {
          elderName: `${elder.firstName} ${elder.lastName}`,
          recordCount: elderRecords.length,
          alertDistribution: {
            critical: criticalAlerts,
            warning: warningAlerts,
            normal: elderRecords.length - criticalAlerts - warningAlerts
          }
        };
      }
    });

    // Calculate summary
    const criticalCount = healthRecords.filter(r => r.alertLevel === 'critical').length;
    const warningCount = healthRecords.filter(r => r.alertLevel === 'high' || r.alertLevel === 'warning').length;

    const summary = {
      totalRecords: healthRecords.length,
      totalElders: uniqueElders.length,
      criticalAlerts: criticalCount,
      warningAlerts: warningCount
    };

    res.json({
      success: true,
      data: {
        summary,
        statistics,
        trends
      }
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

    // If user is staff, only show assigned elders' data
    if (req.user.role === 'staff') {
      const assignedElderIds = await getAssignedElderIds(req.user.id);
      if (assignedElderIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No assigned elders found',
          data: {
            month: reportMonth + 1,
            year: reportYear,
            summary: {
              totalRecords: 0,
              totalElders: 0,
              criticalAlerts: 0,
              warningAlerts: 0
            },
            statistics: {},
            trends: {},
            weeklyBreakdown: []
          }
        });
      }
      whereClause.elderId = { [Op.in]: assignedElderIds };
      
      // If specific elder requested, verify they're assigned
      if (elderId && !assignedElderIds.includes(elderId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this elder\'s data'
        });
      }
      if (elderId) {
        whereClause.elderId = elderId;
      }
    }
    // If user is an elder, only show their own data
    else if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    }
    // Admin can see all, or filter by elderId
    else if (elderId) {
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

    // Get unique elder count
    const uniqueElders = [...new Set(healthRecords.map(r => r.elderId))];

    // Calculate statistics
    const statistics = {};
    const vitalTypes = [
      { field: 'heartRate', name: 'heartRate' },
      { field: 'temperature', name: 'temperature' },
      { field: 'bloodPressureSystolic', name: 'bloodPressureSystolic' },
      { field: 'bloodPressureDiastolic', name: 'bloodPressureDiastolic' },
      { field: 'weight', name: 'weight' },
      { field: 'oxygenSaturation', name: 'oxygenSaturation' }
    ];

    vitalTypes.forEach(vital => {
      const validRecords = healthRecords.filter(r => r[vital.field] != null);
      if (validRecords.length > 0) {
        const values = validRecords.map(r => parseFloat(r[vital.field]));
        statistics[vital.name] = {
          average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
          min: Math.min(...values).toFixed(1),
          max: Math.max(...values).toFixed(1),
          count: values.length
        };
      }
    });

    // Calculate trends per elder
    const trends = {};
    uniqueElders.forEach(elderId => {
      const elderRecords = healthRecords.filter(r => r.elderId === elderId);
      const elder = elderRecords[0]?.elder;
      
      if (elder) {
        const criticalAlerts = elderRecords.filter(r => r.alertLevel === 'critical').length;
        const warningAlerts = elderRecords.filter(r => r.alertLevel === 'high' || r.alertLevel === 'warning').length;
        
        trends[elderId] = {
          elderName: `${elder.firstName} ${elder.lastName}`,
          recordCount: elderRecords.length,
          alertDistribution: {
            critical: criticalAlerts,
            warning: warningAlerts,
            normal: elderRecords.length - criticalAlerts - warningAlerts
          }
        };
      }
    });

    // Group by week for weekly breakdown
    const weeklyData = {};
    healthRecords.forEach(record => {
      const recordDate = new Date(record.monitoringDate);
      const weekStart = new Date(recordDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekKey = `${weekStart.toISOString().split('T')[0]}_${weekEnd.toISOString().split('T')[0]}`;
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(record);
    });

    const weeklyBreakdown = [];
    Object.keys(weeklyData).sort().forEach((weekKey, index) => {
      const weekRecords = weeklyData[weekKey];
      const [weekStartStr, weekEndStr] = weekKey.split('_');
      const criticalCount = weekRecords.filter(r => r.alertLevel === 'critical').length;
      const warningCount = weekRecords.filter(r => r.alertLevel === 'high' || r.alertLevel === 'warning').length;
      
      weeklyBreakdown.push({
        week: `Week ${index + 1}`,
        period: `${weekStartStr} to ${weekEndStr}`,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        recordCount: weekRecords.length,
        criticalAlerts: criticalCount,
        warningAlerts: warningCount
      });
    });

    // Calculate summary
    const criticalCount = healthRecords.filter(r => r.alertLevel === 'critical').length;
    const warningCount = healthRecords.filter(r => r.alertLevel === 'high' || r.alertLevel === 'warning').length;

    const summary = {
      totalRecords: healthRecords.length,
      totalElders: uniqueElders.length,
      criticalAlerts: criticalCount,
      warningAlerts: warningCount
    };

    res.json({
      success: true,
      data: {
        summary,
        statistics,
        trends,
        weeklyBreakdown
      }
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
    const { date, startDate, endDate, year, month, elderId } = req.query;
    
    // Determine report type from the URL path
    let reportType = 'custom';
    let reportData = null;
    let reportTitle = 'Health Report';

    if (req.path.includes('/daily/pdf')) {
      reportType = 'daily';
      reportTitle = `Daily Health Report - ${date || new Date().toISOString().split('T')[0]}`;
      
      // Generate daily report data
      const whereClause = {
        monitoringDate: {
          [Op.gte]: new Date(date || new Date()),
          [Op.lt]: new Date(new Date(date || new Date()).setDate(new Date(date || new Date()).getDate() + 1))
        }
      };
      if (elderId) whereClause.elderId = elderId;
      
      // Apply staff access control
      if (req.user.role === 'staff') {
        const assignedElderIds = await getAssignedElderIds(req.user.id);
        whereClause.elderId = { [Op.in]: assignedElderIds };
      }
      
      reportData = await HealthMonitoring.findAll({
        where: whereClause,
        include: [{ model: Elder, as: 'elder', attributes: ['id', 'firstName', 'lastName'] }],
        order: [['monitoringDate', 'DESC']]
      });

    } else if (req.path.includes('/weekly/pdf')) {
      reportType = 'weekly';
      const weekStart = new Date(startDate || new Date());
      const weekEnd = new Date(endDate || new Date(weekStart).setDate(weekStart.getDate() + 7));
      reportTitle = `Weekly Health Report - ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`;
      
      const whereClause = {
        monitoringDate: {
          [Op.gte]: weekStart,
          [Op.lte]: weekEnd
        }
      };
      if (elderId) whereClause.elderId = elderId;
      
      // Apply staff access control
      if (req.user.role === 'staff') {
        const assignedElderIds = await getAssignedElderIds(req.user.id);
        whereClause.elderId = { [Op.in]: assignedElderIds };
      }
      
      reportData = await HealthMonitoring.findAll({
        where: whereClause,
        include: [{ model: Elder, as: 'elder', attributes: ['id', 'firstName', 'lastName'] }],
        order: [['monitoringDate', 'DESC']]
      });

    } else if (req.path.includes('/monthly/pdf')) {
      reportType = 'monthly';
      const reportYear = year || new Date().getFullYear();
      const reportMonth = month ? parseInt(month) - 1 : new Date().getMonth();
      const monthStart = new Date(reportYear, reportMonth, 1);
      const monthEnd = new Date(reportYear, reportMonth + 1, 1);
      reportTitle = `Monthly Health Report - ${reportYear}-${String(reportMonth + 1).padStart(2, '0')}`;
      
      const whereClause = {
        monitoringDate: {
          [Op.gte]: monthStart,
          [Op.lt]: monthEnd
        }
      };
      if (elderId) whereClause.elderId = elderId;
      
      // Apply staff access control
      if (req.user.role === 'staff') {
        const assignedElderIds = await getAssignedElderIds(req.user.id);
        whereClause.elderId = { [Op.in]: assignedElderIds };
      }
      
      reportData = await HealthMonitoring.findAll({
        where: whereClause,
        include: [{ model: Elder, as: 'elder', attributes: ['id', 'firstName', 'lastName'] }],
        order: [['monitoringDate', 'DESC']]
      });
    }

    console.log(`📄 Generating ${reportType} PDF with ${reportData?.length || 0} records...`);

    if (!reportData || reportData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found for PDF report'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=health-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Add header
    doc.fontSize(20).font('Helvetica-Bold').text(reportTitle, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Add summary statistics
    const uniqueElders = [...new Set(reportData.map(r => r.elderId))];
    const criticalAlerts = reportData.filter(r => r.alertLevel === 'critical').length;
    const warningAlerts = reportData.filter(r => r.alertLevel === 'high' || r.alertLevel === 'warning').length;

    doc.fontSize(14).font('Helvetica-Bold').text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Records: ${reportData.length}`);
    doc.text(`Total Elders: ${uniqueElders.length}`);
    doc.text(`Critical Alerts: ${criticalAlerts}`, { color: 'red' });
    doc.text(`Warning Alerts: ${warningAlerts}`, { color: 'orange' });
    doc.moveDown(2);

    // Add vital statistics averages
    const heartRates = reportData.filter(r => r.heartRate).map(r => r.heartRate);
    const temperatures = reportData.filter(r => r.temperature).map(r => r.temperature);
    const systolic = reportData.filter(r => r.bloodPressureSystolic).map(r => r.bloodPressureSystolic);
    const diastolic = reportData.filter(r => r.bloodPressureDiastolic).map(r => r.bloodPressureDiastolic);
    const o2Sats = reportData.filter(r => r.oxygenSaturation).map(r => r.oxygenSaturation);

    doc.fontSize(14).font('Helvetica-Bold').text('Vital Statistics', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    if (heartRates.length > 0) {
      const avg = (heartRates.reduce((a, b) => a + b, 0) / heartRates.length).toFixed(1);
      doc.text(`Heart Rate: Avg ${avg} bpm (Min: ${Math.min(...heartRates)}, Max: ${Math.max(...heartRates)})`);
    }
    
    if (temperatures.length > 0) {
      const avg = (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1);
      doc.text(`Temperature: Avg ${avg}°F (Min: ${Math.min(...temperatures).toFixed(1)}, Max: ${Math.max(...temperatures).toFixed(1)})`);
    }
    
    if (systolic.length > 0 && diastolic.length > 0) {
      const avgSys = (systolic.reduce((a, b) => a + b, 0) / systolic.length).toFixed(0);
      const avgDia = (diastolic.reduce((a, b) => a + b, 0) / diastolic.length).toFixed(0);
      doc.text(`Blood Pressure: Avg ${avgSys}/${avgDia} mmHg`);
    }
    
    if (o2Sats.length > 0) {
      const avg = (o2Sats.reduce((a, b) => a + b, 0) / o2Sats.length).toFixed(1);
      doc.text(`Oxygen Saturation: Avg ${avg}% (Min: ${Math.min(...o2Sats)}, Max: ${Math.max(...o2Sats)})`);
    }
    
    doc.moveDown(2);

    // Add detailed records table
    doc.fontSize(14).font('Helvetica-Bold').text('Detailed Records', { underline: true });
    doc.moveDown(1);

    // Group records by elder
    const recordsByElder = {};
    reportData.forEach(record => {
      const elderName = `${record.elder.firstName} ${record.elder.lastName}`;
      if (!recordsByElder[elderName]) {
        recordsByElder[elderName] = [];
      }
      recordsByElder[elderName].push(record);
    });

    // Print records for each elder
    Object.keys(recordsByElder).forEach(elderName => {
      const elderRecords = recordsByElder[elderName];
      
      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
      }
      
      doc.fontSize(12).font('Helvetica-Bold').text(elderName, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica');
      
      elderRecords.forEach((record, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }
        
        const date = new Date(record.monitoringDate).toLocaleString();
        doc.text(`${index + 1}. ${date}`, { continued: false });
        
        if (record.heartRate) doc.text(`   HR: ${record.heartRate} bpm`, { indent: 20 });
        if (record.temperature) doc.text(`   Temp: ${record.temperature}°F`, { indent: 20 });
        if (record.bloodPressureSystolic && record.bloodPressureDiastolic) {
          doc.text(`   BP: ${record.bloodPressureSystolic}/${record.bloodPressureDiastolic} mmHg`, { indent: 20 });
        }
        if (record.oxygenSaturation) doc.text(`   O2: ${record.oxygenSaturation}%`, { indent: 20 });
        if (record.weight) doc.text(`   Weight: ${record.weight} lbs`, { indent: 20 });
        if (record.bloodSugar) doc.text(`   Blood Sugar: ${record.bloodSugar} mg/dL`, { indent: 20 });
        
        if (record.alertLevel && record.alertLevel !== 'normal') {
          doc.fillColor('red').text(`   ⚠️ Alert Level: ${record.alertLevel.toUpperCase()}`, { indent: 20 });
          doc.fillColor('black');
        }
        
        if (record.notes) {
          doc.text(`   Notes: ${record.notes}`, { indent: 20 });
        }
        
        doc.moveDown(0.5);
      });
      
      doc.moveDown(1);
    });

    // Finalize the PDF and send to client
    doc.end();
    
    console.log(`✅ PDF generated successfully for ${reportType} report`);
    
  } catch (error) {
    console.error('❌ Export health report to PDF error:', error);
    
    // Make sure to end the response properly
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to export health report to PDF',
        error: error.message
      });
    }
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