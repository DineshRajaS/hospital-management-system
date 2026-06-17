const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Admin routes
router.post('/', authenticate, checkRole('admin'), billController.createBill);
router.get('/', authenticate, checkRole('admin'), billController.getAllBills);
router.get('/doctor/:doctorId', authenticate, checkRole('admin'), billController.getBillsByDoctor);
router.get('/patient/:patientId', authenticate, checkRole('admin', 'patient'), billController.getBillsByPatient);
router.get('/reports/summary', authenticate, checkRole('admin'), billController.getBillingSummary);
router.get('/:id', authenticate, billController.getBillById);
router.put('/:id', authenticate, checkRole('admin'), billController.updateBill);

// Patient routes
router.get('/my-bills/all', authenticate, checkRole('patient'), billController.getMyBills);

module.exports = router;