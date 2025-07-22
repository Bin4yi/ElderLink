// routes/dashboard.js (or wherever you're organizing routes)
const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory'); // adjust the path if needed

router.get('/pharmacyDashboard', async (req, res) => {
  try {
    const totalMedicines = await Inventory.count();
    const lowStockMedicines = await Inventory.count({
      where: { quantity: { [Op.lt]: 5 } }
    });
    const outOfStockMedicines = await Inventory.count({
      where: { quantity: 0 }
    });

    res.json({
      totalMedicines,
      lowStockMedicines,
      outOfStockMedicines
    });
  } catch (err) {
    console.error('Error fetching pharmacy dashboard:', err);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
});

module.exports = router;
