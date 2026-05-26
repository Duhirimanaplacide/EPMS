const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: String,
  position: String,
  telephone: String,
  gender: { type: String, enum: ['Male', 'Female'] },
  hiredDate: Date,
  departmentCode: { type: String, ref: 'Department' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
