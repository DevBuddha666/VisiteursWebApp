import React, { useRef } from 'react';
import { HiXMark, HiOutlineArrowDownTray, HiOutlinePrinter } from 'react-icons/hi2';

export default function QRCodeModal({ orientateur, qrData, onClose }) {
  const printRef = useRef(null);

  if (!orientateur || !qrData) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrData.qrDataUrl;
    link.download = `qrcode_${orientateur.nom}_${orientateur.prenom}_${orientateur.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fiche QR Code - ${orientateur.prenom} ${orientateur.nom}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #012a4a;
              text-align: center;
              margin: 0;
              padding: 40px 20px;
              background: #ffffff;
            }
            .container {
              border: 3px solid #01497c;
              border-radius: 20px;
              padding: 40px;
              max-width: 500px;
              margin: 0 auto;
              box-shadow: 0 10px 30px rgba(1, 42, 74, 0.1);
            }
            .header {
              margin-bottom: 25px;
            }
            .school {
              font-size: 26px;
              font-weight: 800;
              color: #012a4a;
              letter-spacing: 1px;
            }
            .sub {
              font-size: 14px;
              color: #2c7da0;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-top: 5px;
              font-weight: 600;
            }
            .badge {
              display: inline-block;
              background: #f0f5f9;
              padding: 8px 18px;
              border-radius: 20px;
              font-size: 13px;
              color: #01497c;
              font-weight: 600;
              margin-top: 15px;
            }
            .qr-wrapper {
              margin: 25px 0;
            }
            .qr-image {
              width: 260px;
              height: 260px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              padding: 10px;
            }
            .orientateur-name {
              font-size: 22px;
              font-weight: 700;
              color: #012a4a;
            }
            .orientateur-role {
              font-size: 15px;
              color: #4a5568;
              margin-top: 4px;
            }
            .code {
              font-family: monospace;
              font-size: 14px;
              background: #edf2f7;
              padding: 4px 10px;
              border-radius: 6px;
              display: inline-block;
              margin-top: 10px;
            }
            .footer {
              margin-top: 30px;
              font-size: 13px;
              color: #718096;
              border-top: 1px dashed #cbd5e0;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="/logo-efet.png" alt="Logo EFET" style="height: 55px; margin-bottom: 10px; object-fit: contain;" />
              <div class="school">EFET AGADIR</div>
              <div class="sub">École Française d'Enseignement Technique</div>
              <div class="badge">Bulletin de Visite Numérique</div>
            </div>

            <div class="qr-wrapper">
              <img class="qr-image" src="${qrData.qrDataUrl}" alt="QR Code" />
            </div>

            <div class="orientateur-name">${orientateur.prenom} ${orientateur.nom}</div>
            <div class="orientateur-role">Conseiller(e) en Orientation</div>
            <div class="code">Code : ${orientateur.code}</div>

            <div class="footer">
              Scannez ce QR Code avec votre smartphone pour remplir le formulaire de visite officiel.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <h2>QR Code de l'orientateur</h2>
          <button className="modal-close" onClick={onClose}><HiXMark size={20} /></button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          {/* Printable preview card */}
          <div
            ref={printRef}
            style={{
              padding: '1.5rem',
              background: 'var(--bg-body)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--pacific-blue)',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <img
                src="/logo-efet.png"
                alt="Logo EFET AGADIR"
                style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div style={{ fontWeight: 800, color: 'var(--deep-space-blue)', fontSize: '1.1rem' }}>
              EFET AGADIR
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--cerulean)', marginBottom: '1rem', fontWeight: 600 }}>
              BULLETIN DE VISITE OFFICIEL
            </div>

            <div style={{ display: 'inline-block', background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <img
                src={qrData.qrDataUrl}
                alt={`QR Code pour ${orientateur.prenom} ${orientateur.nom}`}
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>

            <div style={{ marginTop: '1rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--deep-space-blue)' }}>
              {orientateur.prenom} {orientateur.nom}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Conseiller en Orientation
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                background: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                display: 'inline-block',
                marginTop: '0.5rem',
                border: '1px solid var(--border-color)',
                color: 'var(--yale-blue-2)',
                fontWeight: 600,
              }}
            >
              Code : {orientateur.code}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Scannez pour accéder directement au formulaire d'orientation
            </p>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Fermer
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HiOutlineArrowDownTray size={16} /> Télécharger PNG
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HiOutlinePrinter size={16} /> Imprimer la fiche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
