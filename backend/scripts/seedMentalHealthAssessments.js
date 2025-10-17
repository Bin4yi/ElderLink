// backend/scripts/seedMentalHealthAssessments.js
const {
  sequelize,
  User,
  Elder,
  StaffAssignment,
  MentalHealthAssessment,
} = require("../models");

async function seedMentalHealthAssessments() {
  try {
    console.log("🌱 Starting Mental Health Assessments seed...");

    // Find the mental health specialist
    const specialist = await User.findOne({
      where: { role: "mental_health_consultant" },
    });

    if (!specialist) {
      console.error("❌ Mental health specialist not found!");
      console.log("Please run seedTreatmentPlanData.js first to create the specialist.");
      return;
    }

    console.log(`✅ Found specialist: ${specialist.firstName} ${specialist.lastName}`);

    // Find staff user
    const staff = await User.findOne({
      where: { role: "staff" },
    });

    if (!staff) {
      console.error("❌ Staff user not found!");
      console.log("Please create a staff user first.");
      return;
    }

    console.log(`✅ Found staff: ${staff.firstName} ${staff.lastName}`);

    // Get all active staff assignments to find assigned elders
    const staffAssignments = await StaffAssignment.findAll({
      where: {
        staffId: staff.id,
        isActive: true,
      },
      include: [{ model: Elder, as: "elder" }],
    });

    if (staffAssignments.length === 0) {
      console.error("❌ No active staff assignments found!");
      console.log("Please assign elders to staff first.");
      return;
    }

    console.log(`✅ Found ${staffAssignments.length} assigned elders`);

    // Assessment templates with different types and statuses
    const assessmentTemplates = [
      {
        assessmentType: "Cognitive Function Assessment",
        recommendations: "Comprehensive evaluation of cognitive abilities including memory, attention, and problem-solving skills.",
        priority: "high",
        statusOptions: ["scheduled", "not_started", "started", "in_progress"],
      },
      {
        assessmentType: "Depression Screening (PHQ-9)",
        recommendations: "Standardized depression screening to assess mood changes and emotional well-being.",
        priority: "medium",
        statusOptions: ["scheduled", "started", "in_progress"],
      },
      {
        assessmentType: "Anxiety Assessment (GAD-7)",
        recommendations: "Assessment of anxiety levels and identification of anxiety-related symptoms and triggers.",
        priority: "medium",
        statusOptions: ["not_started", "started", "in_progress"],
      },
      {
        assessmentType: "Memory and Recall Evaluation",
        recommendations: "Detailed evaluation of short-term and long-term memory function and recall abilities.",
        priority: "high",
        statusOptions: ["in_progress", "completed"],
      },
      {
        assessmentType: "Social Interaction Assessment",
        recommendations: "Assessment of social engagement, communication skills, and interpersonal relationships.",
        priority: "low",
        statusOptions: ["scheduled", "not_started"],
      },
      {
        assessmentType: "Behavioral Observation",
        recommendations: "Ongoing monitoring of behavioral patterns and identification of any concerning changes.",
        priority: "critical",
        statusOptions: ["urgent", "started", "in_progress"],
      },
    ];

    let createdCount = 0;
    const today = new Date();

    // Create assessments for each assigned elder
    for (const assignment of staffAssignments) {
      const elder = assignment.elder;
      console.log(`\n📋 Creating assessments for Elder: ${elder.firstName} ${elder.lastName}`);

      // Create 2-3 random assessments per elder
      const numAssessments = Math.floor(Math.random() * 2) + 2; // 2 or 3 assessments
      const selectedTemplates = shuffleArray([...assessmentTemplates]).slice(0, numAssessments);

      for (let i = 0; i < selectedTemplates.length; i++) {
        const template = selectedTemplates[i];
        
        // Random status from template options
        const status = template.statusOptions[Math.floor(Math.random() * template.statusOptions.length)];
        
        // Calculate scheduled date (some past, some future)
        const daysOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
        const scheduledDate = new Date(today);
        scheduledDate.setDate(scheduledDate.getDate() + daysOffset);

        // Set completed date if status is completed
        let completedDate = null;
        let findings = null;
        
        if (status === "completed") {
          completedDate = new Date(scheduledDate);
          completedDate.setHours(completedDate.getHours() + 2); // Completed 2 hours after scheduled
          findings = "Assessment completed successfully. Elder showed good cooperation and engagement throughout the evaluation.";
        } else if (status === "in_progress") {
          findings = `[${new Date().toISOString()}] Staff: Assessment started. Initial observations recorded.`;
        } else if (status === "started") {
          findings = `[${new Date().toISOString()}] Staff: Assessment began with elder consent obtained.`;
        }

        const assessmentData = {
          elderId: elder.id,
          specialistId: specialist.id,
          assessmentType: template.assessmentType,
          scheduledDate: scheduledDate,
          completedDate: completedDate,
          findings: findings,
          recommendations: template.recommendations,
          status: status,
          priority: template.priority, // Use the priority from template (low, medium, high, urgent)
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await MentalHealthAssessment.create(assessmentData);
        createdCount++;
        console.log(`  ✓ Created: ${template.assessmentType} (Status: ${status})`);
      }
    }

    console.log(`\n✅ Successfully created ${createdCount} mental health assessments!`);
    console.log("\n📊 Summary:");
    
    // Show count by status
    const statuses = ["scheduled", "not_started", "started", "in_progress", "completed", "urgent"];
    for (const status of statuses) {
      const count = await MentalHealthAssessment.count({ where: { status } });
      if (count > 0) {
        console.log(`  ${status.replace('_', ' ').toUpperCase()}: ${count}`);
      }
    }

  } catch (error) {
    console.error("❌ Error seeding mental health assessments:", error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Run the seed function
seedMentalHealthAssessments();
