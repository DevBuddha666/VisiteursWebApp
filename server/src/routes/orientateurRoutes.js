const express = require('express');
const router = express.Router();
const orientateurController = require('../controllers/orientateurController');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const { orientateurSchema, orientateurUpdateSchema } = require('../config/validation');

// Route publique — vérification du code orientateur
router.get('/verify/:code', orientateurController.verifyCode);

// Routes protégées (admin)
router.get('/', authMiddleware, orientateurController.getAll);
router.post('/', authMiddleware, validate(orientateurSchema), orientateurController.create);
router.put('/:id', authMiddleware, validate(orientateurUpdateSchema), orientateurController.update);
router.delete('/:id', authMiddleware, orientateurController.remove);
router.get('/:id/qrcode', authMiddleware, orientateurController.getQRCode);
router.get('/:id/qrcode-data', authMiddleware, orientateurController.getQRCodeData);
router.get('/:id/stats', authMiddleware, orientateurController.getStats);

module.exports = router;
