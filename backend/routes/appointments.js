const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { appointmentValidation } = require('../middleware/validation');

// Create appointment
router.post('/', authenticate, appointmentValidation, appointmentController.createAppointment);

// Get appointments
router.get('/', authenticate, appointmentController.getAppointments);
router.get('/my-appointments', authenticate, appointmentController.getMyAppointments);
router.get('/doctor/:doctorId', authenticate, appointmentController.getAppointmentsByDoctor);
router.get('/patient/:patientId', authenticate, appointmentController.getAppointmentsByPatient);
router.get('/:id', authenticate, appointmentController.getAppointmentById);

// Update appointment
router.put('/:id', authenticate, appointmentController.updateAppointment);
router.patch('/:id/status', authenticate, appointmentController.updateAppointmentStatus);
router.patch('/:id/notes', authenticate, checkRole('doctor'), appointmentController.addConsultationNotes);

// Cancel appointment
router.delete('/:id', authenticate, appointmentController.cancelAppointment);

// Check availability
router.post('/check-availability', authenticate, appointmentController.checkAvailability);

module.exports = router;