const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Department = require('./models/Department');
const Employee = require('./models/Employee');
const Salary = require('./models/Salary');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/EPMS');
    console.log('MongoDB connected');

    await Department.deleteMany({});
    await Employee.deleteMany({});
    await Salary.deleteMany({});
    console.log('Cleared existing data');

    const depts = await Department.insertMany([
      { departmentCode: 'D001', departmentName: 'Logistics' },
      { departmentCode: 'D002', departmentName: 'Administration' },
      { departmentCode: 'D003', departmentName: 'Operations' },
      { departmentCode: 'D004', departmentName: 'Finance' },
    ]);
    console.log('Inserted 4 departments');

    const emps = await Employee.insertMany([
      { employeeNumber: 'EMP001', firstName: 'Jean', lastName: 'Mugabo', address: 'Rubavu Town', position: 'Driver', telephone: '0781234567', gender: 'Male', hiredDate: new Date('2023-01-15'), departmentCode: depts[0]._id },
      { employeeNumber: 'EMP002', firstName: 'Marie', lastName: 'Uwimana', address: 'Gisenyi', position: 'HR Officer', telephone: '0789876543', gender: 'Female', hiredDate: new Date('2022-06-01'), departmentCode: depts[1]._id },
      { employeeNumber: 'EMP003', firstName: 'Patrick', lastName: 'Ndayisaba', address: 'Mudende', position: 'Dispatcher', telephone: '0723456789', gender: 'Male', hiredDate: new Date('2023-03-20'), departmentCode: depts[2]._id },
      { employeeNumber: 'EMP004', firstName: 'Claudine', lastName: 'Mukamana', address: 'Nyamyumba', position: 'Accountant', telephone: '0788765432', gender: 'Female', hiredDate: new Date('2023-07-10'), departmentCode: depts[3]._id },
    ]);
    console.log('Inserted 4 employees');

    await Salary.insertMany([
      { employeeNumber: emps[0].employeeNumber, grossSalary: 350000, totalDeduction: 35000, netSalary: 315000, monthOfPayment: 'January 2024' },
      { employeeNumber: emps[1].employeeNumber, grossSalary: 450000, totalDeduction: 45000, netSalary: 405000, monthOfPayment: 'January 2024' },
      { employeeNumber: emps[2].employeeNumber, grossSalary: 300000, totalDeduction: 30000, netSalary: 270000, monthOfPayment: 'January 2024' },
      { employeeNumber: emps[3].employeeNumber, grossSalary: 400000, totalDeduction: 40000, netSalary: 360000, monthOfPayment: 'January 2024' },
      { employeeNumber: emps[0].employeeNumber, grossSalary: 350000, totalDeduction: 35000, netSalary: 315000, monthOfPayment: 'February 2024' },
      { employeeNumber: emps[1].employeeNumber, grossSalary: 450000, totalDeduction: 45000, netSalary: 405000, monthOfPayment: 'February 2024' },
      { employeeNumber: emps[2].employeeNumber, grossSalary: 320000, totalDeduction: 32000, netSalary: 288000, monthOfPayment: 'February 2024' },
      { employeeNumber: emps[3].employeeNumber, grossSalary: 400000, totalDeduction: 40000, netSalary: 360000, monthOfPayment: 'February 2024' },
    ]);
    console.log('Inserted 8 salary records');

    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({ username: 'admin', password: hashed, role: 'admin' });
      console.log('Created admin user (admin / admin123)');
    } else {
      console.log('Admin user already exists');
    }

    console.log('\nSeed completed successfully');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    process.exit();
  }
}

seed();
