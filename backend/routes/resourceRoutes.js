// backend/routes/resourceRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  incrementDownloadCount,
  rateResource,
  getResourceStatistics,
} = require("../controllers/resourceController");

// CRUD operations
router.post("/", authenticate, createResource);
router.get("/", authenticate, getAllResources);
router.get("/statistics", authenticate, getResourceStatistics);
router.get("/:resourceId", authenticate, getResourceById);
router.put("/:resourceId", authenticate, updateResource);
router.delete("/:resourceId", authenticate, deleteResource);

// Resource actions
router.post("/:resourceId/download", authenticate, incrementDownloadCount);
router.post("/:resourceId/rate", authenticate, rateResource);

module.exports = router;
