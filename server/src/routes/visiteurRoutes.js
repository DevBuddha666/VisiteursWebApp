const express = require('express');
const router = express.Router();
const visiteurController = require('../controllers/visiteurController');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const { visiteurSchema } = require('../config/validation');
const { formLimiter } = require('../middlewares/rateLimit');

// Route publique — soumission du bulletin de visite
router.post('/', formLimiter, validate(visiteurSchema), visiteurController.create);

// Routes protégées (admin)
router.get('/export', authMiddleware, visiteurController.exportCSV);
router.get('/', authMiddleware, visiteurController.getAll);
router.get('/:id', authMiddleware, visiteurController.getById);

module.exports = router;
