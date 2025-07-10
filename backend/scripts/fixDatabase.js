// backend/scripts/fixDatabase.js
const sequelize = require('../config/database');
const { User } = require('../models');

const fixDatabase = async () => {
  try {
    console.log('🔧 Fixing database schema...');
    
    // First, let's check what columns exist in the Users table
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Current columns in Users table:');
    results.forEach(row => console.log(`  - ${row.column_name}`));
    
    // Check current data issues
    console.log('\n🔍 Checking data issues...');
    
    const [dataCheck] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "firstName" IS NULL OR "firstName" = '' THEN 1 END) as null_firstName,
        COUNT(CASE WHEN "lastName" IS NULL OR "lastName" = '' THEN 1 END) as null_lastName,
        COUNT(CASE WHEN "email" IS NULL OR "email" = '' THEN 1 END) as null_email,
        COUNT(CASE WHEN "password" IS NULL OR "password" = '' THEN 1 END) as null_password,
        COUNT(CASE WHEN "phone" IS NULL OR "phone" = '' THEN 1 END) as null_phone,
        COUNT(CASE WHEN "role" IS NULL OR "role" = '' THEN 1 END) as null_role
      FROM "Users";
    `);
    
    console.log('📊 Data issues found:');
    console.log(`  Total users: ${dataCheck[0].total}`);
    console.log(`  NULL firstName: ${dataCheck[0].null_firstName}`);
    console.log(`  NULL lastName: ${dataCheck[0].null_lastName}`);
    console.log(`  NULL email: ${dataCheck[0].null_email}`);
    console.log(`  NULL password: ${dataCheck[0].null_password}`);
    console.log(`  NULL phone: ${dataCheck[0].null_phone}`);
    console.log(`  NULL role: ${dataCheck[0].null_role}`);
    
    // FIXED: Handle role enum issue - do this FIRST before other fields
    console.log('\n🔧 Fixing role enum values...');
    
    // Show current role values
    const [roleValues] = await sequelize.query(`
      SELECT DISTINCT "role", COUNT(*) as count
      FROM "Users" 
      GROUP BY "role"
      ORDER BY count DESC;
    `);
    
    console.log('📊 Current role values:');
    roleValues.forEach(row => {
      console.log(`  - "${row.role}" (${row.count} users)`);
    });
    
    // Fix empty string roles to NULL first, then to valid enum value
    await sequelize.query(`
      UPDATE "Users" 
      SET "role" = NULL 
      WHERE "role" = '';
    `);
    
    console.log('✅ Empty string roles converted to NULL');
    
    // Now update NULL roles to valid enum value
    await sequelize.query(`
      UPDATE "Users" 
      SET "role" = 'family_member' 
      WHERE "role" IS NULL;
    `);
    
    console.log('✅ NULL roles fixed');
    
    // FIXED: Handle other NULL values
    console.log('🔧 Fixing other NULL values...');
    
    // Fix firstName
    await sequelize.query(`
      UPDATE "Users" 
      SET "firstName" = 'Unknown' 
      WHERE "firstName" IS NULL OR "firstName" = '';
    `);
    
    // Fix lastName
    await sequelize.query(`
      UPDATE "Users" 
      SET "lastName" = 'User' 
      WHERE "lastName" IS NULL OR "lastName" = '';
    `);
    
    // Fix email (if any are NULL)
    await sequelize.query(`
      UPDATE "Users" 
      SET "email" = CONCAT('user_', id, '@example.com') 
      WHERE "email" IS NULL OR "email" = '';
    `);
    
    // Fix password (if any are NULL)
    await sequelize.query(`
      UPDATE "Users" 
      SET "password" = '$2a$12$defaulthashfortemporarypassword' 
      WHERE "password" IS NULL OR "password" = '';
    `);
    
    // Fix phone (if any are NULL)
    await sequelize.query(`
      UPDATE "Users" 
      SET "phone" = '+1234567890' 
      WHERE "phone" IS NULL OR "phone" = '';
    `);
    
    // Fix isActive (if any are NULL)
    await sequelize.query(`
      UPDATE "Users" 
      SET "isActive" = true 
      WHERE "isActive" IS NULL;
    `);
    
    console.log('✅ All NULL values fixed');
    
    // Final data integrity check
    const [finalCheck] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT("firstName") as has_firstName,
        COUNT("lastName") as has_lastName,
        COUNT("email") as has_email,
        COUNT("password") as has_password,
        COUNT("phone") as has_phone,
        COUNT("role") as has_role
      FROM "Users";
    `);
    
    console.log('\n📊 Final data integrity check:');
    console.log(`  Total users: ${finalCheck[0].total}`);
    console.log(`  Has firstName: ${finalCheck[0].has_firstName}`);
    console.log(`  Has lastName: ${finalCheck[0].has_lastName}`);
    console.log(`  Has email: ${finalCheck[0].has_email}`);
    console.log(`  Has password: ${finalCheck[0].has_password}`);
    console.log(`  Has phone: ${finalCheck[0].has_phone}`);
    console.log(`  Has role: ${finalCheck[0].has_role}`);
    
    // Show final role distribution
    const [finalRoles] = await sequelize.query(`
      SELECT DISTINCT "role", COUNT(*) as count
      FROM "Users" 
      GROUP BY "role"
      ORDER BY count DESC;
    `);
    
    console.log('\n📊 Final role distribution:');
    finalRoles.forEach(row => {
      console.log(`  - ${row.role}: ${row.count} users`);
    });
    
    // Now sync the database models - use alter: true to be safer
    console.log('\n🔄 Synchronizing database schema...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized');
    
    // Test by finding users
    const users = await User.findAll();
    console.log(`✅ Found ${users.length} users in database`);
    
    // Show user details
    if (users.length > 0) {
      console.log('\n👤 Users in database:');
      users.forEach(user => {
        console.log(`  📧 ${user.email} (${user.role}) - ${user.firstName} ${user.lastName} - Created: ${user.createdAt}`);
      });
    }
    
    // Test specific user
    const testUser = await User.findOne({ where: { email: 'pasansanjiiwa2022@gmail.com' } });
    if (testUser) {
      console.log('\n🎯 Test user verification:');
      console.log(`📧 Email: ${testUser.email}`);
      console.log(`👤 Name: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`📱 Role: ${testUser.role}`);
      console.log(`✅ Active: ${testUser.isActive}`);
      
      // Test password
      const isValidPassword = await testUser.comparePassword('12345678');
      console.log(`🔐 Password test: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    console.log('\n🎉 Database fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    console.error('Full error details:', error.message);
    
    // Show what step failed
    if (error.sql) {
      console.error('Failed SQL:', error.sql);
    }
  } finally {
    process.exit(0);
  }
};

fixDatabase();
