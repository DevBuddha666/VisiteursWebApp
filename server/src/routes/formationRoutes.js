const express = require('express');
const router = express.Router();
const formationController = require('../controllers/formationController');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const { formationSchema } = require('../config/validation');

// Route publique — liste des formations pour le formulaire
router.get('/', formationController.getAll);

// Routes protégées (admin)
router.post('/', authMiddleware, validate(formationSchema), formationController.create);
router.put('/:id', authMiddleware, validate(formationSchema), formationController.update);
router.delete('/:id', authMiddleware, formationController.remove);

module.exports = router;
