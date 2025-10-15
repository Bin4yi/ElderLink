// backend/scripts/syncInventoryDatabase.js - Fixed version
const sequelize = require('../config/database');

async function syncInventoryDatabase() {
  try {
    console.log('🔄 Syncing inventory database...');
    
    // First, sync all models in the correct dependency order
    // Start with models that don't have foreign key dependencies
    
    // 1. Users table (no dependencies)
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ UUID extension ensured');
    
    const { User } = require('../models');
    await User.sync({ alter: true });
    console.log('✅ User table synced');
    
    // 2. Subscription table (depends on User)
    const { Subscription } = require('../models');
    await Subscription.sync({ alter: true });
    console.log('✅ Subscription table synced');
    
    // 3. Elder table (depends on User and Subscription)
    const { Elder } = require('../models');
    await Elder.sync({ alter: true });
    console.log('✅ Elder table synced');
    
    // 4. Doctor table (depends on User)
    const { Doctor } = require('../models');
    await Doctor.sync({ alter: true });
    console.log('✅ Doctor table synced');
    
    // 5. Inventory table (depends on User)
    const { Inventory } = require('../models');
    await Inventory.sync({ alter: true });
    console.log('✅ Inventory table synced');
    
    // 6. InventoryTransaction table (depends on Inventory and User)
    const { InventoryTransaction } = require('../models');
    await InventoryTransaction.sync({ alter: true });
    console.log('✅ InventoryTransaction table synced');
    
    // 7. Prescription table (depends on User and Elder)
    const { Prescription } = require('../models');
    await Prescription.sync({ alter: true });
    console.log('✅ Prescription table synced');
    
    // 8. PrescriptionItem table (depends on Prescription and Inventory)
    const { PrescriptionItem } = require('../models');
    await PrescriptionItem.sync({ alter: true });
    console.log('✅ PrescriptionItem table synced');
    
    // 9. Other existing tables
    const { HealthMonitoring, Notification, StaffAssignment, DoctorAssignment, 
            Appointment, ConsultationRecord, DoctorSchedule } = require('../models');
    
    await HealthMonitoring.sync({ alter: true });
    console.log('✅ HealthMonitoring table synced');
    
    await Notification.sync({ alter: true });
    console.log('✅ Notification table synced');
    
    await StaffAssignment.sync({ alter: true });
    console.log('✅ StaffAssignment table synced');
    
    await DoctorAssignment.sync({ alter: true });
    console.log('✅ DoctorAssignment table synced');
    
    await Appointment.sync({ alter: true });
    console.log('✅ Appointment table synced');
    
    await DoctorSchedule.sync({ alter: true });
    console.log('✅ DoctorSchedule table synced');
    
    await ConsultationRecord.sync({ alter: true });
    console.log('✅ ConsultationRecord table synced');
    
    console.log('🎉 All inventory database tables synced successfully!');
    
    // Create sample data if requested
    const createSampleData = process.argv.includes('--sample-data');
    if (createSampleData) {
      await createSampleInventoryData();
    }
    
  } catch (error) {
    console.error('❌ Inventory database sync failed:', error);
    console.error('Full error:', error.message);
  } finally {
    await sequelize.close();
  }
}

async function createSampleInventoryData() {
  try {
    console.log('🔄 Creating sample inventory data...');
    
    const bcrypt = require('bcryptjs');
    const { User, Inventory, InventoryTransaction } = require('../models');
    
    // Find or create a pharmacist user
    let pharmacist = await User.findOne({ where: { role: 'pharmacist' } });
    
    if (!pharmacist) {
      console.log('📝 Creating sample pharmacist user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      pharmacist = await User.create({
        firstName: 'John',
        lastName: 'Pharmacist',
        email: 'pharmacist@example.com',
        password: hashedPassword,
        role: 'pharmacist',
        phoneNumber: '+1-555-0123',
        isVerified: true
      });
      console.log('✅ Sample pharmacist created');
    }

    // Check if sample data already exists
    const existingItems = await Inventory.count({ where: { pharmacyId: pharmacist.id } });
    if (existingItems > 0) {
      console.log('📋 Sample inventory data already exists, skipping...');
      return;
    }

    // Sample inventory items
    const sampleItems = [
      {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        brand: 'Tylenol',
        category: 'tablet',
        strength: '500mg',
        quantity: 500,
        unit: 'pieces',
        costPrice: 0.05,
        sellingPrice: 0.12,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        batchNumber: 'PAR2024001',
        manufacturer: 'PharmaCorp',
        location: 'A1-01',
        minStockLevel: 50,
        prescriptionRequired: false,
        description: 'Pain reliever and fever reducer',
        dosageInstructions: 'Take 1-2 tablets every 4-6 hours as needed',
        storageConditions: 'Store at room temperature'
      },
      {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        brand: 'Amoxil',
        category: 'capsule',
        strength: '250mg',
        quantity: 200,
        unit: 'pieces',
        costPrice: 0.15,
        sellingPrice: 0.35,
        expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        batchNumber: 'AMX2024001',
        manufacturer: 'AntibioPharm',
        location: 'A2-03',
        minStockLevel: 30,
        prescriptionRequired: true,
        description: 'Antibiotic for bacterial infections',
        dosageInstructions: 'Take as prescribed by physician',
        sideEffects: 'May cause nausea, diarrhea, or allergic reactions',
        storageConditions: 'Store in cool, dry place'
      },
      {
        name: 'Cough Syrup',
        genericName: 'Dextromethorphan',
        brand: 'CoughAway',
        category: 'syrup',
        strength: '15mg/5ml',
        quantity: 50,
        unit: 'bottles',
        costPrice: 3.50,
        sellingPrice: 7.99,
        expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        batchNumber: 'CSY2024001',
        manufacturer: 'CoughCure Ltd',
        location: 'B1-05',
        minStockLevel: 10,
        prescriptionRequired: false,
        description: 'Cough suppressant syrup',
        dosageInstructions: '10ml every 4 hours as needed',
        storageConditions: 'Refrigerate after opening'
      },
      {
        name: 'Insulin Injection',
        genericName: 'Human Insulin',
        brand: 'NovoLog',
        category: 'injection',
        strength: '100 units/ml',
        quantity: 25,
        unit: 'vials',
        costPrice: 25.00,
        sellingPrice: 45.00,
        expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        batchNumber: 'INS2024001',
        manufacturer: 'DiabetesCare Inc',
        location: 'C1-01',
        minStockLevel: 5,
        prescriptionRequired: true,
        description: 'Fast-acting insulin for diabetes management',
        dosageInstructions: 'Inject as prescribed by physician',
        storageConditions: 'Keep refrigerated at 2-8°C'
      },
      {
        name: 'Vitamin D3',
        genericName: 'Cholecalciferol',
        brand: 'VitaBoost',
        category: 'tablet',
        strength: '1000 IU',
        quantity: 300,
        unit: 'pieces',
        costPrice: 0.08,
        sellingPrice: 0.20,
        expirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
        batchNumber: 'VTD2024001',
        manufacturer: 'VitaminWorks',
        location: 'A3-02',
        minStockLevel: 25,
        prescriptionRequired: false,
        description: 'Vitamin D supplement for bone health',
        dosageInstructions: 'Take 1 tablet daily with food',
        storageConditions: 'Store in cool, dry place away from light'
      }
    ];

    // Create inventory items
    for (const itemData of sampleItems) {
      const item = await Inventory.create({
        ...itemData,
        pharmacyId: pharmacist.id,
        createdBy: pharmacist.id
      });

      // Create initial stock transaction
      await InventoryTransaction.create({
        inventoryId: item.id,
        type: 'stock_in',
        quantity: itemData.quantity,
        reason: 'Initial stock',
        performedBy: pharmacist.id,
        unitCost: itemData.costPrice,
        totalAmount: itemData.costPrice * itemData.quantity
      });

      console.log(`✅ Created inventory item: ${item.name}`);
    }

    console.log('🎉 Sample inventory data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Run the sync
if (require.main === module) {
  syncInventoryDatabase();
}

module.exports = { syncInventoryDatabase, createSampleInventoryData };