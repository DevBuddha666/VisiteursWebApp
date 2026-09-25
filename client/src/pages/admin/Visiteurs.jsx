import React, { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUserCircle,
  HiXMark,
} from 'react-icons/hi2';
import { visiteurService, orientateurService, formationService } from '../../services/api';

export default function Visiteurs() {
  const [visiteurs, setVisiteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters state
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orientateurId, setOrientateurId] = useState('');
  const [niveauScolaire, setNiveauScolaire] = useState('');
  const [formationId, setFormationId] = useState('');

  // Options for select filters
  const [orientateursList, setOrientateursList] = useState([]);
  const [formationsList, setFormationsList] = useState([]);

  // Detail Modal state
  const [selectedVisiteur, setSelectedVisiteur] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load filter options
  useEffect(() => {
    orientateurService.getAll({ limit: 100 }).then((res) => {
      if (res.data.success) setOrientateursList(res.data.data);
    });
    formationService.getAll().then((res) => {
      if (res.data.success) setFormationsList(res.data.data);
    });
  }, []);

  const fetchVisiteurs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          search: search || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          orientateurId: orientateurId || undefined,
          niveauScolaire: niveauScolaire || undefined,
          formationId: formationId || undefined,
        };

        const res = await visiteurService.getAll(params);
        if (res.data.success) {
          setVisiteurs(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Erreur chargement visiteurs:', err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, search, dateFrom, dateTo, orientateurId, niveauScolaire, formationId]
  );

  useEffect(() => {
    fetchVisiteurs(1);
  }, [fetchVisiteurs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVisiteurs(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setOrientateurId('');
    setNiveauScolaire('');
    setFormationId('');
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        orientateurId: orientateurId || undefined,
      };

      const response = await visiteurService.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visiteurs_efet_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors de l'export CSV");
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await visiteurService.getById(id);
      if (res.data.success) {
        setSelectedVisiteur(res.data.data);
      }
    } catch (err) {
      alert('Impossible de charger les détails du visiteur');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      {/* Title & Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Bulletins de Visite
          </h1>
          <p className="page-subtitle">
            Consultez, filtrez et exportez les visiteurs accueillis à l'EFET Agadir
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleExportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <HiOutlineArrowDownTray size={18} />
          <span>Exporter en CSV / Excel</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div className="filters-grid">
            {/* Search */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Recherche</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nom, tél, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Date From */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Du</label>
              <input
                type="date"
                className="form-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Au</label>
              <input
                type="date"
                className="form-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Orientateur Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Orientateur</label>
              <select
                className="form-select"
                value={orientateurId}
                onChange={(e) => setOrientateurId(e.target.value)}
              >
                <option value="">Tous les orientateurs</option>
                {orientateursList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.prenom} {o.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Niveau Scolaire Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Niveau Scolaire</label>
              <select
                className="form-select"
                value={niveauScolaire}
                onChange={(e) => setNiveauScolaire(e.target.value)}
              >
                <option value="">Tous les niveaux</option>
                <option value="BAC">BAC</option>
                <option value="NIVEAU_BAC">NIVEAU BAC</option>
                <option value="BAC_2">BAC +2</option>
                <option value="BAC_3">BAC +3</option>
              </select>
            </div>

            {/* Formation Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Formation</label>
              <select
                className="form-select"
                value={formationId}
                onChange={(e) => setFormationId(e.target.value)}
              >
                <option value="">Toutes les formations</option>
                {formationsList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleResetFilters}>
              Effacer filtres
            </button>
            <button
              type="submit"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <HiOutlineMagnifyingGlass size={16} />
              <span>Filtrer</span>
            </button>
          </div>
        </form>
      </div>

      {/* Visiteurs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Date & Heure</th>
                <th>Visiteur</th>
                <th>Contact</th>
                <th>Niveau & Option</th>
                <th>Formations demandées</th>
                <th>Orientateur</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Chargement des données...</p>
                  </td>
                </tr>
              ) : visiteurs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Aucun bulletin de visite ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                visiteurs.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span className="badge badge-primary font-bold">
                        #{String(v.numeroOrdre).padStart(3, '0')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(v.dateVisite).toLocaleDateString('fr-FR')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {v.heureVisite}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--deep-space-blue)' }}>
                        {v.nomPrenom}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {v.sexe === 'F' ? 'Femme' : 'Homme'} &bull; {v.ville} ({v.quartier})
                      </div>
                    </td>
                    <td>
                      <div>{v.telephone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{v.niveauScolaire}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {v.optionBac}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '240px', fontSize: '0.8rem' }}>
                        {v.formations && v.formations.length > 0 ? (
                          v.formations.map((f, i) => (
                            <span
                              key={i}
                              style={{
                                display: 'inline-block',
                                background: 'rgba(44, 125, 160, 0.08)',
                                color: 'var(--yale-blue-2)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                margin: '2px',
                                fontSize: '0.75rem',
                              }}
                            >
                              {f.formation.nom}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucune</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {v.orientateur ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <HiOutlineUserCircle size={18} color="var(--cerulean)" style={{ flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--deep-space-blue)' }}>
                              {v.orientateur.prenom} {v.orientateur.nom}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--cerulean)', fontFamily: 'monospace' }}>
                              [{v.orientateur.code}]
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="badge" style={{ background: '#edf2f7', color: '#718096' }}>
                          De passage (Sans QR)
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDetail(v.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <HiOutlineEye size={15} />
                        <span>Détail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && pagination.totalPages > 1 && (
          <div className="pagination" style={{ padding: '1rem' }}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchVisiteurs(pagination.page - 1)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <HiOutlineChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === pagination.page ? 'active' : ''}
                onClick={() => fetchVisiteurs(p)}
              >
                {p}
              </button>
            ))}
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchVisiteurs(pagination.page + 1)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <HiOutlineChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Visiteur Full Detail Modal */}
      {selectedVisiteur && (
        <div className="modal-overlay" onClick={() => setSelectedVisiteur(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div>
                <h2>Fiche Visiteur #{String(selectedVisiteur.numeroOrdre).padStart(3, '0')}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enregistré le {new Date(selectedVisiteur.dateVisite).toLocaleDateString('fr-FR')} à {selectedVisiteur.heureVisite}
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedVisiteur(null)} style={{ display: 'flex', alignItems: 'center' }}>
                <HiXMark size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Orientateur banner in detail */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: selectedVisiteur.orientateur ? 'rgba(44, 125, 160, 0.08)' : '#edf2f7',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <HiOutlineUserCircle size={28} color="var(--cerulean)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Orientateur Référent
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--deep-space-blue)' }}>
                    {selectedVisiteur.orientateur
                      ? `${selectedVisiteur.orientateur.prenom} ${selectedVisiteur.orientateur.nom} (Code: ${selectedVisiteur.orientateur.code})`
                      : 'Visiteur de passage (Aucun orientateur associé)'}
                  </div>
                </div>
              </div>

              {/* Grid 2 cols */}
              <div className="modal-grid-2">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nom & Prénom</div>
                  <div style={{ fontWeight: 600 }}>{selectedVisiteur.nomPrenom}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sexe</div>
                  <div style={{ fontWeight: 600 }}>{selectedVisiteur.sexe === 'F' ? 'Féminin' : 'Masculin'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date & Lieu de Naissance</div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(selectedVisiteur.dateNaissance).toLocaleDateString('fr-FR')} à {selectedVisiteur.lieuNaissance}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Téléphone</div>
                  <div style={{ fontWeight: 600 }}>{selectedVisiteur.telephone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>E-mail</div>
                  <div style={{ fontWeight: 600 }}>{selectedVisiteur.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adresse / Quartier / Ville</div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedVisiteur.adresse}, {selectedVisiteur.quartier}, {selectedVisiteur.ville}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Niveau Scolaire & Option</div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedVisiteur.niveauScolaire} &bull; {selectedVisiteur.optionBac}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Établissement fréquenté</div>
                  <div style={{ fontWeight: 600 }}>{selectedVisiteur.etablissement}</div>
                </div>
              </div>

              {/* Parents & Profession */}
              <div style={{ background: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--deep-space-blue)', marginBottom: '0.5rem' }}>
                  Situation Familiale & Professionnelle
                </div>
                <div className="modal-grid-3">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Prof. Père:</span>{' '}
                    <strong>{selectedVisiteur.professionPere || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Prof. Mère:</span>{' '}
                    <strong>{selectedVisiteur.professionMere || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Prof. Visiteur:</span>{' '}
                    <strong>{selectedVisiteur.professionVisiteur || '—'}</strong>
                  </div>
                </div>
              </div>

              {/* Formations demandées */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--deep-space-blue)', marginBottom: '0.5rem' }}>
                  Formations Souhaitées
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {selectedVisiteur.formations && selectedVisiteur.formations.length > 0 ? (
                    selectedVisiteur.formations.map((f, i) => (
                      <span key={i} className="badge badge-primary">
                        {f.formation.nom}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune filière cochée</span>
                  )}
                </div>
              </div>

              {/* Sources */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--deep-space-blue)', marginBottom: '0.5rem' }}>
                  Comment a connu l'école
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {selectedVisiteur.sources && selectedVisiteur.sources.length > 0 ? (
                    selectedVisiteur.sources.map((s, i) => (
                      <span key={i} className="badge badge-info">
                        {s.source.libelle}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Non précisé</span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedVisiteur(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
