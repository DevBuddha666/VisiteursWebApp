import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  HiOutlineArrowPath,
  HiOutlineUsers,
  HiOutlineSun,
  HiOutlineCalendarDays,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';
import { statsService } from '../../services/api';

const COLORS = [
  '#01497c', // yale-blue-2
  '#2c7da0', // cerulean
  '#468faf', // blue-green
  '#61a5c2', // pacific-blue
  '#89c2d9', // sky-blue-light
  '#012a4a', // deep-space-blue
  '#a9d6e5', // light-blue
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await statsService.getOverview();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>⚠️ {error || 'Données indisponibles'}</p>
        <button className="btn btn-primary" onClick={fetchStats}>
          🔄 Réessayer
        </button>
      </div>
    );
  }

  const { counters, sexe, niveauScolaire, optionBac, formations, sources, orientateurs, evolution } = data;

  // Formatter pour l'évolution
  const evolutionData = evolution.map((item) => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    visiteurs: item.count,
  }));

  // Formatter pour formations
  const formationsData = formations.map((item) => ({
    name: item.formation.nom.length > 25 ? item.formation.nom.substring(0, 25) + '...' : item.formation.nom,
    fullName: item.formation.nom,
    total: item.count,
  }));

  // Formatter pour sources
  const sourcesData = sources.map((item) => ({
    name: item.source.libelle,
    total: item.count,
  }));

  // Formatter pour options bac
  const bacLabels = {
    SC_EXP: 'Sc. Expérimentales',
    SC_MATH: 'Sc. Mathématiques',
    SC_ECO: 'Sc. Économiques',
    TECHNIQUE: 'Technique',
    LM: 'Lettres Modernes',
    AUTRES: 'Autres Diplômes',
  };

  const optionBacData = optionBac.map((item) => ({
    name: bacLabels[item.label] || item.label,
    total: item.count,
  }));

  // Formatter pour sexe
  const sexeLabels = { F: 'Femmes', M: 'Hommes' };
  const sexeData = sexe.map((item) => ({
    name: sexeLabels[item.label] || item.label,
    value: item.count,
  }));

  return (
    <div>
      {/* Header title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Tableau de bord — Vue d'ensemble
          </h1>
          <p className="page-subtitle">
            Suivi des flux de visiteurs et performances d'orientation EFET Agadir
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchStats}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <HiOutlineArrowPath size={16} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(1, 73, 124, 0.1)', color: 'var(--yale-blue-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineUsers size={24} />
          </div>
          <div className="stat-value">{counters.total}</div>
          <div className="stat-label">Total des visiteurs enregistrés</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(44, 125, 160, 0.1)', color: 'var(--cerulean)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineSun size={24} />
          </div>
          <div className="stat-value">{counters.today}</div>
          <div className="stat-label">Visiteurs reçus aujourd'hui</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(70, 143, 175, 0.1)', color: 'var(--blue-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineCalendarDays size={24} />
          </div>
          <div className="stat-value">{counters.week}</div>
          <div className="stat-label">Visiteurs cette semaine</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(97, 165, 194, 0.1)', color: 'var(--pacific-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineArrowTrendingUp size={24} />
          </div>
          <div className="stat-value">{counters.month}</div>
          <div className="stat-label">Visiteurs ce mois-ci</div>
        </div>
      </div>

      {/* Evolution Chart (Full Width) */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Évolution des visites (30 derniers jours)</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Affluence quotidienne des futurs étudiants à l'EFET Agadir
            </p>
          </div>
        </div>
        <div style={{ width: '100%', height: '280px' }}>
          {evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="visiteursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c7da0" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2c7da0" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                <XAxis dataKey="date" stroke="#718096" fontSize={11} tickLine={false} />
                <YAxis stroke="#718096" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#012a4a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visiteurs"
                  name="Nombre de visiteurs"
                  stroke="#01497c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#visiteursGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Aucune donnée d'évolution enregistrée pour le moment.
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Formations les plus demandées & Classement des Orientateurs */}
      <div className="dashboard-grid-2">
        {/* Formations Top */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top formations souhaitées</h2>
            <span className="badge badge-primary">{formations.length} filières</span>
          </div>
          <div style={{ width: '100%', height: '320px' }}>
            {formationsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formationsData.slice(0, 7)} layout="vertical" margin={{ left: -10, right: 15, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf2f7" />
                  <XAxis type="number" stroke="#718096" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#718096" fontSize={10} width={110} />
                  <Tooltip
                    formatter={(val, _name, props) => [val, props.payload.fullName]}
                    contentStyle={{ background: '#012a4a', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="total" name="Demandes" fill="#2c7da0" radius={[0, 4, 4, 0]}>
                    {formationsData.slice(0, 7).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Aucune formation sélectionnée pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Classement Orientateurs */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Classement des Orientateurs</h2>
            <span className="badge badge-success">Actifs</span>
          </div>

          {orientateurs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orientateurs.map((o, idx) => (
                <div
                  key={o.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: idx === 0 ? 'rgba(44, 125, 160, 0.08)' : 'var(--bg-body)',
                    borderRadius: 'var(--radius-md)',
                    border: idx === 0 ? '1px solid var(--cerulean)' : '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: idx === 0 ? 'var(--cerulean)' : idx === 1 ? 'var(--blue-green)' : 'var(--border-color)',
                        color: idx < 2 ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--deep-space-blue)', fontSize: '0.9rem' }}>
                        {o.prenom} {o.nom}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Conseiller(e) EFET
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--yale-blue-2)' }}>
                      {o.count}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      visiteurs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
              Aucun visiteur attribué à des orientateurs pour le moment.
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Répartition Sexe, Niveau Scolaire, et Sources */}
      <div className="dashboard-grid-3">
        {/* Parité Sexe */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Répartition Homme / Femme</h2>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            {sexeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sexeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sexeData.map((_entry, index) => (
                      <Cell key={`cell-sexe-${index}`} fill={index === 0 ? '#2c7da0' : '#01497c'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#012a4a', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Pas de données
              </div>
            )}
          </div>
        </div>

        {/* Option du Bac */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Options du Baccalauréat</h2>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            {optionBacData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={optionBacData} margin={{ bottom: 20, left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                  <XAxis dataKey="name" stroke="#718096" fontSize={10} angle={-25} textAnchor="end" />
                  <YAxis stroke="#718096" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#012a4a', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="total" name="Visiteurs" fill="#468faf" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Pas de données
              </div>
            )}
          </div>
        </div>

        {/* Sources de connaissance */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Comment ils ont connu l'EFET</h2>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            {sourcesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourcesData.slice(0, 6)} layout="vertical" margin={{ left: -10, right: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf2f7" />
                  <XAxis type="number" stroke="#718096" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#718096" fontSize={10} width={100} />
                  <Tooltip contentStyle={{ background: '#012a4a', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="total" name="Citations" fill="#014f86" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Pas de données
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
