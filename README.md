# Employee Payroll Management System (EPMS)

A web-based payroll management application for PayMaster Ltd, a transportation and logistics company in Rubavu District, Rwanda.

## Features

- **Employee Management**: Digital recording of employee details
- **Department Management**: Department code and name tracking
- **Payroll Processing**: Automatic net salary calculation
- **Reports**: Daily, weekly, and monthly payroll reports
- **Authentication**: Secure login for HR staff

## Tech Stack

- **Frontend**: React.js + Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Setup Instructions

### 1. Start MongoDB

Make sure MongoDB is installed and running on your system. On Windows, you can start it with:

```bash
mongod
```

Or if MongoDB is running as a service, ensure the service is started.

### 2. Seed the Database

Open a terminal and run:

```bash
mongosh < database/seed.js
```

This creates the `EPMS` database with sample departments, employees, and salary records.

### 3. Backend Setup

```bash
cd backend
npm install
```

Create the admin user:

```bash
node seedAdmin.js
```

Start the backend server:

```bash
npm run dev
```

The API will run on http://localhost:5000

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:3000

### 5. Login

- **Username**: admin
- **Password**: admin123

## Database Schema

### Collections

**Department**
```
{
  _id: ObjectId,
  departmentCode: String (unique),
  departmentName: String
}
```

**Employee**
```
{
  _id: ObjectId,
  employeeNumber: String (unique),
  firstName: String,
  lastName: String,
  address: String,
  position: String,
  telephone: String,
  gender: "Male" | "Female",
  hiredDate: Date,
  departmentCode: ObjectId (ref: Department)
}
```

**Salary**
```
{
  _id: ObjectId,
  employeeNumber: ObjectId (ref: Employee),
  grossSalary: Number,
  totalDeduction: Number,
  netSalary: Number,
  monthOfPayment: String
}
```

**User**
```
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  role: String
}
```

### Relationships

- Department (1) to Employee (N) — referenced by ObjectId
- Employee (1) to Salary (N) — referenced by employeeNumber string

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | Register new user |
| GET | /api/employees | List all employees |
| POST | /api/employees | Add employee |
| GET | /api/departments | List all departments |
| POST | /api/departments | Add department |
| GET | /api/salaries | List all salary records |
| GET | /api/salaries/:id | Get salary record |
| POST | /api/salaries | Add salary record |
| PUT | /api/salaries/:id | Update salary record |
| DELETE | /api/salaries/:id | Delete salary record |
| GET | /api/reports/summary | Dashboard summary |
| GET | /api/reports/daily | Daily payroll report |
| GET | /api/reports/weekly | Weekly payroll report |
| GET | /api/reports/monthly | Monthly payroll report |
| GET | /api/reports/department | Department-wise report |

## Notes

- Employee and Department forms support **insert only**
- Salary form supports **full CRUD** (Create, Read, Update, Delete)
- Net salary is auto-calculated when gross salary and deductions are entered
- Reports can be filtered by date (daily), week start (weekly), or month/year (monthly)
