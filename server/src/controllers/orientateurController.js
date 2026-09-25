const prisma = require('../config/database');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');

/**
 * GET /api/orientateurs/verify/:code (PUBLIC)
 * Vérifie qu'un code orientateur existe et est actif.
 * Ne renvoie que le nom et prénom — jamais l'ID interne.
 */
async function verifyCode(req, res, next) {
  try {
    const { code } = req.params;

    const orientateur = await prisma.orientateur.findUnique({
      where: { code },
      select: { nom: true, prenom: true, actif: true },
    });

    if (!orientateur || !orientateur.actif) {
      return res.status(404).json({
        success: false,
        message: 'Code orientateur invalide ou inactif.',
      });
    }

    res.json({
      success: true,
      data: {
        nom: orientateur.nom,
        prenom: orientateur.prenom,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orientateurs (ADMIN)
 * Liste tous les orientateurs avec pagination.
 */
async function getAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const search = req.query.search || '';
    const actif = req.query.actif;

    const where = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (actif !== undefined && actif !== '') {
      where.actif = actif === 'true';
    }

    const [total, orientateurs] = await Promise.all([
      prisma.orientateur.count({ where }),
      prisma.orientateur.findMany({
        where,
        include: {
          _count: { select: { visiteurs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      success: true,
      data: orientateurs.map((o) => ({
        ...o,
        visiteursCount: o._count.visiteurs,
        _count: undefined,
      })),
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
 * POST /api/orientateurs (ADMIN)
 * Crée un nouvel orientateur avec code unique et QR code.
 */
async function create(req, res, next) {
  try {
    const { nom, prenom } = req.body;

    // Générer un code unique de 8 caractères
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = nanoid(8);
      const existing = await prisma.orientateur.findUnique({ where: { code } });
      if (!existing) isUnique = true;
    }

    const orientateur = await prisma.orientateur.create({
      data: { nom, prenom, code },
    });

    console.log(`[AUDIT] Orientateur créé : ${nom} ${prenom} (code: ${code}) à ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      data: orientateur,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/orientateurs/:id (ADMIN)
 * Met à jour un orientateur.
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    const orientateur = await prisma.orientateur.update({
      where: { id },
      data,
    });

    console.log(`[AUDIT] Orientateur mis à jour : ${id} à ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: orientateur,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/orientateurs/:id (ADMIN)
 * Supprime un orientateur. Si des visiteurs y sont rattachés,
 * propose la désactivation au lieu de la suppression.
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const orientateur = await prisma.orientateur.findUnique({
      where: { id },
      include: { _count: { select: { visiteurs: true } } },
    });

    if (!orientateur) {
      return res.status(404).json({
        success: false,
        message: 'Orientateur introuvable.',
      });
    }

    if (orientateur._count.visiteurs > 0) {
      return res.status(409).json({
        success: false,
        message: `Impossible de supprimer cet orientateur : ${orientateur._count.visiteurs} visiteur(s) y sont rattachés. Vous pouvez le désactiver à la place.`,
        visiteursCount: orientateur._count.visiteurs,
      });
    }

    await prisma.orientateur.delete({ where: { id } });

    console.log(`[AUDIT] Orientateur supprimé : ${orientateur.nom} ${orientateur.prenom} (code: ${orientateur.code}) à ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Orientateur supprimé avec succès.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orientateurs/:id/qrcode (ADMIN)
 * Génère le QR code à la volée (PNG) pour un orientateur.
 */
async function getQRCode(req, res, next) {
  try {
    const { id } = req.params;
    const format = req.query.format || 'png';

    const orientateur = await prisma.orientateur.findUnique({
      where: { id },
      select: { code: true, nom: true, prenom: true },
    });

    if (!orientateur) {
      return res.status(404).json({
        success: false,
        message: 'Orientateur introuvable.',
      });
    }

    const publicUrl = process.env.PUBLIC_URL || 'http://localhost:5173';
    const qrUrl = `${publicUrl}/visite?ref=${orientateur.code}`;

    if (format === 'svg') {
      const svgString = await QRCode.toString(qrUrl, { type: 'svg', width: 300 });
      res.set('Content-Type', 'image/svg+xml');
      res.send(svgString);
    } else {
      const pngBuffer = await QRCode.toBuffer(qrUrl, {
        type: 'png',
        width: 400,
        margin: 2,
        color: {
          dark: '#012a4a',
          light: '#ffffff',
        },
      });
      res.set('Content-Type', 'image/png');
      res.set('Content-Disposition', `inline; filename="qr-${orientateur.code}.png"`);
      res.send(pngBuffer);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orientateurs/:id/qrcode-data (ADMIN)
 * Renvoie le QR code en base64 avec les infos pour impression.
 */
async function getQRCodeData(req, res, next) {
  try {
    const { id } = req.params;

    const orientateur = await prisma.orientateur.findUnique({
      where: { id },
      select: { code: true, nom: true, prenom: true },
    });

    if (!orientateur) {
      return res.status(404).json({
        success: false,
        message: 'Orientateur introuvable.',
      });
    }

    const publicUrl = process.env.PUBLIC_URL || 'http://localhost:5173';
    const qrUrl = `${publicUrl}/visite?ref=${orientateur.code}`;

    const dataUrl = await QRCode.toDataURL(qrUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#012a4a',
        light: '#ffffff',
      },
    });

    res.json({
      success: true,
      data: {
        nom: orientateur.nom,
        prenom: orientateur.prenom,
        code: orientateur.code,
        qrUrl,
        qrDataUrl: dataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orientateurs/:id/stats (ADMIN)
 * Statistiques individuelles d'un orientateur.
 */
async function getStats(req, res, next) {
  try {
    const { id } = req.params;

    const orientateur = await prisma.orientateur.findUnique({
      where: { id },
      select: { id: true, nom: true, prenom: true, code: true },
    });

    if (!orientateur) {
      return res.status(404).json({
        success: false,
        message: 'Orientateur introuvable.',
      });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, today, week, month] = await Promise.all([
      prisma.visiteur.count({ where: { orientateurId: id } }),
      prisma.visiteur.count({ where: { orientateurId: id, dateVisite: { gte: startOfDay } } }),
      prisma.visiteur.count({ where: { orientateurId: id, dateVisite: { gte: startOfWeek } } }),
      prisma.visiteur.count({ where: { orientateurId: id, dateVisite: { gte: startOfMonth } } }),
    ]);

    // Évolution sur les 30 derniers jours
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyVisitors = await prisma.visiteur.groupBy({
      by: ['dateVisite'],
      where: {
        orientateurId: id,
        dateVisite: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      orderBy: { dateVisite: 'asc' },
    });

    res.json({
      success: true,
      data: {
        orientateur,
        stats: { total, today, week, month },
        evolution: dailyVisitors.map((d) => ({
          date: d.dateVisite,
          count: d._count.id,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  verifyCode,
  getAll,
  create,
  update,
  remove,
  getQRCode,
  getQRCodeData,
  getStats,
};
