const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Create
router.post('/', inventoryController.createInventoryItem);

// Get all
router.get('/', inventoryController.getAllItems);

// Get one by ID
router.get('/:id', inventoryController.getItemById);

// ✅ Delete by ID
router.delete('/:id', inventoryController.deleteInventoryItem);

router.put('/:id', inventoryController.updateInventoryItem);


router.post('/check-inventory', inventoryController.checkInventoryForPrescription);




module.exports = router;
