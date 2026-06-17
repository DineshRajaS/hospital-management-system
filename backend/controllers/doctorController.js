const { Doctor, User, Appointment } = require('../models');
const { Op, fn, col, where } = require('sequelize');

const getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, minFee, maxFee } = req.query;
    
    const whereClause = {};
    if (specialization) {
      whereClause.specialization = { [Op.like]: `%${specialization}%` };
    }
    if (minFee || maxFee) {
      whereClause.consultationFee = {};
      if (minFee) whereClause.consultationFee[Op.gte] = minFee;
      if (maxFee) whereClause.consultationFee[Op.lte] = maxFee;
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['name', 'email', 'phone']
      }],
      order: [['rating', 'DESC']]
    });

    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['name', 'email', 'phone']
      }]
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// const searchDoctors = async (req, res, next) => {
//   try {
//     const { name, specialization, department } = req.query;

//     const whereClause = {};
//     if (specialization) whereClause.specialization = { [Op.like]: `%${specialization}%` };
//     if (department) whereClause.department = { [Op.like]: `%${department}%` };

//     const userWhere = {};
//     if (name) userWhere.name = { [Op.like]: `%${name}%` };

//     const doctors = await Doctor.findAll({
//       where: whereClause,
//       // include: [{
//       //   model: User,
//       //   attributes: ['name', 'email', 'phone'],
//       //   where: userWhere
//       // }]
//       include: [{
//         model: User,
//         attributes: ['name', 'email', 'phone'],
//         where: Object.keys(userWhere).length ? userWhere : undefined,
//         required: !!Object.keys(userWhere).length, // false if no name filter
//       }]
//     });

//     res.json({ success: true, data: doctors });
//   } catch (error) {
//     next(error);
//   }
// };


const searchDoctors = async (req, res, next) => {
  try {
    const { name, specialization, department } = req.query;

    const whereClause = {};
    const userWhere = {};

    if (specialization) {
      whereClause.specialization = where(fn('LOWER', col('specialization')), {
        [Op.like]: `%${specialization.toLowerCase()}%`
      });
    }

    if (department) {
      whereClause.department = where(fn('LOWER', col('department')), {
        [Op.like]: `%${department.toLowerCase()}%`
      });
    }

    if (name) {
      userWhere.name = where(fn('LOWER', col('User.name')), {
        [Op.like]: `%${name.toLowerCase()}%`
      });
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['name', 'email', 'phone'],
        where: Object.keys(userWhere).length ? userWhere : undefined,
        required: !!Object.keys(userWhere).length
      }]
    });

    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};


const createDoctor = async (req, res, next) => {
  try {
    const { email, password, name, phone, ...doctorData } = req.body;

    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: 'doctor'
    });

    const doctor = await Doctor.create({
      userId: user.id,
      ...doctorData
    });

    const result = await Doctor.findByPk(doctor.id, {
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Doctor created successfully',
      data: result 
    });
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await doctor.update(req.body);
    
    const updated = await Doctor.findByPk(doctor.id, {
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
    });

    res.json({ 
      success: true, 
      message: 'Doctor updated successfully',
      data: updated 
    });
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await User.destroy({ where: { id: doctor.userId } });

    res.json({ 
      success: true, 
      message: 'Doctor deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

const updateOwnProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ 
      where: { userId: req.user.userId } 
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const { consultationFee, workingHoursStart, workingHoursEnd } = req.body;
    
    await doctor.update({
      consultationFee,
      workingHoursStart,
      workingHoursEnd
    });

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: doctor 
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorAnalytics = async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{
        model: Appointment,
        attributes: []
      }],
      attributes: [
        'id',
        [Doctor.sequelize.fn('COUNT', Doctor.sequelize.col('Appointments.id')), 'appointmentCount']
      ],
      group: ['Doctor.id'],
      order: [[Doctor.sequelize.literal('appointmentCount'), 'DESC']]
    });

    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  searchDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateOwnProfile,
  getDoctorAnalytics
};