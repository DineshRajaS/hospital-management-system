const { Bill, Appointment, Patient, Doctor, User } = require('../models');
const { Op } = require('sequelize');

const generateBillNumber = () => {
  return `BILL${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const calculateTotal = (consultationFee, medicineFee, testFee, procedureFee, tax, discount) => {
  const subtotal = parseFloat(consultationFee) + parseFloat(medicineFee) + 
                   parseFloat(testFee) + parseFloat(procedureFee);
  const taxAmount = parseFloat(tax);
  const discountAmount = parseFloat(discount);
  return (subtotal + taxAmount - discountAmount).toFixed(2);
};

const createBill = async (req, res, next) => {
  try {
    const { appointmentId, patientId, consultationFee, medicineFee, testFee, procedureFee, tax, discount } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ error: 'Appointment must be completed before billing' });
    }

    const existingBill = await Bill.findOne({ where: { appointmentId } });
    if (existingBill) {
      return res.status(400).json({ error: 'Bill already exists for this appointment' });
    }

    const billNumber = generateBillNumber();
    const totalAmount = calculateTotal(consultationFee, medicineFee, testFee, procedureFee, tax, discount);

    const bill = await Bill.create({
      billNumber,
      appointmentId,
      patientId,
      consultationFee: consultationFee || 0,
      medicineFee: medicineFee || 0,
      testFee: testFee || 0,
      procedureFee: procedureFee || 0,
      tax: tax || 0,
      discount: discount || 0,
      totalAmount
    });

    const result = await Bill.findByPk(bill.id, {
      include: [
        { model: Appointment },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Bill generated successfully',
      data: result 
    });
  } catch (error) {
    next(error);
  }
};

const getAllBills = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.billDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const bills = await Bill.findAll({
      where: whereClause,
      include: [
        { model: Appointment, include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['billDate', 'DESC']]
    });

    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
};

const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [
        { model: Appointment, include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ]
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

const getBillsByDoctor = async (req, res, next) => {
  try {
    const bills = await Bill.findAll({
      include: [
        { 
          model: Appointment, 
          where: { doctorId: req.params.doctorId },
          include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }]
        },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['billDate', 'DESC']]
    });

    const totalRevenue = bills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0);

    res.json({ 
      success: true, 
      data: bills,
      summary: {
        totalBills: bills.length,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBillsByPatient = async (req, res, next) => {
  try {
    const bills = await Bill.findAll({
      where: { patientId: req.params.patientId },
      include: [
        { model: Appointment, include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['billDate', 'DESC']]
    });

    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
};

const getMyBills = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.userId } });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const bills = await Bill.findAll({
      where: { patientId: patient.id },
      include: [
        { model: Appointment, include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }] }
      ],
      order: [['billDate', 'DESC']]
    });

    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
};

const updateBill = async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const { consultationFee, medicineFee, testFee, procedureFee, tax, discount } = req.body;

    const totalAmount = calculateTotal(
      consultationFee || bill.consultationFee,
      medicineFee || bill.medicineFee,
      testFee || bill.testFee,
      procedureFee || bill.procedureFee,
      tax || bill.tax,
      discount || bill.discount
    );

    await bill.update({
      consultationFee,
      medicineFee,
      testFee,
      procedureFee,
      tax,
      discount,
      totalAmount
    });

    res.json({ 
      success: true, 
      message: 'Bill updated successfully',
      data: bill 
    });
  } catch (error) {
    next(error);
  }
};

const getBillingSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.billDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const bills = await Bill.findAll({
      where: whereClause,
      attributes: [
        [Bill.sequelize.fn('COUNT', Bill.sequelize.col('id')), 'totalBills'],
        [Bill.sequelize.fn('SUM', Bill.sequelize.col('totalAmount')), 'totalRevenue'],
        [Bill.sequelize.fn('SUM', Bill.sequelize.col('consultationFee')), 'consultationRevenue'],
        [Bill.sequelize.fn('SUM', Bill.sequelize.col('medicineFee')), 'medicineRevenue'],
        [Bill.sequelize.fn('SUM', Bill.sequelize.col('testFee')), 'testRevenue']
      ]
    });

    const pendingBills = await Bill.count({
      where: { ...whereClause, status: 'pending' }
    });

    const paidBills = await Bill.count({
      where: { ...whereClause, status: 'paid' }
    });

    res.json({ 
      success: true, 
      data: {
        ...bills[0].dataValues,
        pendingBills,
        paidBills
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  getBillsByDoctor,
  getBillsByPatient,
  getMyBills,
  updateBill,
  getBillingSummary
};