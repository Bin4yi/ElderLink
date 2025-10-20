// Script to reset passwords that were double-hashed
const bcrypt = require("bcryptjs");
const { User } = require("../models");
require("dotenv").config();

async function fixDoubleHashedPasswords() {
  try {
    console.log("🔧 Starting password fix script...\n");

    // Check if database is connected
    const sequelize = require("../config/database");
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Find the user
    const email = "dr.maria.rodriguez@elderlink.com";
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("❌ User not found:", email);
      process.exit(1);
    }

    console.log("✅ Found user:", email);
    console.log(
      "Current password hash:",
      user.password.substring(0, 20) + "...\n"
    );

    // Set a new temporary password
    const tempPassword = "NewPass123!";
    console.log("🔑 Setting new temporary password:", tempPassword);
    console.log("⚠️  Please change this password after logging in!\n");

    // Update the password (this will be properly hashed by the beforeUpdate hook)
    user.password = tempPassword;
    await user.save();

    console.log("✅ Password updated successfully!");
    console.log("New password hash:", user.password.substring(0, 20) + "...\n");

    // Verify the password works
    const isValid = await user.comparePassword(tempPassword);
    console.log(
      "🔍 Password verification:",
      isValid ? "✅ VALID" : "❌ INVALID"
    );

    if (isValid) {
      console.log("\n✅ SUCCESS! You can now login with:");
      console.log("   Email:", email);
      console.log("   Password:", tempPassword);
      console.log(
        "\n⚠️  IMPORTANT: Change this password immediately after logging in!"
      );
    } else {
      console.log(
        "\n❌ FAILED! Password still not working. Manual intervention needed."
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing passwords:", error);
    process.exit(1);
  }
}

fixDoubleHashedPasswords();
