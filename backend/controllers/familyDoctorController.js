// backend/controllers/familyDoctorController.js
const { sequelize } = require('../config/database'); // Adjust if your sequelize instance exports differently
const { QueryTypes } = require('sequelize');

const FamilyDoctorController = {
  getDoctorsList: async (req, res) => {
    try {
      const doctors = await sequelize.query(
        `
        SELECT 
          u.id, u.email, u.phone, u."profileImage", u."firstName", u."lastName",
          d.specialization, d.experience, d.availableDays
        FROM Users u
        INNER JOIN doctors d ON u.id = d.user_id
        WHERE u.role = 'doctor'
        ORDER BY u."firstName", u."lastName";
        `,
        { type: QueryTypes.SELECT }
      );

      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = FamilyDoctorController;

