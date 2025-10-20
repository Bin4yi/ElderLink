// backend/controllers/monthlySessionController.js
const { 
  MonthlySession, 
  DoctorSchedule, 
  Doctor, 
  Elder, 
  User, 
  Subscription 
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Create a single monthly session for an elder
 * Simple, straightforward - no transactions, no complexity
 */
exports.createFirstMonthlySession = async (req, res) => {
  try {
    const { elderId, doctorId, sessionDate, sessionTime } = req.body;
    const familyMemberId = req.user.id;

    console.log('📝 Creating first monthly session:', { elderId, doctorId, sessionDate, sessionTime, familyMemberId });

    // Simple validation
    if (!elderId || !doctorId || !sessionDate || !sessionTime) {
      return res.status(400).json({
        success: false,
        message: 'Elder ID, Doctor ID, session date, and time are required'
      });
    }

    // Check if elder exists (simple query)
    const elder = await Elder.findByPk(elderId);
    if (!elder) {
      return res.status(404).json({
        success: false,
        message: 'Elder not found'
      });
    }

    // Check if doctor exists and get Doctor profile ID
    const doctorUser = await User.findOne({
      where: { 
        id: doctorId,
        role: 'doctor'
      }
    });
    if (!doctorUser) {
      return res.status(404).json({
        success: false,
        message: 'Doctor user not found'
      });
    }

    // Get the Doctor profile (which has the actual doctorId for monthly_sessions table)
    const doctorProfile = await Doctor.findOne({
      where: { userId: doctorId }
    });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found. The doctor may not have completed their profile setup.'
      });
    }

    console.log('✅ Found doctor profile:', doctorProfile.id, 'for user:', doctorId);

    // Check if session already exists for this month (simple check)
    // Family can only create ONE monthly session per month (free service)
    // For additional sessions, they must book regular appointments with payment
    const sessionDateObj = new Date(sessionDate);
    const year = sessionDateObj.getFullYear();
    const month = sessionDateObj.getMonth();
    
    const existingSession = await MonthlySession.findOne({
      where: {
        elderId,
        familyMemberId,
        sessionDate: {
          [Op.gte]: new Date(year, month, 1),
          [Op.lt]: new Date(year, month + 1, 1)
        },
        status: { [Op.notIn]: ['cancelled', 'missed'] }
      }
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'You Already Created Session for This Month',
        existingSession: {
          id: existingSession.id,
          sessionDate: existingSession.sessionDate,
          sessionTime: existingSession.sessionTime,
          status: existingSession.status
        }
      });
    }

    // Create the session - simple and direct (use doctorProfile.id, not doctorId from request)
    const session = await MonthlySession.create({
      elderId,
      familyMemberId,
      doctorId: doctorProfile.id, // Use Doctor table ID, not User ID
      scheduleId: null,
      sessionDate,
      sessionTime,
      duration: 45,
      status: 'scheduled',
      sessionType: 'initial',
      isAutoScheduled: false,
      notes: `Monthly health check-up scheduled for ${sessionDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    });

    console.log('✅ Session created successfully:', session.id);

    // Fetch the created session with all includes
    const sessionWithDetails = await MonthlySession.findByPk(session.id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'photo']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Monthly session created successfully',
      data: {
        session: sessionWithDetails
      }
    });

  } catch (error) {
    console.error('❌ Error creating monthly session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create monthly session',
      error: error.message
    });
  }
};

/**
 * Auto-schedule monthly sessions for an elder
 * Creates recurring monthly sessions starting from a base date/time
 */
exports.autoScheduleMonthlySessions = async (req, res) => {
  let transaction;
  
  try {
    const { elderId, doctorId, startDate, sessionTime, numberOfMonths } = req.body;
    const familyMemberId = req.user.id;

    console.log('🔍 Auto-schedule request:', { elderId, doctorId, startDate, sessionTime, numberOfMonths, familyMemberId });

    // Validate input
    if (!elderId || !doctorId || !startDate || !sessionTime || !numberOfMonths) {
      return res.status(400).json({
        success: false,
        message: 'Elder ID, Doctor ID, start date, session time, and number of months are required'
      });
    }

    // Verify elder exists and belongs to family member via subscription (without transaction)
    let elder;
    try {
      elder = await Elder.findOne({
        where: { id: elderId },
        include: [{
          model: Subscription,
          as: 'subscription',
          where: { userId: familyMemberId },
          required: false
        }]
      });
    } catch (includeError) {
      console.log('⚠️ Include query failed, trying alternative approach:', includeError.message);
      // Fallback: Check elder and subscription separately
      elder = await Elder.findByPk(elderId);
      if (elder) {
        const subscription = await Subscription.findOne({
          where: { 
            userId: familyMemberId,
            elderId: elderId
          }
        });
        if (!subscription) {
          elder = null; // No access if no subscription link
        }
      }
    }

    console.log('👴 Elder found:', elder ? 'Yes' : 'No');

    if (!elder) {
      return res.status(404).json({
        success: false,
        message: 'Elder not found or you do not have access'
      });
    }

    // Verify doctor exists (doctors are Users with role='doctor')
    const doctor = await User.findOne({
      where: { 
        id: doctorId,
        role: 'doctor'
      }
    });

    console.log('👨‍⚕️ Doctor found:', doctor ? 'Yes' : 'No');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Start transaction only after validation succeeds
    transaction = await sequelize.transaction();

    const scheduledSessions = [];
    const errors = [];

    // Parse the start date
    const baseDate = new Date(startDate);
    baseDate.setHours(0, 0, 0, 0); // Reset time to midnight for date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('📅 Base date:', baseDate.toISOString(), 'Today:', today.toISOString());
    
    // Create sessions for each month
    for (let monthOffset = 0; monthOffset < numberOfMonths; monthOffset++) {
      try {
        // Calculate session date for this month
        const sessionDate = new Date(baseDate);
        sessionDate.setMonth(baseDate.getMonth() + monthOffset);
        
        const sessionDateStr = sessionDate.toISOString().split('T')[0];
        const sessionYear = sessionDate.getFullYear();
        const sessionMonth = sessionDate.getMonth();

        console.log(`\n🔄 Processing month ${monthOffset + 1}:`);
        console.log(`   Session date: ${sessionDateStr}`);
        console.log(`   Session time: ${sessionTime}`);

        // Skip if date is in the past (but allow today)
        if (sessionDate < today) {
          console.log(`   ⏭️ Skipping - date is in the past`);
          errors.push({
            month: monthOffset + 1,
            date: sessionDateStr,
            reason: 'Date is in the past'
          });
          continue;
        }

        console.log(`   🔍 Checking for existing session...`);

        // Check if session already exists for this month
        const existingSession = await MonthlySession.findOne({
          where: {
            elderId,
            sessionDate: {
              [Op.gte]: new Date(sessionYear, sessionMonth, 1),
              [Op.lt]: new Date(sessionYear, sessionMonth + 1, 1)
            },
            status: { [Op.notIn]: ['cancelled', 'missed'] }
          },
          transaction
        });

        if (existingSession) {
          console.log(`   ⚠️ Session already exists: ${existingSession.id}`);
          errors.push({
            month: monthOffset + 1,
            date: sessionDateStr,
            reason: 'Session already exists for this month'
          });
          continue;
        }

        console.log(`   ✨ No existing session found, creating new one...`);

        // Create monthly session
        const monthName = sessionDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const session = await MonthlySession.create({
          elderId,
          familyMemberId,
          doctorId,
          scheduleId: null,
          sessionDate: sessionDateStr,
          sessionTime: sessionTime,
          duration: 45,
          status: 'scheduled',
          sessionType: monthOffset === 0 ? 'initial' : 'regular',
          isAutoScheduled: true,
          notes: `Monthly health check-up scheduled for ${monthName} at ${sessionTime}`
        }, { transaction });

        scheduledSessions.push(session);
        console.log(`   ✅ Session created successfully!`);
        console.log(`      ID: ${session.id}`);
        console.log(`      Date: ${session.sessionDate}`);
        console.log(`      Time: ${session.sessionTime}`);
      } catch (sessionError) {
        console.error(`   ❌ Error creating session ${monthOffset + 1}:`, sessionError);
        console.error(`      Error name: ${sessionError.name}`);
        console.error(`      Error message: ${sessionError.message}`);
        if (sessionError.parent) {
          console.error(`      Database error: ${sessionError.parent.message}`);
        }
        errors.push({
          month: monthOffset + 1,
          reason: sessionError.message || 'Failed to create session',
          details: sessionError.parent?.message || sessionError.toString()
        });
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Scheduled sessions: ${scheduledSessions.length}`);
    console.log(`   Errors: ${errors.length}`);

    await transaction.commit();
    console.log(`✅ Transaction committed successfully!`);

    return res.status(201).json({
      success: true,
      message: `Successfully scheduled ${scheduledSessions.length} monthly sessions`,
      data: {
        scheduledSessions,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error auto-scheduling monthly sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to auto-schedule monthly sessions',
      error: error.message
    });
  }
};

/**
 * Get all monthly sessions for family member's elders
 */
exports.getMonthlySessions = async (req, res) => {
  try {
    const familyMemberId = req.user.id;
    const { elderId, status, startDate, endDate } = req.query;

    const whereClause = { familyMemberId };

    if (elderId) {
      whereClause.elderId = elderId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.sessionDate = {};
      if (startDate) whereClause.sessionDate[Op.gte] = startDate;
      if (endDate) whereClause.sessionDate[Op.lte] = endDate;
    }

    const sessions = await MonthlySession.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'photo']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ],
      order: [['sessionDate', 'ASC'], ['sessionTime', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      }
    });

  } catch (error) {
    console.error('Error fetching monthly sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly sessions',
      error: error.message
    });
  }
};

/**
 * Get monthly sessions for doctor
 */
exports.getDoctorMonthlySessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, startDate, endDate } = req.query;

    console.log('🔍 getDoctorMonthlySessions called for userId:', userId);

    // Get doctor profile
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      console.log('❌ Doctor profile not found for userId:', userId);
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    console.log('✅ Doctor profile found:', { doctorId: doctor.id, userId: doctor.userId });

    const whereClause = { doctorId: doctor.id };

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.sessionDate = {};
      if (startDate) whereClause.sessionDate[Op.gte] = startDate;
      if (endDate) whereClause.sessionDate[Op.lte] = endDate;
    }

    console.log('🔎 Searching monthly sessions with whereClause:', whereClause);

    const sessions = await MonthlySession.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'photo', 'medicalHistory', 'allergies', 'phone', 'emergencyContact', 'bloodType', 'gender']
        },
        {
          model: User,
          as: 'familyMember',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ],
      order: [['sessionDate', 'ASC'], ['sessionTime', 'ASC']]
    });

    console.log('📊 Found monthly sessions:', sessions.length);
    if (sessions.length > 0) {
      console.log('📋 First session:', {
        id: sessions[0].id,
        elderId: sessions[0].elderId,
        doctorId: sessions[0].doctorId,
        sessionDate: sessions[0].sessionDate,
        sessionTime: sessions[0].sessionTime,
        status: sessions[0].status,
        hasElder: !!sessions[0].elder,
        hasFamilyMember: !!sessions[0].familyMember
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching doctor monthly sessions:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly sessions',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get single monthly session details
 */
exports.getMonthlySessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await MonthlySession.findByPk(sessionId, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'name', 'dateOfBirth', 'photo', 'medicalHistory', 'allergies', 'emergencyContact']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: DoctorSchedule,
          as: 'schedule'
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Monthly session not found'
      });
    }

    // Check authorization
    const doctor = await Doctor.findOne({ where: { userId } });
    const isDoctor = doctor && doctor.id === session.doctorId;
    const isFamilyMember = session.familyMemberId === userId;

    if (!isDoctor && !isFamilyMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this session'
      });
    }

    return res.status(200).json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Error fetching monthly session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly session',
      error: error.message
    });
  }
};

/**
 * Update monthly session (for doctor to add notes, vitals, etc.)
 */
exports.updateMonthlySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const session = await MonthlySession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Monthly session not found'
      });
    }

    // Check authorization
    const doctor = await Doctor.findOne({ where: { userId } });
    const isDoctor = doctor && doctor.id === session.doctorId;
    const isFamilyMember = session.familyMemberId === userId;

    if (!isDoctor && !isFamilyMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this session'
      });
    }

    // Restrict what family members can update
    if (isFamilyMember && !isDoctor) {
      const allowedFields = ['familyNotes', 'cancellationReason'];
      const updateFields = Object.keys(updates);
      const invalidFields = updateFields.filter(field => !allowedFields.includes(field) && field !== 'status');
      
      if (invalidFields.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Family members can only update family notes and cancellation reason'
        });
      }
    }

    // Update session
    await session.update(updates);

    // If status changed to completed, set completedAt
    if (updates.status === 'completed' && !session.completedAt) {
      await session.update({ completedAt: new Date() });
    }

    const updatedSession = await MonthlySession.findByPk(sessionId, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'name', 'dateOfBirth', 'photo']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Monthly session updated successfully',
      data: updatedSession
    });

  } catch (error) {
    console.error('Error updating monthly session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update monthly session',
      error: error.message
    });
  }
};

/**
 * Cancel monthly session
 */
exports.cancelMonthlySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.id;

    const session = await MonthlySession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Monthly session not found'
      });
    }

    // Check authorization
    const doctor = await Doctor.findOne({ where: { userId } });
    const isDoctor = doctor && doctor.id === session.doctorId;
    const isFamilyMember = session.familyMemberId === userId;

    if (!isDoctor && !isFamilyMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this session'
      });
    }

    await session.update({
      status: 'cancelled',
      cancellationReason: cancellationReason || 'No reason provided'
    });

    return res.status(200).json({
      success: true,
      message: 'Monthly session cancelled successfully',
      data: session
    });

  } catch (error) {
    console.error('Error cancelling monthly session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel monthly session',
      error: error.message
    });
  }
};

/**
 * Reschedule monthly session
 */
exports.rescheduleMonthlySession = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { sessionId } = req.params;
    const { newDate, newTime, reason } = req.body;
    const userId = req.user.id;

    const session = await MonthlySession.findByPk(sessionId, { transaction });
    if (!session) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Monthly session not found'
      });
    }

    // Check authorization
    const doctor = await Doctor.findOne({ where: { userId }, transaction });
    const isDoctor = doctor && doctor.id === session.doctorId;
    const isFamilyMember = session.familyMemberId === userId;

    if (!isDoctor && !isFamilyMember && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this session'
      });
    }

    // Find available schedule for new date/time
    const availableSchedule = await DoctorSchedule.findOne({
      where: {
        doctorId: session.doctorId,
        date: newDate,
        startTime: newTime,
        isAvailable: true
      },
      transaction
    });

    if (!availableSchedule) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No available schedule found for the selected date and time'
      });
    }

    // Mark old session as rescheduled
    await session.update({
      status: 'rescheduled',
      cancellationReason: reason || 'Rescheduled to a different date/time'
    }, { transaction });

    // Create new session
    const newSession = await MonthlySession.create({
      elderId: session.elderId,
      familyMemberId: session.familyMemberId,
      doctorId: session.doctorId,
      scheduleId: availableSchedule.id,
      sessionDate: newDate,
      sessionTime: newTime,
      duration: session.duration,
      status: 'scheduled',
      sessionType: session.sessionType,
      isAutoScheduled: false,
      notes: `Rescheduled from ${session.sessionDate}. Reason: ${reason || 'Not specified'}`,
      rescheduledFrom: session.id
    }, { transaction });

    await transaction.commit();

    const rescheduledSession = await MonthlySession.findByPk(newSession.id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'name', 'dateOfBirth', 'photo']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Monthly session rescheduled successfully',
      data: rescheduledSession
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error rescheduling monthly session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reschedule monthly session',
      error: error.message
    });
  }
};

/**
 * Complete monthly session with vitals and notes
 */
exports.completeMonthlySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      doctorNotes,
      sessionSummary,
      vitalSigns,
      prescriptions,
      nextSessionDate,
      sessionDuration
    } = req.body;
    const userId = req.user.id;

    const session = await MonthlySession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Monthly session not found'
      });
    }

    // Only doctor can complete session
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor || doctor.id !== session.doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned doctor can complete this session'
      });
    }

    await session.update({
      status: 'completed',
      doctorNotes,
      sessionSummary,
      vitalSigns,
      prescriptions,
      nextSessionDate,
      sessionDuration,
      completedAt: new Date()
    });

    const completedSession = await MonthlySession.findByPk(sessionId, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'name', 'dateOfBirth', 'photo']
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Monthly session completed successfully',
      data: completedSession
    });

  } catch (error) {
    console.error('Error completing monthly session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete monthly session',
      error: error.message
    });
  }
};

/**
 * Get monthly session statistics
 */
exports.getMonthlySessionStats = async (req, res) => {
  try {
    const familyMemberId = req.user.id;
    const { elderId } = req.query;

    const whereClause = { familyMemberId };
    if (elderId) {
      whereClause.elderId = elderId;
    }

    const stats = await MonthlySession.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const formattedStats = {
      total: 0,
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      missed: 0,
      rescheduled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat.status.replace('-', '')] = parseInt(stat.count);
      formattedStats.total += parseInt(stat.count);
    });

    return res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error fetching monthly session stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Check if a monthly session exists for a specific month
 * Used to validate before creating a new session
 */
exports.checkMonthlySessionExists = async (req, res) => {
  try {
    const { elderId, year, month } = req.query;
    const familyMemberId = req.user.id;

    if (!elderId || !year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Elder ID, year, and month are required'
      });
    }

    // Check if session exists for the specified month
    const existingSession = await MonthlySession.findOne({
      where: {
        elderId,
        familyMemberId,
        sessionDate: {
          [Op.gte]: new Date(year, month - 1, 1),
          [Op.lt]: new Date(year, month, 1)
        },
        status: { [Op.notIn]: ['cancelled', 'missed'] }
      },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (existingSession) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: 'You Already Created Session for This Month',
        session: {
          id: existingSession.id,
          sessionDate: existingSession.sessionDate,
          sessionTime: existingSession.sessionTime,
          status: existingSession.status,
          doctor: existingSession.doctor
        }
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
      message: 'No session exists for this month'
    });

  } catch (error) {
    console.error('Error checking monthly session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check monthly session',
      error: error.message
    });
  }
};
