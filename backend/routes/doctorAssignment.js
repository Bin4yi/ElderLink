// backend/routes/doctorAssignment.js
const express = require('express');
const router = express.Router();
const DoctorAssignmentController = require('../controllers/doctorAssignmentController');
const { authenticate, authorize } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor assignment routes working',
    timestamp: new Date().toISOString()
  });
});

// Get available doctors
router.get('/doctors', 
  authenticate, 
  authorize('family_member'), 
  DoctorAssignmentController.getAvailableDoctors
);

// Assign doctor to elder
router.post('/assign', 
  authenticate, 
  authorize('family_member'), 
  DoctorAssignmentController.assignDoctor
);

// Get family's doctor assignments
router.get('/assignments', 
  authenticate, 
  authorize('family_member'), 
  DoctorAssignmentController.getFamilyDoctorAssignments
);

// Get assignments for specific elder
router.get('/elders/:elderId/assignments', 
  authenticate, 
  authorize('family_member'), 
  DoctorAssignmentController.getElderDoctorAssignments
);

// Get assignment details
router.get('/assignments/:assignmentId', 
  authenticate, 
  authorize('family_member'), 
  DoctorAssignmentController.getAssignmentDetails
);

// Terminate assignment
router.put('/assignments/:assignmentId/terminate', authenticate, authorize('family_member'), DoctorAssignmentController.terminateAssignment);

module.exports = router;