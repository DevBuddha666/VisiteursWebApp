import React, { useState, useEffect } from 'react';
import {
  HiOutlinePlus,
  HiOutlineAcademicCap,
  HiOutlineMegaphone,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiXMark,
} from 'react-icons/hi2';
import { formationService, sourceService } from '../../services/api';

const CATEGORIES = [
  { value: 'BAC3_TS_LP', label: 'BAC +3 : TECHNICIEN SPÉCIALISÉ + LP' },
  { value: 'BAC2_TECHNICIEN', label: 'Niveau BAC +2 : TECHNICIEN' },
  { value: 'SANTE', label: 'Programme Santé' },
  { value: 'BACHELOR', label: 'BACHELOR - LICENCE' },
  { value: 'MASTER', label: 'Master & Mastère Spécialisé' },
];

export default function Referentiels() {
  const [activeTab, setActiveTab] = useState('formations'); // 'formations' | 'sources'

  // Formations state
  const [formations, setFormations] = useState([]);
  const [formationModal, setFormationModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [formationForm, setFormationForm] = useState({ nom: '', categorie: 'BACHELOR' });

  // Sources state
  const [sources, setSources] = useState([]);
  const [sourceModal, setSourceModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [sourceForm, setSourceForm] = useState({ libelle: '' });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [resF, resS] = await Promise.all([
        formationService.getAll(),
        sourceService.getAll(),
      ]);
      if (resF.data.success) setFormations(resF.data.data);
      if (resS.data.success) setSources(resS.data.data);
    } catch (err) {
      console.error('Erreur chargement référentiels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Formations Actions ──
  const handleOpenAddFormation = () => {
    setEditingFormation(null);
    setFormationForm({ nom: '', categorie: 'BACHELOR' });
    setErrorMsg('');
    setFormationModal(true);
  };

  const handleOpenEditFormation = (f) => {
    setEditingFormation(f);
    setFormationForm({ nom: f.nom, categorie: f.categorie });
    setErrorMsg('');
    setFormationModal(true);
  };

  const handleSaveFormation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingFormation) {
        await formationService.update(editingFormation.id, formationForm);
      } else {
        await formationService.create(formationForm);
      }
      setFormationModal(false);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFormation = async (f) => {
    if (!window.confirm(`Confirmez-vous la suppression de la formation "${f.nom}" ?`)) return;

    try {
      await formationService.delete(f.id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossible de supprimer cette formation');
    }
  };

  // ── Sources Actions ──
  const handleOpenAddSource = () => {
    setEditingSource(null);
    setSourceForm({ libelle: '' });
    setErrorMsg('');
    setSourceModal(true);
  };

  const handleOpenEditSource = (s) => {
    setEditingSource(s);
    setSourceForm({ libelle: s.libelle });
    setErrorMsg('');
    setSourceModal(true);
  };

  const handleSaveSource = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingSource) {
        await sourceService.update(editingSource.id, sourceForm);
      } else {
        await sourceService.create(sourceForm);
      }
      setSourceModal(false);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSource = async (s) => {
    if (!window.confirm(`Confirmez-vous la suppression de la source "${s.libelle}" ?`)) return;

    try {
      await sourceService.delete(s.id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossible de supprimer cette source');
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Gestion des Référentiels
          </h1>
          <p className="page-subtitle">
            Configurez les formations proposées et les sources de connaissance de l'école
          </p>
        </div>

        {activeTab === 'formations' ? (
          <button
            className="btn btn-primary"
            onClick={handleOpenAddFormation}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <HiOutlinePlus size={18} />
            <span>Nouvelle Formation</span>
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleOpenAddSource}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <HiOutlinePlus size={18} />
            <span>Nouvelle Source</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`btn ${activeTab === 'formations' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('formations')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <HiOutlineAcademicCap size={18} />
          <span>Formations & Filières ({formations.length})</span>
        </button>
        <button
          className={`btn ${activeTab === 'sources' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('sources')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <HiOutlineMegaphone size={18} />
          <span>Sources de Connaissance ({sources.length})</span>
        </button>
      </div>

      {/* Tab 1: Formations */}
      {activeTab === 'formations' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Intitulé de la formation</th>
                  <th>Catégorie</th>
                  <th>ID Système</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : formations.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Aucune formation trouvée.
                    </td>
                  </tr>
                ) : (
                  formations.map((f) => {
                    const catObj = CATEGORIES.find((c) => c.value === f.categorie);
                    return (
                      <tr key={f.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--deep-space-blue)' }}>{f.nom}</div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{catObj ? catObj.label : f.categorie}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {f.id}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOpenEditFormation(f)}
                            title="Modifier"
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                          >
                            <HiOutlinePencilSquare size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center' }}
                            onClick={() => handleDeleteFormation(f)}
                            title="Supprimer"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Sources de Connaissance */}
      {activeTab === 'sources' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Libellé de la source</th>
                  <th>ID Système</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '3rem' }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : sources.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Aucune source trouvée.
                    </td>
                  </tr>
                ) : (
                  sources.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--deep-space-blue)' }}>{s.libelle}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          {s.id}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenEditSource(s)}
                          title="Modifier"
                          style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center' }}
                          onClick={() => handleDeleteSource(s)}
                          title="Supprimer"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Formation */}
      {formationModal && (
        <div className="modal-overlay" onClick={() => setFormationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFormation ? 'Modifier la formation' : 'Nouvelle Formation'}</h2>
              <button className="modal-close" onClick={() => setFormationModal(false)} style={{ display: 'flex', alignItems: 'center' }}>
                <HiXMark size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveFormation}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiOutlineExclamationTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Intitulé de la formation *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formationForm.nom}
                    onChange={(e) => setFormationForm({ ...formationForm, nom: e.target.value })}
                    required
                    placeholder="Ex: Intelligence Artificielle & Big Data"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Catégorie de diplôme *</label>
                  <select
                    className="form-select"
                    value={formationForm.categorie}
                    onChange={(e) => setFormationForm({ ...formationForm, categorie: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setFormationModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Source */}
      {sourceModal && (
        <div className="modal-overlay" onClick={() => setSourceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSource ? 'Modifier la source' : 'Nouvelle Source de Connaissance'}</h2>
              <button className="modal-close" onClick={() => setSourceModal(false)} style={{ display: 'flex', alignItems: 'center' }}>
                <HiXMark size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveSource}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiOutlineExclamationTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Libellé de la source *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sourceForm.libelle}
                    onChange={(e) => setSourceForm({ ...sourceForm, libelle: e.target.value })}
                    required
                    placeholder="Ex: Campagne TikTok, Salon d'orientation..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSourceModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
