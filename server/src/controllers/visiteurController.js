const prisma = require('../config/database');

/**
 * POST /api/visiteurs (PUBLIC)
 * Crée un nouveau bulletin de visite.
 * - dateVisite, heureVisite, numeroOrdre sont calculés côté serveur
 * - Le code orientateur (refCode) est revalidé côté serveur
 */
async function create(req, res, next) {
  try {
    const {
      nomPrenom, dateNaissance, lieuNaissance, sexe,
      adresse, quartier, ville, telephone, email,
      niveauScolaire, etablissement, optionBac,
      professionPere, professionMere, professionVisiteur,
      refCode, formationIds, sourceIds,
    } = req.body;

    // ── Calculer date, heure et numéro d'ordre côté serveur ──
    const now = new Date();
    const dateVisite = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const heureVisite = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Casablanca',
    });

    // Numéro d'ordre : auto-incrémenté par jour
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const lastVisiteur = await prisma.visiteur.findFirst({
      where: {
        dateVisite: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
      orderBy: { numeroOrdre: 'desc' },
      select: { numeroOrdre: true },
    });

    const numeroOrdre = (lastVisiteur?.numeroOrdre || 0) + 1;

    // ── Vérifier le code orientateur si fourni ──
    let orientateurId = null;
    if (refCode) {
      const orientateur = await prisma.orientateur.findUnique({
        where: { code: refCode },
        select: { id: true, actif: true },
      });

      if (orientateur && orientateur.actif) {
        orientateurId = orientateur.id;
      }
      // Si le code est invalide ou inactif, on enregistre sans orientateur
    }

    // ── Vérifier que les formations existent ──
    let validFormationIds = [];
    if (formationIds && formationIds.length > 0) {
      const formations = await prisma.formation.findMany({
        where: {
          OR: [
            { id: { in: formationIds } },
            { nom: { in: formationIds } },
          ],
        },
        select: { id: true },
      });
      validFormationIds = formations.map((f) => f.id);
    }

    // ── Vérifier que les sources existent ──
    let validSourceIds = [];
    if (sourceIds && sourceIds.length > 0) {
      const sources = await prisma.sourceConnaissance.findMany({
        where: {
          OR: [
            { id: { in: sourceIds } },
            { libelle: { in: sourceIds } },
          ],
        },
        select: { id: true },
      });
      validSourceIds = sources.map((s) => s.id);
    }

    // ── Créer le visiteur avec les relations ──
    const visiteur = await prisma.visiteur.create({
      data: {
        dateVisite,
        heureVisite,
        numeroOrdre,
        nomPrenom,
        dateNaissance: new Date(dateNaissance),
        lieuNaissance,
        sexe,
        adresse,
        quartier,
        ville,
        telephone,
        email,
        niveauScolaire,
        etablissement,
        optionBac,
        professionPere: professionPere || '',
        professionMere: professionMere || '',
        professionVisiteur: professionVisiteur || '',
        orientateurId,
        formations: {
          create: validFormationIds.map((fId) => ({
            formationId: fId,
          })),
        },
        sources: {
          create: validSourceIds.map((sId) => ({
            sourceId: sId,
          })),
        },
      },
      include: {
        orientateur: { select: { nom: true, prenom: true } },
        formations: { include: { formation: true } },
        sources: { include: { source: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Merci pour votre visite ! Votre bulletin a été enregistré avec succès.',
      data: {
        numeroOrdre: visiteur.numeroOrdre,
        dateVisite: visiteur.dateVisite,
        heureVisite: visiteur.heureVisite,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/visiteurs (ADMIN)
 * Liste des visiteurs avec pagination, recherche et filtres.
 */
async function getAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const search = req.query.search || '';
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const orientateurId = req.query.orientateurId;
    const niveauScolaire = req.query.niveauScolaire;
    const formationId = req.query.formationId;

    const where = {};

    if (search) {
      where.OR = [
        { nomPrenom: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.dateVisite = {};
      if (dateFrom) where.dateVisite.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setDate(end.getDate() + 1);
        where.dateVisite.lte = end;
      }
    }

    if (orientateurId) {
      where.orientateurId = orientateurId;
    }

    if (niveauScolaire) {
      where.niveauScolaire = niveauScolaire;
    }

    if (formationId) {
      where.formations = {
        some: { formationId },
      };
    }

    const [total, visiteurs] = await Promise.all([
      prisma.visiteur.count({ where }),
      prisma.visiteur.findMany({
        where,
        include: {
          orientateur: { select: { nom: true, prenom: true, code: true } },
          formations: { include: { formation: { select: { nom: true, categorie: true } } } },
          sources: { include: { source: { select: { libelle: true } } } },
        },
        orderBy: [{ dateVisite: 'desc' }, { numeroOrdre: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      success: true,
      data: visiteurs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/visiteurs/:id (ADMIN)
 * Détail complet d'un bulletin de visite.
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const visiteur = await prisma.visiteur.findUnique({
      where: { id },
      include: {
        orientateur: { select: { nom: true, prenom: true, code: true } },
        formations: { include: { formation: true } },
        sources: { include: { source: true } },
      },
    });

    if (!visiteur) {
      return res.status(404).json({
        success: false,
        message: 'Visiteur introuvable.',
      });
    }

    res.json({ success: true, data: visiteur });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/visiteurs/export (ADMIN)
 * Export CSV de la liste filtrée.
 */
async function exportCSV(req, res, next) {
  try {
    const search = req.query.search || '';
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const orientateurId = req.query.orientateurId;

    const where = {};

    if (search) {
      where.OR = [
        { nomPrenom: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.dateVisite = {};
      if (dateFrom) where.dateVisite.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setDate(end.getDate() + 1);
        where.dateVisite.lte = end;
      }
    }

    if (orientateurId) {
      where.orientateurId = orientateurId;
    }

    const visiteurs = await prisma.visiteur.findMany({
      where,
      include: {
        orientateur: { select: { nom: true, prenom: true } },
        formations: { include: { formation: { select: { nom: true, categorie: true } } } },
        sources: { include: { source: { select: { libelle: true } } } },
      },
      orderBy: [{ dateVisite: 'desc' }, { numeroOrdre: 'desc' }],
    });

    // Construire le CSV manuellement pour éviter les problèmes de dépendance
    const headers = [
      'N° Ordre', 'Date Visite', 'Heure', 'Nom & Prénom', 'Date Naissance',
      'Lieu Naissance', 'Sexe', 'Adresse', 'Quartier', 'Ville',
      'Téléphone', 'Email', 'Niveau Scolaire', 'Établissement',
      'Option Bac', 'Profession Père', 'Profession Mère',
      'Profession Visiteur', 'Orientateur', 'Formations', 'Sources',
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = visiteurs.map((v) => [
      v.numeroOrdre,
      new Date(v.dateVisite).toLocaleDateString('fr-FR'),
      v.heureVisite,
      v.nomPrenom,
      new Date(v.dateNaissance).toLocaleDateString('fr-FR'),
      v.lieuNaissance,
      v.sexe,
      v.adresse,
      v.quartier,
      v.ville,
      v.telephone,
      v.email,
      v.niveauScolaire,
      v.etablissement,
      v.optionBac,
      v.professionPere,
      v.professionMere,
      v.professionVisiteur,
      v.orientateur ? `${v.orientateur.nom} ${v.orientateur.prenom}` : 'Aucun',
      v.formations.map((f) => f.formation.nom).join(' | '),
      v.sources.map((s) => s.source.libelle).join(' | '),
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    // BOM UTF-8 pour Excel
    const bom = '\uFEFF';

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="visiteurs_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(bom + csvContent);
  } catch (error) {
    next(error);
  }
}

module.exports = { create, getAll, getById, exportCSV };
