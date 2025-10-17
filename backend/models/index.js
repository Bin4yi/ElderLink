//index.js of models

const sequelize = require("../config/database");

// Import models
const User = require("./User");
const Elder = require("./Elder");
const Subscription = require("./Subscription");
const HealthMonitoring = require("./HealthMonitoring");
const HealthAlert = require("./HealthAlert");
const Notification = require("./Notification");
const StaffAssignment = require("./StaffAssignment"); // ✅ Changed from StaffAssignmentModel
const DoctorAssignment = require("./DoctorAssignment"); // ✅ Add this
const Doctor = require("./Doctor");
const Appointment = require("./Appointment");
const ConsultationRecord = require("./ConsultationRecord"); // ✅ Add this
const DoctorSchedule = require("./DoctorSchedule");

// Import new inventory models
const Inventory = require("./Inventory");
const InventoryTransaction = require("./InventoryTransaction");
const Prescription = require("./Prescription");
const PrescriptionItem = require("./PrescriptionItem");
const Delivery = require("./Delivery");

// Import ambulance and emergency models
const Ambulance = require("./Ambulance");
const EmergencyAlert = require("./EmergencyAlert");
const AmbulanceDispatch = require("./AmbulanceDispatch");
const EmergencyLocation = require("./EmergencyLocation");

// === Mental Health Models ===
const MentalHealthAssignment = require("./MentalHealthAssignment");
const TherapySession = require("./TherapySession");
const MentalHealthAssessment = require("./MentalHealthAssessment");
const TreatmentPlan = require("./TreatmentPlan");
const TreatmentPlanProgress = require("./TreatmentPlanProgress");
const ProgressReport = require("./ProgressReport");
const GroupTherapySession = require("./GroupTherapySession");
const MentalHealthResource = require("./MentalHealthResource");

// Clear any existing associations to prevent conflicts
const clearAssociations = (model) => {
  if (model.associations) {
    Object.keys(model.associations).forEach((alias) => {
      delete model.associations[alias];
    });
  }
};

// Clear associations for all models
[
  User,
  Elder,
  Subscription,
  HealthMonitoring,
  HealthAlert,
  Notification,
  StaffAssignment,
  DoctorAssignment,
  Inventory,
  InventoryTransaction,
  Prescription,
  PrescriptionItem,
  Ambulance,
  EmergencyAlert,
  AmbulanceDispatch,
  EmergencyLocation,
].forEach(clearAssociations);

// User associations
User.hasMany(Elder, { foreignKey: "userId", as: "elders" });
User.hasMany(Subscription, { foreignKey: "userId", as: "subscriptions" });
User.hasMany(HealthMonitoring, {
  foreignKey: "staffId",
  as: "healthMonitorings",
});
User.hasMany(HealthAlert, {
  foreignKey: "acknowledgedBy",
  as: "acknowledgedAlerts",
});
User.hasMany(HealthAlert, { foreignKey: "resolvedBy", as: "resolvedAlerts" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
User.hasMany(StaffAssignment, {
  foreignKey: "staffId",
  as: "staffAssignments",
});
User.hasMany(DoctorAssignment, {
  foreignKey: "doctorId",
  as: "doctorAssignments",
}); // ✅ Add this
User.hasMany(DoctorAssignment, {
  foreignKey: "familyMemberId",
  as: "familyDoctorAssignments",
}); // ✅ Add this
User.hasOne(Doctor, {
  foreignKey: "userId",
  as: "doctorProfile",
  onDelete: "CASCADE",
});

// Elder associations
Elder.belongsTo(User, { foreignKey: "userId", as: "user" });
Elder.belongsTo(Subscription, {
  foreignKey: "subscriptionId",
  as: "subscription",
});
Elder.hasMany(HealthMonitoring, { foreignKey: "elderId", as: "healthRecords" });
Elder.hasMany(HealthAlert, { foreignKey: "elderId", as: "healthAlerts" });
Elder.hasMany(Notification, {
  foreignKey: "elderId",
  as: "elderNotifications",
});
Elder.hasMany(StaffAssignment, {
  foreignKey: "elderId",
  as: "staffAssignments",
});
Elder.hasMany(DoctorAssignment, {
  foreignKey: "elderId",
  as: "doctorAssignmentRecords",
}); // ✅ Changed from 'doctorAssignments' to 'doctorAssignmentRecords'

// Subscription associations
Subscription.belongsTo(User, { foreignKey: "userId", as: "user" });
Subscription.hasOne(Elder, { foreignKey: "subscriptionId", as: "elder" });

// HealthMonitoring associations
HealthMonitoring.belongsTo(User, { foreignKey: "staffId", as: "staff" });
HealthMonitoring.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
HealthMonitoring.hasMany(HealthAlert, {
  foreignKey: "healthMonitoringId",
  as: "alerts",
});

// HealthAlert associations
HealthAlert.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
HealthAlert.belongsTo(HealthMonitoring, {
  foreignKey: "healthMonitoringId",
  as: "healthMonitoring",
});
HealthAlert.belongsTo(User, {
  foreignKey: "acknowledgedBy",
  as: "acknowledgedByUser",
});
HealthAlert.belongsTo(User, { foreignKey: "resolvedBy", as: "resolvedByUser" });

// Notification associations
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
Notification.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });

// StaffAssignment associations
StaffAssignment.belongsTo(User, { foreignKey: "staffId", as: "staff" });
StaffAssignment.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
StaffAssignment.belongsTo(User, {
  foreignKey: "assignedBy",
  as: "assignedByUser",
});
StaffAssignment.belongsTo(User, {
  foreignKey: "unassignedBy",
  as: "unassignedByUser",
});

// DoctorAssignment associations
DoctorAssignment.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
DoctorAssignment.belongsTo(User, { foreignKey: "doctorId", as: "doctor" });
DoctorAssignment.belongsTo(User, {
  foreignKey: "familyMemberId",
  as: "familyMember",
});

// Doctor associations
Doctor.belongsTo(User, { foreignKey: "userId", as: "user" });
Doctor.belongsTo(User, { foreignKey: "verifiedBy", as: "verifier" });

// ========== NEW APPOINTMENT SYSTEM ASSOCIATIONS ==========

// Appointment associations
Appointment.belongsTo(User, {
  foreignKey: "familyMemberId",
  as: "familyMember",
});

Appointment.belongsTo(Elder, {
  foreignKey: "elderId",
  as: "elder",
});

Appointment.belongsTo(Doctor, {
  foreignKey: "doctorId",
  as: "doctor",
});

// Reverse associations for Appointments
User.hasMany(Appointment, {
  foreignKey: "familyMemberId",
  as: "bookedAppointments",
});

Elder.hasMany(Appointment, {
  foreignKey: "elderId",
  as: "appointments",
});

Doctor.hasMany(Appointment, {
  foreignKey: "doctorId",
  as: "doctorAppointments",
});

// Doctor Schedule associations
DoctorSchedule.belongsTo(Doctor, {
  foreignKey: "doctorId",
  as: "doctor",
});

Doctor.hasMany(DoctorSchedule, {
  foreignKey: "doctorId",
  as: "schedules",
});

// Consultation Record associations
ConsultationRecord.belongsTo(Appointment, {
  foreignKey: "appointmentId",
  as: "appointment",
});

ConsultationRecord.belongsTo(Doctor, {
  foreignKey: "doctorId",
  as: "doctor",
});

ConsultationRecord.belongsTo(Elder, {
  foreignKey: "elderId",
  as: "elder",
});

// Reverse associations for Consultation Records
Appointment.hasOne(ConsultationRecord, {
  foreignKey: "appointmentId",
  as: "consultationRecord",
});

Doctor.hasMany(ConsultationRecord, {
  foreignKey: "doctorId",
  as: "consultationRecords",
});

Elder.hasMany(ConsultationRecord, {
  foreignKey: "elderId",
  as: "consultationRecords",
});

// === NEW INVENTORY ASSOCIATIONS ===

// Inventory associations
Inventory.belongsTo(User, { foreignKey: "pharmacyId", as: "pharmacy" });
Inventory.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Inventory.hasMany(InventoryTransaction, {
  foreignKey: "inventoryId",
  as: "transactions",
});
Inventory.hasMany(PrescriptionItem, {
  foreignKey: "inventoryId",
  as: "prescriptionItems",
});

// InventoryTransaction associations
InventoryTransaction.belongsTo(Inventory, {
  foreignKey: "inventoryId",
  as: "inventory",
});
InventoryTransaction.belongsTo(User, {
  foreignKey: "performedBy",
  as: "performer",
});

// Prescription associations
Prescription.belongsTo(User, { foreignKey: "doctorId", as: "doctor" });
Prescription.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
Prescription.belongsTo(User, { foreignKey: "pharmacyId", as: "pharmacy" });
Prescription.belongsTo(User, { foreignKey: "filledBy", as: "pharmacist" });
Prescription.hasMany(PrescriptionItem, {
  foreignKey: "prescriptionId",
  as: "items",
});
Prescription.hasOne(Delivery, {
  foreignKey: "prescriptionId",
  as: "delivery",
});

// Delivery associations
Delivery.belongsTo(Prescription, {
  foreignKey: "prescriptionId",
  as: "prescription",
});
Delivery.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
Delivery.belongsTo(User, { foreignKey: "pharmacistId", as: "pharmacist" });

// Reverse associations
User.hasMany(Delivery, { foreignKey: "pharmacistId", as: "deliveries" });
Elder.hasMany(Delivery, { foreignKey: "elderId", as: "deliveries" });

// PrescriptionItem associations
PrescriptionItem.belongsTo(Prescription, {
  foreignKey: "prescriptionId",
  as: "prescription",
});
PrescriptionItem.belongsTo(Inventory, {
  foreignKey: "inventoryId",
  as: "inventory",
});

// Reverse associations for Users (Pharmacists)
User.hasMany(Inventory, { foreignKey: "pharmacyId", as: "inventoryItems" });
User.hasMany(Inventory, {
  foreignKey: "createdBy",
  as: "createdInventoryItems",
});
User.hasMany(InventoryTransaction, {
  foreignKey: "performedBy",
  as: "inventoryTransactions",
});
User.hasMany(Prescription, {
  foreignKey: "doctorId",
  as: "prescribedPrescriptions",
});
User.hasMany(Prescription, {
  foreignKey: "pharmacyId",
  as: "assignedPrescriptions",
});
User.hasMany(Prescription, {
  foreignKey: "filledBy",
  as: "filledPrescriptions",
});

// Elder prescriptions
Elder.hasMany(Prescription, { foreignKey: "elderId", as: "prescriptions" });

// === AMBULANCE AND EMERGENCY SYSTEM ASSOCIATIONS ===

// Ambulance associations
Ambulance.belongsTo(User, { foreignKey: "driverId", as: "driver" });
Ambulance.hasMany(AmbulanceDispatch, {
  foreignKey: "ambulanceId",
  as: "dispatches",
});

// EmergencyAlert associations
EmergencyAlert.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
EmergencyAlert.belongsTo(User, { foreignKey: "userId", as: "user" });
EmergencyAlert.belongsTo(User, {
  foreignKey: "acknowledgedBy",
  as: "acknowledgedByUser",
});
EmergencyAlert.hasMany(AmbulanceDispatch, {
  foreignKey: "emergencyAlertId",
  as: "dispatches",
});
EmergencyAlert.hasMany(EmergencyLocation, {
  foreignKey: "emergencyAlertId",
  as: "locations",
});

// AmbulanceDispatch associations
AmbulanceDispatch.belongsTo(EmergencyAlert, {
  foreignKey: "emergencyAlertId",
  as: "emergencyAlert",
});
AmbulanceDispatch.belongsTo(Ambulance, {
  foreignKey: "ambulanceId",
  as: "ambulance",
});
AmbulanceDispatch.belongsTo(User, { foreignKey: "driverId", as: "driver" });
AmbulanceDispatch.belongsTo(User, {
  foreignKey: "coordinatorId",
  as: "coordinator",
});
AmbulanceDispatch.hasMany(EmergencyLocation, {
  foreignKey: "ambulanceDispatchId",
  as: "locations",
});

// EmergencyLocation associations
EmergencyLocation.belongsTo(EmergencyAlert, {
  foreignKey: "emergencyAlertId",
  as: "emergencyAlert",
});
EmergencyLocation.belongsTo(AmbulanceDispatch, {
  foreignKey: "ambulanceDispatchId",
  as: "dispatch",
});

// Reverse associations
User.hasMany(Ambulance, { foreignKey: "driverId", as: "ambulances" });
User.hasOne(Ambulance, { foreignKey: "driverId", as: "assignedAmbulance" }); // For getting single ambulance
User.hasMany(EmergencyAlert, { foreignKey: "userId", as: "emergencyAlerts" });
User.hasMany(EmergencyAlert, {
  foreignKey: "acknowledgedBy",
  as: "acknowledgedEmergencies",
});
User.hasMany(AmbulanceDispatch, {
  foreignKey: "driverId",
  as: "driverDispatches",
});
User.hasMany(AmbulanceDispatch, {
  foreignKey: "coordinatorId",
  as: "coordinatedDispatches",
});

Elder.hasMany(EmergencyAlert, { foreignKey: "elderId", as: "emergencyAlerts" });

// === MENTAL HEALTH ASSOCIATIONS ===

// Mental Health Assignment Associations
MentalHealthAssignment.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
MentalHealthAssignment.belongsTo(User, {
  foreignKey: "specialistId",
  as: "specialist",
});
MentalHealthAssignment.belongsTo(User, {
  foreignKey: "familyMemberId",
  as: "familyMember",
});

Elder.hasMany(MentalHealthAssignment, {
  foreignKey: "elderId",
  as: "mentalHealthAssignments",
});
User.hasMany(MentalHealthAssignment, {
  foreignKey: "specialistId",
  as: "specialistAssignments",
});
User.hasMany(MentalHealthAssignment, {
  foreignKey: "familyMemberId",
  as: "familyMentalHealthAssignments",
});

// Therapy Session Associations
TherapySession.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
TherapySession.belongsTo(User, {
  foreignKey: "specialistId",
  as: "specialist",
});
TherapySession.belongsTo(GroupTherapySession, {
  foreignKey: "groupSessionId",
  as: "groupSession",
});

Elder.hasMany(TherapySession, { foreignKey: "elderId", as: "therapySessions" });
User.hasMany(TherapySession, {
  foreignKey: "specialistId",
  as: "conductedSessions",
});

// Assessment Associations
MentalHealthAssessment.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
MentalHealthAssessment.belongsTo(User, {
  foreignKey: "specialistId",
  as: "specialist",
});

Elder.hasMany(MentalHealthAssessment, {
  foreignKey: "elderId",
  as: "assessments",
});
User.hasMany(MentalHealthAssessment, {
  foreignKey: "specialistId",
  as: "conductedAssessments",
});

// Treatment Plan Associations
TreatmentPlan.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
TreatmentPlan.belongsTo(User, { foreignKey: "specialistId", as: "specialist" });
TreatmentPlan.hasMany(TreatmentPlanProgress, {
  foreignKey: "treatmentPlanId",
  as: "progressReports",
});

Elder.hasMany(TreatmentPlan, { foreignKey: "elderId", as: "treatmentPlans" });
User.hasMany(TreatmentPlan, {
  foreignKey: "specialistId",
  as: "createdTreatmentPlans",
});

// Treatment Plan Progress Associations
TreatmentPlanProgress.belongsTo(TreatmentPlan, {
  foreignKey: "treatmentPlanId",
  as: "treatmentPlan",
});
TreatmentPlanProgress.belongsTo(User, {
  foreignKey: "caregiverId",
  as: "caregiver",
});

User.hasMany(TreatmentPlanProgress, {
  foreignKey: "caregiverId",
  as: "reportedProgress",
});

// Progress Report Associations
ProgressReport.belongsTo(Elder, { foreignKey: "elderId", as: "elder" });
ProgressReport.belongsTo(User, {
  foreignKey: "specialistId",
  as: "specialist",
});

Elder.hasMany(ProgressReport, { foreignKey: "elderId", as: "progressReports" });
User.hasMany(ProgressReport, {
  foreignKey: "specialistId",
  as: "createdProgressReports",
});

// Group Therapy Session Associations
GroupTherapySession.belongsTo(User, {
  foreignKey: "specialistId",
  as: "specialist",
});
GroupTherapySession.hasMany(TherapySession, {
  foreignKey: "groupSessionId",
  as: "individualSessions",
});

User.hasMany(GroupTherapySession, {
  foreignKey: "specialistId",
  as: "groupSessions",
});

// Resource Associations
MentalHealthResource.belongsTo(User, {
  foreignKey: "uploadedBy",
  as: "uploader",
});
User.hasMany(MentalHealthResource, {
  foreignKey: "uploadedBy",
  as: "uploadedResources",
});

module.exports = {
  sequelize,
  User,
  Elder,
  Subscription,
  HealthMonitoring,
  HealthAlert,
  Notification,
  StaffAssignment,
  DoctorAssignment,
  Appointment,
  ConsultationRecord,
  Doctor,
  DoctorSchedule,
  Inventory,
  InventoryTransaction,
  Prescription,
  PrescriptionItem,
  Delivery,
  Ambulance,
  EmergencyAlert,
  AmbulanceDispatch,
  EmergencyLocation,
  // Mental Health Models
  MentalHealthAssignment,
  TherapySession,
  MentalHealthAssessment,
  TreatmentPlan,
  TreatmentPlanProgress,
  ProgressReport,
  GroupTherapySession,
  MentalHealthResource,
};
