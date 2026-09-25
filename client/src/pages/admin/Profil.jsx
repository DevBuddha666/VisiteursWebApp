import React, { useState } from 'react';
import {
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiOutlineLockClosed,
  HiOutlineUser,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';

export default function Profil() {
  const { admin } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.data.success) {
        setSuccessMsg('Votre mot de passe a été mis à jour avec succès.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          'Erreur lors du changement de mot de passe. Vérifiez votre mot de passe actuel.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', width: '100%' }}>
      <div className="page-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.25rem' }}>
        <h1 className="page-title">
          Paramètres du Compte
        </h1>
        <p className="page-subtitle">
          Gérez votre profil administrateur et vos identifiants de sécurité
        </p>
      </div>

      {/* Admin Info Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HiOutlineUser size={20} color="var(--cerulean)" />
          <h2 className="card-title" style={{ margin: 0 }}>Informations Administrateur</h2>
        </div>
        <div className="modal-grid-2">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nom complet</div>
            <div style={{ fontWeight: 600, color: 'var(--deep-space-blue)' }}>{admin?.nom}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adresse e-mail</div>
            <div style={{ fontWeight: 600, color: 'var(--deep-space-blue)' }}>{admin?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rôle</div>
            <span className="badge badge-primary">Responsable de Direction</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID Compte</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              {admin?.id}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HiOutlineLockClosed size={20} color="var(--cerulean)" />
          <h2 className="card-title" style={{ margin: 0 }}>Modifier le mot de passe</h2>
        </div>

        {successMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              border: '1px solid var(--success)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <HiOutlineCheck size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              border: '1px solid var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <HiOutlineExclamationTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Mot de passe actuel *</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nouveau mot de passe *</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimum 8 caractères, majuscule, chiffre, caractère spécial"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmer le nouveau mot de passe *</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirmer à l'identique"
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
