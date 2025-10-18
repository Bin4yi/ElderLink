// backend/scripts/createMentalHealthTables.js
const sequelize = require("../config/database");
const { User } = require("../models");
const {
  MentalHealthProfile,
  MentalHealthSpecialist,
  MentalHealthSession,
} = require("../models");

const createMentalHealthTables = async () => {
  try {
    console.log("🧠 Creating Mental Health tables...");

    // Create tables
    await sequelize.sync({ alter: true });

    console.log("✅ Mental Health tables created successfully!");

    // Create some sample data
    await createSampleData();

    console.log("✅ Sample mental health data created!");
  } catch (error) {
    console.error("❌ Error creating Mental Health tables:", error);
    throw error;
  }
};

const createSampleData = async () => {
  try {
    console.log("🔄 Creating sample mental health data...");

    // Create specialist profiles for existing mental health consultants
    const consultants = await User.findAll({
      where: { role: "mental_health_consultant" },
    });

    for (const consultant of consultants) {
      const existingSpecialist = await MentalHealthSpecialist.findOne({
        where: { userId: consultant.id },
      });

      if (!existingSpecialist) {
        await MentalHealthSpecialist.create({
          userId: consultant.id,
          biography: `Dr. ${consultant.firstName} ${consultant.lastName} is a licensed mental health professional with extensive experience in ${consultant.specialization}.`,
          education: "Ph.D. in Clinical Psychology",
          certifications:
            "Licensed Clinical Psychologist, Certified Geriatric Specialist",
          specialties: [
            consultant.specialization,
            "Elderly Care",
            "Family Therapy",
          ],
          languages: ["English", "Spanish"],
          yearsOfExperience: Math.floor(Math.random() * 20) + 5,
          approachToTherapy:
            "I believe in a collaborative approach that combines evidence-based practices with compassionate care.",
          treatmentMethods: [
            "Cognitive Behavioral Therapy",
            "Mindfulness-Based Therapy",
            "Solution-Focused Therapy",
          ],
          consultationRate: 150.0,
          acceptingNewClients: true,
          preferredCommunication: "all",
          isVerified: true,
          verificationDate: new Date(),
        });

        console.log(
          `✅ Created specialist profile for ${consultant.firstName} ${consultant.lastName}`
        );
      }
    }

    // Create sample mental health profiles for some users
    const familyMembers = await User.findAll({
      where: { role: "family_member" },
      limit: 3,
    });

    for (const user of familyMembers) {
      const existingProfile = await MentalHealthProfile.findOne({
        where: { userId: user.id },
      });

      if (!existingProfile) {
        await MentalHealthProfile.create({
          userId: user.id,
          currentMood: "fair",
          stressLevel: Math.floor(Math.random() * 5) + 3,
          anxietyLevel: Math.floor(Math.random() * 5) + 2,
          depressionLevel: Math.floor(Math.random() * 4) + 1,
          sleepQuality: "fair",
          exerciseFrequency: "weekly",
          socialSupport: "moderate",
          selfHarmRisk: "low",
          treatmentGoals: "Improve stress management and overall well-being",
          assignedConsultantId: consultants[0]?.id,
          lastAssessmentDate: new Date(),
          isActive: true,
        });

        console.log(
          `✅ Created mental health profile for ${user.firstName} ${user.lastName}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
    throw error;
  }
};

// Run the script
if (require.main === module) {
  createMentalHealthTables()
    .then(() => {
      console.log("🎉 Mental Health system setup completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = createMentalHealthTables;
