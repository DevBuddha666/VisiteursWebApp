require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { globalLimiter } = require('./src/middlewares/rateLimit');
const errorHandler = require('./src/middlewares/errorHandler');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const orientateurRoutes = require('./src/routes/orientateurRoutes');
const visiteurRoutes = require('./src/routes/visiteurRoutes');
const formationRoutes = require('./src/routes/formationRoutes');
const sourceRoutes = require('./src/routes/sourceRoutes');
const statsRoutes = require('./src/routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Sécurité ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(globalLimiter);

// ─── Parseurs ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes API ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orientateurs', orientateurRoutes);
app.use('/api/visiteurs', visiteurRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/stats', statsRoutes);

// ─── Route santé ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EFET AGADIR API opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── 404 ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} non trouvée.`,
  });
});

// ─── Gestionnaire d'erreurs global ──────────────────────────────
app.use(errorHandler);

// ─── Démarrage ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║          🎓 EFET AGADIR — API Visiteurs             ║
║──────────────────────────────────────────────────────║
║  Serveur démarré sur le port ${String(PORT).padEnd(25)}║
║  Environnement : ${(process.env.NODE_ENV || 'development').padEnd(33)}║
║  URL : http://localhost:${String(PORT).padEnd(28)}║
╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
