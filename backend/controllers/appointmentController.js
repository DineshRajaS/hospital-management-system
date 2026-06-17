const { Appointment, Doctor, Patient, User } = require('../models');
const { Op } = require('sequelize');

const validateWorkingHours = (time) => {
  const [hours] = time.split(':').map(Number);
  return hours >= 9 && hours < 17;
};

const calculateEndTime = (startTime) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours;
  const endMinutes = minutes + 30;
  
  if (endMinutes >= 60) {
    return `${String(endHours + 1).padStart(2, '0')}:${String(endMinutes - 60).padStart(2, '0')}`;
  }
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

const checkAvailability = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, startTime } = req.body;

    if (!validateWorkingHours(startTime)) {
      return res.status(400).json({ 
        error: 'Appointments must be between 9 AM and 5 PM' 
      });
    }

    const endTime = calculateEndTime(startTime);

    const conflicts = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate,
        status: { [Op.ne]: 'cancelled' },
        [Op.or]: [
          {
            startTime: { [Op.between]: [startTime, endTime] }
          },
          {
            endTime: { [Op.between]: [startTime, endTime] }
          }
        ]
      }
    });

    if (conflicts.length > 0) {
      return res.status(400).json({ 
        available: false,
        error: 'Time slot not available' 
      });
    }

    res.json({ 
      success: true, 
      available: true,
      endTime 
    });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, patientId, appointmentDate, startTime, reason } = req.body;

    if (!validateWorkingHours(startTime)) {
      return res.status(400).json({ 
        error: 'Appointments must be between 9 AM and 5 PM' 
      });
    }

    const endTime = calculateEndTime(startTime);

    const conflicts = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate,
        status: { [Op.ne]: 'cancelled' },
        [Op.or]: [
          {
            startTime: { [Op.between]: [startTime, endTime] }
          },
          {
            endTime: { [Op.between]: [startTime, endTime] }
          }
        ]
      }
    });

    if (conflicts.length > 0) {
      return res.status(400).json({ 
        error: 'Appointment slot already booked' 
      });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      appointmentDate,
      startTime,
      endTime,
      reason
    });

    const result = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Appointment scheduled successfully',
      data: result 
    });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    
    const whereClause = {};
    if (date) whereClause.appointmentDate = date;
    if (status) whereClause.status = status;

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'ASC']]
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const whereClause = {};
    
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.userId } });
      whereClause.doctorId = doctor.id;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.userId } });
      whereClause.patientId = patient.id;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'ASC']]
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

const getAppointmentsByDoctor = async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: req.params.doctorId },
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'ASC']]
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

const getAppointmentsByPatient = async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.params.patientId },
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'ASC']]
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { appointmentDate, startTime } = req.body;

    if (startTime && !validateWorkingHours(startTime)) {
      return res.status(400).json({ 
        error: 'Appointments must be between 9 AM and 5 PM' 
      });
    }

    const endTime = startTime ? calculateEndTime(startTime) : appointment.endTime;

    await appointment.update({
      appointmentDate: appointmentDate || appointment.appointmentDate,
      startTime: startTime || appointment.startTime,
      endTime
    });

    res.json({ 
      success: true, 
      message: 'Appointment updated successfully',
      data: appointment 
    });
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.update({ status: req.body.status });

    res.json({ 
      success: true, 
      message: 'Appointment status updated',
      data: appointment 
    });
  } catch (error) {
    next(error);
  }
};

const addConsultationNotes = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { consultationNotes, prescription } = req.body;

    await appointment.update({
      consultationNotes,
      prescription,
      status: 'completed'
    });

    res.json({ 
      success: true, 
      message: 'Consultation notes added',
      data: appointment 
    });
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.update({ status: 'cancelled' });

    res.json({ 
      success: true, 
      message: 'Appointment cancelled successfully' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkAvailability,
  createAppointment,
  getAppointments,
  getMyAppointments,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  addConsultationNotes,
  cancelAppointment
};
