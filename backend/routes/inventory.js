// backend/routes/inventory.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');

// Inventory management routes
router.get('/', authenticate, authorize(['pharmacist', 'admin', 'doctor']), inventoryController.getInventoryItems);
router.get('/stats', authenticate, authorize(['pharmacist', 'admin']), inventoryController.getInventoryStats);
router.get('/low-stock', authenticate, authorize(['pharmacist', 'admin']), inventoryController.getLowStockItems);
router.get('/expiring', authenticate, authorize(['pharmacist', 'admin']), inventoryController.getExpiringItems);
router.get('/report', authenticate, authorize(['pharmacist', 'admin']), inventoryController.generateInventoryReport);
router.get('/:id', authenticate, authorize(['pharmacist', 'admin']), inventoryController.getInventoryItem);
router.post('/', authenticate, authorize(['pharmacist', 'admin']), inventoryController.createInventoryItem);
router.put('/:id', authenticate, authorize(['pharmacist', 'admin']), inventoryController.updateInventoryItem);
router.delete('/:id', authenticate, authorize(['pharmacist', 'admin']), inventoryController.deleteInventoryItem);

module.exports = router;