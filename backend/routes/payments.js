const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Admin routes
router.post('/', authenticate, checkRole('admin'), paymentController.recordPayment);
router.get('/', authenticate, checkRole('admin'), paymentController.getAllPayments);
router.get('/bill/:billId', authenticate, paymentController.getPaymentByBill);
router.get('/patient/:patientId', authenticate, checkRole('admin', 'patient'), paymentController.getPaymentsByPatient);
router.get('/reports/revenue', authenticate, checkRole('admin'), paymentController.getRevenueReport);
router.get('/:id', authenticate, paymentController.getPaymentById);

// Patient routes
router.get('/my-payments/all', authenticate, checkRole('patient'), paymentController.getMyPayments);
router.post('/initiate', authenticate, checkRole('patient'), paymentController.initiatePayment);

module.exports = router;