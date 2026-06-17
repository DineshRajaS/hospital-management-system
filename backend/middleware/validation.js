const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  body('phone').matches(/^[0-9]{10}$/),
  body('role').isIn(['admin', 'doctor', 'patient']),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
];

const appointmentValidation = [
  body('doctorId').isInt(),
  body('patientId').isInt(),
  body('appointmentDate').isDate(),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  appointmentValidation
};
