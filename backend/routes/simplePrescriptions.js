const express = require('express');
const router = express.Router();
const { SimplePrescription } = require('../models');

router.get('/', async (req, res) => {
  try {
    const prescriptions = await SimplePrescription.findAll();
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
