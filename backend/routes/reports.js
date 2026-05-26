const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Salary = require('../models/Salary');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.get('/summary', async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments();
    const departmentCount = await Department.countDocuments();
    const totalRecords = await Salary.countDocuments();

    const salaryAgg = await Salary.aggregate([
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$grossSalary' },
          totalDeduction: { $sum: '$totalDeduction' },
          totalNet: { $sum: '$netSalary' },
          avgNet: { $avg: '$netSalary' },
        }
      }
    ]);

    const recentSalaries = await Salary.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedRecent = await Promise.all(recentSalaries.map(async (s) => {
      const emp = await Employee.findOne({ employeeNumber: s.employeeNumber });
      return {
        _id: s._id,
        employeeNumber: s.employeeNumber,
        grossSalary: s.grossSalary,
        totalDeduction: s.totalDeduction,
        netSalary: s.netSalary,
        monthOfPayment: s.monthOfPayment,
        firstName: emp?.firstName || '',
        lastName: emp?.lastName || '',
        position: emp?.position || '',
      };
    }));

    const stats = salaryAgg[0] || { totalGross: 0, totalDeduction: 0, totalNet: 0, avgNet: 0 };

    res.json({
      employees: employeeCount,
      departments: departmentCount,
      salaryStats: {
        totalRecords,
        totalGross: stats.totalGross,
        totalDeduction: stats.totalDeduction,
        totalNet: stats.totalNet,
        avgNet: stats.avgNet,
      },
      recentSalaries: formattedRecent,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const salaries = await Salary.find({
      createdAt: { $gte: targetDate, $lt: nextDay }
    })
      .sort({ createdAt: 1 });

    const formatted = await formatSalariesWithDept(salaries);

    res.json({ date: targetDate.toISOString().split('T')[0], records: formatted, count: formatted.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/weekly', async (req, res) => {
  try {
    const { weekStart } = req.query;
    let startDate, endDate;

    if (weekStart) {
      startDate = new Date(weekStart);
      endDate = new Date(weekStart);
      endDate.setDate(endDate.getDate() + 6);
    } else {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    const salaries = await Salary.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .sort({ createdAt: 1 });

    const formatted = await formatSalariesWithDept(salaries);

    res.json({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      records: formatted,
      count: formatted.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const salaries = await Salary.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .sort({ createdAt: 1 });

    const formatted = await formatSalariesWithDept(salaries);

    res.json({
      month: String(currentMonth).padStart(2, '0'),
      year: currentYear,
      records: formatted,
      count: formatted.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/department', async (req, res) => {
  try {
    const departments = await Department.find().sort({ departmentCode: 1 });

    const result = await Promise.all(departments.map(async (dept) => {
      const employees = await Employee.find({ departmentCode: dept.departmentCode });
      const empNumbers = employees.map(e => e.employeeNumber);

      const salaryAgg = await Salary.aggregate([
        { $match: { employeeNumber: { $in: empNumbers } } },
        {
          $group: {
            _id: null,
            totalGross: { $sum: '$grossSalary' },
            totalDeduction: { $sum: '$totalDeduction' },
            totalNet: { $sum: '$netSalary' },
          }
        }
      ]);

      const stats = salaryAgg[0] || { totalGross: 0, totalDeduction: 0, totalNet: 0 };

      return {
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        employeeCount: employees.length,
        totalGross: stats.totalGross,
        totalDeduction: stats.totalDeduction,
        totalNet: stats.totalNet,
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

async function formatSalariesWithDept(salaries) {
  return await Promise.all(salaries.map(async (s) => {
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
}

module.exports = router;
