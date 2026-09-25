const rateLimit = require('express-rate-limit');

/**
 * Rate limiter pour le login admin.
 * 10 tentatives max par fenêtre de 15 minutes par IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter pour la soumission du formulaire public.
 * 20 soumissions max par fenêtre de 15 minutes par IP.
 */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Trop de soumissions. Veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter global pour l'API.
 * 200 requêtes par fenêtre de 15 minutes par IP.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  formLimiter,
  globalLimiter,
};
