const vitalsModel = require('../models/monitoring');

exports.getAll = async (req, res) => {
  const vitals = await vitalsModel.getAllVitals();
  res.json(vitals);
};

exports.getById = async (req, res) => {
  const vital = await vitalsModel.getVitalsById(req.params.id);
  res.json(vital);
};

exports.create = async (req, res) => {
  const newVital = await vitalsModel.createVitals(req.body);
  res.status(201).json(newVital);
};

exports.update = async (req, res) => {
  const updated = await vitalsModel.updateVitals(req.params.id, req.body.vitals);
  res.json(updated);
};

exports.delete = async (req, res) => {
  await vitalsModel.deleteVitals(req.params.id);
  res.status(204).end();
};