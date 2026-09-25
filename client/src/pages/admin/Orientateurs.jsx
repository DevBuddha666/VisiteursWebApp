import React, { useState, useEffect } from 'react';
import {
  HiOutlinePlus,
  HiOutlineQrCode,
  HiOutlineChartBar,
  HiOutlinePencilSquare,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiOutlineLightBulb,
  HiXMark,
} from 'react-icons/hi2';
import { orientateurService } from '../../services/api';
import QRCodeModal from '../../components/QRCodeModal';

export default function Orientateurs() {
  const [orientateurs, setOrientateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actifFilter, setActifFilter] = useState('');

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrientateur, setEditingOrientateur] = useState(null);
  const [formData, setFormData] = useState({ nom: '', prenom: '', actif: true });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // QR Modal
  const [qrModalData, setQrModalData] = useState(null); // { orientateur, qrData }
  const [qrLoading, setQrLoading] = useState(false);

  // Individual Stats Modal
  const [statsModalData, setStatsModalData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Delete / Deactivate confirmation modal
  const [deleteWarning, setDeleteWarning] = useState(null); // { orientateur, errorMsg }

  const fetchOrientateurs = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        actif: actifFilter || undefined,
        limit: 100,
      };
      const res = await orientateurService.getAll(params);
      if (res.data.success) {
        setOrientateurs(res.data.data);
      }
    } catch (err) {
      console.error('Erreur chargement orientateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrientateurs();
  }, [search, actifFilter]);

  const handleOpenCreate = () => {
    setEditingOrientateur(null);
    setFormData({ nom: '', prenom: '', actif: true });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (orientateur) => {
    setEditingOrientateur(orientateur);
    setFormData({
      nom: orientateur.nom,
      prenom: orientateur.prenom,
      actif: orientateur.actif,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      if (editingOrientateur) {
        await orientateurService.update(editingOrientateur.id, formData);
      } else {
        await orientateurService.create({ nom: formData.nom, prenom: formData.prenom });
      }
      setModalOpen(false);
      fetchOrientateurs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActif = async (orientateur) => {
    try {
      await orientateurService.update(orientateur.id, { actif: !orientateur.actif });
      fetchOrientateurs();
    } catch (err) {
      alert('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (orientateur) => {
    if (!window.confirm(`Confirmez-vous la suppression de l'orientateur ${orientateur.prenom} ${orientateur.nom} ?`)) {
      return;
    }

    try {
      await orientateurService.delete(orientateur.id);
      fetchOrientateurs();
    } catch (err) {
      if (err.response?.status === 409) {
        setDeleteWarning({
          orientateur,
          errorMsg: err.response.data.message,
        });
      } else {
        alert(err.response?.data?.message || 'Erreur de suppression');
      }
    }
  };

  const handleOpenQR = async (orientateur) => {
    try {
      setQrLoading(true);
      const res = await orientateurService.getQRCodeData(orientateur.id);
      if (res.data.success) {
        setQrModalData({
          orientateur,
          qrData: res.data.data,
        });
      }
    } catch (err) {
      alert('Erreur de génération du QR Code');
    } finally {
      setQrLoading(false);
    }
  };

  const handleOpenStats = async (orientateur) => {
    try {
      setStatsLoading(true);
      const res = await orientateurService.getStats(orientateur.id);
      if (res.data.success) {
        setStatsModalData(res.data.data);
      }
    } catch (err) {
      alert('Erreur lors de la récupération des statistiques');
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Gestion des Orientateurs
          </h1>
          <p className="page-subtitle">
            Créez les conseillers, générez leurs QR codes uniques et suivez leurs statistiques
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <HiOutlinePlus size={18} />
          <span>Nouvel Orientateur</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par nom, prénom ou code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <select
              className="form-select"
              value={actifFilter}
              onChange={(e) => setActifFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actifs uniquement</option>
              <option value="false">Désactivés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orientateurs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Orientateur</th>
                <th>Code Unique</th>
                <th>Statut</th>
                <th>Visiteurs Référés</th>
                <th>Créé le</th>
                <th style={{ textAlign: 'right' }}>Actions & QR</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : orientateurs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Aucun orientateur enregistré. Cliquez sur "Nouvel Orientateur" pour en ajouter un.
                  </td>
                </tr>
              ) : (
                orientateurs.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: o.actif ? 'rgba(44, 125, 160, 0.12)' : '#edf2f7',
                            color: o.actif ? 'var(--cerulean)' : '#a0aec0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {o.prenom.charAt(0)}{o.nom.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--deep-space-blue)' }}>
                            {o.prenom} {o.nom}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Conseiller(e) en orientation
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          background: '#edf2f7',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--yale-blue-2)',
                        }}
                      >
                        {o.code}
                      </span>
                    </td>
                    <td>
                      {o.actif ? (
                        <span className="badge badge-success">Actif</span>
                      ) : (
                        <span className="badge badge-danger">Inactif</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--deep-space-blue)' }}>
                        {o.visiteursCount}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        visiteurs
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {/* QR Code Action */}
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenQR(o)}
                          title="Voir / Imprimer le QR Code"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <HiOutlineQrCode size={15} />
                          <span>QR Code</span>
                        </button>

                        {/* Individual Stats Action */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenStats(o)}
                          title="Statistiques de cet orientateur"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <HiOutlineChartBar size={15} />
                          <span>Stats</span>
                        </button>

                        {/* Edit Action */}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenEdit(o)}
                          title="Modifier"
                          style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                          <HiOutlinePencilSquare size={16} />
                        </button>

                        {/* Toggle active / inactive */}
                        <button
                          className={`btn btn-sm ${o.actif ? 'btn-ghost' : 'btn-secondary'}`}
                          onClick={() => handleToggleActif(o)}
                          title={o.actif ? 'Désactiver' : 'Activer'}
                          style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                          {o.actif ? <HiOutlinePause size={16} /> : <HiOutlinePlay size={16} />}
                        </button>

                        {/* Delete Action */}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center' }}
                          onClick={() => handleDelete(o)}
                          title="Supprimer"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit Orientateur */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingOrientateur ? "Modifier l'orientateur" : 'Nouvel Orientateur'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
                <HiXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <HiOutlineExclamationTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                    placeholder="Ex: Fatima"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                    placeholder="Ex: Zahra"
                  />
                </div>

                {editingOrientateur && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.actif}
                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Orientateur actif</span>
                    </label>
                  </div>
                )}

                {!editingOrientateur && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <HiOutlineLightBulb size={17} style={{ color: 'var(--cerulean)', flexShrink: 0, marginTop: '2px' }} />
                    <span>Un code unique de 8 caractères et son QR code associé seront automatiquement générés à la création.</span>
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Enregistrement...' : editingOrientateur ? 'Mettre à jour' : 'Créer & Générer QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalData && (
        <QRCodeModal
          orientateur={qrModalData.orientateur}
          qrData={qrModalData.qrData}
          onClose={() => setQrModalData(null)}
        />
      )}

      {/* Individual Stats Modal */}
      {statsModalData && (
        <div className="modal-overlay" onClick={() => setStatsModalData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h2>Statistiques — {statsModalData.orientateur.prenom} {statsModalData.orientateur.nom}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--cerulean)', fontFamily: 'monospace' }}>
                  Code : {statsModalData.orientateur.code}
                </div>
              </div>
              <button className="modal-close" onClick={() => setStatsModalData(null)} style={{ display: 'flex', alignItems: 'center' }}>
                <HiXMark size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--deep-space-blue)' }}>
                    {statsModalData.stats.total}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Visiteurs</div>
                </div>

                <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cerulean)' }}>
                    {statsModalData.stats.today}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aujourd'hui</div>
                </div>

                <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue-green)' }}>
                    {statsModalData.stats.week}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cette Semaine</div>
                </div>

                <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--pacific-blue)' }}>
                    {statsModalData.stats.month}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ce Mois-ci</div>
                </div>
              </div>

              {statsModalData.evolution && statsModalData.evolution.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep-space-blue)', marginBottom: '0.5rem' }}>
                    Activité récente (30 jours)
                  </div>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.8rem' }}>
                    {statsModalData.evolution.map((ev, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.35rem 0',
                          borderBottom: '1px solid var(--border-light)',
                        }}
                      >
                        <span>{new Date(ev.date).toLocaleDateString('fr-FR')}</span>
                        <strong>{ev.count} visiteur(s)</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setStatsModalData(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conflict Warning Modal */}
      {deleteWarning && (
        <div className="modal-overlay" onClick={() => setDeleteWarning(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Suppression impossible</h2>
              <button className="modal-close" onClick={() => setDeleteWarning(null)} style={{ display: 'flex', alignItems: 'center' }}>
                <HiXMark size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  color: 'var(--danger)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                }}
              >
                <HiOutlineExclamationTriangle size={20} style={{ flexShrink: 0 }} />
                <span>{deleteWarning.errorMsg}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Pour préserver l'intégrité de l'historique des visiteurs rattachés à cet orientateur, il est recommandé de simplement désactiver sa fiche. Son QR Code ne sera plus actif pour les nouveaux visiteurs, mais tous ses historiques seront conservés.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteWarning(null)}>
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  await orientateurService.update(deleteWarning.orientateur.id, { actif: false });
                  setDeleteWarning(null);
                  fetchOrientateurs();
                }}
              >
                Désactiver l'orientateur à la place
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
