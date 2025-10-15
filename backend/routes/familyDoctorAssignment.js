const express = require('express');
const router = express.Router();
const FamilyDoctorAssignmentController = require('../controllers/familyDoctorAssignmentController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and family member role
router.use(authenticate);
router.use(authorize('family_member'));

// Get available doctors for assignment
router.get('/available-doctors', FamilyDoctorAssignmentController.getAvailableDoctors);

// Assign doctor to family/elder
router.post('/assign', FamilyDoctorAssignmentController.assignDoctor);

// Get family's doctor assignments
router.get('/assignments', FamilyDoctorAssignmentController.getFamilyDoctorAssignments);

// Get specific assignment details
router.get('/assignments/:assignmentId', FamilyDoctorAssignmentController.getAssignmentDetails);

// Update assignment
router.put('/assignments/:assignmentId', FamilyDoctorAssignmentController.updateAssignment);

// Remove assignment
router.delete('/assignments/:assignmentId', FamilyDoctorAssignmentController.removeAssignment);

// Get assigned doctors
router.get('/assigned-doctors', FamilyDoctorAssignmentController.getAssignedDoctors);

module.exports = router;