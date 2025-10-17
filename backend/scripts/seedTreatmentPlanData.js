// backend/scripts/seedTreatmentPlanData.js
const {
  sequelize,
  User,
  Elder,
  TreatmentPlan,
  TreatmentPlanProgress,
  StaffAssignment,
  MentalHealthAssignment,
  Subscription,
} = require("../models");

async function seedTreatmentPlanData() {
  try {
    console.log("🌱 Starting to seed treatment plan data...\n");

    // Step 0: Get or create a default subscription
    console.log("0️⃣ Finding existing subscription...");
    let defaultSubscription = await Subscription.findOne({
      where: { status: "active" },
    });

    if (!defaultSubscription) {
      // Create a test user for the subscription
      const testUser = await User.findOne({ where: { email: "test@elderlink.com" } }) ||
        await User.create({
          email: "test@elderlink.com",
          password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
          firstName: "Test",
          lastName: "User",
          role: "family",
        });

      defaultSubscription = await Subscription.create({
        userId: testUser.id,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        plan: "basic",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        amount: 0,
        duration: "1_month",
        autoRenew: true,
      });
      console.log(`   ✅ Created default subscription`);
    } else {
      console.log(`   ✅ Found existing subscription`);
    }

    // Step 1: Find or create a mental health specialist
    console.log("\n1️⃣ Finding/Creating mental health specialist...");
    let specialist = await User.findOne({
      where: { role: "mental_health_consultant" },
    });

    if (!specialist) {
      specialist = await User.create({
        email: "specialist@elderlink.com",
        password: "$2b$10$abcdefghijklmnopqrstuvwxyz", // hashed 'password123'
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        role: "mental_health_consultant",
        specialization: "Geriatric Psychiatry",
        phone: "555-0101",
        isActive: true,
      });
      console.log(`   ✅ Created specialist: ${specialist.firstName} ${specialist.lastName}`);
    } else {
      console.log(`   ✅ Found specialist: ${specialist.firstName} ${specialist.lastName}`);
    }

    // Step 2: Find or create a staff member (caregiver)
    console.log("\n2️⃣ Finding/Creating staff member...");
    let staff = await User.findOne({
      where: { role: "staff" },
    });

    if (!staff) {
      staff = await User.create({
        email: "staff@elderlink.com",
        password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
        firstName: "John",
        lastName: "Caregiver",
        role: "staff",
        phone: "555-0102",
        isActive: true,
      });
      console.log(`   ✅ Created staff: ${staff.firstName} ${staff.lastName}`);
    } else {
      console.log(`   ✅ Found staff: ${staff.firstName} ${staff.lastName}`);
    }

    // Step 3: Find or create elders
    console.log("\n3️⃣ Finding/Creating elders...");
    const elderData = [
      {
        firstName: "Margaret",
        lastName: "Thompson",
        dateOfBirth: "1945-03-15",
        gender: "female",
        medicalHistory: "Mild Cognitive Impairment",
        address: "123 Oak Street, Springfield, IL",
        phone: "555-0101",
        emergencyContact: JSON.stringify({
          name: "Jane Thompson",
          relationship: "Daughter",
          phone: "555-0102"
        }),
        subscriptionId: defaultSubscription.id,
      },
      {
        firstName: "Robert",
        lastName: "Johnson",
        dateOfBirth: "1942-07-22",
        gender: "male",
        medicalHistory: "Depression, Anxiety",
        address: "456 Elm Avenue, Springfield, IL",
        phone: "555-0201",
        emergencyContact: JSON.stringify({
          name: "Michael Johnson",
          relationship: "Son",
          phone: "555-0202"
        }),
        subscriptionId: defaultSubscription.id,
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        dateOfBirth: "1948-11-08",
        gender: "female",
        medicalHistory: "Anxiety Disorder",
        address: "789 Pine Road, Springfield, IL",
        phone: "555-0301",
        emergencyContact: JSON.stringify({
          name: "David Williams",
          relationship: "Husband",
          phone: "555-0302"
        }),
        subscriptionId: defaultSubscription.id,
      },
    ];

    const elders = [];
    for (const data of elderData) {
      let elder = await Elder.findOne({
        where: { firstName: data.firstName, lastName: data.lastName },
      });

      if (!elder) {
        elder = await Elder.create(data);
        console.log(`   ✅ Created elder: ${elder.firstName} ${elder.lastName}`);
      } else {
        console.log(`   ✅ Found elder: ${elder.firstName} ${elder.lastName}`);
      }
      elders.push(elder);
    }

    // Step 4: Create staff assignments
    console.log("\n4️⃣ Creating staff assignments...");
    for (const elder of elders) {
      const existingAssignment = await StaffAssignment.findOne({
        where: {
          elderId: elder.id,
          staffId: staff.id,
        },
      });

      if (!existingAssignment) {
        await StaffAssignment.create({
          elderId: elder.id,
          staffId: staff.id,
          isActive: true,
          assignedDate: new Date(),
          assignedBy: specialist.id, // Mental health specialist assigns the staff
        });
        console.log(`   ✅ Assigned ${elder.firstName} ${elder.lastName} to ${staff.firstName} ${staff.lastName}`);
      } else {
        console.log(`   ℹ️  Assignment already exists for ${elder.firstName} ${elder.lastName}`);
      }
    }

    // Step 5: Create mental health assignments
    console.log("\n5️⃣ Creating mental health assignments...");
    for (const elder of elders) {
      const existingAssignment = await MentalHealthAssignment.findOne({
        where: {
          elderId: elder.id,
          specialistId: specialist.id,
        },
      });

      if (!existingAssignment) {
        // Create or find a family member for the assignment
        let familyMember = await User.findOne({ where: { role: "family_member" } });
        if (!familyMember) {
          familyMember = await User.create({
            email: "family@elderlink.com",
            password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
            firstName: "Family",
            lastName: "Member",
            role: "family_member",
          });
        }

        await MentalHealthAssignment.create({
          elderId: elder.id,
          specialistId: specialist.id,
          familyMemberId: familyMember.id,
          status: "active",
          assignedDate: new Date(),
          reason: "Cognitive health monitoring and support",
        });
        console.log(`   ✅ Assigned ${elder.firstName} ${elder.lastName} to specialist`);
      } else {
        console.log(`   ℹ️  Mental health assignment already exists for ${elder.firstName}`);
      }
    }

    // Step 6: Create treatment plans
    console.log("\n6️⃣ Creating treatment plans...");
    const treatmentPlanData = [
      {
        elderId: elders[0].id,
        specialistId: specialist.id,
        planTitle: "Cognitive Function Enhancement Program",
        status: "active",
        priority: "high",
        startDate: "2025-10-01",
        endDate: "2026-01-01",
        progress: 0,
        primaryDiagnosis: "Mild Cognitive Impairment",
        secondaryDiagnosis: "Age-related Memory Decline",
        goals: [
          {
            id: 1,
            description: "Improve short-term memory recall by 30%",
            status: "in_progress",
            targetDate: "2025-12-01",
            progress: 40,
          },
          {
            id: 2,
            description: "Complete daily cognitive exercises",
            status: "in_progress",
            targetDate: "2026-01-01",
            progress: 60,
          },
        ],
        interventions: [
          "Daily memory exercises",
          "Cognitive stimulation therapy twice weekly",
          "Social engagement activities",
        ],
        nextReview: "2025-11-15",
      },
      {
        elderId: elders[1].id,
        specialistId: specialist.id,
        planTitle: "Depression Management & Support Plan",
        status: "active",
        priority: "medium",
        startDate: "2025-10-05",
        endDate: "2026-02-05",
        progress: 0,
        primaryDiagnosis: "Major Depressive Disorder",
        secondaryDiagnosis: "Generalized Anxiety Disorder",
        goals: [
          {
            id: 1,
            description: "Reduce depressive symptoms by 50%",
            status: "in_progress",
            targetDate: "2025-12-05",
            progress: 25,
          },
        ],
        interventions: [
          "Individual therapy sessions",
          "Group support activities",
          "Physical activity program",
        ],
        nextReview: "2025-11-20",
      },
      {
        elderId: elders[2].id,
        specialistId: specialist.id,
        planTitle: "Anxiety Reduction Therapy",
        status: "active",
        priority: "medium",
        startDate: "2025-10-10",
        endDate: "2025-12-10",
        progress: 0,
        primaryDiagnosis: "Generalized Anxiety Disorder",
        goals: [
          {
            id: 1,
            description: "Reduce anxiety episodes by 60%",
            status: "in_progress",
            targetDate: "2025-11-30",
            progress: 50,
          },
        ],
        interventions: [
          "Mindfulness meditation",
          "Breathing exercises",
          "Relaxation therapy",
        ],
        nextReview: "2025-11-10",
      },
    ];

    const treatmentPlans = [];
    for (const data of treatmentPlanData) {
      const existingPlan = await TreatmentPlan.findOne({
        where: {
          elderId: data.elderId,
          planTitle: data.planTitle,
        },
      });

      if (!existingPlan) {
        const plan = await TreatmentPlan.create(data);
        treatmentPlans.push(plan);
        const elder = elders.find((e) => e.id === data.elderId);
        console.log(`   ✅ Created plan: "${plan.planTitle}" for ${elder.firstName} ${elder.lastName}`);
      } else {
        treatmentPlans.push(existingPlan);
        console.log(`   ℹ️  Plan already exists: "${data.planTitle}"`);
      }
    }

    // Step 7: Create some sample progress reports
    console.log("\n7️⃣ Creating sample progress reports...");
    if (treatmentPlans.length > 0) {
      const sampleReports = [
        {
          treatmentPlanId: treatmentPlans[0].id,
          caregiverId: staff.id,
          progressPercentage: 40,
          notes: "Patient showing good engagement in memory exercises. Completed all daily tasks.",
          reportDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
        {
          treatmentPlanId: treatmentPlans[0].id,
          caregiverId: staff.id,
          progressPercentage: 55,
          notes: "Noticeable improvement in recall abilities. Patient is more confident.",
          reportDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          treatmentPlanId: treatmentPlans[1].id,
          caregiverId: staff.id,
          progressPercentage: 30,
          notes: "Patient attended group therapy sessions. Some improvement in mood.",
          reportDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      ];

      for (const report of sampleReports) {
        const existing = await TreatmentPlanProgress.findOne({
          where: {
            treatmentPlanId: report.treatmentPlanId,
            caregiverId: report.caregiverId,
            progressPercentage: report.progressPercentage,
          },
        });

        if (!existing) {
          await TreatmentPlanProgress.create(report);
          const plan = treatmentPlans.find((p) => p.id === report.treatmentPlanId);
          console.log(`   ✅ Created progress report for: "${plan.planTitle}"`);
        } else {
          console.log(`   ℹ️  Progress report already exists`);
        }
      }

      // Update treatment plan progress based on reports
      for (const plan of treatmentPlans) {
        const reports = await TreatmentPlanProgress.findAll({
          where: { treatmentPlanId: plan.id },
        });

        if (reports.length > 0) {
          const avgProgress = Math.round(
            reports.reduce((sum, r) => sum + r.progressPercentage, 0) / reports.length
          );
          plan.progress = avgProgress;
          await plan.save();
          console.log(`   📊 Updated "${plan.planTitle}" progress to ${avgProgress}%`);
        }
      }
    }

    console.log("\n✨ Treatment plan data seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - Specialist: ${specialist.email}`);
    console.log(`   - Staff: ${staff.email}`);
    console.log(`   - Elders: ${elders.length}`);
    console.log(`   - Treatment Plans: ${treatmentPlans.length}`);
    console.log(`   - Staff Assignments: ${elders.length}`);
    console.log(`   - Mental Health Assignments: ${elders.length}`);
    console.log("\n💡 Tip: Use these credentials to test:");
    console.log(`   Staff login: staff@elderlink.com / password123`);
    console.log(`   Specialist login: specialist@elderlink.com / password123`);

  } catch (error) {
    console.error("❌ Error seeding treatment plan data:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedTreatmentPlanData()
    .then(() => {
      console.log("\n✅ Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedTreatmentPlanData };
