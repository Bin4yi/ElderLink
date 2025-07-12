// backend/models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  familyMemberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  type: {
    type: DataTypes.ENUM('consultation', 'follow-up', 'emergency'),
    defaultValue: 'consultation'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled', 'no-show'),
    defaultValue: 'pending'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  doctorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  zoomMeetingId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zoomJoinUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  zoomPassword: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    { fields: ['doctorId', 'appointmentDate'] },
    { fields: ['elderId'] },
    { fields: ['familyMemberId'] },
    { fields: ['status'] }
  ]
});

module.exports = Appointment;

// backend/models/DoctorSchedule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorSchedule = sequelize.define('DoctorSchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 6
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  slotDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  maxAppointments: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  indexes: [
    { 
      unique: true, 
      fields: ['doctorId', 'dayOfWeek', 'startTime'] 
    }
  ]
});

module.exports = DoctorSchedule;

// backend/models/ScheduleException.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScheduleException = sequelize.define('ScheduleException', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  isUnavailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  indexes: [
    { 
      unique: true, 
      fields: ['doctorId', 'date', 'startTime'] 
    }
  ]
});

module.exports = ScheduleException;

// backend/models/ConsultationRecord.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConsultationRecord = sequelize.define('ConsultationRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Appointments',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  sessionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nextAppointment: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  vitalSigns: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sessionSummary: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  prescriptionAttached: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('completed', 'in-progress', 'cancelled'),
    defaultValue: 'completed'
  }
});

module.exports = ConsultationRecord;

// backend/models/Prescription.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  consultationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ConsultationRecords',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  prescriptionNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  medications: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active'
  },
  digitalSignature: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescriptionFile: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (prescription) => {
      if (!prescription.prescriptionNumber) {
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        prescription.prescriptionNumber = `RX${timestamp}${random}`;
      }
    }
  }
});

module.exports = Prescription;

// backend/models/AppointmentNotification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentNotification = sequelize.define('AppointmentNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Appointments',
      key: 'id'
    }
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('booking_confirmation', 'approval', 'rejection', 'reminder', 'completion'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  method: {
    type: DataTypes.ENUM('in_app', 'email', 'sms'),
    defaultValue: 'in_app'
  }
}, {
  indexes: [
    { fields: ['recipientId', 'isRead'] }
  ]
});

module.exports = AppointmentNotification;

// backend/models/ElderMedicalHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ElderMedicalHistory = sequelize.define('ElderMedicalHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  recordType: {
    type: DataTypes.ENUM('consultation', 'lab_result', 'prescription', 'emergency'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  doctorName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = ElderMedicalHistory;