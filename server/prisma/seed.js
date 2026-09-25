const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // ─── 1. Création du compte Admin par défaut ───────────────────
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@efet-agadir.ma' },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@2024!', 12);
    await prisma.admin.create({
      data: {
        email: 'admin@efet-agadir.ma',
        passwordHash,
        nom: 'Administrateur EFET',
      },
    });
    console.log('✅ Compte admin créé : admin@efet-agadir.ma / Admin@2024!');
  } else {
    console.log('ℹ️  Compte admin déjà existant.');
  }

  // ─── 2. Formations ────────────────────────────────────────────
  const formations = [
    // BAC +3 : TECHNICIEN SPECIALISE + LP
    { nom: 'Systèmes & Réseaux Informatique', categorie: 'BAC3_TS_LP' },
    { nom: 'Développement Informatique Full Stack', categorie: 'BAC3_TS_LP' },
    { nom: 'Financier Comptable', categorie: 'BAC3_TS_LP' },
    { nom: 'Commerce international', categorie: 'BAC3_TS_LP' },
    { nom: 'Gestion des Entreprises', categorie: 'BAC3_TS_LP' },
    { nom: 'Transport & logistique', categorie: 'BAC3_TS_LP' },

    // Niveau BAC +2 : TECHNICIEN
    { nom: 'Gestion informatisée', categorie: 'BAC2_TECHNICIEN' },
    { nom: 'Action Commerciale & Marketing', categorie: 'BAC2_TECHNICIEN' },
    { nom: 'Assistant Gestion Administrative & Comptable', categorie: 'BAC2_TECHNICIEN' },
    { nom: 'Assistant Webmaster', categorie: 'BAC2_TECHNICIEN' },
    { nom: 'Accueil dans les Transports Aériens & Maritimes', categorie: 'BAC2_TECHNICIEN' },

    // Programme Santé
    { nom: 'Sage de Femme', categorie: 'SANTE' },
    { nom: 'Infirmier Polyvalent', categorie: 'SANTE' },
    { nom: 'Infirmier auxiliaire', categorie: 'SANTE' },
    { nom: 'Aide soignant', categorie: 'SANTE' },

    // BACHELOR - LICENCE
    { nom: 'Management & Gestion d\'Entreprise', categorie: 'BACHELOR' },
    { nom: 'Gestionnaire des Ressources Humaines', categorie: 'BACHELOR' },
    { nom: 'Finance Contrôle de Gestion', categorie: 'BACHELOR' },
    { nom: 'Transport & Logistique', categorie: 'BACHELOR' },
    { nom: 'Marketing International', categorie: 'BACHELOR' },
    { nom: 'Développeur Web', categorie: 'BACHELOR' },
    { nom: 'Techniques Numériques & Multimédia', categorie: 'BACHELOR' },
    { nom: 'Développement d\'applications Mobiles', categorie: 'BACHELOR' },
    { nom: 'Informatique Réseaux & Sécurité', categorie: 'BACHELOR' },
    { nom: 'E-Commerce', categorie: 'BACHELOR' },
    { nom: 'Merchandising & Management Commercial', categorie: 'BACHELOR' },
    { nom: 'Marketing Digital', categorie: 'BACHELOR' },

    // Master
    { nom: 'Management & Stratégie d\'Entreprises', categorie: 'MASTER' },
    { nom: 'Management & Stratégie Financière', categorie: 'MASTER' },
    { nom: 'Finance Audit & Contrôle de Gestion', categorie: 'MASTER' },
    { nom: 'Management des Ressources Humaines', categorie: 'MASTER' },
    { nom: 'Management Digital', categorie: 'MASTER' },
    { nom: 'Expert IT - Cyber Sécurité & Haute Disponibilité', categorie: 'MASTER' },
    { nom: 'Expert IT - Applications Intelligentes & Big Data', categorie: 'MASTER' },
    { nom: 'Marketing Stratégique et communication', categorie: 'MASTER' },
  ];

  for (const formation of formations) {
    await prisma.formation.upsert({
      where: {
        id: `seed-${formation.categorie}-${formation.nom.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`,
      },
      update: { nom: formation.nom, categorie: formation.categorie },
      create: {
        id: `seed-${formation.categorie}-${formation.nom.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`,
        nom: formation.nom,
        categorie: formation.categorie,
      },
    });
  }
  console.log(`✅ ${formations.length} formations insérées/mises à jour.`);

  // ─── 3. Sources de connaissance ───────────────────────────────
  const sources = [
    'Facebook - Instagram',
    'Revue de l\'étudiant',
    'Événements internes du centre',
    'Forum de l\'étudiant',
    'Visite du lycée',
    'Panneaux publicitaires',
    'Affiches',
    'Prospectus/Dépliants',
    'Téléphone',
    'De passage',
    'Site internet',
    'Amis',
    'Étudiants de l\'école',
    'Professeurs',
    'Personnel de l\'école',
    'Recommandation',
  ];

  for (const libelle of sources) {
    const id = `seed-source-${libelle.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`;
    await prisma.sourceConnaissance.upsert({
      where: { id },
      update: { libelle },
      create: { id, libelle },
    });
  }
  console.log(`✅ ${sources.length} sources de connaissance insérées/mises à jour.`);

  console.log('🎉 Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant le seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
