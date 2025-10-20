// backend/controllers/consultationController.js
const { ConsultationRecord, Appointment, Elder, Doctor, User } = require('../models');
const { Op } = require('sequelize');

// Create a new consultation record
const createConsultationRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const {
      appointmentId,
      elderId,
      symptoms,
      diagnosis,
      treatment,
      sessionSummary,
      recommendations,
      prescriptionAttached,
      medicationNotes
    } = req.body;

    // Validate required fields
    if (!appointmentId || !elderId || !sessionSummary || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID, Elder ID, Session Summary, and Diagnosis are required'
      });
    }

    // Get doctor record from user ID
    const doctor = await Doctor.findOne({
      where: { userId: userId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        doctorId: doctor.id
      }
    });

    if (!appointment) {
      console.log(`❌ Appointment not found - ID: ${appointmentId}, Doctor ID: ${doctor.id}, User ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or you are not authorized'
      });
    }

    // Check if consultation record already exists for this appointment
    const existingRecord = await ConsultationRecord.findOne({
      where: { appointmentId }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Consultation record already exists for this appointment'
      });
    }

    // Create consultation record (simplified - no vitals, no follow-ups)
    const consultationRecord = await ConsultationRecord.create({
      appointmentId,
      doctorId: doctor.id,
      elderId,
      sessionDate: new Date(),
      duration: appointment.duration || 30,
      symptoms: symptoms || '',
      diagnosis,
      treatment: treatment || '',
      recommendations: recommendations || '',
      sessionSummary,
      prescriptionAttached: prescriptionAttached || false,
      status: 'completed'
      // Removed: vitalSigns, followUpRequired, followUpDate, nextAppointment, additionalNotes, clinicalObservations
    });

    // Update appointment status to completed
    await appointment.update({
      status: 'completed'
    });

    // Fetch the created record with minimal associations
    const recordWithDetails = await ConsultationRecord.findByPk(consultationRecord.id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }],
          attributes: ['id', 'specialization']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'type']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Consultation record created successfully',
      data: recordWithDetails
    });

  } catch (error) {
    console.error('Error creating consultation record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create consultation record',
      error: error.message
    });
  }
};

// Get all consultation records for a doctor (with pagination)
const getDoctorConsultationRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, elderId } = req.query;

    // Get doctor record
    const doctor = await Doctor.findOne({
      where: { userId: userId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const whereClause = { doctorId: doctor.id };
    if (status) {
      whereClause.status = status;
    }
    if (elderId) {
      whereClause.elderId = elderId;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ConsultationRecord.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'type']
        }
      ],
      order: [['sessionDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        records: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching consultation records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultation records',
      error: error.message
    });
  }
};

// Get all consultation records for an elder
const getElderConsultationRecords = async (req, res) => {
  try {
    const { elderId } = req.params;

    const records = await ConsultationRecord.findAll({
      where: { elderId },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }],
          attributes: ['id', 'specialization']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'type']
        }
      ],
      order: [['sessionDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: records
    });

  } catch (error) {
    console.error('Error fetching elder consultation records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elder consultation records',
      error: error.message
    });
  }
};

// Get a specific consultation record by ID
const getConsultationRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await ConsultationRecord.findByPk(id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }],
          attributes: ['id', 'specialization']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'type']
        }
      ]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Consultation record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('Error fetching consultation record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultation record',
      error: error.message
    });
  }
};

// Update a consultation record
const updateConsultationRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      symptoms,
      diagnosis,
      treatment,
      recommendations,
      sessionSummary,
      prescriptionAttached,
      medicationNotes,
      status
    } = req.body;

    // Get doctor record
    const doctor = await Doctor.findOne({
      where: { userId: userId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const record = await ConsultationRecord.findOne({
      where: {
        id,
        doctorId: doctor.id
      }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Consultation record not found or you are not authorized'
      });
    }

    // Update only provided fields
    const updateData = {};
    if (symptoms !== undefined) updateData.symptoms = symptoms;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (treatment !== undefined) updateData.treatment = treatment;
    if (recommendations !== undefined) updateData.recommendations = recommendations;
    if (sessionSummary !== undefined) updateData.sessionSummary = sessionSummary;
    if (prescriptionAttached !== undefined) updateData.prescriptionAttached = prescriptionAttached;
    if (medicationNotes !== undefined) updateData.medicationNotes = medicationNotes;
    if (status !== undefined) updateData.status = status;

    await record.update(updateData);

    const updatedRecord = await ConsultationRecord.findByPk(id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Consultation record updated successfully',
      data: updatedRecord
    });

  } catch (error) {
    console.error('Error updating consultation record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation record',
      error: error.message
    });
  }
};

// Delete (soft delete) a consultation record
const deleteConsultationRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get doctor record
    const doctor = await Doctor.findOne({
      where: { userId: userId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const record = await ConsultationRecord.findOne({
      where: {
        id,
        doctorId: doctor.id
      }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Consultation record not found or you are not authorized'
      });
    }

    // Soft delete by updating status
    await record.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: 'Consultation record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting consultation record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete consultation record',
      error: error.message
    });
  }
};

module.exports = {
  createConsultationRecord,
  getDoctorConsultationRecords,
  getElderConsultationRecords,
  getConsultationRecordById,
  updateConsultationRecord,
  deleteConsultationRecord
};
