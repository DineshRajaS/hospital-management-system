const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Admin routes
router.get('/', authenticate, checkRole('admin', 'doctor'), patientController.getAllPatients);
router.get('/:id', authenticate, checkRole('admin', 'doctor'), patientController.getPatientById);
router.post('/', authenticate, checkRole('admin'), patientController.createPatient);
router.put('/:id', authenticate, checkRole('admin'), patientController.updatePatient);

// Patient self-management
router.get('/profile/me', authenticate, checkRole('patient'), patientController.getMyProfile);
router.put('/profile/me', authenticate, checkRole('patient'), patientController.updateMyProfile);
router.put('/medical-history/me', authenticate, checkRole('patient'), patientController.updateMedicalHistory);

module.exports = router;