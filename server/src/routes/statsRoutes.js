const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middlewares/auth');

// Toutes les routes stats sont protégées
router.get('/overview', authMiddleware, statsController.getOverview);
router.get('/orientateurs', authMiddleware, statsController.getOrientateursStats);

module.exports = router;
