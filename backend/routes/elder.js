const express = require('express');
const router = express.Router();
const { addElder, getElders, getElderById, updateElder, upload } = require('../controllers/elderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateElder } = require('../middleware/validation');

// CRITICAL: Add upload.single('photo') back - it's needed to parse FormData
router.post('/', authenticate, authorize('family_member'), upload.single('photo'), validateElder, addElder);
router.get('/', authenticate, getElders);
router.get('/:elderId', authenticate, getElderById);
router.put('/:elderId', authenticate, upload.single('photo'), updateElder);

module.exports = router;