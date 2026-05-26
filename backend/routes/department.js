const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ departmentCode: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { departmentCode, departmentName } = req.body;

    const existing = await Department.findOne({ departmentCode });
    if (existing) {
      return res.status(400).json({ message: 'Department code already exists' });
    }

    await Department.create({ departmentCode, departmentName });

    res.status(201).json({ message: 'Department added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
