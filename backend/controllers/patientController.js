const { Patient, User } = require('../models');
const { Op } = require('sequelize');

const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email', 'phone']
      }]
    });

    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['name', 'email', 'phone']
      }]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const createPatient = async (req, res, next) => {
  try {
    const { email, password, name, phone, ...patientData } = req.body;

    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: 'patient'
    });

    const patientId = `PAT${Date.now()}`;
    const patient = await Patient.create({
      userId: user.id,
      patientId,
      ...patientData
    });

    const result = await Patient.findByPk(patient.id, {
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Patient registered successfully',
      data: result 
    });
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await patient.update(req.body);
    
    const updated = await Patient.findByPk(patient.id, {
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
    });

    res.json({ 
      success: true, 
      message: 'Patient updated successfully',
      data: updated 
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { userId: req.user.userId },
      include: [{
        model: User,
        attributes: ['name', 'email', 'phone']
      }]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { userId: req.user.userId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const { address, emergencyContact, bloodGroup } = req.body;
    
    await patient.update({
      address,
      emergencyContact,
      bloodGroup
    });

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: patient 
    });
  } catch (error) {
    next(error);
  }
};

const updateMedicalHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { userId: req.user.userId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const { medicalHistory, allergies, chronicConditions, currentMedications } = req.body;
    
    await patient.update({
      medicalHistory,
      allergies,
      chronicConditions,
      currentMedications
    });

    res.json({ 
      success: true, 
      message: 'Medical history updated successfully',
      data: patient 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getMyProfile,
  updateMyProfile,
  updateMedicalHistory
};