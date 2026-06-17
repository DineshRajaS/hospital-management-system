const { User, Doctor, Patient } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');

const register = async (req, res, next) => {
  try {
    const { email, password, role, name, phone, ...roleData } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({ email, password, role, name, phone });

    if (role === 'doctor') {
      await Doctor.create({
        userId: user.id,
        specialization: roleData.specialization,
        qualification: roleData.qualification,
        experience: roleData.experience,
        consultationFee: roleData.consultationFee,
        department: roleData.department
      });
    } else if (role === 'patient') {
      const patientId = `PAT${Date.now()}`;
      await Patient.create({
        userId: user.id,
        patientId,
        ...roleData
      });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      console.log(user);
      return res.status(401).json({ error: 'Invalid credentials, user not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials check password' });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
