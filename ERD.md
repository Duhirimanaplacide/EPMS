# Employee Payroll Management System (EPMS)
## Entity Relationship Diagram (ERD)

### Entities and Attributes (MongoDB Documents)

#### 1. Department
- **_id** (ObjectId, auto-generated PK)
- **departmentCode** (String, unique)
- **departmentName** (String)
- createdAt, updatedAt

#### 2. Employee
- **_id** (ObjectId, auto-generated PK)
- **employeeNumber** (String, unique)
- **firstName** (String)
- **lastName** (String)
- **address** (String)
- **position** (String)
- **telephone** (String)
- **gender** (String: 'Male' or 'Female')
- **hiredDate** (Date)
- **departmentCode** (ObjectId, ref: Department)
- createdAt, updatedAt

#### 3. Salary
- **_id** (ObjectId, auto-generated PK)
- **employeeNumber** (ObjectId, ref: Employee)
- **grossSalary** (Number)
- **totalDeduction** (Number)
- **netSalary** (Number)
- **monthOfPayment** (String)
- createdAt, updatedAt

#### 4. User (Authentication)
- **_id** (ObjectId, auto-generated PK)
- **username** (String, unique)
- **password** (String, hashed with bcrypt)
- **role** (String, default: 'hr')
- createdAt, updatedAt

### Relationships

1. **Department to Employee**: One-to-Many (1:N)
   - One department can have many employees
   - Employee stores a reference (ObjectId) to Department

2. **Employee to Salary**: One-to-Many (1:N)
   - One employee can have many salary records (different months)
   - Salary stores a reference (ObjectId) to Employee

### ERD Diagram (Text Representation)

```
+------------------+       1:N        +---------------------------+
|   DEPARTMENT     |◄----------------|      EMPLOYEE             |
+------------------+                  +---------------------------+
| _id (PK)         |                  | _id (PK)                  |
| departmentCode   |                  | employeeNumber            |
| departmentName   |                  | firstName                 |
| createdAt        |                  | lastName                  |
| updatedAt        |                  | address                   |
+------------------+                  | position                  |
                                      | telephone                 |
                                      | gender                    |
                                      | hiredDate                 |
                                      | departmentCode (FK)  ─────┤
                                      | createdAt                 |
                                      | updatedAt                 |
                                      +---------------------------+
                                               |
                                               | 1:N
                                               ▼
                                      +---------------------------+
                                      |       SALARY              |
                                      +---------------------------+
                                      | _id (PK)                  |
                                      | employeeNumber (FK)  ─────┤
                                      | grossSalary               |
                                      | totalDeduction            |
                                      | netSalary                 |
                                      | monthOfPayment            |
                                      | createdAt                 |
                                      | updatedAt                 |
                                      +---------------------------+
```

### Database: EPMS (MongoDB)

### Sample Data (MongoDB Insert Statements)

```javascript
// Departments
db.departments.insertMany([
  { departmentCode: "D001", departmentName: "Logistics" },
  { departmentCode: "D002", departmentName: "Administration" },
  { departmentCode: "D003", departmentName: "Operations" },
  { departmentCode: "D004", departmentName: "Finance" }
]);

// Get department IDs for references
const logistics = db.departments.findOne({ departmentCode: "D001" })._id;
const admin = db.departments.findOne({ departmentCode: "D002" })._id;
const ops = db.departments.findOne({ departmentCode: "D003" })._id;
const finance = db.departments.findOne({ departmentCode: "D004" })._id;

// Employees
db.employees.insertMany([
  { employeeNumber: "EMP001", firstName: "Jean", lastName: "Mugabo", address: "Rubavu Town", position: "Driver", telephone: "0781234567", gender: "Male", hiredDate: new Date("2023-01-15"), departmentCode: logistics },
  { employeeNumber: "EMP002", firstName: "Marie", lastName: "Uwimana", address: "Gisenyi", position: "HR Officer", telephone: "0789876543", gender: "Female", hiredDate: new Date("2022-06-01"), departmentCode: admin },
  { employeeNumber: "EMP003", firstName: "Patrick", lastName: "Ndayisaba", address: "Mudende", position: "Dispatcher", telephone: "0723456789", gender: "Male", hiredDate: new Date("2023-03-20"), departmentCode: ops },
  { employeeNumber: "EMP004", firstName: "Claudine", lastName: "Mukamana", address: "Nyamyumba", position: "Accountant", telephone: "0788765432", gender: "Female", hiredDate: new Date("2023-07-10"), departmentCode: finance }
]);

// Get employee numbers for salary references
const emp1 = db.employees.findOne({ employeeNumber: "EMP001" }).employeeNumber;
const emp2 = db.employees.findOne({ employeeNumber: "EMP002" }).employeeNumber;
const emp3 = db.employees.findOne({ employeeNumber: "EMP003" }).employeeNumber;
const emp4 = db.employees.findOne({ employeeNumber: "EMP004" }).employeeNumber;

// Salaries
db.salaries.insertMany([
  { employeeNumber: emp1, grossSalary: 350000, totalDeduction: 35000, netSalary: 315000, monthOfPayment: "January 2024" },
  { employeeNumber: emp2, grossSalary: 450000, totalDeduction: 45000, netSalary: 405000, monthOfPayment: "January 2024" },
  { employeeNumber: emp3, grossSalary: 300000, totalDeduction: 30000, netSalary: 270000, monthOfPayment: "January 2024" },
  { employeeNumber: emp4, grossSalary: 400000, totalDeduction: 40000, netSalary: 360000, monthOfPayment: "January 2024" },
  { employeeNumber: emp1, grossSalary: 350000, totalDeduction: 35000, netSalary: 315000, monthOfPayment: "February 2024" },
  { employeeNumber: emp2, grossSalary: 450000, totalDeduction: 45000, netSalary: 405000, monthOfPayment: "February 2024" },
  { employeeNumber: emp3, grossSalary: 320000, totalDeduction: 32000, netSalary: 288000, monthOfPayment: "February 2024" },
  { employeeNumber: emp4, grossSalary: 400000, totalDeduction: 40000, netSalary: 360000, monthOfPayment: "February 2024" }
]);