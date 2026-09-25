import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineCog6Tooth,
  HiOutlineArrowTopRightOnSquare,
  HiBars3,
  HiXMark,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: HiOutlineChartBar },
    { to: '/admin/visiteurs', label: 'Visiteurs', icon: HiOutlineUsers },
    { to: '/admin/orientateurs', label: 'Orientateurs', icon: HiOutlineUserGroup },
    { to: '/admin/referentiels', label: 'Référentiels', icon: HiOutlineBookOpen },
    { to: '/admin/profil', label: 'Mon Compte', icon: HiOutlineCog6Tooth },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                height: '42px',
                padding: '4px 8px',
                borderRadius: '10px',
                background: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <img
                src="/logo-efet.png"
                alt="Logo EFET AGADIR"
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.5px', color: 'var(--white)' }}>
                EFET AGADIR
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sky-blue-light)', opacity: 0.9 }}>
                Gestion des Visiteurs
              </div>
            </div>
          </div>

          {/* Close button inside sidebar on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="admin-hamburger-btn"
            style={{ color: 'var(--white)', fontSize: '1.25rem', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            title="Fermer le menu"
          >
            <HiXMark size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--white)' : 'var(--light-blue)',
                  background: isActive ? 'linear-gradient(90deg, var(--yale-blue-2), var(--cerulean))' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                })}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Sidebar with Public Link */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <a
            href="/visite"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--light-blue)',
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            <HiOutlineArrowTopRightOnSquare size={17} />
            <span>Ouvrir formulaire public</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="admin-hamburger-btn"
              title="Menu de navigation"
              aria-label="Ouvrir le menu"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <HiBars3 size={24} />
            </button>
            <div className="admin-header-title">
              Espace Direction & Orientation
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(44, 125, 160, 0.15)',
                  color: 'var(--cerulean)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                }}
              >
                {admin?.nom ? admin.nom.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {admin?.nom || 'Admin'}
                </span>
                <span className="admin-user-email" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {admin?.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.65rem' }}
              title="Se déconnecter"
            >
              <span className="btn-text-hide-mobile">Déconnexion</span>
              <HiArrowRightOnRectangle size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
