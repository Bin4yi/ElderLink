// backend/routes/doctorSchedule.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const DoctorScheduleController = require('../controllers/doctorScheduleController');

// All routes require doctor authentication
router.use(authenticate);
router.use(authorize(['doctor']));

// Get doctor's schedules
router.get('/', DoctorScheduleController.getSchedules);

// Add single schedule
router.post('/', DoctorScheduleController.addSchedule);

// Add bulk schedules
router.post('/bulk', DoctorScheduleController.addBulkSchedules);

// Update schedule
router.put('/:scheduleId', DoctorScheduleController.updateSchedule);

// Delete schedule
router.delete('/:scheduleId', DoctorScheduleController.deleteSchedule);

module.exports = router;
