const express = require('express');
const router = express.Router();
const { 
  addElder, 
  getElders, 
  getElderById, 
  updateElder, 
  upload 
} = require('../controllers/elderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateElder } = require('../middleware/validation');

// IMPORTANT: Remove validateElder from the route temporarily to test
router.post('/', authenticate, authorize('family_member'), upload.single('photo'), addElder);
router.get('/', authenticate, getElders);
router.get('/:elderId', authenticate, getElderById);
router.put('/:elderId', authenticate, authorize('family_member'), upload.single('photo'), updateElder);

module.exports = router;