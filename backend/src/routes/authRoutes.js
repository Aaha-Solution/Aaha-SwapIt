const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { loginValidation, registerValidation } = require('../validations/authValidation');

router.post('/login', loginValidation, validationMiddleware, authController.login);
router.post('/signup', registerValidation, validationMiddleware, authController.signup);
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
