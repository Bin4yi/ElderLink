// backend/scripts/testHealthData.js
const { HealthMonitoring, User, Elder } = require('../models');

const testHealthData = async () => {
  try {
    console.log('🧪 Testing health monitoring data...');
    
    // Get all health monitoring records
    const allRecords = await HealthMonitoring.findAll({
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });
    
    console.log('✅ Found', allRecords.length, 'health monitoring records');
    
    allRecords.forEach((record, index) => {
      console.log(`📊 Record ${index + 1}:`, {
        id: record.id,
        elderId: record.elderId,
        staffId: record.staffId,
        monitoringDate: record.monitoringDate,
        status: record.status,
        heartRate: record.heartRate,
        notes: record.notes,
        elder: record.elder ? `${record.elder.firstName} ${record.elder.lastName}` : 'No elder data',
        staff: record.staff ? `${record.staff.firstName} ${record.staff.lastName}` : 'No staff data'
      });
    });
    
    // Test specific elder
    const elderId = 'e167e627-b6ad-47d0-b67e-2b30d45f2c77';
    const elderRecords = await HealthMonitoring.findAll({
      where: { elderId },
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });
    
    console.log(`✅ Found ${elderRecords.length} records for elder ${elderId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testHealthData();