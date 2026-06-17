const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/search', doctorController.searchDoctors);
router.get('/:id', doctorController.getDoctorById);

// Admin only routes
router.post('/', authenticate, checkRole('admin'), doctorController.createDoctor);
router.put('/:id', authenticate, checkRole('admin'), doctorController.updateDoctor);
router.delete('/:id', authenticate, checkRole('admin'), doctorController.deleteDoctor);

// Doctor self-management
router.put('/profile/me', authenticate, checkRole('doctor'), doctorController.updateOwnProfile);
router.get('/analytics/appointments', authenticate, checkRole('admin'), doctorController.getDoctorAnalytics);

module.exports = router;

