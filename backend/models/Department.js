const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentCode: { type: String, required: true, unique: true },
  departmentName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
