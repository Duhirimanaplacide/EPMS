const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const salaries = await Salary.find().sort({ createdAt: -1 });

    const formatted = await Promise.all(salaries.map(async (s) => {
      const emp = await Employee.findOne({ employeeNumber: s.employeeNumber });
      let deptName = null;
      if (emp?.departmentCode) {
        const dept = await Department.findById(emp.departmentCode);
        deptName = dept?.departmentName || null;
      }
      return {
        _id: s._id,
        employeeNumber: s.employeeNumber,
        grossSalary: s.grossSalary,
        totalDeduction: s.totalDeduction,
        netSalary: s.netSalary,
        monthOfPayment: s.monthOfPayment,
        createdAt: s.createdAt,
        firstName: emp?.firstName || '',
        lastName: emp?.lastName || '',
        position: emp?.position || '',
        departmentName: deptName,
      };
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    const emp = await Employee.findOne({ employeeNumber: salary.employeeNumber });

    res.json({
      ...salary.toObject(),
      firstName: emp?.firstName || '',
      lastName: emp?.lastName || '',
      position: emp?.position || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { employeeNumber, grossSalary, totalDeduction, netSalary, monthOfPayment } = req.body;

    await Salary.create({
      employeeNumber,
      grossSalary,
      totalDeduction,
      netSalary,
      monthOfPayment,
    });

    res.status(201).json({ message: 'Salary record added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { grossSalary, totalDeduction, netSalary, monthOfPayment } = req.body;

    await Salary.findByIdAndUpdate(req.params.id, {
      grossSalary,
      totalDeduction,
      netSalary,
      monthOfPayment,
    });

    res.json({ message: 'Salary record updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Salary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Salary record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
