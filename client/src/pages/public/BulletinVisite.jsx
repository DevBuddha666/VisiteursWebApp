import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineSpeakerphone,
  HiOutlineCalendar,
  HiOutlineCheck,
  HiOutlineExclamationCircle,
  HiOutlineLightBulb,
  HiOutlineDesktopComputer,
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineDeviceMobile,
  HiOutlineNewspaper,
  HiOutlinePhone,
  HiOutlineGlobe,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineAnnotation,
  HiOutlineClipboard,
} from 'react-icons/hi';
import { orientateurService, formationService, sourceService, visiteurService } from '../../services/api';

const formSchema = z.object({
  nomPrenom: z.string().min(2, 'Le nom et prénom sont obligatoires'),
  dateNaissance: z.string().min(1, 'Date de naissance obligatoire'),
  lieuNaissance: z.string().min(2, 'Lieu de naissance obligatoire'),
  sexe: z.enum(['F', 'M'], { required_error: 'Veuillez sélectionner le sexe' }),
  adresse: z.string().min(3, "L'adresse est obligatoire"),
  quartier: z.string().min(2, 'Le quartier est obligatoire'),
  ville: z.string().min(2, 'La ville est obligatoire'),
  telephone: z.string().min(8, 'Numéro de téléphone obligatoire'),
  email: z.string().email('Adresse e-mail invalide'),
  niveauScolaire: z.enum(['BAC', 'NIVEAU_BAC', 'BAC_2', 'BAC_3'], {
    required_error: 'Veuillez sélectionner votre niveau scolaire',
  }),
  etablissement: z.string().min(2, "L'établissement d'origine est obligatoire"),
  optionBac: z.enum(['SC_EXP', 'SC_MATH', 'SC_ECO', 'TECHNIQUE', 'LM', 'AUTRES'], {
    required_error: "Veuillez sélectionner l'option du baccalauréat",
  }),
  professionPere: z.string().optional().default(''),
  professionMere: z.string().optional().default(''),
  professionVisiteur: z.string().optional().default(''),
});

const CATEGORIE_LABELS = {
  BAC3_TS_LP: 'Formations — BAC +3 : TECHNICIEN SPECIALISE + LP',
  BAC2_TECHNICIEN: 'Formations — Niveau BAC +2 : TECHNICIEN',
  SANTE: 'Programme Santé',
  BACHELOR: 'BACHELOR - LICENCE',
  MASTER: 'Master',
};

const CATEGORIE_ICON_COMPONENTS = {
  BAC3_TS_LP: HiOutlineDesktopComputer,
  BAC2_TECHNICIEN: HiOutlineCog,
  SANTE: HiOutlineHeart,
  BACHELOR: HiOutlineAcademicCap,
  MASTER: HiOutlineOfficeBuilding,
};

// ── Données officielles pré-chargées selon Section 6 du Prompt ──
const INITIAL_FORMATIONS_GROUPED = {
  BAC3_TS_LP: [
    { id: 'BAC3_1', nom: 'Systèmes & Réseaux Informatique', categorie: 'BAC3_TS_LP' },
    { id: 'BAC3_2', nom: 'Développement Informatique Full Stack', categorie: 'BAC3_TS_LP' },
    { id: 'BAC3_3', nom: 'Financier Comptable', categorie: 'BAC3_TS_LP' },
    { id: 'BAC3_4', nom: 'Commerce international', categorie: 'BAC3_TS_LP' },
    { id: 'BAC3_5', nom: 'Gestion des Entreprises', categorie: 'BAC3_TS_LP' },
    { id: 'BAC3_6', nom: 'Transport & logistique', categorie: 'BAC3_TS_LP' },
  ],
  BAC2_TECHNICIEN: [
    { id: 'BAC2_1', nom: 'Gestion informatisée', categorie: 'BAC2_TECHNICIEN' },
    { id: 'BAC2_2', nom: 'Action Commerciale & Marketing', categorie: 'BAC2_TECHNICIEN' },
    { id: 'BAC2_3', nom: 'Assistant Gestion Administrative & Comptable', categorie: 'BAC2_TECHNICIEN' },
    { id: 'BAC2_4', nom: 'Assistant Webmaster', categorie: 'BAC2_TECHNICIEN' },
    { id: 'BAC2_5', nom: 'Accueil dans les Transports Aériens & Maritimes', categorie: 'BAC2_TECHNICIEN' },
  ],
  SANTE: [
    { id: 'SANTE_1', nom: 'Sage de Femme', categorie: 'SANTE' },
    { id: 'SANTE_2', nom: 'Infirmier Polyvalent', categorie: 'SANTE' },
    { id: 'SANTE_3', nom: 'Infirmier auxiliaire', categorie: 'SANTE' },
    { id: 'SANTE_4', nom: 'Aide soignant', categorie: 'SANTE' },
  ],
  BACHELOR: [
    { id: 'BACH_1', nom: "Management & Gestion d'Entreprise", categorie: 'BACHELOR' },
    { id: 'BACH_2', nom: 'Gestionnaire des Ressources Humaines', categorie: 'BACHELOR' },
    { id: 'BACH_3', nom: 'Finance Contrôle de Gestion', categorie: 'BACHELOR' },
    { id: 'BACH_4', nom: 'Transport & Logistique', categorie: 'BACHELOR' },
    { id: 'BACH_5', nom: 'Marketing International', categorie: 'BACHELOR' },
    { id: 'BACH_6', nom: 'Développeur Web', categorie: 'BACHELOR' },
    { id: 'BACH_7', nom: 'Techniques Numériques & Multimédia', categorie: 'BACHELOR' },
    { id: 'BACH_8', nom: "Développement d'applications Mobiles", categorie: 'BACHELOR' },
    { id: 'BACH_9', nom: 'Informatique Réseaux & Sécurité', categorie: 'BACHELOR' },
    { id: 'BACH_10', nom: 'E-Commerce', categorie: 'BACHELOR' },
    { id: 'BACH_11', nom: 'Merchandising & Management Commercial', categorie: 'BACHELOR' },
    { id: 'BACH_12', nom: 'Marketing Digital', categorie: 'BACHELOR' },
  ],
  MASTER: [
    { id: 'MAST_1', nom: "Management & Stratégie d'Entreprises", categorie: 'MASTER' },
    { id: 'MAST_2', nom: 'Management & Stratégie Financière', categorie: 'MASTER' },
    { id: 'MAST_3', nom: 'Finance Audit & Contrôle de Gestion', categorie: 'MASTER' },
    { id: 'MAST_4', nom: 'Management des Ressources Humaines', categorie: 'MASTER' },
    { id: 'MAST_5', nom: 'Management Digital', categorie: 'MASTER' },
    { id: 'MAST_6', nom: 'Expert IT - Cyber Sécurité & Haute Disponibilité', categorie: 'MASTER' },
    { id: 'MAST_7', nom: 'Expert IT - Applications Intelligentes & Big Data', categorie: 'MASTER' },
    { id: 'MAST_8', nom: 'Marketing Stratégique et communication', categorie: 'MASTER' },
  ],
};

const INITIAL_SOURCES = [
  { id: 'SRC_1', libelle: 'Facebook - Instagram', IconComp: HiOutlineDeviceMobile },
  { id: 'SRC_2', libelle: "Revue de l'étudiant", IconComp: HiOutlineNewspaper },
  { id: 'SRC_3', libelle: 'Événements internes du centre', IconComp: HiOutlineAnnotation },
  { id: 'SRC_4', libelle: "Forum de l'étudiant", IconComp: HiOutlineAcademicCap },
  { id: 'SRC_5', libelle: 'Visite du lycée', IconComp: HiOutlineOfficeBuilding },
  { id: 'SRC_6', libelle: 'Panneaux publicitaires', IconComp: HiOutlineClipboard },
  { id: 'SRC_7', libelle: 'Affiches', IconComp: HiOutlineNewspaper },
  { id: 'SRC_8', libelle: 'Prospectus/Dépliants', IconComp: HiOutlineBookOpen },
  { id: 'SRC_9', libelle: 'Téléphone', IconComp: HiOutlinePhone },
  { id: 'SRC_10', libelle: 'De passage', IconComp: HiOutlineUser },
  { id: 'SRC_11', libelle: 'Site internet', IconComp: HiOutlineGlobe },
  { id: 'SRC_12', libelle: 'Amis', IconComp: HiOutlineUsers },
  { id: 'SRC_13', libelle: "Étudiants de l'école", IconComp: HiOutlineAcademicCap },
  { id: 'SRC_14', libelle: 'Professeurs', IconComp: HiOutlineBriefcase },
  { id: 'SRC_15', libelle: "Personnel de l'école", IconComp: HiOutlineOfficeBuilding },
  { id: 'SRC_16', libelle: 'Recommandation', IconComp: HiOutlineStar },
];

export default function BulletinVisite() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  const [orientateurInfo, setOrientateurInfo] = useState(null);
  const [orientateurStatus, setOrientateurStatus] = useState('checking'); // 'checking' | 'valid' | 'none' | 'invalid'
  const [formationsGrouped, setFormationsGrouped] = useState(INITIAL_FORMATIONS_GROUPED);
  const [sourcesList, setSourcesList] = useState(INITIAL_SOURCES);
  const [selectedFormations, setSelectedFormations] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomPrenom: '',
      dateNaissance: '',
      lieuNaissance: '',
      adresse: '',
      quartier: '',
      ville: '',
      telephone: '',
      email: '',
      etablissement: '',
      professionPere: '',
      professionMere: '',
      professionVisiteur: '',
    },
  });

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Resolve orientateur from QR code ref
  useEffect(() => {
    if (!refCode) {
      setOrientateurStatus('none');
      return;
    }
    orientateurService
      .verify(refCode)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setOrientateurInfo(res.data.data);
          setOrientateurStatus('valid');
        } else {
          setOrientateurStatus('invalid');
        }
      })
      .catch(() => setOrientateurStatus('invalid'));
  }, [refCode]);

  // Load dynamic data from API
  useEffect(() => {
    formationService
      .getAll()
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          const grouped = {};
          res.data.data.forEach((f) => {
            if (!grouped[f.categorie]) grouped[f.categorie] = [];
            grouped[f.categorie].push(f);
          });
          setFormationsGrouped(grouped);
        }
      })
      .catch(() => {});

    sourceService
      .getAll()
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          const withIcons = res.data.data.map((s, idx) => ({
            ...s,
            IconComp: INITIAL_SOURCES[idx % INITIAL_SOURCES.length]?.IconComp || HiOutlineAnnotation,
          }));
          setSourcesList(withIcons);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFormation = (id) => {
    setSelectedFormations((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleSource = (id) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        ...data,
        orientateurId: orientateurStatus === 'valid' && orientateurInfo ? orientateurInfo.id : null,
        formations: selectedFormations,
        sources: selectedSources,
      };
      const res = await visiteurService.create(payload);
      if (res.data.success) {
        setSubmitted(true);
        reset();
        setSelectedFormations([]);
        setSelectedSources([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(res.data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Erreur de connexion. Veuillez réessayer.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── LOADING SCREEN (while checking QR code) ──
  if (orientateurStatus === 'checking') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-body)',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            border: '4px solid var(--light-blue)',
            borderTopColor: 'var(--deep-space-blue)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Vérification en cours…</p>
      </div>
    );
  }

  // ── SUCCESS SCREEN ──
  if (submitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-body)',
          padding: '1.5rem',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '560px',
            width: '100%',
            textAlign: 'center',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <img
              src="/logo-efet.png"
              alt="Logo EFET AGADIR"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 1.5rem',
            }}
          >
            ✓
          </div>

          <h1 style={{ fontSize: '1.75rem', color: 'var(--deep-space-blue)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Merci pour votre visite !
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Votre bulletin de visite a bien été enregistré. Notre équipe vous contactera très prochainement.
          </p>

          {orientateurInfo && (
            <div
              style={{
                background: 'rgba(44, 125, 160, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: 'var(--cerulean)',
              }}
            >
              Orientateur référent : <strong>{orientateurInfo.prenom} {orientateurInfo.nom}</strong>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setSubmitted(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Remplir un nouveau bulletin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)', paddingBottom: '3rem' }}>
      {/* Top Banner / Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, var(--deep-space-blue) 0%, var(--yale-blue-2) 100%)',
          color: 'var(--white)',
          padding: '2rem 1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  height: '56px',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  background: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <img
                  src="/logo-efet.png"
                  alt="Logo EFET AGADIR"
                  style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.5px', margin: 0, color: 'var(--white)' }}>
                  EFET AGADIR
                </h1>
                <div style={{ fontSize: '0.85rem', color: 'var(--light-blue)' }}>
                  École Française d'Enseignement Technique
                </div>
              </div>
            </div>

            {/* Live Clock & Date Badge */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <HiOutlineCalendar size={15} />
              <span>
                {currentTime.toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--sky-blue-light)',
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--white)' }}>
              Bulletin de Visite & d'Information
            </h2>
            <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0', color: 'var(--light-blue)', opacity: 0.9 }}>
              Bienvenue à EFET Agadir. Veuillez renseigner ce formulaire pour personnaliser votre entretien et recevoir notre documentation complète.
            </p>
          </div>

          {/* Orientateur Badge if scanned */}
          {orientateurStatus === 'valid' && orientateurInfo && (
            <div
              style={{
                marginTop: '1rem',
                background: 'rgba(56, 161, 105, 0.15)',
                border: '1px solid #38a169',
                color: '#e6fffa',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.9rem',
              }}
            >
              <HiOutlineLightBulb size={20} style={{ flexShrink: 0 }} />
              <div>
                Vous êtes orienté(e) par :{' '}
                <strong style={{ textDecoration: 'underline' }}>
                  {orientateurInfo.prenom} {orientateurInfo.nom}
                </strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '0.5rem' }}>
                  (Conseiller attitré)
                </span>
              </div>
            </div>
          )}

          {orientateurStatus === 'invalid' && (
            <div
              style={{
                marginTop: '1rem',
                background: 'rgba(229, 62, 62, 0.15)',
                border: '1px solid #e53e3e',
                color: '#fff5f5',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiOutlineExclamationCircle size={16} />
                Le code orientateur indiqué n'est plus actif. Vous pouvez néanmoins continuer et remplir votre bulletin.
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Form Container */}
      <main style={{ maxWidth: '850px', margin: '-1.5rem auto 0', padding: '0 1rem' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Card 1: Informations Personnelles */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiOutlineUser size={20} style={{ color: 'var(--cerulean)' }} />
                <span className="card-title">1. Informations Personnelles</span>
              </div>
              <span className="badge badge-primary">Obligatoire</span>
            </div>

            <div className="form-group">
              <label className="form-label">Nom et Prénom *</label>
              <input
                type="text"
                className={`form-input ${errors.nomPrenom ? 'error' : ''}`}
                placeholder="Ex: Alami Mehdi"
                {...register('nomPrenom')}
              />
              {errors.nomPrenom && <div className="form-error">{errors.nomPrenom.message}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date de naissance *</label>
                <input
                  type="date"
                  className={`form-input ${errors.dateNaissance ? 'error' : ''}`}
                  {...register('dateNaissance')}
                />
                {errors.dateNaissance && <div className="form-error">{errors.dateNaissance.message}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Lieu de naissance *</label>
                <input
                  type="text"
                  className={`form-input ${errors.lieuNaissance ? 'error' : ''}`}
                  placeholder="Ex: Agadir"
                  {...register('lieuNaissance')}
                />
                {errors.lieuNaissance && <div className="form-error">{errors.lieuNaissance.message}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sexe *</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" value="F" {...register('sexe')} />
                  <span>Femme</span>
                </label>
                <label className="radio-item">
                  <input type="radio" value="M" {...register('sexe')} />
                  <span>Homme</span>
                </label>
              </div>
              {errors.sexe && <div className="form-error">{errors.sexe.message}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Adresse *</label>
                <input
                  type="text"
                  className={`form-input ${errors.adresse ? 'error' : ''}`}
                  placeholder="N° et Rue"
                  {...register('adresse')}
                />
                {errors.adresse && <div className="form-error">{errors.adresse.message}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Quartier *</label>
                <input
                  type="text"
                  className={`form-input ${errors.quartier ? 'error' : ''}`}
                  placeholder="Ex: Dakhla, Talborjt"
                  {...register('quartier')}
                />
                {errors.quartier && <div className="form-error">{errors.quartier.message}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ville *</label>
                <input
                  type="text"
                  className={`form-input ${errors.ville ? 'error' : ''}`}
                  placeholder="Ex: Agadir, Inezgane"
                  {...register('ville')}
                />
                {errors.ville && <div className="form-error">{errors.ville.message}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Téléphone *</label>
                <input
                  type="tel"
                  className={`form-input ${errors.telephone ? 'error' : ''}`}
                  placeholder="06 XX XX XX XX"
                  {...register('telephone')}
                />
                {errors.telephone && <div className="form-error">{errors.telephone.message}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adresse E-mail *</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="nom.prenom@gmail.com"
                {...register('email')}
              />
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>
          </div>

          {/* Card 2: Parcours Scolaire */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiOutlineAcademicCap size={20} style={{ color: 'var(--cerulean)' }} />
                <span className="card-title">2. Parcours Scolaire & Situation</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Niveau scolaire *</label>
                <select className={`form-select ${errors.niveauScolaire ? 'error' : ''}`} {...register('niveauScolaire')}>
                  <option value="BAC">BAC</option>
                  <option value="NIVEAU_BAC">NIVEAU BAC</option>
                  <option value="BAC_2">BAC +2</option>
                  <option value="BAC_3">BAC +3</option>
                </select>
                {errors.niveauScolaire && <div className="form-error">{errors.niveauScolaire.message}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Établissement fréquenté *</label>
                <input
                  type="text"
                  className={`form-input ${errors.etablissement ? 'error' : ''}`}
                  placeholder="Lycée ou Faculté d'origine"
                  {...register('etablissement')}
                />
                {errors.etablissement && <div className="form-error">{errors.etablissement.message}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Option du Baccalauréat *</label>
              <select className={`form-select ${errors.optionBac ? 'error' : ''}`} {...register('optionBac')}>
                <option value="SC_EXP">Sciences Expérimentales (SVT / PC)</option>
                <option value="SC_MATH">Sciences Mathématiques</option>
                <option value="SC_ECO">Sciences Économiques & Gestion</option>
                <option value="TECHNIQUE">Technique (STM / STE)</option>
                <option value="LM">Lettres & Sciences Humaines</option>
                <option value="AUTRES">Autres Diplômes</option>
              </select>
              {errors.optionBac && <div className="form-error">{errors.optionBac.message}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Profession du père</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optionnel"
                  {...register('professionPere')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profession de la mère</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optionnel"
                  {...register('professionMere')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profession actuelle du visiteur</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Étudiant, En recherche d'emploi, Employé(e)..."
                {...register('professionVisiteur')}
              />
            </div>
          </div>

          {/* Card 3: Formations Souhaitées */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiOutlineBookOpen size={20} style={{ color: 'var(--cerulean)' }} />
                <span className="card-title">3. Formations Souhaitées à l'EFET</span>
              </div>
              <span className="badge badge-info">{selectedFormations.length} sélectionnée(s)</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Cochez la ou les filières qui vous intéressent pour votre inscription (multi-sélection possible) :
            </p>

            {Object.keys(CATEGORIE_LABELS).map((catKey) => {
              const items = formationsGrouped[catKey] || [];
              if (items.length === 0) return null;

              return (
                <div key={catKey} style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--yale-blue-2)',
                      padding: '0.5rem 0.85rem',
                      background: 'rgba(1, 73, 124, 0.06)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.75rem',
                      borderLeft: '4px solid var(--cerulean)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {(() => { const CatIcon = CATEGORIE_ICON_COMPONENTS[catKey] || HiOutlineBookOpen; return <CatIcon size={16} />; })()}
                    <span>{CATEGORIE_LABELS[catKey]}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      {items.length} filière(s)
                    </span>
                  </div>

                  <div className="checkbox-group">
                    {items.map((f) => {
                      const isChecked = selectedFormations.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className={`checkbox-item ${isChecked ? 'checked' : ''}`}
                          style={{
                            padding: '0.6rem 0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFormation(f.id)}
                          />
                          <span style={{ fontWeight: isChecked ? 600 : 400 }}>{f.nom}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card 4: Comment avez-vous connu EFET ? */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiOutlineSpeakerphone size={20} style={{ color: 'var(--cerulean)' }} />
                <span className="card-title">4. Comment avez-vous connu l'EFET ?</span>
              </div>
              <span className="badge badge-info">{selectedSources.length} source(s)</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Précisez le ou les moyens par lesquels vous avez découvert l'EFET Agadir :
            </p>

            <div className="checkbox-group">
              {sourcesList.map((s) => {
                const isChecked = selectedSources.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`checkbox-item ${isChecked ? 'checked' : ''}`}
                    style={{
                      padding: '0.6rem 0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSource(s.id)}
                    />
                    {s.IconComp && <s.IconComp size={15} style={{ flexShrink: 0 }} />}
                    <span style={{ fontWeight: isChecked ? 600 : 400 }}>{s.libelle}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                border: '1px solid var(--danger)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiOutlineExclamationCircle size={16} /> {errorMessage}
              </span>
            </div>
          )}

          {/* Submit Action */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              style={{ minWidth: '280px', padding: '1rem 2.5rem', fontSize: '1.1rem' }}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <HiOutlineCheck size={18} />
                  <span>Valider mon bulletin de visite</span>
                </>
              )}
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Vos données sont protégées et strictement destinées au service des admissions d'EFET Agadir.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
