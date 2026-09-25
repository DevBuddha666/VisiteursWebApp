/**
 * Middleware global de gestion des erreurs.
 * Capture toutes les erreurs non gérées et renvoie une réponse JSON structurée.
 */
function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`, err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Erreur Prisma : enregistrement non trouvé
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Ressource introuvable.',
    });
  }

  // Erreur Prisma : violation de contrainte unique
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'champ inconnu';
    return res.status(409).json({
      success: false,
      message: `Un enregistrement avec ce ${field} existe déjà.`,
    });
  }

  // Erreur Prisma : violation de clé étrangère
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide : la ressource liée n\'existe pas.',
    });
  }

  // Erreur générique
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500
      ? 'Erreur interne du serveur.'
      : err.message,
  });
}

module.exports = errorHandler;
