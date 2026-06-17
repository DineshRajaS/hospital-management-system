const { Payment, Bill, Patient, User, Appointment, Doctor } = require('../models');
const { Op } = require('sequelize');

const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
};

const recordPayment = async (req, res, next) => {
  try {
    const { billId, patientId, amount, paymentMethod } = req.body;

    const bill = await Bill.findByPk(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const existingPayment = await Payment.findOne({ where: { billId } });
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already recorded for this bill' });
    }

    if (parseFloat(amount) !== parseFloat(bill.totalAmount)) {
      return res.status(400).json({ error: 'Payment amount must match bill total' });
    }

    const transactionId = generateTransactionId();

    const payment = await Payment.create({
      billId,
      patientId,
      amount,
      paymentMethod,
      transactionId,
      paymentStatus: 'completed'
    });

    await bill.update({ status: 'paid' });

    const result = await Payment.findByPk(payment.id, {
      include: [
        { model: Bill },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Payment recorded successfully',
      data: result 
    });
  } catch (error) {
    next(error);
  }
};

const initiatePayment = async (req, res, next) => {
  try {
    const { billId, paymentMethod } = req.body;

    const patient = await Patient.findOne({ where: { userId: req.user.userId } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const bill = await Bill.findByPk(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (bill.patientId !== patient.id) {
      return res.status(403).json({ error: 'Unauthorized access to this bill' });
    }

    const existingPayment = await Payment.findOne({ where: { billId } });
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already exists for this bill' });
    }

    const transactionId = generateTransactionId();

    const payment = await Payment.create({
      billId,
      patientId: patient.id,
      amount: bill.totalAmount,
      paymentMethod,
      transactionId,
      paymentStatus: 'completed'
    });

    await bill.update({ status: 'paid' });

    res.status(201).json({ 
      success: true, 
      message: 'Payment processed successfully',
      data: {
        transactionId,
        amount: payment.amount,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;
    
    const whereClause = {};
    if (paymentMethod) whereClause.paymentMethod = paymentMethod;
    if (startDate && endDate) {
      whereClause.paymentDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [
        { 
          model: Bill, 
          include: [
            { 
              model: Appointment, 
              include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }] 
            }
          ]
        },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['paymentDate', 'DESC']]
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        { model: Bill },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const getPaymentByBill = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      where: { billId: req.params.billId },
      include: [
        { model: Bill },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found for this bill' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const getPaymentsByPatient = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      where: { patientId: req.params.patientId },
      include: [
        { model: Bill },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ],
      order: [['paymentDate', 'DESC']]
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.userId } });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const payments = await Payment.findAll({
      where: { patientId: patient.id },
      include: [
        { 
          model: Bill,
          include: [
            { 
              model: Appointment, 
              include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }] 
            }
          ]
        }
      ],
      order: [['paymentDate', 'DESC']]
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.paymentDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalRevenue = await Payment.findAll({
      where: whereClause,
      attributes: [
        [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'totalPayments'],
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'totalRevenue']
      ]
    });

    const byPaymentMethod = await Payment.findAll({
      where: whereClause,
      attributes: [
        'paymentMethod',
        [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'count'],
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'revenue']
      ],
      group: ['paymentMethod']
    });

    const dailyRevenue = await Payment.findAll({
      where: whereClause,
      attributes: [
        [Payment.sequelize.fn('DATE', Payment.sequelize.col('paymentDate')), 'date'],
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'revenue']
      ],
      group: [Payment.sequelize.fn('DATE', Payment.sequelize.col('paymentDate'))],
      order: [[Payment.sequelize.fn('DATE', Payment.sequelize.col('paymentDate')), 'DESC']]
    });

    res.json({ 
      success: true, 
      data: {
        summary: totalRevenue[0].dataValues,
        byPaymentMethod,
        dailyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPayment,
  initiatePayment,
  getAllPayments,
  getPaymentById,
  getPaymentByBill,
  getPaymentsByPatient,
  getMyPayments,
  getRevenueReport
};