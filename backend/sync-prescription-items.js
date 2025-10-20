const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const PrescriptionItem = require('./models/PrescriptionItem');

async function syncPrescriptionItems() {
  try {
    console.log('Starting prescription_items table sync...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Get current table structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'prescription_items'
      ORDER BY ordinal_position;
    `);

    console.log('\nCurrent prescription_items columns:');
    results.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // Check if frequency column exists
    const hasFrequency = results.some(col => col.column_name === 'frequency');
    
    if (!hasFrequency) {
      console.log('\n⚠ Missing "frequency" column!');
      console.log('Adding frequency column...');
      
      await sequelize.query(`
        ALTER TABLE prescription_items
        ADD COLUMN frequency VARCHAR(255);
      `);
      
      console.log('✓ Added frequency column');
    } else {
      console.log('\n✓ frequency column already exists');
    }

    // Verify all required columns from the model
    const requiredColumns = [
      'id', 'prescriptionId', 'inventoryId', 'medicationName', 
      'genericName', 'strength', 'dosage', 'frequency',
      'quantityPrescribed', 'quantityDispensed', 'duration',
      'instructions', 'unitPrice', 'totalPrice', 
      'substitutionAllowed', 'status', 'notes',
      'createdAt', 'updatedAt'
    ];

    const missingColumns = requiredColumns.filter(
      col => !results.some(r => r.column_name === col)
    );

    if (missingColumns.length > 0) {
      console.log('\n⚠ Missing columns:', missingColumns.join(', '));
    } else {
      console.log('\n✓ All required columns present');
    }

    // Get final table structure
    const [finalResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'prescription_items'
      ORDER BY ordinal_position;
    `);

    console.log('\nFinal prescription_items structure:');
    finalResults.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    console.log('\n✓ Prescription items table sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing prescription_items:', error);
    process.exit(1);
  }
}

syncPrescriptionItems();
