// backend/scripts/completeCleanup.js
const sequelize = require('../config/database');

const completeCleanup = async () => {
  try {
    console.log('🔄 Running complete database cleanup...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Drop all inventory-related tables, indexes, and constraints
    console.log('🗑️ Dropping all inventory-related objects...');
    
    // Drop tables in reverse dependency order
    await sequelize.query('DROP TABLE IF EXISTS "prescription_items" CASCADE;');
    console.log('✅ Dropped prescription_items table');
    
    await sequelize.query('DROP TABLE IF EXISTS "inventory_transactions" CASCADE;');
    console.log('✅ Dropped inventory_transactions table');
    
    await sequelize.query('DROP TABLE IF EXISTS "prescriptions" CASCADE;');
    console.log('✅ Dropped prescriptions table');
    
    await sequelize.query('DROP TABLE IF EXISTS "inventories" CASCADE;');
    console.log('✅ Dropped inventories table');
    
    await sequelize.query('DROP TABLE IF EXISTS "inventory" CASCADE;');
    console.log('✅ Dropped inventory table (if existed)');
    
    // Drop any remaining indexes that might exist
    console.log('🗑️ Dropping any remaining indexes...');
    const indexesToDrop = [
      'inventories_name',
      'inventories_pharmacy_id', 
      'inventories_category',
      'inventories_expiration_date',
      'inventories_status',
      'inventory_transactions_inventory_id',
      'inventory_transactions_type',
      'inventory_transactions_created_at',
      'prescriptions_prescription_number',
      'prescriptions_doctor_id',
      'prescriptions_elder_id',
      'prescriptions_pharmacy_id',
      'prescriptions_status',
      'prescription_items_prescription_id',
      'prescription_items_inventory_id',
      'prescription_items_status'
    ];
    
    for (const indexName of indexesToDrop) {
      try {
        await sequelize.query(`DROP INDEX IF EXISTS "${indexName}";`);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (err) {
        // Index might not exist, ignore error
        console.log(`⚠️ Index ${indexName} doesn't exist or already dropped`);
      }
    }
    
    // Drop any remaining ENUMs
    console.log('🗑️ Dropping ENUM types...');
    const enumsToDrop = [
      'enum_inventories_category',
      'enum_inventories_unit',
      'enum_inventories_status',
      'enum_inventory_transactions_type',
      'enum_prescriptions_status',
      'enum_prescriptions_priority',
      'enum_prescription_items_status'
    ];
    
    for (const enumName of enumsToDrop) {
      try {
        await sequelize.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE;`);
        console.log(`✅ Dropped ENUM: ${enumName}`);
      } catch (err) {
        console.log(`⚠️ ENUM ${enumName} doesn't exist or already dropped`);
      }
    }
    
    console.log('🎉 Complete cleanup finished!');
    
    // Now create the tables fresh
    console.log('📝 Creating fresh inventory tables...');
    
    // Ensure UUID extension
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ UUID extension ensured');
    
    // Import models and sync them individually
    const { User, Elder, Subscription } = require('../models');
    
    // Make sure base models exist first
    await User.sync({ alter: true });
    await Elder.sync({ alter: true });
    await Subscription.sync({ alter: true });
    console.log('✅ Base models verified');
    
    // Import and sync inventory models one by one
    const Inventory = require('../models/Inventory');
    await Inventory.sync({ force: false });
    console.log('✅ Inventory table created');
    
    const InventoryTransaction = require('../models/InventoryTransaction');
    await InventoryTransaction.sync({ force: false });
    console.log('✅ InventoryTransaction table created');
    
    const Prescription = require('../models/Prescription');
    await Prescription.sync({ force: false });
    console.log('✅ Prescription table created');
    
    const PrescriptionItem = require('../models/PrescriptionItem');
    await PrescriptionItem.sync({ force: false });
    console.log('✅ PrescriptionItem table created');
    
    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('inventories', 'inventory_transactions', 'prescriptions', 'prescription_items');",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('📋 Successfully created tables:', tables.map(t => t.table_name));
    
    if (tables.length === 4) {
      console.log('🎉 All inventory tables created successfully!');
    } else {
      console.log('⚠️ Some tables may not have been created properly');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Complete cleanup failed:', error);
    console.error('Error message:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
    process.exit(1);
  }
};

completeCleanup();