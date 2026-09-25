const { ZodError } = require('zod');

/**
 * Factory de middleware de validation Zod.
 * @param {import('zod').ZodSchema} schema - Le schéma Zod à utiliser pour valider req.body
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // remplace par les données nettoyées
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors,
        });
      }
      next(error);
    }
  };
}

module.exports = validate;
