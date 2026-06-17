// seeders/defaultUsers.js
const seedDefaultUsers = async (User, Doctor, Patient) => {
  console.log('🌱 Checking default users...');

  // ── 1. Admin ──────────────────────────────────────────────────
  const adminEmail = 'admin@hospital.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
      phone: '9000000001',
      isActive: true
    });
    console.log(`✅ Created admin: ${adminEmail} (password: Admin@123)`);
  } else {
    console.log(`⏭️  Admin already exists: ${adminEmail}`);
  }

  // ── 2. Doctor ─────────────────────────────────────────────────
  const doctorEmail = 'doctor@hospital.com';
  const existingDoctorUser = await User.findOne({ where: { email: doctorEmail } });

  if (!existingDoctorUser) {
    const doctorUser = await User.create({
      name: 'Dr. Default Doctor',
      email: doctorEmail,
      password: 'Doctor@123',
      role: 'doctor',
      phone: '9000000002',
      isActive: true
    });

    // Mirror exactly what register() does for role === 'doctor'
    await Doctor.create({
      userId: doctorUser.id,
      specialization: 'General Medicine',
      qualification: 'MBBS',
      experience: 5,
      consultationFee: 500,
      department: 'General'
    });

    console.log(`✅ Created doctor: ${doctorEmail} (password: Doctor@123)`);
  } else {
    console.log(`⏭️  Doctor already exists: ${doctorEmail}`);
  }

  // ── 3. Patient ────────────────────────────────────────────────
  const patientEmail = 'patient@hospital.com';
  const existingPatientUser = await User.findOne({ where: { email: patientEmail } });

  if (!existingPatientUser) {
    const patientUser = await User.create({
      name: 'Default Patient',
      email: patientEmail,
      password: 'Patient@123',
      role: 'patient',
      phone: '9000000003',
      isActive: true
    });

    // Mirror exactly what register() does for role === 'patient'
    const patientId = `PAT${Date.now()}`;
    await Patient.create({
      userId: patientUser.id,
      patientId,
      dateOfBirth: '1990-01-01',
      gender: 'male',
      bloodGroup: 'O+',
      address: '123 Default Street'
    });

    console.log(`✅ Created patient: ${patientEmail} (password: Patient@123)`);
  } else {
    console.log(`⏭️  Patient already exists: ${patientEmail}`);
  }

  console.log('🌱 Seeding complete.');
};

module.exports = { seedDefaultUsers };