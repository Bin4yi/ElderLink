// backend/controllers/mentalHealthProfileController.js
const { User } = require("../models");
const bcrypt = require("bcryptjs");

// Get specialist profile
const getSpecialistProfile = async (req, res) => {
  try {
    const specialistId = req.user.id;

    const specialist = await User.findByPk(specialistId, {
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "specialization",
        "licenseNumber",
        "experience",
        "profileImage",
        "createdAt",
      ],
    });

    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found" });
    }

    res.status(200).json({ profile: specialist });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update specialist profile
const updateSpecialistProfile = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      specialization,
      experience,
      licenseNumber,
    } = req.body;

    const specialist = await User.findByPk(specialistId);

    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found" });
    }

    // Update allowed fields (email cannot be changed)
    if (firstName) specialist.firstName = firstName;
    if (lastName) specialist.lastName = lastName;
    if (phone) specialist.phone = phone;
    if (specialization) specialist.specialization = specialization;
    if (experience !== undefined) specialist.experience = experience;
    if (licenseNumber) specialist.licenseNumber = licenseNumber;

    await specialist.save();

    // Return updated profile without password
    const updatedProfile = await User.findByPk(specialistId, {
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "specialization",
        "licenseNumber",
        "experience",
        "profileImage",
        "createdAt",
      ],
    });

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Update profile image
const updateProfileImage = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { profileImage } = req.body;

    const specialist = await User.findByPk(specialistId);

    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found" });
    }

    specialist.profileImage = profileImage;
    await specialist.save();

    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: specialist.profileImage,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({
      message: "Error updating profile image",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const specialist = await User.findByPk(specialistId);

    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      specialist.password
    );

    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    specialist.password = hashedPassword;
    specialist.lastPasswordChange = new Date();

    await specialist.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      message: "Error changing password",
      error: error.message,
    });
  }
};

// Get profile statistics
const getProfileStatistics = async (req, res) => {
  try {
    const specialistId = req.user.id;

    const {
      MentalHealthAssignment,
      TherapySession,
      ProgressReport,
    } = require("../models");

    const activeClients = await MentalHealthAssignment.count({
      where: { specialistId, status: "active" },
    });

    const totalSessions = await TherapySession.count({
      where: { specialistId },
    });

    const completedSessions = await TherapySession.count({
      where: { specialistId, status: "completed" },
    });

    const reportsGenerated = await ProgressReport.count({
      where: { specialistId },
    });

    // Get sessions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sessionsThisMonth = await TherapySession.count({
      where: {
        specialistId,
        createdAt: { [Op.gte]: startOfMonth },
      },
    });

    res.status(200).json({
      statistics: {
        activeClients,
        totalSessions,
        completedSessions,
        sessionsThisMonth,
        reportsGenerated,
      },
    });
  } catch (error) {
    console.error("Error fetching profile statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getSpecialistProfile,
  updateSpecialistProfile,
  updateProfileImage,
  changePassword,
  getProfileStatistics,
};
