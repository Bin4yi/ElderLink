const express = require('express');
const router = express.Router();
const { 
  addElder, 
  getElders, 
  getElderById, 
  updateElder, 
  upload,
  createElderLogin,
  toggleElderAccess,
  getElderProfile,
  addElderWithAuth // NEW: Import this
} = require('../controllers/elderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateElder, validateElderWithAuth } = require('../middleware/validation');

// Family member routes
router.post('/', authenticate, authorize('family_member'), upload.single('photo'), validateElder, addElder);

// NEW: Add elder with authentication in one step
router.post('/with-auth', authenticate, authorize('family_member'), upload.single('photo'), validateElderWithAuth, addElderWithAuth);

router.get('/', authenticate, authorize('family_member'), getElders);
router.get('/:elderId', authenticate, authorize('family_member'), getElderById);
router.put('/:elderId', authenticate, authorize('family_member'), upload.single('photo'), updateElder);

// Elder authentication management routes
router.post('/:elderId/create-login', authenticate, authorize('family_member'), createElderLogin);
router.put('/:elderId/toggle-access', authenticate, authorize('family_member'), toggleElderAccess);

// Elder profile route (for elder dashboard)
router.get('/profile/me', authenticate, authorize('elder'), getElderProfile);

module.exports = router;