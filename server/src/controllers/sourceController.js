const prisma = require('../config/database');

/**
 * GET /api/sources (PUBLIC)
 * Liste toutes les sources de connaissance.
 */
async function getAll(req, res, next) {
  try {
    const sources = await prisma.sourceConnaissance.findMany({
      orderBy: { libelle: 'asc' },
    });

    res.json({
      success: true,
      data: sources,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/sources (ADMIN)
 * Crée une nouvelle source de connaissance.
 */
async function create(req, res, next) {
  try {
    const { libelle } = req.body;

    const source = await prisma.sourceConnaissance.create({
      data: { libelle },
    });

    console.log(`[AUDIT] Source créée : ${libelle} à ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      data: source,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/sources/:id (ADMIN)
 * Met à jour une source de connaissance.
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { libelle } = req.body;

    const source = await prisma.sourceConnaissance.update({
      where: { id },
      data: { libelle },
    });

    console.log(`[AUDIT] Source mise à jour : ${id} à ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: source,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/sources/:id (ADMIN)
 * Supprime une source de connaissance.
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const count = await prisma.visiteurSource.count({
      where: { sourceId: id },
    });

    if (count > 0) {
      return res.status(409).json({
        success: false,
        message: `Impossible de supprimer : ${count} visiteur(s) ont sélectionné cette source.`,
      });
    }

    await prisma.sourceConnaissance.delete({ where: { id } });

    console.log(`[AUDIT] Source supprimée : ${id} à ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Source de connaissance supprimée avec succès.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, update, remove };
