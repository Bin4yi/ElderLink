// backend/routes/doctorAppointments.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// ✅ FIXED: Get doctor's appointments
router.get('/appointments', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const doctorId = req.user.id;

    console.log('📋 Fetching doctor appointments:', { doctorId, status, date, page, limit });

    // Mock appointments data - replace with actual database query
    const mockAppointments = [
      {
        id: 1,
        elderId: 1,
        elderName: 'John Smith',
        elderAge: 75,
        familyMemberId: 2,
        familyMemberName: 'Sarah Smith',
        appointmentDate: '2024-01-15T10:00:00Z',
        reason: 'Regular checkup',
        symptoms: 'Mild fatigue',
        notes: 'Monthly health monitoring',
        priority: 'medium',
        type: 'consultation',
        status: 'pending',
        duration: 30,
        createdAt: '2024-01-10T08:00:00Z'
      },
      {
        id: 2,
        elderId: 2,
        elderName: 'Mary Johnson',
        elderAge: 82,
        familyMemberId: 3,
        familyMemberName: 'Mike Johnson',
        appointmentDate: '2024-01-16T14:00:00Z',
        reason: 'Blood pressure check',
        symptoms: 'Headaches',
        notes: 'Follow-up appointment',
        priority: 'high',
        type: 'follow-up',
        status: 'approved',
        duration: 45,
        createdAt: '2024-01-11T09:00:00Z'
      }
    ];

    // Filter by status if provided
    let filteredAppointments = mockAppointments;
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }

    // Filter by date if provided
    if (date) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.appointmentDate.startsWith(date)
      );
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

    const response = {
      success: true,
      message: 'Doctor appointments retrieved successfully',
      appointments: paginatedAppointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredAppointments.length / parseInt(limit)),
        totalCount: filteredAppointments.length,
        hasNext: endIndex < filteredAppointments.length,
        hasPrev: parseInt(page) > 1
      }
    };

    console.log('✅ Appointments fetched successfully:', response.appointments.length);
    res.json(response);
  } catch (error) {
    console.error('❌ Get doctor appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ✅ ADDED: Get doctor consultations (consultation records)
router.get('/consultations', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const doctorId = req.user.id;

    console.log('📋 Fetching doctor consultations:', { doctorId, page, limit });

    // Mock consultation data - replace with actual database query
    const mockConsultations = [
      {
        id: 1,
        appointmentId: 1,
        elderId: 1,
        elderName: 'John Smith',
        elderAge: 75,
        doctorId: doctorId,
        familyMemberId: 2,
        consultationDate: '2024-01-15T10:00:00Z',
        diagnosis: 'Mild hypertension',
        treatment: 'Lifestyle modifications recommended',
        prescription: 'Lisinopril 5mg daily',
        followUpRequired: true,
        followUpDate: '2024-02-15T10:00:00Z',
        notes: 'Patient responding well to current treatment',
        vitalSigns: {
          bloodPressure: '140/90',
          heartRate: '78',
          temperature: '98.6',
          weight: '165'
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        appointmentId: 2,
        elderId: 2,
        elderName: 'Mary Johnson',
        elderAge: 82,
        doctorId: doctorId,
        familyMemberId: 3,
        consultationDate: '2024-01-16T14:00:00Z',
        diagnosis: 'Tension headaches',
        treatment: 'Stress management and hydration',
        prescription: 'Acetaminophen as needed',
        followUpRequired: false,
        followUpDate: null,
        notes: 'Symptoms likely stress-related',
        vitalSigns: {
          bloodPressure: '130/85',
          heartRate: '82',
          temperature: '98.4',
          weight: '145'
        },
        createdAt: '2024-01-16T14:45:00Z',
        updatedAt: '2024-01-16T14:45:00Z'
      }
    ];

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedConsultations = mockConsultations.slice(startIndex, endIndex);

    const response = {
      success: true,
      message: 'Doctor consultations retrieved successfully',
      consultations: paginatedConsultations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(mockConsultations.length / parseInt(limit)),
        totalCount: mockConsultations.length,
        hasNext: endIndex < mockConsultations.length,
        hasPrev: parseInt(page) > 1
      }
    };

    console.log('✅ Consultations fetched successfully:', response.consultations.length);
    res.json(response);
  } catch (error) {
    console.error('❌ Get doctor consultations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

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
      doctorId: req.user.id,
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
      reviewedAt: new Date(),
      reviewedBy: req.user.id
    };

    console.log('✅ Appointment reviewed successfully');

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
      completedAt: new Date(),
      completedBy: req.user.id
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

    console.log('📋 Fetching elder medical summary:', { elderId });

    // Mock medical summary - replace with actual database query
    const medicalSummary = {
      elderId: parseInt(elderId),
      elderName: 'John Smith',
      age: 75,
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: '2020-03-15',
          status: 'active',
          medications: ['Lisinopril 5mg daily']
        },
        {
          condition: 'Type 2 Diabetes',
          diagnosedDate: '2019-08-22',
          status: 'controlled',
          medications: ['Metformin 500mg twice daily']
        }
      ],
      allergies: ['Penicillin', 'Shellfish'],
      currentMedications: [
        { name: 'Lisinopril', dosage: '5mg daily', prescribedDate: '2023-12-01' },
        { name: 'Metformin', dosage: '500mg twice daily', prescribedDate: '2023-10-15' }
      ],
      recentVitals: {
        lastChecked: '2024-01-10T09:00:00Z',
        bloodPressure: '135/85',
        heartRate: '76',
        temperature: '98.6',
        weight: '165',
        glucoseLevel: '125'
      },
      emergencyContact: {
        name: 'Sarah Smith',
        relationship: 'Daughter',
        phone: '+1-555-0123'
      }
    };

    console.log('✅ Medical summary fetched successfully');

    res.json({
      success: true,
      message: 'Medical summary retrieved successfully',
      medicalSummary: medicalSummary
    });
  } catch (error) {
    console.error('❌ Get medical summary error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Reschedule appointment
router.patch('/appointments/:id/reschedule', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newDateTime, reason } = req.body;

    console.log('🔄 Rescheduling appointment:', { id, newDateTime, reason });

    // Mock reschedule - replace with actual database update
    const rescheduledAppointment = {
      id: parseInt(id),
      oldDateTime: '2024-01-15T10:00:00Z',
      newDateTime: newDateTime,
      rescheduleReason: reason,
      rescheduledAt: new Date(),
      rescheduledBy: req.user.id,
      status: 'rescheduled'
    };

    console.log('✅ Appointment rescheduled successfully');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: rescheduledAppointment
    });
  } catch (error) {
    console.error('❌ Reschedule appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctorId = req.user.id;

    console.log('📊 Fetching doctor dashboard stats:', { doctorId });

    // Mock stats - replace with actual database queries
    const stats = {
      totalAppointments: 25,
      pendingAppointments: 8,
      completedAppointments: 15,
      cancelledAppointments: 2,
      todaysAppointments: 3,
      thisWeekAppointments: 12,
      totalPatients: 18,
      emergencyAlerts: 1,
      upcomingAppointments: [
        {
          id: 1,
          elderName: 'John Smith',
          time: '10:00 AM',
          date: '2024-01-15',
          type: 'consultation'
        },
        {
          id: 2,
          elderName: 'Mary Johnson',
          time: '2:00 PM',
          date: '2024-01-15',
          type: 'follow-up'
        }
      ]
    };

    console.log('✅ Dashboard stats fetched successfully');

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      stats: stats
    });
  } catch (error) {
    console.error('❌ Get doctor dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create prescription
router.post('/appointments/:id/prescriptions', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    const prescriptionData = req.body;

    console.log('💊 Creating prescription:', { appointmentId: id, prescriptionData });

    // Mock prescription creation - replace with actual database insert
    const newPrescription = {
      id: Date.now(),
      appointmentId: parseInt(id),
      doctorId: req.user.id,
      ...prescriptionData,
      createdAt: new Date(),
      status: 'active'
    };

    console.log('✅ Prescription created successfully');

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription: newPrescription
    });
  } catch (error) {
    console.error('❌ Create prescription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update schedule
router.post('/schedule', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { schedules } = req.body;
    const doctorId = req.user.id;

    console.log('📅 Updating doctor schedule:', { doctorId, schedules });

    // Mock schedule update - replace with actual database update
    const updatedSchedule = {
      doctorId: doctorId,
      schedules: schedules,
      updatedAt: new Date()
    };

    console.log('✅ Schedule updated successfully');

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('❌ Update schedule error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Add schedule exception
router.post('/schedule/exceptions', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const exceptionData = req.body;
    const doctorId = req.user.id;

    console.log('🚫 Adding schedule exception:', { doctorId, exceptionData });

    // Mock exception creation - replace with actual database insert
    const newException = {
      id: Date.now(),
      doctorId: doctorId,
      ...exceptionData,
      createdAt: new Date()
    };

    console.log('✅ Schedule exception added successfully');

    res.status(201).json({
      success: true,
      message: 'Schedule exception added successfully',
      exception: newException
    });
  } catch (error) {
    console.error('❌ Add schedule exception error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;