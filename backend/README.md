/*
CREATE DATABASE IF NOT EXISTS hospital_management;
USE hospital_management;

-- Users table will be created by Sequelize automatically
-- Along with all other tables

-- Sample Admin User (password: Admin@123)
-- This should be inserted after running the application once
INSERT INTO users (email, password, role, name, phone, is_active, created_at, updated_at)
VALUES (
  'admin@hospital.com',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
  'admin',
  'System Administrator',
  '9876543210',
  true,
  NOW(),
  NOW()
);
*/

/*
# Get Well Soon - Hospital Management System Backend

## Prerequisites
- Node.js v20+
- MySQL v8.0+
- npm v10.2.3+

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with the configuration shown in the project

4. Create MySQL database:
   ```sql
   CREATE DATABASE hospital_management;
   ```

5. Run the application:
   ```bash
   npm run dev
   ```

The application will:
- Connect to the database
- Sync all models/tables automatically
- Start the server on port 5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Doctors
- GET /api/doctors - Get all doctors
- GET /api/doctors/search - Search doctors
- GET /api/doctors/:id - Get doctor by ID
- POST /api/doctors - Create doctor (Admin)
- PUT /api/doctors/:id - Update doctor (Admin)
- DELETE /api/doctors/:id - Delete doctor (Admin)
- PUT /api/doctors/profile/me - Update own profile (Doctor)

### Patients
- GET /api/patients - Get all patients (Admin/Doctor)
- GET /api/patients/:id - Get patient by ID (Admin/Doctor)
- POST /api/patients - Create patient (Admin)
- PUT /api/patients/:id - Update patient (Admin)
- GET /api/patients/profile/me - Get own profile (Patient)
- PUT /api/patients/profile/me - Update own profile (Patient)

### Appointments
- POST /api/appointments - Create appointment
- GET /api/appointments - Get all appointments
- GET /api/appointments/my-appointments - Get own appointments
- GET /api/appointments/:id - Get appointment by ID
- PUT /api/appointments/:id - Update appointment
- DELETE /api/appointments/:id - Cancel appointment
- POST /api/appointments/check-availability - Check slot availability

### Bills
- POST /api/bills - Create bill (Admin)
- GET /api/bills - Get all bills (Admin)
- GET /api/bills/:id - Get bill by ID
- GET /api/bills/doctor/:doctorId - Get bills by doctor
- GET /api/bills/patient/:patientId - Get bills by patient
- GET /api/bills/my-bills/all - Get own bills (Patient)
- PUT /api/bills/:id - Update bill (Admin)

### Payments
- POST /api/payments - Record payment (Admin)
- POST /api/payments/initiate - Initiate payment (Patient)
- GET /api/payments - Get all payments (Admin)
- GET /api/payments/:id - Get payment by ID
- GET /api/payments/bill/:billId - Get payment by bill
- GET /api/payments/my-payments/all - Get own payments (Patient)
- GET /api/payments/reports/revenue - Get revenue report (Admin)

## Testing

Run tests:
```bash
npm test
```

## Security Features
- JWT authentication
- bcrypt password hashing
- Helmet for HTTP headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention via ORM

## License
MIT
*/
