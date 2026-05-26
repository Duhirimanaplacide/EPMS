const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employee'));
app.use('/api/departments', require('./routes/department'));
app.use('/api/salaries', require('./routes/salary'));
app.use('/api/reports', require('./routes/reports'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
