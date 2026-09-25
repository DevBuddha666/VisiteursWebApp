const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const { sourceSchema } = require('../config/validation');

// Route publique — liste des sources pour le formulaire
router.get('/', sourceController.getAll);

// Routes protégées (admin)
router.post('/', authMiddleware, validate(sourceSchema), sourceController.create);
router.put('/:id', authMiddleware, validate(sourceSchema), sourceController.update);
router.delete('/:id', authMiddleware, sourceController.remove);

module.exports = router;
