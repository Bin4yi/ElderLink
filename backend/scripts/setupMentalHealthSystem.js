// backend/scripts/setupMentalHealthSystem.js (UPDATE THIS FILE)
const sequelize = require("../config/database");
const {
  User,
  Elder,
  MentalHealthAssignment,
  TherapySession,
  MentalHealthAssessment,
  TreatmentPlan,
  TreatmentPlanProgress,
  ProgressReport,
  GroupTherapySession,
  MentalHealthResource,
} = require("../models");

const setupMentalHealthSystem = async () => {
  try {
    console.log("🧠 Starting Mental Health System Setup...\n");

    // Step 1: Sync database with force to drop existing tables (BE CAREFUL!)
    console.log("📊 Step 1: Creating database tables...");
    await sequelize.sync({ alter: true });
    console.log("✅ Database tables created successfully!\n");

    // Step 2: Verify Mental Health Specialists exist
    console.log("👥 Step 2: Verifying Mental Health Specialists...");
    const specialists = await User.findAll({
      where: { role: "mental_health_consultant" },
    });

    if (specialists.length === 0) {
      console.log("⚠️  No mental health specialists found!");
      console.log(
        "📝 Please run: node backend/scripts/updateUserRolesForMentalHealth.js"
      );
      console.log("   to create mental health consultant users first.\n");
    } else {
      console.log(`✅ Found ${specialists.length} Mental Health Specialists:`);
      specialists.forEach((specialist) => {
        console.log(
          `   • ${specialist.firstName} ${specialist.lastName} (${specialist.email})`
        );
      });
      console.log("");
    }

    // Step 3: Create sample data (optional)
    const createSampleData = process.argv.includes("--sample-data");

    if (createSampleData) {
      console.log("📝 Step 3: Creating sample data...\n");
      await createSampleMentalHealthData();
    } else {
      console.log("ℹ️  Step 3: Skipping sample data creation");
      console.log("   Run with --sample-data flag to create sample data\n");
    }

    // Step 4: Verify tables
    console.log("🔍 Step 4: Verifying all tables...");
    const tables = await sequelize.getQueryInterface().showAllTables();

    const mentalHealthTables = [
      "mental_health_assignments",
      "therapy_sessions",
      "mental_health_assessments",
      "treatment_plans",
      "treatment_plan_progress",
      "progress_reports",
      "group_therapy_sessions",
      "mental_health_resources",
    ];

    console.log("\n📋 Mental Health System Tables:");
    mentalHealthTables.forEach((table) => {
      const exists = tables.includes(table);
      console.log(`   ${exists ? "✅" : "❌"} ${table}`);
    });

    console.log("\n🎉 Mental Health System Setup Complete!");
    console.log("\n📚 Next Steps:");
    console.log("   1. Ensure mental health specialists are created");
    console.log("   2. Start the server: npm start");
    console.log("   3. Test the API endpoints");
    console.log("   4. Integrate with frontend\n");
  } catch (error) {
    console.error("❌ Error setting up Mental Health System:", error);
    throw error;
  }
};

// Function to create sample data
const createSampleMentalHealthData = async () => {
  try {
    // Get a specialist and elder for sample data
    const specialist = await User.findOne({
      where: { role: "mental_health_consultant" },
    });

    const familyMember = await User.findOne({
      where: { role: "family_member" },
    });

    const elder = await Elder.findOne();

    if (!specialist || !familyMember || !elder) {
      console.log("⚠️  Insufficient data to create samples");
      console.log(
        `   Found: ${specialist ? "✅" : "❌"} specialist, ${
          familyMember ? "✅" : "❌"
        } family member, ${elder ? "✅" : "❌"} elder`
      );
      console.log("   Need: 1 specialist, 1 family member, 1 elder\n");
      return;
    }

    console.log("Creating sample Mental Health Assignment...");
    const assignment = await MentalHealthAssignment.create({
      elderId: elder.id,
      specialistId: specialist.id,
      familyMemberId: familyMember.id,
      assignmentType: "primary",
      status: "active",
      sessionFee: 150.0,
      priority: "medium",
      notes: "Initial assignment for mental health support",
    });
    console.log("✅ Sample assignment created");

    console.log("Creating sample Therapy Session...");
    await TherapySession.create({
      elderId: elder.id,
      specialistId: specialist.id,
      sessionType: "individual",
      therapyType: "Cognitive Behavioral Therapy",
      status: "scheduled",
      sessionNumber: 1,
      isFirstSession: true,
      scheduledDate: new Date(),
      scheduledTime: "10:00:00",
      duration: 60,
      location: "video_call",
      sessionGoals: ["Initial assessment", "Establish rapport"],
      emergencyContact: {
        name: "John Doe",
        phone: "+1234567890",
        relationship: "Son",
      },
    });
    console.log("✅ Sample therapy session created");

    console.log("Creating sample Assessment...");
    await MentalHealthAssessment.create({
      elderId: elder.id,
      specialistId: specialist.id,
      assessmentType: "Initial Mental Health Evaluation",
      status: "scheduled",
      priority: "high",
      scheduledDate: new Date(),
      duration: 60,
      riskLevel: "low",
    });
    console.log("✅ Sample assessment created");

    console.log("Creating sample Treatment Plan...");
    await TreatmentPlan.create({
      elderId: elder.id,
      specialistId: specialist.id,
      planTitle: "Anxiety Management Treatment Plan",
      status: "active",
      priority: "medium",
      startDate: new Date(),
      progress: 0,
      primaryDiagnosis: "Generalized Anxiety Disorder",
      goals: [
        {
          id: 1,
          description: "Reduce anxiety symptoms by 50%",
          status: "in_progress",
          targetDate: "2025-03-01",
          progress: 0,
        },
      ],
      interventions: [
        "Cognitive Behavioral Therapy - 2x weekly",
        "Mindfulness exercises - daily",
      ],
    });
    console.log("✅ Sample treatment plan created");

    console.log("Creating sample Resource...");
    await MentalHealthResource.create({
      title: "Cognitive Behavioral Therapy Workbook",
      category: "workbook",
      description: "Comprehensive workbook for CBT techniques",
      resourceType: "PDF Document",
      fileSize: "2.5 MB",
      tags: ["CBT", "Anxiety", "Depression"],
      targetAudience: "Clients with anxiety and depression",
      difficulty: "Beginner",
      estimatedTime: "2-3 weeks",
      author: specialist.firstName + " " + specialist.lastName,
      rating: 4.8,
      featured: true,
      uploadedBy: specialist.id,
    });
    console.log("✅ Sample resource created");

    console.log("\n✅ All sample data created successfully!\n");
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
    console.error("Error details:", error.message);
  }
};

// Run the setup
if (require.main === module) {
  setupMentalHealthSystem()
    .then(() => {
      console.log("✨ Setup completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = setupMentalHealthSystem;
