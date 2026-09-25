const { z } = require('zod');

/**
 * Schémas de validation Zod pour toutes les entrées de l'API.
 * Chaque schéma est strict : aucun champ non déclaré n'est accepté.
 */

// ─── Auth ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
});

// ─── Orientateur ─────────────────────────────────────────────────
const orientateurSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  prenom: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
});

const orientateurUpdateSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100, 'Nom trop long').optional(),
  prenom: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long').optional(),
  actif: z.boolean().optional(),
});

// ─── Visiteur (Bulletin de visite) ───────────────────────────────
const visiteurSchema = z.object({
  nomPrenom: z.string().min(1, 'Nom et prénom requis').max(200),
  dateNaissance: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Date de naissance invalide',
  }),
  lieuNaissance: z.string().min(1, 'Lieu de naissance requis').max(200),
  sexe: z.enum(['F', 'M'], { errorMap: () => ({ message: 'Sexe doit être F ou M' }) }),
  adresse: z.string().min(1, 'Adresse requise').max(500),
  quartier: z.string().min(1, 'Quartier requis').max(200),
  ville: z.string().min(1, 'Ville requise').max(200),
  telephone: z.string().min(1, 'Téléphone requis').max(20),
  email: z.string().email('Email invalide'),
  niveauScolaire: z.enum(['BAC', 'NIVEAU_BAC', 'BAC_2', 'BAC_3'], {
    errorMap: () => ({ message: 'Niveau scolaire invalide' }),
  }),
  etablissement: z.string().min(1, 'Établissement requis').max(300),
  optionBac: z.enum(['SC_EXP', 'SC_MATH', 'SC_ECO', 'TECHNIQUE', 'LM', 'AUTRES'], {
    errorMap: () => ({ message: 'Option du Bac invalide' }),
  }),
  professionPere: z.string().max(200).default(''),
  professionMere: z.string().max(200).default(''),
  professionVisiteur: z.string().max(200).default(''),
  refCode: z.string().max(20).optional().nullable(),
  formationIds: z.array(z.string()).min(0).default([]),
  sourceIds: z.array(z.string()).min(0).default([]),
});

// ─── Formation ───────────────────────────────────────────────────
const formationSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(300),
  categorie: z.enum(['BAC3_TS_LP', 'BAC2_TECHNICIEN', 'SANTE', 'BACHELOR', 'MASTER'], {
    errorMap: () => ({ message: 'Catégorie invalide' }),
  }),
});

// ─── Source de connaissance ──────────────────────────────────────
const sourceSchema = z.object({
  libelle: z.string().min(1, 'Libellé requis').max(300),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  orientateurSchema,
  orientateurUpdateSchema,
  visiteurSchema,
  formationSchema,
  sourceSchema,
};
