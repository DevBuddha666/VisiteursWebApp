const prisma = require('../config/database');

/**
 * GET /api/formations (PUBLIC)
 * Liste toutes les formations, groupées par catégorie.
 */
async function getAll(req, res, next) {
  try {
    const formations = await prisma.formation.findMany({
      orderBy: [{ categorie: 'asc' }, { nom: 'asc' }],
    });

    // Grouper par catégorie pour le frontend
    const grouped = formations.reduce((acc, f) => {
      if (!acc[f.categorie]) acc[f.categorie] = [];
      acc[f.categorie].push(f);
      return acc;
    }, {});

    res.json({
      success: true,
      data: formations,
      grouped,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/formations (ADMIN)
 * Crée une nouvelle formation.
 */
async function create(req, res, next) {
  try {
    const { nom, categorie } = req.body;

    const formation = await prisma.formation.create({
      data: { nom, categorie },
    });

    console.log(`[AUDIT] Formation créée : ${nom} (${categorie}) à ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      data: formation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/formations/:id (ADMIN)
 * Met à jour une formation.
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { nom, categorie } = req.body;

    const formation = await prisma.formation.update({
      where: { id },
      data: { nom, categorie },
    });

    console.log(`[AUDIT] Formation mise à jour : ${id} à ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: formation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/formations/:id (ADMIN)
 * Supprime une formation.
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    // Vérifier si des visiteurs ont choisi cette formation
    const count = await prisma.visiteurFormation.count({
      where: { formationId: id },
    });

    if (count > 0) {
      return res.status(409).json({
        success: false,
        message: `Impossible de supprimer : ${count} visiteur(s) ont choisi cette formation.`,
      });
    }

    await prisma.formation.delete({ where: { id } });

    console.log(`[AUDIT] Formation supprimée : ${id} à ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Formation supprimée avec succès.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, update, remove };
