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
      message: 'Dashboard stats retrieved successfully',
      stats: stats
    });
  } catch (error) {
    console.error('Get doctor dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Complete appointment
router.patch('/appointments/:id/complete', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { consultation, prescription, followUpRequired, followUpDate } = req.body;

    console.log('🔄 Completing appointment:', { id, consultation, prescription });

    // Mock appointment completion - replace with actual database update
    const completedAppointment = {
      id: parseInt(id),
      status: 'completed',
      consultation: consultation,
      prescription: prescription,
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate || null,
      completedAt: new Date()
    };

    console.log('✅ Appointment completed successfully');

    res.json({
      success: true,
      message: 'Appointment completed successfully',
      appointment: completedAppointment
    });
  } catch (error) {
    console.error('❌ Complete appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get elder's medical summary
router.get('/elders/:elderId/medical-summary', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { elderId } = req.params;

    // Mock medical summary - replace with actual database query
    const medicalSummary = {
      elder: {
        id: parseInt(elderId),
        firstName: 'John',
        lastName: 'Elder',
        dateOfBirth: '1950-01-01',
        gender: 'male',
        bloodType: 'O+',
        allergies: 'None',
        chronicConditions: 'Hypertension',
        currentMedications: 'Lisinopril 10mg',
        phone: '+1-555-0123',
        emergencyContact: 'Jane Elder - +1-555-0124'
      },
      recentAppointments: [
        {
          id: 1,
          appointmentDate: new Date('2024-01-10T10:00:00'),
          reason: 'Regular checkup',
          status: 'completed',
          doctorNotes: 'Patient is stable, continue current medication'
        }
      ],
      vitalSigns: [
        {
          date: '2024-01-10',
          bloodPressure: '130/80',
          heartRate: 72,
          temperature: 98.6,
          weight: 165
        }
      ],
      prescriptions: [
        {
          id: 1,
          medicationName: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          prescribedDate: '2024-01-01',
          status: 'active'
        }
      ]
    };

    res.json({
      success: true,
      message: 'Medical summary retrieved successfully',
      medicalSummary: medicalSummary
    });
  } catch (error) {
    console.error('Get medical summary error:', error);
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

// Schedule appointment
router.post('/schedule', authenticate, authorize('doctor'), DoctorAppointmentController.updateSchedule);

module.exports = router;