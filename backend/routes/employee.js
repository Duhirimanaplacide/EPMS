const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('departmentCode', 'departmentName')
      .sort({ employeeNumber: 1 });

    const formatted = employees.map(emp => ({
      ...emp.toObject(),
      departmentName: emp.departmentCode?.departmentName || null,
      departmentCode: emp.departmentCode?._id || emp.departmentCode,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { employeeNumber, firstName, lastName, address, position, telephone, gender, hiredDate, departmentCode } = req.body;

    const existing = await Employee.findOne({ employeeNumber });
    if (existing) {
      return res.status(400).json({ message: 'Employee number already exists' });
    }

    await Employee.create({
      employeeNumber,
      firstName,
      lastName,
      address,
      position,
      telephone,
      gender,
      hiredDate,
      departmentCode: departmentCode || null,
    });

    res.status(201).json({ message: 'Employee added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
