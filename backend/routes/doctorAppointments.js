// backend/routes/doctorAppointments.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const DoctorAppointmentController = require('../controllers/doctorAppointmentController');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// Get doctor's appointments
router.get('/appointments', authenticate, authorize('doctor'), DoctorAppointmentController.getDoctorAppointments);

// Review appointment (approve/reject)
router.patch('/appointments/:id/review', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, doctorNotes, rejectionReason } = req.body;

    console.log('🔄 Reviewing appointment:', { id, action, doctorNotes });

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false,
        message: 'Action must be either "approve" or "reject"' 
      });
    }

    // Mock appointment update - replace with actual database update
    const updatedAppointment = {
      id: parseInt(id),
      elderId: 1,
      doctorId: 1,
      familyMemberId: 2,
      appointmentDate: new Date('2024-01-15T10:00:00'),
      reason: 'Regular checkup',
      symptoms: 'Mild fatigue',
      notes: 'Monthly health monitoring',
      doctorNotes: doctorNotes,
      rejectionReason: action === 'reject' ? rejectionReason : null,
      priority: 'medium',
      type: 'consultation',
      status: action === 'approve' ? 'approved' : 'rejected',
      elder: {
        id: 1,
        firstName: 'John',
        lastName: 'Elder',
        photo: null,
        dateOfBirth: '1950-01-01',
        gender: 'male'
      },
      familyMember: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Elder',
        email: 'jane@elderlink.com',
        phone: '+1-555-0124'
      }
    };

    console.log('✅ Appointment updated successfully');

    res.json({
      success: true,
      message: `Appointment ${action}d successfully`,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('❌ Review appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.patch('/appointments/:id/reschedule',
  authenticate,
  authorize('doctor'),
  DoctorAppointmentController.rescheduleAppointment
);

// Get dashboard stats
router.get('/dashboard/stats', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Mock statistics - replace with actual database queries
    const stats = {
      todayAppointments: 3,
      pendingAppointments: 2,
      totalPatients: 15,
      monthlyConsultations: 45,
      completedToday: 1,
      emergencyAlerts: 0,
      avgRating: 4.8
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Create prescription
router.post('/appointments/:appointmentId/prescriptions', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { medicationName, dosage, frequency, duration, instructions } = req.body;

    // Validate required fields
    if (!medicationName || !dosage || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: medicationName, dosage, frequency'
      });
    }

    // Mock prescription creation - replace with actual database insertion
    const newPrescription = {
      id: Date.now(), // Mock ID
      appointmentId: parseInt(appointmentId),
      medicationName,
      dosage,
      frequency,
      duration,
      instructions,
      prescribedDate: new Date(),
      status: 'active'
    };

    console.log('💊 New prescription created:', newPrescription);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription: newPrescription
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription'
    });
  }
});

// ✅ FIXED: Doctor schedule management routes

// Get doctor's schedule
router.get('/schedule', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // For now, return mock data - replace with actual database query
    const mockSchedules = [
      {
        id: 1,
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '10:00',
        isAvailable: true
      },
      {
        id: 2,
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true
      }
    ];
    
    res.json({
      success: true,
      message: 'Schedule retrieved successfully',
      schedules: mockSchedules
    });
  } catch (error) {
    console.error('❌ Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
});

// ✅ FIXED: Update doctor's schedule - This is the route that was missing!
router.post('/schedule', authenticate, authorize('doctor'), DoctorAppointmentController.updateSchedule);

// Add schedule exception
router.post('/schedule/exceptions', authenticate, authorize('doctor'), DoctorAppointmentController.addScheduleException);

// Delete schedule slots
router.delete('/schedule', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { scheduleIds } = req.body;
    
    if (!scheduleIds || !Array.isArray(scheduleIds)) {
      return res.status(400).json({
        success: false,
        message: 'Schedule IDs array is required'
      });
    }
    
    // Mock deletion - replace with actual database deletion
    console.log('🗑️ Deleting schedule slots:', scheduleIds);
    
    res.json({
      success: true,
      message: `${scheduleIds.length} schedule slots deleted successfully`
    });
  } catch (error) {
    console.error('❌ Error deleting schedule slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule slots'
    });
  }
});

module.exports = router;