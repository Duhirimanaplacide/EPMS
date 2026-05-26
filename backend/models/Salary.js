const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employeeNumber: { type: String, required: true },
  grossSalary: { type: Number, required: true },
  totalDeduction: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  monthOfPayment: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);
