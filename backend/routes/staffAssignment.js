const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { StaffAssignment, User, Elder } = require('../models'); // ✅ Import from models/index.js

// Get all staff assignments
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    console.log('🔍 Getting all staff assignments...');
    
    const assignments = await StaffAssignment.findAll({
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['assignedDate', 'DESC']]
    });
    
    console.log('✅ Found', assignments.length, 'staff assignments');
    
    res.json({
      success: true,
      data: assignments,
      total: assignments.length,
      message: 'Staff assignments retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get staff assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff assignments',
      error: error.message
    });
  }
});

// Get assignments for a specific staff member
router.get('/staff/:staffId', authenticate, authorize(['admin', 'staff']), async (req, res) => {
  try {
    const { staffId } = req.params;
    console.log('🔍 Getting assignments for staff:', staffId);
    
    // Check if user is staff and trying to access their own assignments
    if (req.user.role === 'staff' && req.user.id !== staffId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own assignments'
      });
    }
    
    const assignments = await StaffAssignment.findAll({
      where: {
        staffId: staffId,
        isActive: true
      },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'phone', 'address']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['assignedDate', 'DESC']]
    });
    
    console.log('✅ Found', assignments.length, 'assignments for staff');
    
    res.json({
      success: true,
      data: assignments,
      total: assignments.length,
      message: 'Staff assignments retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get staff assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff assignments',
      error: error.message
    });
  }
});

// Create new staff assignment
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { staffId, elderId, notes } = req.body;
    const assignedBy = req.user.id;
    
    console.log('🔍 Creating staff assignment:', { staffId, elderId, assignedBy });
    
    // Check if assignment already exists
    const existingAssignment = await StaffAssignment.findOne({
      where: {
        staffId: staffId,
        elderId: elderId,
        isActive: true
      }
    });
    
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This elder is already assigned to this staff member'
      });
    }
    
    // Create new assignment
    const assignment = await StaffAssignment.create({
      staffId: staffId,
      elderId: elderId,
      assignedBy: assignedBy,
      assignedDate: new Date(),
      isActive: true,
      notes: notes || null
    });
    
    // Fetch the complete assignment with associations
    const completeAssignment = await StaffAssignment.findByPk(assignment.id, {
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    console.log('✅ Staff assignment created:', assignment.id);
    
    res.status(201).json({
      success: true,
      data: completeAssignment,
      message: 'Staff assignment created successfully'
    });
  } catch (error) {
    console.error('❌ Create staff assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create staff assignment',
      error: error.message
    });
  }
});

// Update staff assignment
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    console.log('🔍 Updating staff assignment:', id);
    
    const assignment = await StaffAssignment.findByPk(id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Staff assignment not found'
      });
    }
    
    await assignment.update({ notes });
    
    // Fetch the updated assignment with associations
    const updatedAssignment = await StaffAssignment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    console.log('✅ Staff assignment updated:', id);
    
    res.json({
      success: true,
      data: updatedAssignment,
      message: 'Staff assignment updated successfully'
    });
  } catch (error) {
    console.error('❌ Update staff assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff assignment',
      error: error.message
    });
  }
});

// Deactivate staff assignment (soft delete)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const unassignedBy = req.user.id;
    
    console.log('🔍 Deactivating staff assignment:', id);
    
    const assignment = await StaffAssignment.findByPk(id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Staff assignment not found'
      });
    }
    
    if (!assignment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Staff assignment is already inactive'
      });
    }
    
    await assignment.update({
      isActive: false,
      unassignedDate: new Date(),
      unassignedBy: unassignedBy
    });
    
    console.log('✅ Staff assignment deactivated:', id);
    
    res.json({
      success: true,
      message: 'Staff assignment deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Deactivate staff assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate staff assignment',
      error: error.message
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Staff assignment routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;