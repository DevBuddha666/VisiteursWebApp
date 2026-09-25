const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const { loginSchema, changePasswordSchema } = require('../config/validation');
const { loginLimiter } = require('../middlewares/rateLimit');

// Routes publiques
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);

// Routes protégées
router.get('/me', authMiddleware, authController.me);
router.put('/password', authMiddleware, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
