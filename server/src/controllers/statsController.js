const prisma = require('../config/database');

/**
 * GET /api/stats/overview (ADMIN)
 * Statistiques globales du dashboard.
 */
async function getOverview(req, res, next) {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    if (startOfWeek > startOfDay) startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── Compteurs principaux ──
    const [totalVisiteurs, todayVisiteurs, weekVisiteurs, monthVisiteurs] = await Promise.all([
      prisma.visiteur.count(),
      prisma.visiteur.count({ where: { dateVisite: { gte: startOfDay } } }),
      prisma.visiteur.count({ where: { dateVisite: { gte: startOfWeek } } }),
      prisma.visiteur.count({ where: { dateVisite: { gte: startOfMonth } } }),
    ]);

    // ── Répartition par sexe ──
    const sexeStats = await prisma.visiteur.groupBy({
      by: ['sexe'],
      _count: { id: true },
    });

    // ── Répartition par niveau scolaire ──
    const niveauStats = await prisma.visiteur.groupBy({
      by: ['niveauScolaire'],
      _count: { id: true },
    });

    // ── Répartition par option du Bac ──
    const optionBacStats = await prisma.visiteur.groupBy({
      by: ['optionBac'],
      _count: { id: true },
    });

    // ── Répartition par formation ──
    const formationStats = await prisma.visiteurFormation.groupBy({
      by: ['formationId'],
      _count: { visiteurId: true },
      orderBy: { _count: { visiteurId: 'desc' } },
      take: 20,
    });

    // Enrichir avec les noms des formations
    const formationIds = formationStats.map((f) => f.formationId);
    const formations = await prisma.formation.findMany({
      where: { id: { in: formationIds } },
      select: { id: true, nom: true, categorie: true },
    });
    const formationMap = Object.fromEntries(formations.map((f) => [f.id, f]));

    const formationData = formationStats.map((f) => ({
      formation: formationMap[f.formationId] || { nom: 'Inconnue', categorie: 'AUTRE' },
      count: f._count.visiteurId,
    }));

    // ── Répartition par source de connaissance ──
    const sourceStats = await prisma.visiteurSource.groupBy({
      by: ['sourceId'],
      _count: { visiteurId: true },
      orderBy: { _count: { visiteurId: 'desc' } },
    });

    const sourceIds = sourceStats.map((s) => s.sourceId);
    const sources = await prisma.sourceConnaissance.findMany({
      where: { id: { in: sourceIds } },
      select: { id: true, libelle: true },
    });
    const sourceMap = Object.fromEntries(sources.map((s) => [s.id, s]));

    const sourceData = sourceStats.map((s) => ({
      source: sourceMap[s.sourceId] || { libelle: 'Inconnue' },
      count: s._count.visiteurId,
    }));

    // ── Classement des orientateurs ──
    const orientateurStats = await prisma.orientateur.findMany({
      where: { actif: true },
      select: {
        id: true,
        nom: true,
        prenom: true,
        _count: { select: { visiteurs: true } },
      },
      orderBy: { visiteurs: { _count: 'desc' } },
      take: 10,
    });

    // ── Évolution sur les 30 derniers jours ──
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyEvolution = await prisma.visiteur.groupBy({
      by: ['dateVisite'],
      where: { dateVisite: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { dateVisite: 'asc' },
    });

    res.json({
      success: true,
      data: {
        counters: {
          total: totalVisiteurs,
          today: todayVisiteurs,
          week: weekVisiteurs,
          month: monthVisiteurs,
        },
        sexe: sexeStats.map((s) => ({ label: s.sexe, count: s._count.id })),
        niveauScolaire: niveauStats.map((n) => ({ label: n.niveauScolaire, count: n._count.id })),
        optionBac: optionBacStats.map((o) => ({ label: o.optionBac, count: o._count.id })),
        formations: formationData,
        sources: sourceData,
        orientateurs: orientateurStats.map((o) => ({
          id: o.id,
          nom: o.nom,
          prenom: o.prenom,
          count: o._count.visiteurs,
        })),
        evolution: dailyEvolution.map((d) => ({
          date: d.dateVisite,
          count: d._count.id,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/stats/orientateurs (ADMIN)
 * Classement complet des orientateurs.
 */
async function getOrientateursStats(req, res, next) {
  try {
    const orientateurs = await prisma.orientateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        code: true,
        actif: true,
        _count: { select: { visiteurs: true } },
      },
      orderBy: { visiteurs: { _count: 'desc' } },
    });

    res.json({
      success: true,
      data: orientateurs.map((o) => ({
        ...o,
        visiteursCount: o._count.visiteurs,
        _count: undefined,
      })),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getOverview, getOrientateursStats };
