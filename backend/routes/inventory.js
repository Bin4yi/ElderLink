const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// ✅ Use correct exported function names
router.get('/', inventoryController.getAllItems);
router.post('/', inventoryController.createItem);
router.get('/:id', inventoryController.getItemById);
router.put('/:id', inventoryController.updateItem); // Add if needed
router.delete('/:id', inventoryController.deleteItem);

module.exports = router;

