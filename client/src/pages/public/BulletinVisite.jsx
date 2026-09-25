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
      .catch(() => { });

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
      .catch(() => { });
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

  // ── STYLES FUTURISTES INLINE ──
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Inter:wght@300;400;500;600;700;800&display=swap');

    @keyframes bv-spin { to { transform: rotate(360deg); } }
    @keyframes bv-float { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-18px) scale(1.04);} }
    @keyframes bv-pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(97,165,194,0.25),0 0 40px rgba(97,165,194,0.1);} 50%{box-shadow:0 0 35px rgba(97,165,194,0.5),0 0 70px rgba(97,165,194,0.2);} }
    @keyframes bv-scanline { 0%{top:-100%;} 100%{top:200%;} }
    @keyframes bv-fadeup { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
    @keyframes bv-shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes bv-orb1 { 0%,100%{transform:translate(0,0);} 33%{transform:translate(60px,-40px);} 66%{transform:translate(-40px,30px);} }
    @keyframes bv-orb2 { 0%,100%{transform:translate(0,0);} 33%{transform:translate(-50px,60px);} 66%{transform:translate(70px,-30px);} }
    @keyframes bv-orb3 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(40px,50px);} }
    @keyframes bv-tick { 0%{stroke-dashoffset:50;} 100%{stroke-dashoffset:0;} }

    .bv-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #010d1a 0%, #012a4a 40%, #01497c 75%, #0a2040 100%);
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow-x: hidden;
      padding-bottom: 4rem;
    }
    .bv-page::before {
      content:'';
      position:fixed;
      inset:0;
      background:
        radial-gradient(ellipse 80% 60% at 15% 20%, rgba(97,165,194,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 85% 80%, rgba(1,73,124,0.18) 0%, transparent 55%),
        radial-gradient(ellipse 40% 40% at 50% 50%, rgba(44,125,160,0.06) 0%, transparent 70%);
      pointer-events:none;
      z-index:0;
    }
    .bv-grid-overlay {
      position:fixed;
      inset:0;
      background-image:
        linear-gradient(rgba(97,165,194,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(97,165,194,0.04) 1px, transparent 1px);
      background-size:50px 50px;
      pointer-events:none;
      z-index:0;
    }
    .bv-orb {
      position:fixed;
      border-radius:50%;
      pointer-events:none;
      filter:blur(80px);
      z-index:0;
      opacity:0.18;
    }
    .bv-orb-1 { width:500px;height:500px;background:radial-gradient(circle,#61a5c2,transparent 70%);top:-150px;right:-100px;animation:bv-orb1 18s ease-in-out infinite; }
    .bv-orb-2 { width:400px;height:400px;background:radial-gradient(circle,#014f86,transparent 70%);bottom:-100px;left:-80px;animation:bv-orb2 22s ease-in-out infinite; }
    .bv-orb-3 { width:300px;height:300px;background:radial-gradient(circle,#2c7da0,transparent 70%);top:50%;left:40%;animation:bv-orb3 15s ease-in-out infinite; }

    .bv-header {
      position:relative;
      z-index:10;
      border-bottom:1px solid rgba(97,165,194,0.15);
      backdrop-filter:blur(20px);
      background:rgba(1,10,26,0.6);
      padding:1.5rem;
    }
    .bv-header-inner { max-width:900px;margin:0 auto; }
    .bv-header-top { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem; }

    .bv-logo-wrap {
      display:flex;align-items:center;gap:1rem;
    }
    .bv-logo-box {
      height:52px;
      padding:6px 14px;
      border-radius:12px;
      background:rgba(255,255,255,0.95);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 20px rgba(97,165,194,0.3),0 4px 12px rgba(0,0,0,0.3);
    }
    .bv-logo-box img { height:38px;width:auto;object-fit:contain; }
    .bv-school-name {
      font-family:'Orbitron',sans-serif;
      font-size:1.4rem;font-weight:800;
      background:linear-gradient(90deg,#fff 0%,#89c2d9 50%,#61a5c2 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      letter-spacing:1px;margin:0;
    }
    .bv-school-sub { font-size:0.78rem;color:rgba(169,214,229,0.75);font-weight:400;margin-top:2px; }

    .bv-clock-badge {
      background:rgba(97,165,194,0.08);
      border:1px solid rgba(97,165,194,0.25);
      backdrop-filter:blur(12px);
      padding:0.5rem 1rem;
      border-radius:50px;
      font-size:0.82rem;
      color:rgba(255,255,255,0.85);
      display:flex;align-items:center;gap:0.5rem;
      font-family:'Courier New',monospace;
    }
    .bv-clock-sep { opacity:0.35;margin:0 2px; }
    .bv-clock-time { font-weight:700;color:#89c2d9;letter-spacing:1px; }

    .bv-header-banner {
      margin-top:1.25rem;
      padding:1rem 1.25rem;
      background:linear-gradient(90deg,rgba(97,165,194,0.08) 0%,rgba(1,73,124,0.12) 100%);
      border-radius:12px;
      border:1px solid rgba(97,165,194,0.18);
      border-left:3px solid #61a5c2;
      position:relative;overflow:hidden;
    }
    .bv-header-banner::after {
      content:'';position:absolute;top:-50%;left:-100%;
      width:60%;height:200%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent);
      animation:bv-scanline 4s linear infinite;
    }
    .bv-banner-title { font-size:1.1rem;font-weight:700;color:#fff;margin:0;letter-spacing:0.3px; }
    .bv-banner-sub { font-size:0.82rem;color:rgba(169,214,229,0.8);margin:4px 0 0 0;line-height:1.5; }

    .bv-alert-valid {
      margin-top:1rem;
      background:rgba(56,161,105,0.1);
      border:1px solid rgba(56,161,105,0.4);
      border-radius:10px;padding:0.75rem 1rem;
      display:flex;align-items:center;gap:0.75rem;
      font-size:0.88rem;color:#9ae6b4;
    }
    .bv-alert-invalid {
      margin-top:1rem;
      background:rgba(229,62,62,0.08);
      border:1px solid rgba(229,62,62,0.35);
      border-radius:10px;padding:0.75rem 1rem;
      font-size:0.85rem;color:#fed7d7;
      display:flex;align-items:center;gap:0.5rem;
    }

    .bv-main { max-width:900px;margin:0 auto;padding:2rem 1.25rem 0;position:relative;z-index:10; }

    .bv-card {
      background:rgba(1,20,40,0.55);
      backdrop-filter:blur(24px);
      border:1px solid rgba(97,165,194,0.18);
      border-radius:18px;
      margin-bottom:1.5rem;
      overflow:hidden;
      transition:border-color 0.3s ease,box-shadow 0.3s ease;
      animation:bv-fadeup 0.5s ease both;
    }
    .bv-card:hover {
      border-color:rgba(97,165,194,0.35);
      box-shadow:0 8px 40px rgba(1,73,124,0.3),0 0 0 1px rgba(97,165,194,0.08);
    }
    .bv-card-header {
      padding:1.1rem 1.5rem;
      background:linear-gradient(90deg,rgba(1,73,124,0.5) 0%,rgba(97,165,194,0.08) 100%);
      border-bottom:1px solid rgba(97,165,194,0.15);
      display:flex;align-items:center;justify-content:space-between;
    }
    .bv-card-title-wrap { display:flex;align-items:center;gap:0.75rem; }
    .bv-step-num {
      width:28px;height:28px;border-radius:50%;
      background:linear-gradient(135deg,#014f86,#2c7da0);
      color:#fff;font-size:0.75rem;font-weight:800;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 12px rgba(97,165,194,0.4);
      flex-shrink:0;
    }
    .bv-card-icon { color:#61a5c2; }
    .bv-card-title { font-size:1rem;font-weight:700;color:#e2f0f8;letter-spacing:0.2px; }
    .bv-badge-count {
      font-size:0.72rem;font-weight:700;
      background:rgba(97,165,194,0.15);
      border:1px solid rgba(97,165,194,0.3);
      color:#89c2d9;padding:0.2rem 0.65rem;border-radius:50px;
    }
    .bv-badge-req {
      font-size:0.72rem;font-weight:700;
      background:rgba(1,73,124,0.4);
      border:1px solid rgba(97,165,194,0.25);
      color:#a9d6e5;padding:0.2rem 0.65rem;border-radius:50px;
    }
    .bv-card-body { padding:1.5rem; }

    .bv-form-group { margin-bottom:1.25rem; }
    .bv-form-group:last-child { margin-bottom:0; }
    .bv-label {
      display:block;font-size:0.8rem;font-weight:600;
      color:#89c2d9;margin-bottom:0.4rem;letter-spacing:0.3px;text-transform:uppercase;
    }
    .bv-input, .bv-select {
      width:100%;
      padding:0.75rem 1rem;
      font-size:0.93rem;
      color:#e8f4fc;
      background:rgba(1,13,30,0.6);
      border:1.5px solid rgba(97,165,194,0.2);
      border-radius:10px;
      outline:none;
      transition:all 0.25s ease;
      font-family:'Inter',sans-serif;
    }
    .bv-input:focus, .bv-select:focus {
      border-color:#61a5c2;
      box-shadow:0 0 0 3px rgba(97,165,194,0.12),0 0 20px rgba(97,165,194,0.08);
      background:rgba(1,20,45,0.8);
    }
    .bv-input::placeholder { color:rgba(137,194,217,0.35); }
    .bv-input.bv-err, .bv-select.bv-err {
      border-color:rgba(229,62,62,0.6);
      box-shadow:0 0 0 3px rgba(229,62,62,0.08);
    }
    .bv-select option { background:#012a4a;color:#e8f4fc; }
    .bv-form-error {
      font-size:0.75rem;color:#fc8181;margin-top:5px;
      display:flex;align-items:center;gap:4px;
    }
    .bv-form-row { display:grid;grid-template-columns:1fr 1fr;gap:1rem; }
    @media(max-width:640px){ .bv-form-row{grid-template-columns:1fr;} }

    .bv-radio-group { display:flex;flex-wrap:wrap;gap:0.6rem; }
    .bv-radio-item {
      display:flex;align-items:center;gap:0.5rem;
      padding:0.55rem 1rem;
      background:rgba(1,13,30,0.5);
      border:1.5px solid rgba(97,165,194,0.18);
      border-radius:50px;cursor:pointer;
      font-size:0.88rem;color:rgba(200,228,240,0.8);
      transition:all 0.2s ease;user-select:none;
    }
    .bv-radio-item:hover { border-color:rgba(97,165,194,0.45);color:#e8f4fc; }
    .bv-radio-item.sel {
      border-color:#61a5c2;
      background:rgba(97,165,194,0.12);
      color:#89c2d9;font-weight:600;
      box-shadow:0 0 12px rgba(97,165,194,0.15);
    }
    .bv-radio-item input { display:none; }

    .bv-section-label {
      font-size:0.82rem;font-weight:700;
      color:#61a5c2;
      padding:0.45rem 0.85rem;
      background:rgba(1,73,124,0.25);
      border-radius:8px;
      border-left:3px solid #2c7da0;
      margin-bottom:0.75rem;
      display:flex;align-items:center;gap:0.5rem;
      letter-spacing:0.2px;
    }
    .bv-section-count { margin-left:auto;font-size:0.72rem;font-weight:500;color:rgba(137,194,217,0.6); }

    .bv-checkbox-grid { display:flex;flex-wrap:wrap;gap:0.5rem; }
    .bv-check-item {
      display:flex;align-items:center;gap:0.5rem;
      padding:0.5rem 0.85rem;
      background:rgba(1,13,30,0.45);
      border:1.5px solid rgba(97,165,194,0.15);
      border-radius:8px;cursor:pointer;
      font-size:0.83rem;color:rgba(200,228,240,0.75);
      transition:all 0.18s ease;user-select:none;
    }
    .bv-check-item:hover { border-color:rgba(97,165,194,0.4);color:#c8e4f0;background:rgba(97,165,194,0.06); }
    .bv-check-item:focus-visible { outline:2px solid #61a5c2;outline-offset:2px; }
    .bv-check-item.bv-checked {
      border-color:#61a5c2;
      background:rgba(97,165,194,0.14);
      color:#89c2d9;font-weight:600;
      box-shadow:0 0 10px rgba(97,165,194,0.12);
    }
    .bv-check-item input { display:none; }
    .bv-check-box {
      width:16px;height:16px;border-radius:4px;flex-shrink:0;
      border:1.5px solid rgba(97,165,194,0.35);
      background:transparent;transition:all 0.15s ease;
      display:flex;align-items:center;justify-content:center;
    }
    .bv-checked .bv-check-box {
      background:#2c7da0;border-color:#61a5c2;
    }
    .bv-check-tick { font-size:10px;color:#fff;line-height:1; }

    .bv-hint { font-size:0.8rem;color:rgba(137,194,217,0.55);margin-bottom:1.1rem;line-height:1.5; }

    .bv-error-box {
      padding:1rem 1.25rem;
      border-radius:12px;
      background:rgba(229,62,62,0.08);
      color:#fc8181;
      margin-bottom:1.5rem;
      font-size:0.88rem;
      border:1px solid rgba(229,62,62,0.3);
      display:flex;align-items:center;gap:0.6rem;
    }

    .bv-submit-wrap { text-align:center;margin-top:2rem;animation:bv-fadeup 0.6s ease both; }
    .bv-submit-btn {
      display:inline-flex;align-items:center;gap:0.75rem;
      padding:1rem 3rem;
      font-size:1.05rem;font-weight:700;
      font-family:'Inter',sans-serif;
      background:linear-gradient(135deg,#014f86 0%,#2c7da0 50%,#61a5c2 100%);
      background-size:200% auto;
      color:#fff;border:none;border-radius:50px;cursor:pointer;
      transition:all 0.3s ease;
      box-shadow:0 4px 20px rgba(1,79,134,0.5),0 0 0 1px rgba(97,165,194,0.2);
      letter-spacing:0.3px;
      animation:bv-pulse-glow 3s ease-in-out infinite;
    }
    .bv-submit-btn:hover:not(:disabled) {
      background-position:right center;
      box-shadow:0 8px 30px rgba(1,79,134,0.7),0 0 30px rgba(97,165,194,0.2);
      transform:translateY(-2px);
    }
    .bv-submit-btn:disabled { opacity:0.5;cursor:not-allowed;transform:none;animation:none; }
    .bv-submit-note { font-size:0.75rem;color:rgba(137,194,217,0.4);margin-top:0.85rem;line-height:1.5; }

    .bv-footer {
      position:relative;z-index:10;
      text-align:center;padding-top:2rem;
      font-size:0.75rem;color:rgba(137,194,217,0.3);letter-spacing:0.5px;
    }

    /* ── LOADING ── */
    .bv-loading {
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#010d1a 0%,#012a4a 60%,#01497c 100%);
      flex-direction:column;gap:1.5rem;position:relative;overflow:hidden;
    }
    .bv-loading-ring {
      width:64px;height:64px;border-radius:50%;
      border:3px solid rgba(97,165,194,0.15);
      border-top-color:#61a5c2;
      animation:bv-spin 0.8s linear infinite;
      box-shadow:0 0 25px rgba(97,165,194,0.3);
    }
    .bv-loading-text { color:#89c2d9;font-size:0.9rem;letter-spacing:1px;font-family:'Orbitron',sans-serif; }

    /* ── SUCCESS ── */
    .bv-success {
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#010d1a 0%,#012a4a 60%,#01497c 100%);
      padding:2rem;position:relative;overflow:hidden;
    }
    .bv-success-card {
      background:rgba(1,20,40,0.7);
      backdrop-filter:blur(30px);
      border:1px solid rgba(97,165,194,0.2);
      border-radius:24px;
      max-width:520px;width:100%;
      padding:3rem 2.5rem;text-align:center;
      box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 80px rgba(97,165,194,0.08);
      animation:bv-fadeup 0.5s ease;
    }
    .bv-success-icon {
      width:90px;height:90px;border-radius:50%;margin:0 auto 2rem;
      background:linear-gradient(135deg,rgba(56,161,105,0.2),rgba(56,161,105,0.05));
      border:2px solid rgba(56,161,105,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:2.5rem;
      box-shadow:0 0 30px rgba(56,161,105,0.2);
      animation:bv-pulse-glow 3s ease-in-out infinite;
    }
    .bv-success-title {
      font-size:1.7rem;font-weight:800;color:#e8f4fc;margin-bottom:0.6rem;
      font-family:'Orbitron',sans-serif;letter-spacing:0.5px;
    }
    .bv-success-sub { font-size:0.9rem;color:rgba(169,214,229,0.7);margin-bottom:1.75rem;line-height:1.6; }
    .bv-success-ref {
      background:rgba(44,125,160,0.1);border:1px solid rgba(97,165,194,0.2);
      border-radius:10px;padding:0.75rem 1rem;margin-bottom:1.75rem;
      font-size:0.85rem;color:#89c2d9;
    }
    .bv-success-btn {
      display:inline-flex;align-items:center;gap:0.6rem;
      padding:0.85rem 2.5rem;font-size:0.95rem;font-weight:700;
      background:linear-gradient(135deg,#014f86,#2c7da0);
      color:#fff;border:none;border-radius:50px;cursor:pointer;
      transition:all 0.25s ease;
      box-shadow:0 4px 20px rgba(1,79,134,0.4);
    }
    .bv-success-btn:hover { transform:translateY(-2px);box-shadow:0 8px 25px rgba(1,79,134,0.6); }
  `;

  // ── LOADING SCREEN ──
  if (orientateurStatus === 'checking') {
    return (
      <div className="bv-loading">
        <style>{STYLES}</style>
        <div className="bv-orb bv-orb-1" />
        <div className="bv-orb bv-orb-2" />
        <img src="/logo-efet.png" alt="EFET" style={{ height: '44px', opacity: 0.8, marginBottom: '0.5rem' }} />
        <div className="bv-loading-ring" />
        <p className="bv-loading-text">VÉRIFICATION EN COURS…</p>
      </div>
    );
  }

  // ── SUCCESS SCREEN ──
  if (submitted) {
    return (
      <div className="bv-success">
        <style>{STYLES}</style>
        <div className="bv-orb bv-orb-1" />
        <div className="bv-orb bv-orb-2" />
        <div className="bv-success-card">
          <img src="/logo-efet.png" alt="Logo EFET AGADIR" style={{ height: '44px', margin: '0 auto 1.75rem', opacity: 0.9 }} />
          <div className="bv-success-icon">✓</div>
          <h1 className="bv-success-title">Merci pour votre visite !</h1>
          <p className="bv-success-sub">
            Votre bulletin a bien été enregistré.<br />Notre équipe vous contactera très prochainement.
          </p>
          {orientateurInfo && (
            <div className="bv-success-ref">
              Conseiller référent : <strong style={{ color: '#61a5c2' }}>{orientateurInfo.prenom} {orientateurInfo.nom}</strong>
            </div>
          )}
          <button className="bv-success-btn" onClick={() => { setSubmitted(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <HiOutlineClipboard size={17} />
            Nouveau bulletin
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN FORM ──
  return (
    <div className="bv-page">
      <style>{STYLES}</style>
      <div className="bv-grid-overlay" />
      <div className="bv-orb bv-orb-1" />
      <div className="bv-orb bv-orb-2" />
      <div className="bv-orb bv-orb-3" />

      {/* ── HEADER ── */}
      <header className="bv-header">
        <div className="bv-header-inner">
          <div className="bv-header-top">
            <div className="bv-logo-wrap">
              <div className="bv-logo-box">
                <img src="/logo-efet.png" alt="Logo EFET AGADIR" />
              </div>
              <div>
                <h1 className="bv-school-name">EFET AGADIR</h1>
                <div className="bv-school-sub">École Française d'Enseignement Technique</div>
              </div>
            </div>

            <div className="bv-clock-badge">
              <HiOutlineCalendar size={14} style={{ color: '#61a5c2' }} />
              <span>
                {currentTime.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="bv-clock-sep">|</span>
              <span className="bv-clock-time">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="bv-header-banner">
            <h2 className="bv-banner-title">Bulletin de Visite &amp; d'Information</h2>
            <p className="bv-banner-sub">
              Bienvenue à EFET Agadir. Veuillez renseigner ce formulaire pour personnaliser votre entretien et recevoir notre documentation complète.
            </p>
          </div>

          {orientateurStatus === 'valid' && orientateurInfo && (
            <div className="bv-alert-valid">
              <HiOutlineLightBulb size={20} style={{ flexShrink: 0 }} />
              <div>
                Vous êtes orienté(e) par :{' '}
                <strong style={{ color: '#68d391' }}>{orientateurInfo.prenom} {orientateurInfo.nom}</strong>
                <span style={{ fontSize: '0.78rem', opacity: 0.7, marginLeft: '0.5rem' }}>(Conseiller attitré)</span>
              </div>
            </div>
          )}

          {orientateurStatus === 'invalid' && (
            <div className="bv-alert-invalid">
              <HiOutlineExclamationCircle size={16} style={{ flexShrink: 0 }} />
              Le code orientateur indiqué n'est plus actif. Vous pouvez néanmoins continuer et remplir votre bulletin.
            </div>
          )}
        </div>
      </header>

      {/* ── FORM ── */}
      <main className="bv-main">
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Card 1 — Informations Personnelles */}
          <div className="bv-card" style={{ animationDelay: '0.05s' }}>
            <div className="bv-card-header">
              <div className="bv-card-title-wrap">
                <div className="bv-step-num">1</div>
                <HiOutlineUser size={18} className="bv-card-icon" />
                <span className="bv-card-title">Informations Personnelles</span>
              </div>
              <span className="bv-badge-req">Obligatoire</span>
            </div>
            <div className="bv-card-body">

              <div className="bv-form-group">
                <label className="bv-label">Nom et Prénom *</label>
                <input type="text" className={`bv-input ${errors.nomPrenom ? 'bv-err' : ''}`} placeholder="Ex: Alami Mehdi" {...register('nomPrenom')} />
                {errors.nomPrenom && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.nomPrenom.message}</div>}
              </div>

              <div className="bv-form-row">
                <div className="bv-form-group">
                  <label className="bv-label">Date de naissance *</label>
                  <input type="date" className={`bv-input ${errors.dateNaissance ? 'bv-err' : ''}`} {...register('dateNaissance')} />
                  {errors.dateNaissance && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.dateNaissance.message}</div>}
                </div>
                <div className="bv-form-group">
                  <label className="bv-label">Lieu de naissance *</label>
                  <input type="text" className={`bv-input ${errors.lieuNaissance ? 'bv-err' : ''}`} placeholder="Ex: Agadir" {...register('lieuNaissance')} />
                  {errors.lieuNaissance && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.lieuNaissance.message}</div>}
                </div>
              </div>

              <div className="bv-form-group">
                <label className="bv-label">Sexe *</label>
                <div className="bv-radio-group">
                  {[{ val: 'F', lbl: '♀ Femme' }, { val: 'M', lbl: '♂ Homme' }].map(({ val, lbl }) => (
                    <label key={val} className={`bv-radio-item${errors.sexe || (register('sexe') && false) ? '' : ''}`}
                      style={{ borderColor: undefined }}>
                      <input type="radio" value={val} {...register('sexe')} />
                      {lbl}
                    </label>
                  ))}
                </div>
                {errors.sexe && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.sexe.message}</div>}
              </div>

              <div className="bv-form-row">
                <div className="bv-form-group">
                  <label className="bv-label">Adresse *</label>
                  <input type="text" className={`bv-input ${errors.adresse ? 'bv-err' : ''}`} placeholder="N° et Rue" {...register('adresse')} />
                  {errors.adresse && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.adresse.message}</div>}
                </div>
                <div className="bv-form-group">
                  <label className="bv-label">Quartier *</label>
                  <input type="text" className={`bv-input ${errors.quartier ? 'bv-err' : ''}`} placeholder="Ex: Dakhla, Talborjt" {...register('quartier')} />
                  {errors.quartier && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.quartier.message}</div>}
                </div>
              </div>

              <div className="bv-form-row">
                <div className="bv-form-group">
                  <label className="bv-label">Ville *</label>
                  <input type="text" className={`bv-input ${errors.ville ? 'bv-err' : ''}`} placeholder="Ex: Agadir, Inezgane" {...register('ville')} />
                  {errors.ville && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.ville.message}</div>}
                </div>
                <div className="bv-form-group">
                  <label className="bv-label">Téléphone *</label>
                  <input type="tel" className={`bv-input ${errors.telephone ? 'bv-err' : ''}`} placeholder="06 XX XX XX XX" {...register('telephone')} />
                  {errors.telephone && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.telephone.message}</div>}
                </div>
              </div>

              <div className="bv-form-group">
                <label className="bv-label">Adresse E-mail *</label>
                <input type="email" className={`bv-input ${errors.email ? 'bv-err' : ''}`} placeholder="nom.prenom@gmail.com" {...register('email')} />
                {errors.email && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.email.message}</div>}
              </div>

            </div>
          </div>

          {/* Card 2 — Parcours Scolaire */}
          <div className="bv-card" style={{ animationDelay: '0.1s' }}>
            <div className="bv-card-header">
              <div className="bv-card-title-wrap">
                <div className="bv-step-num">2</div>
                <HiOutlineAcademicCap size={18} className="bv-card-icon" />
                <span className="bv-card-title">Parcours Scolaire &amp; Situation</span>
              </div>
            </div>
            <div className="bv-card-body">

              <div className="bv-form-row">
                <div className="bv-form-group">
                  <label className="bv-label">Niveau scolaire *</label>
                  <select className={`bv-select ${errors.niveauScolaire ? 'bv-err' : ''}`} {...register('niveauScolaire')}>
                    <option value="BAC">BAC</option>
                    <option value="NIVEAU_BAC">NIVEAU BAC</option>
                    <option value="BAC_2">BAC +2</option>
                    <option value="BAC_3">BAC +3</option>
                  </select>
                  {errors.niveauScolaire && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.niveauScolaire.message}</div>}
                </div>
                <div className="bv-form-group">
                  <label className="bv-label">Établissement fréquenté *</label>
                  <input type="text" className={`bv-input ${errors.etablissement ? 'bv-err' : ''}`} placeholder="Lycée ou Faculté d'origine" {...register('etablissement')} />
                  {errors.etablissement && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.etablissement.message}</div>}
                </div>
              </div>

              <div className="bv-form-group">
                <label className="bv-label">Option du Baccalauréat *</label>
                <select className={`bv-select ${errors.optionBac ? 'bv-err' : ''}`} {...register('optionBac')}>
                  <option value="SC_EXP">Sciences Expérimentales (SVT / PC)</option>
                  <option value="SC_MATH">Sciences Mathématiques</option>
                  <option value="SC_ECO">Sciences Économiques &amp; Gestion</option>
                  <option value="TECHNIQUE">Technique (STM / STE)</option>
                  <option value="LM">Lettres &amp; Sciences Humaines</option>
                  <option value="AUTRES">Autres Diplômes</option>
                </select>
                {errors.optionBac && <div className="bv-form-error"><HiOutlineExclamationCircle size={12} />{errors.optionBac.message}</div>}
              </div>

              <div className="bv-form-row">
                <div className="bv-form-group">
                  <label className="bv-label">Profession du père</label>
                  <input type="text" className="bv-input" placeholder="Optionnel" {...register('professionPere')} />
                </div>
                <div className="bv-form-group">
                  <label className="bv-label">Profession de la mère</label>
                  <input type="text" className="bv-input" placeholder="Optionnel" {...register('professionMere')} />
                </div>
              </div>

              <div className="bv-form-group">
                <label className="bv-label">Profession actuelle du visiteur</label>
                <input type="text" className="bv-input" placeholder="Ex: Étudiant, En recherche d'emploi, Employé(e)..." {...register('professionVisiteur')} />
              </div>

            </div>
          </div>

          {/* Card 3 — Formations */}
          <div className="bv-card" style={{ animationDelay: '0.15s' }}>
            <div className="bv-card-header">
              <div className="bv-card-title-wrap">
                <div className="bv-step-num">3</div>
                <HiOutlineBookOpen size={18} className="bv-card-icon" />
                <span className="bv-card-title">Formations Souhaitées à l'EFET</span>
              </div>
              <span className="bv-badge-count">{selectedFormations.length} sélectionnée(s)</span>
            </div>
            <div className="bv-card-body">
              <p className="bv-hint">Cochez la ou les filières qui vous intéressent (multi-sélection possible) :</p>

              {Object.keys(CATEGORIE_LABELS).map((catKey) => {
                const items = formationsGrouped[catKey] || [];
                if (items.length === 0) return null;
                const CatIcon = CATEGORIE_ICON_COMPONENTS[catKey] || HiOutlineBookOpen;
                return (
                  <div key={catKey} style={{ marginBottom: '1.25rem' }}>
                    <div className="bv-section-label">
                      <CatIcon size={15} />
                      <span>{CATEGORIE_LABELS[catKey]}</span>
                      <span className="bv-section-count">{items.length} filière(s)</span>
                    </div>
                    <div className="bv-checkbox-grid">
                      {items.map((f) => {
                        const isChecked = selectedFormations.includes(f.id);
                        return (
                          <div
                            key={f.id}
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            className={`bv-check-item${isChecked ? ' bv-checked' : ''}`}
                            onClick={() => toggleFormation(f.id)}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                toggleFormation(f.id);
                              }
                            }}
                          >
                            <span className="bv-check-box">{isChecked && <span className="bv-check-tick">✓</span>}</span>
                            <span>{f.nom}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4 — Sources */}
          <div className="bv-card" style={{ animationDelay: '0.2s' }}>
            <div className="bv-card-header">
              <div className="bv-card-title-wrap">
                <div className="bv-step-num">4</div>
                <HiOutlineSpeakerphone size={18} className="bv-card-icon" />
                <span className="bv-card-title">Comment avez-vous connu l'EFET ?</span>
              </div>
              <span className="bv-badge-count">{selectedSources.length} source(s)</span>
            </div>
            <div className="bv-card-body">
              <p className="bv-hint">Précisez le ou les moyens par lesquels vous avez découvert l'EFET Agadir :</p>
              <div className="bv-checkbox-grid">
                {sourcesList.map((s) => {
                  const isChecked = selectedSources.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      className={`bv-check-item${isChecked ? ' bv-checked' : ''}`}
                      onClick={() => toggleSource(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleSource(s.id);
                        }
                      }}
                    >
                      <span className="bv-check-box">{isChecked && <span className="bv-check-tick">✓</span>}</span>
                      {s.IconComp && <s.IconComp size={14} style={{ flexShrink: 0, opacity: 0.7 }} />}
                      <span>{s.libelle}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="bv-error-box">
              <HiOutlineExclamationCircle size={18} style={{ flexShrink: 0 }} />
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <div className="bv-submit-wrap">
            <button type="submit" className="bv-submit-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'bv-spin 0.7s linear infinite' }} />
                  <span>Enregistrement…</span>
                </>
              ) : (
                <>
                  <HiOutlineCheck size={18} />
                  <span>Valider mon bulletin de visite</span>
                </>
              )}
            </button>
            <p className="bv-submit-note">
              Vos données sont protégées et strictement destinées au service des admissions d'EFET Agadir.
            </p>
          </div>

        </form>

        <div className="bv-footer">EFET AGADIR © {new Date().getFullYear()} — Système de Gestion des Visiteurs</div>
      </main>
    </div>
  );
}
