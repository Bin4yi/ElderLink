// backend/routes/mentalHealthProfileRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getSpecialistProfile,
  updateSpecialistProfile,
  updateProfileImage,
  changePassword,
  getProfileStatistics,
} = require("../controllers/mentalHealthProfileController");

// Profile operations
router.get("/", authenticate, getSpecialistProfile);
router.get("/statistics", authenticate, getProfileStatistics);
router.put("/", authenticate, updateSpecialistProfile);
router.put("/image", authenticate, updateProfileImage);
router.put("/password", authenticate, changePassword);

module.exports = router;
