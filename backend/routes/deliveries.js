// backend/routes/deliveries.js
const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const deliveryController = require("../controllers/deliveryController");

// Delivery management routes for pharmacist
router.post("/create", authenticate, authorize(["pharmacist"]), deliveryController.createDelivery);
router.get("/", authenticate, authorize(["pharmacist", "admin"]), deliveryController.getDeliveries);
router.get("/stats", authenticate, authorize(["pharmacist", "admin"]), deliveryController.getDeliveryStats);
router.patch("/:id/status", authenticate, authorize(["pharmacist"]), deliveryController.updateDeliveryStatus);

module.exports = router;
