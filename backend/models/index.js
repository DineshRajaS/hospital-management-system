// models/index.js
const { sequelize } = require('../config/database');
const UserModel = require('./User');
const DoctorModel = require('./Doctor');
const PatientModel = require('./Patient');
const AppointmentModel = require('./Appointment');
const BillModel = require('./Bill');
const PaymentModel = require('./Payment');
const { seedDefaultUsers } = require('../seeders/defaultUsers');

const User = UserModel(sequelize);
const Doctor = DoctorModel(sequelize);
const Patient = PatientModel(sequelize);
const Appointment = AppointmentModel(sequelize);
const Bill = BillModel(sequelize);
const Payment = PaymentModel(sequelize);

// ─── Associations ────────────────────────────────────────────────
User.hasOne(Doctor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Patient, { foreignKey: 'userId', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'userId' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

Appointment.hasOne(Bill, { foreignKey: 'appointmentId' });
Bill.belongsTo(Appointment, { foreignKey: 'appointmentId' });

Patient.hasMany(Bill, { foreignKey: 'patientId' });
Bill.belongsTo(Patient, { foreignKey: 'patientId' });

Bill.hasOne(Payment, { foreignKey: 'billId' });
Payment.belongsTo(Bill, { foreignKey: 'billId' });

Patient.hasMany(Payment, { foreignKey: 'patientId' });
Payment.belongsTo(Patient, { foreignKey: 'patientId' });

// ─── Sync + Seed ─────────────────────────────────────────────────
const syncDatabase = async () => {
  try {
    // Sync all models (alter in dev, safe no-op if tables already match)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synced successfully');

    // Seed default users (runs only if they don't already exist)
    await seedDefaultUsers(User, Doctor, Patient);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Doctor,
  Patient,
  Appointment,
  Bill,
  Payment,
  syncDatabase
};