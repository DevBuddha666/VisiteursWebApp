const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

/**
 * POST /api/auth/login
 * Authentifie un admin et renvoie access + refresh tokens.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    console.log(`[AUDIT] Admin connecté : ${admin.email} à ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        admin: {
          id: admin.id,
          email: admin.email,
          nom: admin.nom,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Renvoie les informations de l'admin connecté.
 */
async function me(req, res, next) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true, nom: true, createdAt: true },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin introuvable.',
      });
    }

    res.json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 * Renouvelle le access token à partir du refresh token.
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis.',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Vérifier que l'admin existe toujours
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin introuvable.',
      });
    }

    const newAccessToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide ou expiré.',
      });
    }
    next(error);
  }
}

/**
 * PUT /api/auth/password
 * Modifie le mot de passe de l'admin connecté.
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin introuvable.',
      });
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({
      where: { id: req.admin.id },
      data: { passwordHash: newHash },
    });

    console.log(`[AUDIT] Mot de passe modifié pour : ${admin.email} à ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, me, refresh, changePassword };
